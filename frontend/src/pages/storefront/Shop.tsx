import { useEffect, useMemo, useState } from "react";
import { productsApi } from "@/lib/products";
import { api } from "@/lib/api";
import type { Product, Category } from "@/types";
import { Input } from "@/components/ui/Input";
import { ProductCard, ProductGridSkeleton } from "@/components/storefront/ProductCard";
import { useSearchParams } from "react-router-dom";
import { hasActiveSale } from "@/lib/pricing";

export function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"all" | "sale">(
  searchParams.get("tab") === "sale" ? "sale" : "all"
);

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

      const matchesTab = activeTab === "all" || hasActiveSale(product);

          return matchesSearch && matchesCategory && matchesTab;
        });
      }, [products, search, activeCategory, activeTab]);

  return (
    <div>
      {/* Filters: tabs (left) + category pills (right) on one row, search below */}
<section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex gap-2">
      <button
        onClick={() => setActiveTab("all")}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-theme ${
          activeTab === "all"
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
        }`}
      >
        All Products
      </button>
      <button
        onClick={() => setActiveTab("sale")}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-theme ${
          activeTab === "sale"
            ? "bg-danger-500 text-white"
            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
        }`}
      >
        🔥 On Sale
      </button>
    </div>

    {categories.length > 0 && (
      <div className="flex flex-wrap gap-2 sm:justify-end">
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
  </div>

  <Input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search products…"
    className="mt-4 max-w-sm"
  />
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