import { api } from "./api";
import type { Product, ProductImage } from "@/types";

export const productsApi = {
  list: () => api.get<Product[]>("/products"),
  getById: (id: number) => api.get<Product>(`/products/${id}`),
  create: (payload: Partial<Product>) => api.post<{ product_id: number }>("/products", payload),
  update: (id: number, payload: Partial<Product>) =>
    api.put<{ success: boolean }>(`/products/${id}`, payload),
  archive: (id: number) => api.del<{ success: boolean }>(`/products/${id}`),

  // Images
  listImages: (productId: number) => api.get<ProductImage[]>(`/products/${productId}/images`),
  addImage: (productId: number, imageUrl: string, isPrimary?: boolean) =>
    api.post<{ image_id: number }>(`/products/${productId}/images`, {
      image_url: imageUrl,
      is_primary: isPrimary ?? false,
    }),
  deleteImage: (imageId: number) =>
    api.del<{ success: boolean }>(`/products/images/${imageId}`),
};