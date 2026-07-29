import { api } from "./api";
import type { Product } from "@/types";

export const productsApi = {
  list: () => api.get<Product[]>("/products"),
  getById: (id: number) => api.get<Product>(`/products/${id}`),
  create: (payload: Partial<Product>) => api.post<{ product_id: number }>("/products", payload),
  update: (id: number, payload: Partial<Product>) =>
    api.put<{ success: boolean }>(`/products/${id}`, payload),
  archive: (id: number) => api.del<{ success: boolean }>(`/products/${id}`),
};
