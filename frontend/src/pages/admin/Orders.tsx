import { Fragment, useEffect, useState } from "react";
import { ordersApi } from "@/lib/orders";
import { productsApi } from "@/lib/products";
import type { Order, OrderStatus, Product } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Label } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";

const STATUS_TONE: Record<OrderStatus, "spark" | "success" | "danger"> = {
  pending: "spark",
  completed: "success",
  cancelled: "danger",
};

const emptyItemForm = { product_id: "", quantity: "1" };

export function AdminOrders() {
const { user } = useAuth();
const canEditItems = user?.role !== "fulfillment";
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<Order | null>(null);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([ordersApi.list(), productsApi.list()])
      .then(([o, p]) => {
        setOrders(o);
        setProducts(p);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleExpand = async (orderId: number) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      setExpandedOrder(null);
      return;
    }
    setExpandedId(orderId);
    setItemForm(emptyItemForm);
    setError(null);
    const data = await ordersApi.getById(orderId);
    setExpandedOrder(data);
  };

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    await ordersApi.updateStatus(orderId, status);
    load();
    if (expandedId === orderId) {
      const data = await ordersApi.getById(orderId);
      setExpandedOrder(data);
    }
  };

  const handleArchive = async (id: number) => {
    if (!confirm("Archive this order?")) return;
    await ordersApi.archive(id);
    load();
  };

  const handleAddItem = async (e: React.FormEvent, orderId: number) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const product = products.find((p) => p.product_id === Number(itemForm.product_id));
    if (!product) {
      setError("Pick a product.");
      setSubmitting(false);
      return;
    }

    try {
      await ordersApi.addItem({
        order_id: orderId,
        product_id: product.product_id,
        quantity: Number(itemForm.quantity),
        price_each: Number(product.price),
      });
      const data = await ordersApi.getById(orderId);
      setExpandedOrder(data);
      setItemForm(emptyItemForm);
      load(); // refresh totals
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-700">Orders</h1>
      <p className="mt-1 text-sm text-zinc-500">{orders.length} total</p>

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                  No orders yet.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <Fragment key={order.order_id}>
                <tr
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60"
                >
                  <td className="px-4 py-3 font-mono font-medium">#{order.order_id}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.order_status}
                      onChange={(e) =>
                        handleStatusChange(order.order_id, e.target.value as OrderStatus)
                      }
                      className="rounded-lg border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <Badge tone={STATUS_TONE[order.order_status]} className="ml-2">
                      {order.order_status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono">₱{Number(order.total_amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleExpand(order.order_id)}
                      className="mr-3 text-accent-500 hover:underline"
                    >
                      {expandedId === order.order_id ? "Hide" : "View items"}
                    </button>
                    {canEditItems && (
                    <button
                      onClick={() => handleArchive(order.order_id)}
                      className="text-danger-500 hover:underline"
                    >
                      Archive
                    </button>
                    )}
                  </td>
                </tr>

                {expandedId === order.order_id && (
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                    <td colSpan={4} className="px-4 py-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            Items
                          </p>
                          {!expandedOrder?.items || expandedOrder.items.length === 0 ? (
                            <p className="text-sm text-zinc-500">No items yet.</p>
                          ) : (
                            <ul className="flex flex-col gap-1.5 text-sm">
                              {expandedOrder.items.map((item) => (
                                <li
                                  key={item.order_item_id}
                                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2 dark:bg-zinc-800"
                                >
                                  <span>
                                    {item.product_name ?? `Product #${item.product_id}`} ×{" "}
                                    {item.quantity}
                                  </span>
                                  <span className="font-mono">
                                    ₱{(item.quantity * Number(item.price_each)).toFixed(2)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        {canEditItems && (
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            Add item
                          </p>
                          <form
                            onSubmit={(e) => handleAddItem(e, order.order_id)}
                            className="flex flex-col gap-3"
                          >
                            <div>
                              <Label htmlFor="product">Product</Label>
                              <select
                                id="product"
                                required
                                value={itemForm.product_id}
                                onChange={(e) =>
                                  setItemForm({ ...itemForm, product_id: e.target.value })
                                }
                                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                              >
                                <option value="">Select a product…</option>
                                {products.map((p) => (
                                  <option key={p.product_id} value={p.product_id}>
                                    {p.name} (stock: {p.stock})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Label htmlFor="quantity">Quantity</Label>
                              <Input
                                id="quantity"
                                type="number"
                                min={1}
                                required
                                value={itemForm.quantity}
                                onChange={(e) =>
                                  setItemForm({ ...itemForm, quantity: e.target.value })
                                }
                              />
                            </div>
                            {error && <p className="text-sm text-danger-500">{error}</p>}
                            <Button type="submit" size="sm" disabled={submitting}>
                              {submitting ? "Adding…" : "Add item"}
                            </Button>
                          </form>
                        </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}