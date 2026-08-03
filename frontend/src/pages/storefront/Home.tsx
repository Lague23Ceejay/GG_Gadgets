import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productsApi } from "@/lib/products";
import type { Product } from "@/types";
import { ProductCard, ProductGridSkeleton } from "@/components/storefront/ProductCard";
import { EventsCarousel } from "@/components/storefront/EventsCarousel";

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    productsApi
      .list()
      .then(setProducts)
      .catch(() => setError("Couldn't load products. Check that the backend is running."))
      .finally(() => setLoading(false));
  }, []);

  const featured = products.filter((p) => p.attributes?.featured === true);
  const onSale = products.filter((p) => {
    const salePrice = p.attributes?.sale_price as number | undefined;
    return typeof salePrice === "number" && salePrice > 0 && salePrice < Number(p.price);
  });

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-zinc-200 transition-theme dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent-500">
            Now shipping
          </p>
          <h1 className="max-w-2xl font-display text-4xl font-700 leading-tight tracking-tight sm:text-5xl">
            Gear that actually keeps up with you.
          </h1>
          <p className="mt-4 max-w-xl text-zinc-600 dark:text-zinc-400">
            Curated gadgets, checked stock, straight to your door. No filler, just the good stuff.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-accent-500 px-6 text-base font-medium text-white transition-theme hover:bg-accent-600"
          >
            Shop all products →
          </Link>
        </div>
      </section>

      {loading && (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <ProductGridSkeleton count={4} />
        </section>
      )}

      {error && (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="rounded-lg bg-danger-500/10 px-4 py-3 text-sm text-danger-600">{error}</p>
        </section>
      )}

      {!loading && !error && onSale.length > 0 && (
        <ShowcaseSection title="On sale" subtitle="Limited-time price drops." products={onSale} />
      )}

      {!loading && !error && featured.length > 0 && (
        <ShowcaseSection
          title="Best sellers"
          subtitle="What everyone's actually buying."
          products={featured}
        />
      )}

      {!loading && !error && featured.length === 0 && onSale.length === 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6">
          <p className="text-zinc-500">
            Nothing featured yet.{" "}
            <Link to="/shop" className="text-accent-500 hover:underline">
              Browse the full shop →
            </Link>
          </p>
        </section>
      )}
      <EventsCarousel />

      {!loading && !error && (featured.length > 0 || onSale.length > 0) && (
        <section className="mx-auto max-w-6xl px-4 pb-16 text-center sm:px-6">
          <Link
            to="/shop"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-zinc-100 px-6 text-base font-medium text-zinc-900 transition-theme hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            See everything in the shop →
          </Link>
        </section>
      )}
    </div>
  );
}

function ShowcaseSection({
  title,
  subtitle,
  products,
}: {
  title: string;
  subtitle: string;
  products: Product[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-5">
        <h2 className="font-display text-xl font-700 sm:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.product_id} product={product} />
        ))}
      </div>
    </section>
  );
}