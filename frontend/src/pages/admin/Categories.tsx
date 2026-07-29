import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Category } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

const emptyForm = { name: "", description: "" };

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get<Category[]>("/categories")
      .then(setCategories)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (category: Category) => {
    setEditingId(category.category_id);
    setForm({ name: category.name, description: category.description ?? "" });
    setError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
      } else {
        await api.post("/categories", form);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id: number) => {
    if (!confirm("Archive this category?")) return;
    await api.del(`/categories/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-700">Categories</h1>
          <p className="mt-1 text-sm text-zinc-500">{categories.length} total</p>
        </div>
        <Button onClick={openCreate}>+ New category</Button>
      </div>

      {showForm && (
        <Card className="mt-4 p-5">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {error && <p className="text-sm text-danger-500 sm:col-span-2">{error}</p>}

            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : editingId ? "Save changes" : "Create category"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Actions</th>
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
            {!loading && categories.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">
                  No categories yet. Create your first one above.
                </td>
              </tr>
            )}
            {categories.map((category) => (
              <tr
                key={category.category_id}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60"
              >
                <td className="px-4 py-3 font-medium">{category.name}</td>
                <td className="px-4 py-3 text-zinc-500">{category.description || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEdit(category)}
                    className="mr-3 text-accent-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleArchive(category.category_id)}
                    className="text-danger-500 hover:underline"
                  >
                    Archive
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}