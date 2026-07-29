import { useEffect, useState } from "react";
import { productsApi } from "@/lib/products";
import type { Product } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

const emptyForm = { name: "", description: "", price: "", stock: "" };

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    productsApi
      .list()
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.product_id);
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      stock: String(product.stock),
    });
    setError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: Record<string, unknown> = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      attributes: {},
    };
    // Only include category_id if one is actually selected — the backend
    // treats an explicit null as "invalid category", not "no category".

    try {
      if (editingId) {
        await productsApi.update(editingId, payload);
      } else {
        await productsApi.create(payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id: number) => {
    if (!confirm("Archive this product? It will be hidden from the storefront.")) return;
    await productsApi.archive(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-700">Products</h1>
          <p className="mt-1 text-sm text-zinc-500">{products.length} total</p>
        </div>
        <Button onClick={openCreate}>+ New product</Button>
      </div>

      {showForm && (
        <Card className="mt-4 p-5">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>

            {error && <p className="text-sm text-danger-500 sm:col-span-2">{error}</p>}

            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : editingId ? "Save changes" : "Create product"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
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
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                  No products yet. Create your first one above.
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr
                key={product.product_id}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60"
              >
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3 font-mono">₱{Number(product.price).toFixed(2)}</td>
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
                    onClick={() => openEdit(product)}
                    className="mr-3 text-accent-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleArchive(product.product_id)}
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
