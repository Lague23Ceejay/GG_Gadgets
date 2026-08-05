import type { Product } from "@/types";

/**
 * The price a customer actually pays — the sale price if one is set and
 * valid, otherwise the regular price. Used everywhere a price is displayed
 * or charged (product cards, product detail, cart subtotal, checkout),
 * so there's exactly one place that decides "which price counts."
 */
export function getEffectivePrice(product: Product): number {
  const salePrice = product.attributes?.sale_price as number | undefined;
  const regularPrice = Number(product.price);

  if (typeof salePrice === "number" && salePrice > 0 && salePrice < regularPrice) {
    return salePrice;
  }
  return regularPrice;
}

export function hasActiveSale(product: Product): boolean {
  return getEffectivePrice(product) < Number(product.price);
}