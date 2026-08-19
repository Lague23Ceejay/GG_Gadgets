import { useEffect, useMemo, useState } from "react";
import { productsApi } from "@/lib/products";
import { api } from "@/lib/api";
import type { Product, Category } from "@/types";
import { Label } from "@/components/ui/Input";

interface ProductLinkPickerProps {
  value: string;
  onChange: (url: string) => void;
}

function parseLinkUrl(url: string): { categories: string[]; productIds: number[] } {
  try {
    const q = url.split("?")[1] ?? "";
    const params = new URLSearchParams(q);
    const categories = params.get("category")?.split(",").filter(Boolean) ?? [];
    const productIds =
      params.get("products")?.split(",").map(Number).filter((n) => !isNaN(n)) ?? [];
    return { categories, productIds };
  } catch {
    return { categories: [], productIds: [] };
  }
}

function buildLinkUrl(categories: string[], productIds: number[]): string {
  const params = new URLSearchParams();
  if (categories.length > 0) params.set("category", categories.join(","));
  if (productIds.length > 0) params.set("products", productIds.join(","));
  const query = params.toString();
  return query ? `/shop?${query}` : "";
}

export function ProductLinkPicker({ value, onChange }: ProductLinkPickerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  useEffect(() => {
    Promise.all([productsApi.list(), api.get<Category[]>("/categories")])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    const parsed = parseLinkUrl(value);
    setSelectedCategories(parsed.categories);
    setSelectedProductIds(parsed.productIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  const productsByCategory = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const cat of categories) {
      map.set(
        cat.name,
        products.filter((p) => (p.categories ?? []).some((c) => c.category_id === cat.category_id))
      );
    }
    const uncategorized = products.filter((p) => !p.categories || p.categories.length === 0);
    if (uncategorized.length > 0) map.set("Uncategorized", uncategorized);
    return map;
  }, [products, categories]);

  const emitChange = (nextCategories: string[], nextProductIds: number[]) => {
    onChange(buildLinkUrl(nextCategories, nextProductIds));
  };

  const toggleCategory = (categoryName: string, categoryProducts: Product[]) => {
    const isSelected = selectedCategories.includes(categoryName);
    const productIds = categoryProducts.map((p) => p.product_id);

    if (isSelected) {
      const nextCategories = selectedCategories.filter((c) => c !== categoryName);
      setSelectedCategories(nextCategories);
      emitChange(nextCategories, selectedProductIds);
    } else {
      const nextCategories = [...selectedCategories, categoryName];
      const nextProductIds = selectedProductIds.filter((id) => !productIds.includes(id));
      setSelectedCategories(nextCategories);
      setSelectedProductIds(nextProductIds);
      emitChange(nextCategories, nextProductIds);
    }
  };

  const toggleProduct = (product: Product, categoryName: string) => {
    if (selectedCategories.includes(categoryName)) {
      const categoryProducts = productsByCategory.get(categoryName) ?? [];
      const nextCategories = selectedCategories.filter((c) => c !== categoryName);
      const nextProductIds = [
        ...selectedProductIds,
        ...categoryProducts.map((p) => p.product_id).filter((id) => id !== product.product_id),
      ];
      setSelectedCategories(nextCategories);
      setSelectedProductIds(nextProductIds);
      emitChange(nextCategories, nextProductIds);
      return;
    }

    const isSelected = selectedProductIds.includes(product.product_id);
    const nextProductIds = isSelected
      ? selectedProductIds.filter((id) => id !== product.product_id)
      : [...selectedProductIds, product.product_id];
    setSelectedProductIds(nextProductIds);
    emitChange(selectedCategories, nextProductIds);
  };

  if (loading) return <p className="text-sm text-zinc-500">Loading products…</p>;

  if (products.length === 0) {
    return <p className="text-sm text-zinc-500">No products yet — add some first.</p>;
  }

  return (
    <div>
      <Label>Link to products/categories (optional)</Label>
      <div className="max-h-64 overflow-y-auto rounded-lg border border-zinc-300 dark:border-zinc-700">
        {Array.from(productsByCategory.entries()).map(([categoryName, categoryProducts]) => {
          if (categoryProducts.length === 0) return null;
          const categoryChecked = selectedCategories.includes(categoryName);

          return (
            <div key={categoryName} className="border-b border-zinc-200 last:border-0 dark:border-zinc-800">
              <label className="flex cursor-pointer items-center gap-2 bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                <input
                  type="checkbox"
                  checked={categoryChecked}
                  onChange={() => toggleCategory(categoryName, categoryProducts)}
                  className="h-4 w-4 rounded border-zinc-300 text-accent-500 dark:border-zinc-700"
                />
                <span className="text-sm font-semibold">{categoryName}</span>
                <span className="text-xs text-zinc-500">({categoryProducts.length})</span>
              </label>

              <div className="flex flex-col">
                {categoryProducts.map((product) => {
                  const primaryImage =
                    product.images?.find((img) => img.is_primary) ?? product.images?.[0];
                  const checked = categoryChecked || selectedProductIds.includes(product.product_id);

                  return (
                    <label
                      key={product.product_id}
                      className="flex cursor-pointer items-center gap-2 px-3 py-1.5 pl-8 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleProduct(product, categoryName)}
                        className="h-4 w-4 rounded border-zinc-300 text-accent-500 dark:border-zinc-700"
                      />
                      <div className="h-6 w-6 shrink-0 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
                        {primaryImage && (
                          <img
                            src={primaryImage.image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <span className="text-sm">{product.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {value && <p className="mt-1 truncate text-xs text-zinc-500">Links to: {value}</p>}
    </div>
  );
}