import { Fragment, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Customer, CustomerOrderHistory, OrderStatus } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

const STATUS_TONE: Record<OrderStatus, "spark" | "success" | "danger"> = {
  pending: "spark",
  completed: "success",
  cancelled: "danger",
};

const emptyForm = { full_name: "", email: "", phone: "" };

export function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [summary, setSummary] = useState<CustomerOrderHistory | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get<Customer[]>("/customers")
      .then(setCustomers)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingId(customer.customer_id);
    setForm({
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone ?? "",
    });
    setError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = { ...form, metadata: {} };

    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, payload);
      } else {
        await api.post("/customers", payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save customer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id: number) => {
    if (!confirm("Archive this customer?")) return;
    await api.del(`/customers/${id}`);
    load();
  };

  const toggleHistory = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      setSummary(null);
      return;
    }
    setExpandedId(id);
    setSummary(null);
    setSummaryLoading(true);
    try {
      const data = await api.get<CustomerOrderHistory>(`/customers/${id}/summary`);
      setSummary(data);
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-700">Customers</h1>
          <p className="mt-1 text-sm text-zinc-500">{customers.length} total</p>
        </div>
        <Button onClick={openCreate}>+ New customer</Button>
      </div>

      {showForm && (
        <Card className="mt-4 p-5">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
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
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            {error && <p className="text-sm text-danger-500 sm:col-span-3">{error}</p>}

            <div className="flex gap-2 sm:col-span-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : editingId ? "Save changes" : "Create customer"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">History</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                  No customers yet.
                </td>
              </tr>
            )}
            {customers.map((customer) => (
              <Fragment key={customer.customer_id}>
                <tr className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
                  <td className="px-4 py-3 font-medium">{customer.full_name}</td>
                  <td className="px-4 py-3 text-zinc-500">{customer.email}</td>
                  <td className="px-4 py-3 text-zinc-500">{customer.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleHistory(customer.customer_id)}
                      className="text-accent-500 hover:underline"
                    >
                      {expandedId === customer.customer_id ? "Hide" : "View"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(customer)}
                      className="mr-3 text-accent-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleArchive(customer.customer_id)}
                      className="text-danger-500 hover:underline"
                    >
                      Archive
                    </button>
                  </td>
                </tr>

                {expandedId === customer.customer_id && (
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                    <td colSpan={5} className="px-4 py-4">
                      {summaryLoading && <p className="text-sm text-zinc-500">Loading…</p>}

                      {!summaryLoading && summary && (
                        <div>
                          <div className="mb-4 grid grid-cols-3 gap-3">
                            <div className="rounded-lg bg-white p-3 text-center dark:bg-zinc-800">
                              <p className="text-xs uppercase tracking-wide text-zinc-500">Orders</p>
                              <p className="mt-1 font-mono text-lg font-semibold">
                                {summary.order_count}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white p-3 text-center dark:bg-zinc-800">
                              <p className="text-xs uppercase tracking-wide text-zinc-500">
                                Total spent
                              </p>
                              <p className="mt-1 font-mono text-lg font-semibold">
                                ₱{Number(summary.total_spent).toFixed(2)}
                              </p>
                            </div>
                            {summary.points !== null && (
                              <div className="rounded-lg bg-white p-3 text-center dark:bg-zinc-800">
                                <p className="text-xs uppercase tracking-wide text-zinc-500">Points</p>
                                <p className="mt-1 font-mono text-lg font-semibold text-accent-500">
                                  {summary.points}
                                </p>
                              </div>
                            )}
                          </div>

                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            Orders
                          </p>
                          {summary.orders.length === 0 ? (
                            <p className="text-sm text-zinc-500">No orders yet.</p>
                          ) : (
                            <ul className="flex flex-col gap-1.5 text-sm">
                              {summary.orders.map((order) => (
                                <li
                                  key={order.order_id}
                                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2 dark:bg-zinc-800"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono">#{order.order_id}</span>
                                    <Badge tone={STATUS_TONE[order.order_status]}>
                                      {order.order_status}
                                    </Badge>
                                    {order.payment_method && (
                                      <span className="text-xs text-zinc-500">
                                        {order.payment_method}
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-mono">
                                    ₱{Number(order.total_amount).toFixed(2)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
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