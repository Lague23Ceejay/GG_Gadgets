import { Link } from "react-router-dom";
import type { Product } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  const salePrice = product.attributes?.sale_price as number | undefined;
  const hasSale = typeof salePrice === "number" && salePrice > 0 && salePrice < Number(product.price);

  return (
    <Link to={`/products/${product.product_id}`}>
      <Card className="group h-full overflow-hidden p-0 transition-theme hover:border-accent-300 dark:hover:border-accent-500/50">
        <div className="relative aspect-square w-full bg-zinc-100 dark:bg-zinc-800">
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
            {hasSale && (
              <Badge tone="spark" className="absolute left-2 top-2">
                {typeof product.attributes?.discount_percent === "number"
                  ? `-${product.attributes.discount_percent}%`
                  : "Sale"}
              </Badge>
          )}
        </div>

        <div className="p-3 sm:p-4">
          <h3 className="line-clamp-1 text-sm font-medium sm:text-base">{product.name}</h3>
          <div className="mt-1.5 flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              {hasSale ? (
                <>
                  <span className="font-mono text-sm font-semibold text-danger-500 sm:text-base">
                    ₱{salePrice!.toFixed(2)}
                  </span>
                  <span className="font-mono text-xs text-zinc-400 line-through">
                    ₱{Number(product.price).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="font-mono text-sm font-semibold sm:text-base">
                  ₱{Number(product.price).toFixed(2)}
                </span>
              )}
            </div>
            {isOutOfStock && <Badge tone="danger">Sold out</Badge>}
            {!isOutOfStock && isLowStock && <Badge tone="spark">Only {product.stock} left</Badge>}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
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