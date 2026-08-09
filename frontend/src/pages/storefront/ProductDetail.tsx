import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { productsApi } from "@/lib/products";
import type { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "@/context/CartContext";
import { getEffectivePrice, hasActiveSale } from "@/lib/pricing";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (!id) return;
    productsApi
      .getById(Number(id))
      .then(setProduct)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">Loading…</div>;
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl font-700">Product not found</h1>
        <p className="mt-2 text-zinc-500">It may have been archived or the link is wrong.</p>
        <Link to="/" className="mt-6 inline-block text-accent-500 hover:underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 sm:grid-cols-2 sm:gap-12">
        <div className="aspect-square overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
          {primaryImage ? (
            <img src={primaryImage.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">No image</div>
          )}
        </div>

        <div>
          {product.categories && product.categories.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {product.categories.map((cat) => (
                 <Badge key={cat.category_id} tone="accent">
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}

          <h1 className="font-display text-2xl font-700 tracking-tight sm:text-3xl">{product.name}</h1>
          {hasActiveSale(product) ? (
            <div className="mt-3 flex items-baseline gap-2">
              <p className="font-mono text-2xl font-semibold text-danger-500">
                ₱{getEffectivePrice(product).toFixed(2)}
              </p>
              <p className="font-mono text-lg text-zinc-400 line-through">
                ₱{Number(product.price).toFixed(2)}
              </p>
              {typeof product.attributes?.discount_percent === "number" && (
                <Badge tone="spark">-{product.attributes.discount_percent}%</Badge>
              )}
            </div>
          ) : (
            <p className="mt-3 font-mono text-2xl font-semibold">₱{Number(product.price).toFixed(2)}</p>
          )}

          {product.description && (
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">{product.description}</p>
          )}

          <div className="mt-4">
            {isOutOfStock ? (
              <Badge tone="danger">Out of stock</Badge>
            ) : product.stock <= 5 ? (
              <Badge tone="spark">Only {product.stock} left in stock</Badge>
            ) : (
              <Badge tone="success">In stock</Badge>
            )}
          </div>

          {Array.isArray(product.attributes?.specifications) &&
            (product.attributes.specifications as string[]).length > 0 && (
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  Specifications
                </h3>
                <ul className="flex flex-col gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                  {(product.attributes.specifications as string[]).map((spec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent-500" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-zinc-300 dark:border-zinc-700">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-10 w-10 text-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                aria-label="Decrease quantity"
              >
                –
              </button>
              <span className="w-10 text-center font-mono text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="h-10 w-10 text-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                aria-label="Increase quantity"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>

            <Button size="lg" onClick={handleAddToCart} disabled={isOutOfStock} className="flex-1">
              {added ? "Added ✓" : isOutOfStock ? "Out of stock" : "Add to cart"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
