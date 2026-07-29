import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { ordersApi } from "@/lib/orders";
import type { Customer } from "@/types";

export function Cart() {
  const { lines, setQuantity, removeItem, subtotal, clear } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Create the customer, then the order, then attach each cart line as an order item.
      const customer = await api.post<Customer>("/customers", form);
      const order = await api.post<{ order_id: number }>("/orders", {
        customer_id: customer.customer_id,
      });

      for (const line of lines) {
        await ordersApi.addItem({
          order_id: order.order_id,
          product_id: line.product.product_id,
          quantity: line.quantity,
          price_each: Number(line.product.price),
        });
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

  if (orderId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-2xl font-700">Order placed 🎉</h1>
        <p className="mt-2 text-zinc-500">
          Order <span className="font-mono">#{orderId}</span> is confirmed. We'll be in touch.
        </p>
        <Link to="/" className="mt-6 inline-block text-accent-500 hover:underline">
          Keep shopping
        </Link>
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
          <Card key={line.product.product_id} className="flex items-center gap-4 p-4">
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
                ₱{Number(line.product.price).toFixed(2)}
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
        <Button size="lg" className="mt-6 w-full" onClick={() => setShowCheckout(true)}>
          Proceed to checkout
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

            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? "Placing order…" : `Place order — ₱${subtotal.toFixed(2)}`}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
