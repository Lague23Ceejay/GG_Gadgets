import { api } from "./api";
import type { Order, OrderStatus } from "@/types";

export const ordersApi = {
  list: () => api.get<Order[]>("/orders"),
  getById: (id: number) => api.get<Order>(`/orders/${id}`),
  create: (customer_id: number, extra?: Record<string, unknown>) =>
    api.post<{ new_id: number }>("/orders", { customer_id, extra }),
  updateStatus: (id: number, status: OrderStatus) =>
    api.put<{ success: boolean }>(`/orders/${id}/status`, { status }),
  archive: (id: number) => api.del<{ success: boolean }>(`/orders/${id}`),
  addItem: (payload: {
    order_id: number;
    product_id: number;
    quantity: number;
    price_each: number;
    details?: Record<string, unknown>;
  }) => api.post<{ order_item_id: number }>("/orders/items", payload),
  customerCancel: (orderId: number, email: string) =>
  api.post<{ success: boolean }>(`/orders/${orderId}/customer-cancel`, { email }),
};
