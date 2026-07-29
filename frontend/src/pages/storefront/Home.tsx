import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productsApi } from "@/lib/products";
import type { Product } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

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
        </div>
      </section>

      {/* Product grid */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {loading && <GridSkeleton />}

        {error && (
          <p className="rounded-lg bg-danger-500/10 px-4 py-3 text-sm text-danger-600">{error}</p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-zinc-500">No products yet. Add some from the admin panel.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  return (
    <Link to={`/products/${product.product_id}`}>
      <Card className="group h-full overflow-hidden p-0 transition-theme hover:border-accent-300 dark:hover:border-accent-500/50">
        <div className="aspect-square w-full bg-zinc-100 dark:bg-zinc-800">
          {primaryImage ? (
            <img
              src={primaryImage.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400 dark:text-zinc-600">
              <PlaceholderIcon />
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4">
          <h3 className="line-clamp-1 text-sm font-medium sm:text-base">{product.name}</h3>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="font-mono text-sm font-semibold sm:text-base">
              ₱{Number(product.price).toFixed(2)}
            </span>
            {isOutOfStock && <Badge tone="danger">Sold out</Badge>}
            {isLowStock && <Badge tone="spark">Only {product.stock} left</Badge>}
          </div>
        </div>
      </Card>
    </Link>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square rounded-xl bg-zinc-100 dark:bg-zinc-800" />
          <div className="mt-2 h-4 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="mt-1.5 h-4 w-1/3 rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

function PlaceholderIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="m21 15-5-5L5 21" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
