//OrderHistory.tsx
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Order } from "@/types";
import { Card } from "@/components/ui/Card";
import { Link } from "react-router-dom";

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
    
useEffect(() => {
    api
      .get<Order[]>("/orders")
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

    if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <p className="text-zinc-500">Loading your orders…</p>
      </div>
    );
  }

    if (orders.length === 0) {
    return (
        <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
            <h1 className="font-display text-2xl font-700">No orders found</h1>
            <p className="mt-2 text-zinc-500">You haven't placed any orders yet.</p>
            <Link to="/shop" className="mt-6 inline-block text-accent-500 hover:underline">
                Start shopping
            </Link>
        </div>
    );
  }

    return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-700">Order History</h1>
        <div className="mt-6 flex flex-col gap-3">
        {orders.map((order) => (
            <Card key={order.order_id} className="p-4">
                <div className="flex justify-between">
                    <div>
                        <p className="font-medium">Order #{order.order_id}</p>
                        <p className="text-sm text-zinc-500">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            </Card>
        ))}
        </div>
    </div>
  );
}