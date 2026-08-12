import { api } from "./api";
import type { PhysicalReward } from "@/types";

export const loyaltyApi = {
  getBalance: (email: string) =>
    api.get<{ email: string; active_points: number }>(
      `/loyalty/balance?email=${encodeURIComponent(email)}`
    ),
  listActiveRewards: () => api.get<PhysicalReward[]>("/loyalty/rewards"),
  listAllRewards: () => api.get<PhysicalReward[]>("/loyalty/rewards/admin"),
  createReward: (payload: Partial<PhysicalReward>) =>
    api.post<{ reward_id: number }>("/loyalty/rewards", payload),
  updateReward: (id: number, payload: Partial<PhysicalReward>) =>
    api.put<{ success: boolean }>(`/loyalty/rewards/${id}`, payload),
  archiveReward: (id: number) => api.del<{ success: boolean }>(`/loyalty/rewards/${id}`),
  requestOtp: (email: string) => api.post<{ sent: boolean }>("/loyalty/otp/request", { email }),
  verifyOtp: (email: string, code: string) =>
    api.post<{ verified: boolean }>("/loyalty/otp/verify", { email, code }),
  redeem: (email: string, reward_id: number, order_id: number) =>
    api.post<{ success: boolean; reward_name: string }>("/loyalty/redeem", {
      email,
      reward_id,
      order_id,
    }),
};