import { Fragment, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { productsApi } from "@/lib/products";
import type { Product } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Label } from "@/components/ui/Input";

interface InventoryLog {
  log_id: number;
  change_amount: number;
  reason: string;
  created_at: string;
}

export function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logForm, setLogForm] = useState({ change_amount: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    productsApi
      .list()
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleExpand = async (productId: number) => {
    if (expandedId === productId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(productId);
    setLogForm({ change_amount: "", reason: "" });
    setError(null);
    setLogsLoading(true);
    try {
      const data = await api.get<InventoryLog[]>(`/inventory/${productId}/logs`);
      setLogs(data);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleAddLog = async (e: React.FormEvent, productId: number) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post("/inventory", {
        product_id: productId,
        change_amount: Number(logForm.change_amount),
        reason: logForm.reason,
      });
      const data = await api.get<InventoryLog[]>(`/inventory/${productId}/logs`);
      setLogs(data);
      setLogForm({ change_amount: "", reason: "" });
      load(); // refresh stock numbers in the table
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log inventory change.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-700">Inventory</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Current stock levels. Expand a product to view or add manual adjustment logs.
      </p>

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3 text-right">Logs</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">
                  No products yet.
                </td>
              </tr>
            )}
            {products.map((product) => (
              <Fragment key={product.product_id}>
                <tr
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60"
                >
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3">
                    {product.stock === 0 ? (
                      <Badge tone="danger">0</Badge>
                    ) : product.stock <= 5 ? (
                      <Badge tone="spark">{product.stock}</Badge>
                    ) : (
                      product.stock
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleExpand(product.product_id)}
                      className="text-accent-500 hover:underline"
                    >
                      {expandedId === product.product_id ? "Hide" : "View"}
                    </button>
                  </td>
                </tr>

                {expandedId === product.product_id && (
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                    <td colSpan={3} className="px-4 py-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            Log history
                          </p>
                          {logsLoading ? (
                            <p className="text-sm text-zinc-500">Loading…</p>
                          ) : logs.length === 0 ? (
                            <p className="text-sm text-zinc-500">No logs yet.</p>
                          ) : (
                            <ul className="flex max-h-48 flex-col gap-1.5 overflow-y-auto text-sm">
                              {logs.map((log) => (
                                <li
                                  key={log.log_id}
                                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2 dark:bg-zinc-800"
                                >
                                  <span>{log.reason}</span>
                                  <span
                                    className={`font-mono font-semibold ${
                                      log.change_amount >= 0 ? "text-success-600" : "text-danger-500"
                                    }`}
                                  >
                                    {log.change_amount >= 0 ? "+" : ""}
                                    {log.change_amount}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            Add manual adjustment
                          </p>
                          <form
                            onSubmit={(e) => handleAddLog(e, product.product_id)}
                            className="flex flex-col gap-3"
                          >
                            <div>
                              <Label htmlFor="change_amount">
                                Change amount (use a negative number to reduce stock)
                              </Label>
                              <Input
                                id="change_amount"
                                type="number"
                                required
                                value={logForm.change_amount}
                                onChange={(e) =>
                                  setLogForm({ ...logForm, change_amount: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="reason">Reason</Label>
                              <Input
                                id="reason"
                                required
                                placeholder="e.g. Damaged stock write-off"
                                value={logForm.reason}
                                onChange={(e) => setLogForm({ ...logForm, reason: e.target.value })}
                              />
                            </div>
                            {error && <p className="text-sm text-danger-500">{error}</p>}
                            <Button type="submit" size="sm" disabled={submitting}>
                              {submitting ? "Saving…" : "Add log"}
                            </Button>
                          </form>
                        </div>
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