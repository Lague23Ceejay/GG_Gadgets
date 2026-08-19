import { useEffect, useState } from "react";
import { productsApi } from "@/lib/products";
import type { Product, PromoEventProduct } from "@/types";
import { Input, Label } from "@/components/ui/Input";

interface EventProductDiscountPickerProps {
  initialProducts: PromoEventProduct[];
  onChange: (items: { product_id: number; discount_percent: number }[]) => void;
}

export function EventProductDiscountPicker({ initialProducts, onChange }: EventProductDiscountPickerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [discounts, setDiscounts] = useState<Record<number, string>>({});

  useEffect(() => {
    productsApi.list().then(setProducts).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const ids = initialProducts.map((p) => p.product_id);
    const map: Record<number, string> = {};
    for (const p of initialProducts) map[p.product_id] = String(p.discount_percent);
    setSelectedIds(ids);
    setDiscounts(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProducts.length]);

  const emit = (ids: number[], discountMap: Record<number, string>) => {
    onChange(
      ids
        .map((id) => ({ product_id: id, discount_percent: Number(discountMap[id]) }))
        .filter((item) => Number.isFinite(item.discount_percent) && item.discount_percent > 0)
    );
  };

  const toggle = (productId: number) => {
    setSelectedIds((prevIds) => {
      const isSelected = prevIds.includes(productId);
      const nextIds = isSelected ? prevIds.filter((id) => id !== productId) : [...prevIds, productId];

      setDiscounts((prevDiscounts) => {
        const nextDiscounts = { ...prevDiscounts };
        if (!isSelected && !nextDiscounts[productId]) {
          nextDiscounts[productId] = "10";
        }
        emit(nextIds, nextDiscounts);
        return nextDiscounts;
      });

      return nextIds;
    });
  };

  const setDiscount = (productId: number, value: string) => {
    setDiscounts((prev) => {
      const next = { ...prev, [productId]: value };
      emit(selectedIds, next);
      return next;
    });
  };

  if (loading) return <p className="text-sm text-zinc-500">Loading products…</p>;
  if (products.length === 0) return <p className="text-sm text-zinc-500">No products yet.</p>;

  return (
    <div>
      <Label>Products in this event</Label>
      <div className="max-h-72 overflow-y-auto rounded-lg border border-zinc-300 dark:border-zinc-700">
        {products.map((product) => {
          const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
          const isChecked = selectedIds.includes(product.product_id);

          return (
            <div
              key={product.product_id}
              className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2 last:border-0 dark:border-zinc-800"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(product.product_id)}
                className="h-4 w-4 rounded border-zinc-300 text-accent-500 dark:border-zinc-700"
              />
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
                {primaryImage && (
                  <img src={primaryImage.image_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <span className="flex-1 truncate text-sm">{product.name}</span>
              {isChecked && (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={discounts[product.product_id] ?? ""}
                    onChange={(e) => setDiscount(product.product_id, e.target.value)}
                    className="h-8 w-16 text-center"
                  />
                  <span className="text-xs text-zinc-500">%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}