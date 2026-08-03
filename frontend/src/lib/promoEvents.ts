import { api } from "./api";
import type { PromoEvent } from "@/types";

export const promoEventsApi = {
  listActive: () => api.get<PromoEvent[]>("/promo-events"),
  listAll: () => api.get<PromoEvent[]>("/promo-events/admin"),
  create: (payload: Partial<PromoEvent>) => api.post<{ event_id: number }>("/promo-events", payload),
  update: (id: number, payload: Partial<PromoEvent>) =>
    api.put<{ success: boolean }>(`/promo-events/${id}`, payload),
  archive: (id: number) => api.del<{ success: boolean }>(`/promo-events/${id}`),
};