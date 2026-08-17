import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import type { CustomerOrderHistory, OrderStatus } from "@/types";
import { ordersApi } from "@/lib/orders";

const STATUS_TONE: Record<OrderStatus, "spark" | "success" | "danger"> = {
  pending: "spark",
  completed: "success",
  cancelled: "danger",
};

export function OrderHistory() {
  const [email, setEmail] = useState("");
  const [data, setData] = useState<CustomerOrderHistory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await api.get<CustomerOrderHistory>(
        `/settings/order-history?email=${encodeURIComponent(email)}`
      );
      setData(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId: number) => {
  if (!confirm('Cancel this order?')) return;
  setCancellingId(orderId);
  try {
    await ordersApi.customerCancel(orderId, email);
    const refreshed = await api.get<CustomerOrderHistory>(`/settings/order-history?email=${encodeURIComponent(email)}`);
    setData(refreshed);
  } catch (err) {
    setError(err instanceof ApiError ? err.message : 'Could not cancel this order.');
  } finally {
    setCancellingId(null);
  }
};

  const downloadCsv = () => {
    if (!data) return;

    const rows = [
      ["Order #", "Status", "Payment method", "Total", "Date"],
      ...data.orders.map((o) => [
        String(o.order_id),
        o.order_status,
        o.payment_method ?? "—",
        String(o.total_amount),
        new Date(o.created_at).toLocaleDateString(),
      ]),
    ];

    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `order-history-${data.customer_id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl font-700">Your order history</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Enter the email you've ordered with to see your past orders
        {data?.points_enabled !== false && " and points"}.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Looking up…" : "View history"}
        </Button>
      </form>

      {error && <p className="mt-4 text-sm text-danger-500">{error}</p>}

      {data && (
        <div className="mt-8">
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Orders</p>
              <p className="mt-1 font-mono text-xl font-semibold">{data.order_count}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Total spent</p>
              <p className="mt-1 font-mono text-xl font-semibold">
                ₱{Number(data.total_spent).toFixed(2)}
              </p>
            </Card>
            {data.points_enabled && (
              <Card className="p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Points</p>
                <p className="mt-1 font-mono text-xl font-semibold text-accent-500">
                  {data.points}
                </p>
              </Card>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <h2 className="font-display text-lg font-700">Orders</h2>
            <Button variant="secondary" size="sm" onClick={downloadCsv}>
              Download as CSV
            </Button>
          </div>

          <div className="mt-3 flex flex-col gap-3">
            {(data.orders ?? []).map((order) => (
              <Card key={order.order_id} className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono font-medium">#{order.order_id}</p>
                  <Badge tone={STATUS_TONE[order.order_status]}>{order.order_status}
                  {order.order_status === 'pending' && (
                    <button
                      onClick={() => handleCancel(order.order_id)}
                      disabled={cancellingId === order.order_id}
                      className="ml-2 text-xs text-danger-500 hover:underline disabled:opacity-50"
                    >
                      {cancellingId === order.order_id ? 'Cancelling…' : 'Cancel order'}
                    </button>
                  )}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {new Date(order.created_at).toLocaleDateString()} · {order.payment_method ?? "—"}
                </p>
                <ul className="mt-2 flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {order.items?.map((item, i) => (
                    <li key={i}>
                      {item.product_name} × {item.quantity}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-right font-mono font-semibold">
                  ₱{Number(order.total_amount).toFixed(2)}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}