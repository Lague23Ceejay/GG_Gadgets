import { useEffect, useMemo, useState } from "react";
import { productsApi } from "@/lib/products";
import { api } from "@/lib/api";
import type { Product, Category } from "@/types";
import { Input } from "@/components/ui/Input";
import { ProductCard, ProductGridSkeleton } from "@/components/storefront/ProductCard";
import { Link, useSearchParams } from "react-router-dom";
import { hasActiveSale } from "@/lib/pricing";
import AccordionGallery from "@/components/storefront/AccordionGallery";

export function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const eventCategories = searchParams.get("category")?.split(",").filter(Boolean) ?? [];
  const eventProductIds =
    searchParams.get("products")?.split(",").map(Number).filter((n) => !isNaN(n)) ?? [];
  const eventName = searchParams.get("event");
  const hasEventFilter = (eventCategories.length > 0 || eventProductIds.length > 0) && !!eventName;

  const [activeTab, setActiveTab] = useState<"all" | "sale" | "event">(
    hasEventFilter ? "event" : "all"
  );

  const exitEventTab = () => {
    setActiveTab("all");
    setSearchParams({});
  };

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
    const matchesSearch = (product: Product) =>
      !query ||
      product.name.toLowerCase().includes(query) ||
      (product.description ?? "").toLowerCase().includes(query);

    if (activeTab === "event" && hasEventFilter) {
      return products.filter((product) => {
        const matchesEventCategory =
          eventCategories.length > 0 &&
          (product.categories ?? []).some((c) => eventCategories.includes(c.name));
        const matchesEventProduct = eventProductIds.includes(product.product_id);
        return (matchesEventCategory || matchesEventProduct) && matchesSearch(product);
      });
    }

    return products.filter((product) => {
      const matchesCategory =
        !activeCategory || (product.categories ?? []).some((c) => c.name === activeCategory);
      const matchesTab = activeTab === "all" || hasActiveSale(product);
      return matchesSearch(product) && matchesCategory && matchesTab;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, search, activeCategory, activeTab]);

  return (
    <div>
      {/* Filters */}
      <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {hasEventFilter && (
              <button
                onClick={() => setActiveTab("event")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-theme ${
                  activeTab === "event"
                    ? "bg-accent-500 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                ✨ {eventName}
              </button>
            )}
            <button
              onClick={() => (hasEventFilter ? exitEventTab() : setActiveTab("all"))}
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

          {categories.length > 0 && activeTab !== "event" && (
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

      {/* Event gallery above product grid */}
      {activeTab === "event" && filteredProducts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
          <AccordionGallery
            items={filteredProducts.map((p) => ({
              image: (p.images?.find((img) => img.is_primary) ?? p.images?.[0])?.image_url ?? "",
              label: p.name,
              link: `/products/${p.product_id}`,
            }))}
            defaultIndex={0}
            trigger="hover"
            accentColor="#5B5FEF"
            overlayColor="#0B0B0F"
          />
        </section>
      )}

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
