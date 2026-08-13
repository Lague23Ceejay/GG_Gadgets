import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { ordersApi } from "@/lib/orders";
import type { Customer } from "@/types";
import { getEffectivePrice, hasActiveSale } from "@/lib/pricing";
import { RewardsDrawer } from "@/components/storefront/RewardsDrawer";
import { loyaltyApi } from "@/lib/loyalty";


export function Cart() {
  const { lines, setQuantity, removeItem, subtotal, clear } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", payment_method: "Cash on Delivery" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const hasOutOfStockItems = lines.some((line) => line.product.stock === 0);
  const [verifiedRewardIds, setVerifiedRewardIds] = useState<number[]>([]);
  const [rewardMessages, setRewardMessages] = useState<string[]>([]);
  

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Create the customer, then the order, then attach each cart line as an order item.
      const customer = await api.post<Customer>("/customers", form);
      const order = await api.post<{ order_id: number }>("/orders", {
        customer_id: customer.customer_id,
        payment_method: form.payment_method,
      });

      for (const line of lines) {
        await ordersApi.addItem({
          order_id: order.order_id,
          product_id: line.product.product_id,
          quantity: line.quantity,
          price_each: getEffectivePrice(line.product),
        });
      }

      {form.email && <RewardsDrawer email={form.email} onVerifiedRewardsChange={setVerifiedRewardIds} />}

      if (verifiedRewardIds.length > 0) {
        const messages: string[] = [];
        for (const rewardId of verifiedRewardIds) {
          try {
            const result = await loyaltyApi.redeem(form.email, rewardId, order.order_id);
            messages.push(`🎉 ${result.reward_name} redeemed!`);
          } catch (err) {
            messages.push(err instanceof Error ? `A reward couldn't be redeemed: ${err.message}` : "A reward redemption failed.");
          }
        }
        setRewardMessages(messages);
      }

      setOrderId(order.order_id);
      clear();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong placing your order."
      );
    } finally {
      setSubmitting(false);
    }
  };

    {/* Render different content based on the state of the cart */}
  if (orderId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-2xl font-700">Order placed 🎉</h1>
        <p className="mt-2 text-zinc-500">
          Order <span className="font-mono">#{orderId}</span> is confirmed. We'll be in touch.
        </p>

        {/* Reward message (if any) */}
        {rewardMessages.map((msg, i) => (
          <p key={i} className="mt-1 text-sm text-accent-600 dark:text-accent-400">{msg}</p>
        ))}

        <div className="mt-4 rounded-lg bg-accent-50 px-4 py-3 text-sm text-accent-700 dark:bg-accent-500/10 dark:text-accent-300">
          Save your order number — you'll need it to check your order status later.
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to={`/track-order?order_id=${orderId}&email=${encodeURIComponent(form.email)}`}
            className="text-accent-500 hover:underline"
          >
            Track this order →
          </Link>
          <span className="hidden text-zinc-300 sm:inline">·</span>
          <Link to="/" className="text-accent-500 hover:underline">
            Keep shopping
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-2xl font-700">Your cart is empty</h1>
        <p className="mt-2 text-zinc-500">Add something you actually need.</p>
        <Link to="/" className="mt-6 inline-block text-accent-500 hover:underline">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-700">Your cart</h1>

    
      <div className="mt-6 flex flex-col gap-3">
        {lines.map((line) => (
          <Card
            key={line.product.product_id}
            className={`flex items-center gap-4 p-4 ${line.product.stock === 0 ? "opacity-50" : ""}`}
          >
            {line.product.stock === 0 && (
              <span className="text-xs font-medium text-danger-500">Out of stock</span>
            )}
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
              {line.product.images?.[0] && (
                <img
                  src={line.product.images[0].image_url}
                  alt={line.product.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{line.product.name}</p>
              <p className="font-mono text-sm text-zinc-500">
              ₱{getEffectivePrice(line.product).toFixed(2)}
              {hasActiveSale(line.product) && (
                <span className="ml-1.5 text-xs text-zinc-400 line-through">
                  ₱{Number(line.product.price).toFixed(2)}
                </span>
              )}
            </p>
            </div>
            <input
              type="number"
              min={1}
              max={line.product.stock}
              value={line.quantity}
              onChange={(e) => setQuantity(line.product.product_id, Number(e.target.value))}
              className="h-9 w-16 rounded-lg border border-zinc-300 text-center font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              onClick={() => removeItem(line.product.product_id)}
              className="text-sm text-zinc-400 hover:text-danger-500"
            >
              Remove
            </button>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <span className="text-zinc-500">Subtotal</span>
        <span className="font-mono text-lg font-semibold">₱{subtotal.toFixed(2)}</span>
      </div>

      {!showCheckout ? (
        <Button
          size="lg"
          className="mt-6 w-full"
          onClick={() => setShowCheckout(true)}
          disabled={hasOutOfStockItems}
        >
          {hasOutOfStockItems ? "Remove out-of-stock items to continue" : "Proceed to checkout"}
        </Button>
      ) : (
        <Card className="mt-6 p-5">
          <form onSubmit={handleCheckout} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            {error && <p className="text-sm text-danger-500">{error}</p>}

            {/* Payment method selection */}
            <div>
              <Label htmlFor="payment_method">Payment method</Label>
              <select
                id="payment_method"
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="GCash">GCash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit/Debit Card">Credit/Debit Card</option>
              </select>
            </div>

            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? "Placing order…" : `Place order — ₱${subtotal.toFixed(2)}`}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
