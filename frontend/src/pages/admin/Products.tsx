import { Fragment, useEffect, useState } from "react";
import { productsApi } from "@/lib/products";
import { api } from "@/lib/api";
import type { Product, Category } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ProductImageManager } from "@/pages/admin/ProductImageManager";

type DiscountType = "none" | "flat" | "percent";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  featured: false,
  discountType: "none" as DiscountType,
  discountValue: "",
  sku: "",
  barcode: "",
};

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [specs, setSpecs] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [originalCategoryIds, setOriginalCategoryIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([productsApi.list(), api.get<Category[]>("/categories")])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSpecs([]);
    setSelectedCategoryIds([]);
    setOriginalCategoryIds([]);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.product_id);

    const salePrice = product.attributes?.sale_price as number | undefined;
    const discountPercent = product.attributes?.discount_percent as number | undefined;

    setForm({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      stock: String(product.stock),
      featured: product.attributes?.featured === true,
      discountType: discountPercent ? "percent" : salePrice ? "flat" : "none",
      discountValue: discountPercent
        ? String(discountPercent)
        : salePrice
          ? String(salePrice)
          : "",
      sku: product.sku ?? "",
      barcode: product.barcode ?? "",
    });

    const existingIds = (product.categories ?? []).map((c) => c.category_id);
    setSelectedCategoryIds(existingIds);
    setOriginalCategoryIds(existingIds);

    const existingSpecs = product.attributes?.specifications;
    setSpecs(Array.isArray(existingSpecs) ? (existingSpecs as string[]) : []);
    setError(null);
    setShowForm(true);
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const addSpecRow = () => setSpecs((prev) => [...prev, ""]);
  const updateSpecRow = (index: number, value: string) =>
    setSpecs((prev) => prev.map((s, i) => (i === index ? value : s)));
  const removeSpecRow = (index: number) =>
    setSpecs((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const cleanedSpecs = specs.map((s) => s.trim()).filter(Boolean);

    const attributes: Record<string, unknown> = { featured: form.featured };

    if (form.discountType === "flat" && form.discountValue.trim()) {
      attributes.sale_price = Number(form.discountValue);
    } else if (form.discountType === "percent" && form.discountValue.trim()) {
      const pct = Number(form.discountValue);
      attributes.discount_percent = pct;
      attributes.sale_price = Number((Number(form.price) * (1 - pct / 100)).toFixed(2));
    }

    if (cleanedSpecs.length > 0) {
      attributes.specifications = cleanedSpecs;
    }

    const payload: Record<string, unknown> = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      attributes,
      sku: form.sku || null,
      barcode: form.barcode || null,
    };
    // category_id intentionally omitted — categories are now managed as a
    // many-to-many set via the separate assign/remove endpoints below,
    // not through the single category_id param on create/update.

    try {
      let productId = editingId;

      if (editingId) {
        await productsApi.update(editingId, payload);
      } else {
        const created = await productsApi.create(payload);
        productId = created.product_id;
      }

      if (productId) {
        const toAdd = selectedCategoryIds.filter((id) => !originalCategoryIds.includes(id));
        const toRemove = originalCategoryIds.filter((id) => !selectedCategoryIds.includes(id));

        await Promise.all([
          ...toAdd.map((id) => productsApi.assignCategory(productId!, id)),
          ...toRemove.map((id) => productsApi.removeCategory(productId!, id)),
        ]);
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
              <Label>Categories</Label>
              {categories.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  No categories yet — create one in the Categories tab first.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryIds.includes(cat.category_id);
                    return (
                      <button
                        key={cat.category_id}
                        type="button"
                        onClick={() => toggleCategory(cat.category_id)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-theme ${
                          isSelected
                            ? "border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300"
                            : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              )}
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

            <div>
              <Label htmlFor="sku">SKU (optional)</Label>
              <Input
                id="sku"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="Your own inventory code"
              />
            </div>
            <div>
              <Label htmlFor="barcode">Barcode (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  placeholder="UPC/EAN printed on the box"
                />
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowScanner(true)}>
                  📷 Scan
                </Button>
              </div>
              {form.barcode && (
                <button
                  type="button"
                  disabled={lookingUp}
                  onClick={async () => {
                    setLookingUp(true);
                    try {
                      const result = await api.get<{ title: string | null; description: string | null }>(
                        `/products/barcode-lookup?code=${encodeURIComponent(form.barcode)}`
                      );
                      setForm((prev) => ({
                        ...prev,
                        name: prev.name || result.title || prev.name,
                        description: prev.description || result.description || prev.description,
                      }));
                    } catch {
                      // No match or lookup unavailable — fine, admin fills in manually
                    } finally {
                      setLookingUp(false);
                    }
                  }}
                  className="mt-1 text-xs text-accent-500 hover:underline disabled:opacity-50"
                >
                  {lookingUp ? "Looking up…" : "Try auto-fill from this barcode"}
                </button>
              )}
            </div>

            <div>
              <Label htmlFor="discountType">Discount</Label>
              <select
                id="discountType"
                value={form.discountType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discountType: e.target.value as DiscountType,
                    discountValue: "",
                  })
                }
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="none">No discount</option>
                <option value="flat">Flat sale price</option>
                <option value="percent">Percentage off</option>
              </select>
            </div>

            {form.discountType !== "none" && (
              <div>
                <Label htmlFor="discountValue">
                  {form.discountType === "percent" ? "Percent off (e.g. 30)" : "Sale price"}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  step={form.discountType === "percent" ? "1" : "0.01"}
                  min="0"
                  max={form.discountType === "percent" ? "100" : undefined}
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                />
              </div>
            )}

            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id="featured"
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300 text-accent-500 dark:border-zinc-700"
              />
              <Label htmlFor="featured" className="mb-0">
                Feature on homepage (Best Sellers)
              </Label>
            </div>

            <div className="sm:col-span-2">
              <Label>Specifications</Label>
              <div className="flex flex-col gap-2">
                {specs.map((spec, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={spec}
                      onChange={(e) => updateSpecRow(index, e.target.value)}
                      placeholder="e.g. 16GB RAM, 512GB SSD"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecRow(index)}
                      className="shrink-0 rounded-lg border border-zinc-300 px-3 text-sm text-zinc-500 hover:text-danger-500 dark:border-zinc-700"
                      aria-label="Remove specification"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <Button type="button" variant="secondary" size="sm" onClick={addSpecRow} className="self-start">
                  + Add spec
                </Button>
              </div>
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
              <th className="px-4 py-3">Categories</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Images</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                  No products yet. Create your first one above.
                </td>
              </tr>
            )}
            {products.map((product) => (
              <Fragment key={product.product_id}>
                <tr className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
                  <td className="px-4 py-3 font-medium">
                    {product.name}
                    {product.attributes?.featured === true && (
                      <Badge tone="accent" className="ml-2">Featured</Badge>
                    )}
                    {typeof product.attributes?.sale_price === "number" && (
                      <Badge tone="spark" className="ml-2">
                        {typeof product.attributes?.discount_percent === "number"
                          ? `-${product.attributes.discount_percent}%`
                          : "Sale"}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {product.categories && product.categories.length > 0
                      ? product.categories.map((c) => c.name).join(", ")
                      : "—"}
                  </td>
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
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === product.product_id ? null : product.product_id)
                      }
                      className="text-accent-500 hover:underline"
                    >
                      {expandedId === product.product_id ? "Hide" : "Manage"}
                    </button>
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

                {expandedId === product.product_id && (
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                    <td colSpan={6} className="px-4 py-4">
                      <ProductImageManager productId={product.product_id} />
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