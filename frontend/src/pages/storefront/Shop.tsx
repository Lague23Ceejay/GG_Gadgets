import { useEffect, useMemo, useState } from "react";
import { productsApi } from "@/lib/products";
import { api } from "@/lib/api";
import type { Product, Category } from "@/types";
import { Input } from "@/components/ui/Input";
import { ProductCard, ProductGridSkeleton } from "@/components/storefront/ProductCard";

export function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([productsApi.list(), api.get<Category[]>("/categories")])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .catch(() => setError("Couldn't load products. Check that the backend is running."))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.description ?? "").toLowerCase().includes(query);

      const matchesCategory =
        !activeCategory || (product.categories ?? []).some((c) => c.name === activeCategory);

      return matchesSearch && matchesCategory;
    });
  }, [products, search, activeCategory]);

  return (
    <div>
      <section className="border-b border-zinc-200 transition-theme dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h1 className="font-display text-3xl font-700 tracking-tight">Shop</h1>
          <p className="mt-1 text-zinc-500">Everything we've got, in one place.</p>
        </div>
      </section>

      {/* Search + category filter */}
      <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="max-w-sm"
        />

        {categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-theme ${
                activeCategory === null
                  ? "bg-accent-500 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.category_id}
                onClick={() => setActiveCategory(cat.name)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-theme ${
                  activeCategory === cat.name
                    ? "bg-accent-500 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Product grid */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {loading && <ProductGridSkeleton />}

        {error && (
          <p className="rounded-lg bg-danger-500/10 px-4 py-3 text-sm text-danger-600">{error}</p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-zinc-500">No products yet. Add some from the admin panel.</p>
        )}

        {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
          <p className="text-zinc-500">No products match your search.</p>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}