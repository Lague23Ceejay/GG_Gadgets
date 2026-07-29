import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import type { Product, Order, Customer } from "@/types";

export function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Product[]>("/products"),
      api.get<Order[]>("/orders"),
      api.get<Customer[]>("/customers"),
    ])
      .then(([p, o, c]) => {
        setProducts(p);
        setOrders(o);
        setCustomers(c);
      })
      .finally(() => setLoading(false));
  }, []);

  const pendingOrders = orders.filter((o) => o.order_status === "pending").length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const revenue = orders
    .filter((o) => o.order_status === "completed")
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  const stats = [
    { label: "Products", value: products.length },
    { label: "Orders", value: orders.length },
    { label: "Pending orders", value: pendingOrders },
    { label: "Customers", value: customers.length },
    { label: "Low stock items", value: lowStock },
    { label: "Completed revenue", value: `₱${revenue.toFixed(2)}` },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-700">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-500">A quick look at how the store is doing.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-24 animate-pulse p-5" />
            ))
          : stats.map((stat) => (
              <Card key={stat.label} className="p-5">
                <p className="text-xs uppercase tracking-wide text-zinc-500">{stat.label}</p>
                <p className="mt-2 font-mono text-2xl font-semibold">{stat.value}</p>
              </Card>
            ))}
      </div>
    </div>
  );
}
