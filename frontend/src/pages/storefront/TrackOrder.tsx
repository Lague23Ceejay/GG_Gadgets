import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import type { OrderStatus } from "@/types";

const STATUS_TONE: Record<OrderStatus, "spark" | "success" | "danger"> = {
  pending: "spark",
  completed: "success",
  cancelled: "danger",
};

interface TrackedOrder {
  order_id: number;
  order_status: OrderStatus;
  total_amount: number;
  created_at: string;
  items: { product_name: string; quantity: number; price_each: number }[] | null;
}

export function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const data = await api.get<TrackedOrder>(
        `/orders/track?order_id=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`
      );
      setOrder(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl font-700">Track your order</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Enter your order number and the email you checked out with.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="orderId">Order number</Label>
          <Input
            id="orderId"
            type="number"
            required
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. 42"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-danger-500">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? "Looking up…" : "Track order"}
        </Button>
      </form>

      {order && (
        <Card className="mt-6 p-5">
          <div className="flex items-center justify-between">
            <p className="font-mono font-medium">Order #{order.order_id}</p>
            <Badge tone={STATUS_TONE[order.order_status]}>{order.order_status}</Badge>
          </div>

          <ul className="mt-4 flex flex-col gap-1.5 text-sm">
            {order.items?.map((item, i) => (
              <li key={i} className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>
                  {item.product_name} × {item.quantity}
                </span>
                <span className="font-mono">
                  ₱{(item.quantity * Number(item.price_each)).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-between border-t border-zinc-200 pt-3 text-sm font-semibold dark:border-zinc-800">
            <span>Total</span>
            <span className="font-mono">₱{Number(order.total_amount).toFixed(2)}</span>
          </div>
        </Card>
      )}
    </div>
  );
}