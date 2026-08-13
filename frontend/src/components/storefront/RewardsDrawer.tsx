import { useEffect, useState } from "react";
import { loyaltyApi } from "@/lib/loyalty";
import type { PhysicalReward } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LOW_TIER = 3;
const MAX_HIGH_TIER = 2;

interface RewardsDrawerProps {
  email: string;
  onVerifiedRewardsChange: (rewardIds: number[]) => void;
}

export function RewardsDrawer({ email, onVerifiedRewardsChange }: RewardsDrawerProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [rewards, setRewards] = useState<PhysicalReward[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedIds([]);
    setOtpSent(false);
    setOtpCode("");
    setVerified(false);
    onVerifiedRewardsChange([]);
    setError(null);

    if (!EMAIL_RE.test(email)) {
      setBalance(null);
      setRewards([]);
      return;
    }

    let cancelled = false;
    Promise.all([loyaltyApi.getBalance(email), loyaltyApi.listActiveRewards()])
      .then(([b, r]) => {
        if (cancelled) return;
        setBalance(b.active_points);
        setRewards(r);
      })
      .catch(() => {
        if (!cancelled) {
          setBalance(null);
          setRewards([]);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const selectedRewards = rewards.filter((r) => selectedIds.includes(r.reward_id));
  const pointsSpent = selectedRewards.reduce((sum, r) => sum + r.point_cost, 0);
  const lowTierCount = selectedRewards.filter((r) => !r.is_high_end).length;
  const highTierCount = selectedRewards.filter((r) => r.is_high_end).length;
  const remaining = (balance ?? 0) - pointsSpent;

  const canSelect = (reward: PhysicalReward) => {
    if (selectedIds.includes(reward.reward_id)) return true; // always allow deselecting
    if (reward.point_cost > remaining) return false;
    if (reward.is_high_end && highTierCount >= MAX_HIGH_TIER) return false;
    if (!reward.is_high_end && lowTierCount >= MAX_LOW_TIER) return false;
    return true;
  };

  const toggleReward = (reward: PhysicalReward) => {
    if (!canSelect(reward)) return;
    setOtpSent(false);
    setOtpCode("");
    setVerified(false);
    onVerifiedRewardsChange([]);
    setError(null);
    setSelectedIds((prev) =>
      prev.includes(reward.reward_id)
        ? prev.filter((id) => id !== reward.reward_id)
        : [...prev, reward.reward_id]
    );
  };

  const handleSendCode = async () => {
    setLoading(true);
    setError(null);
    try {
      await loyaltyApi.requestOtp(email);
      setOtpSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send the code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loyaltyApi.verifyOtp(email, otpCode);
      if (result.verified) {
        setVerified(true);
        onVerifiedRewardsChange(selectedIds);
      } else {
        setError("That code didn't work.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  if (balance === null || balance <= 0) return null;

  return (
    <div className="rounded-xl border border-accent-200 bg-accent-50 p-4 dark:border-accent-500/30 dark:bg-accent-500/10">
      <p className="text-sm font-semibold text-accent-700 dark:text-accent-300">
        🎁 You have {balance} points available!
      </p>
      <p className="mt-0.5 text-xs text-accent-600 dark:text-accent-400">
        Pick up to {MAX_LOW_TIER} standard items and {MAX_HIGH_TIER} high-end items.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {rewards.map((reward) => {
          const isSelected = selectedIds.includes(reward.reward_id);
          const selectable = canSelect(reward);
          return (
            <button
              key={reward.reward_id}
              type="button"
              disabled={!selectable}
              onClick={() => toggleReward(reward)}
              className={`rounded-lg border p-2 text-left transition-theme ${
                !selectable
                  ? "cursor-not-allowed border-zinc-200 opacity-40 dark:border-zinc-800"
                  : isSelected
                    ? "border-accent-500 bg-white ring-1 ring-accent-500 dark:bg-zinc-900"
                    : "border-zinc-200 bg-white hover:border-accent-300 dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              {reward.image_url && (
                <div className="mb-1.5 aspect-square w-full overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
                  <img src={reward.image_url} alt="" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium">{reward.item_name}</p>
                {isSelected && <span className="text-accent-500">✓</span>}
              </div>
              <p className="font-mono text-xs text-zinc-500">
                {reward.point_cost} pts {reward.is_high_end && "· High-end"}
              </p>
            </button>
          );
        })}
      </div>

      {selectedIds.length > 0 && (
        <div className="mt-3 flex items-center justify-between border-t border-accent-200 pt-3 text-xs dark:border-accent-500/30">
          <span>
            {selectedIds.length} selected · {pointsSpent} pts
          </span>
          <span className="text-zinc-500">{remaining} pts remaining</span>
        </div>
      )}

      {selectedIds.length > 0 && !verified && (
        <div className="mt-3 flex flex-col gap-2">
          {!otpSent ? (
            <Button type="button" size="sm" onClick={handleSendCode} disabled={loading}>
              {loading ? "Sending…" : "Send verification code"}
            </Button>
          ) : (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="otp">4-digit code sent to your email</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="0000"
                />
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleVerify}
                disabled={loading || otpCode.length !== 4}
              >
                {loading ? "Checking…" : "Apply Rewards"}
              </Button>
            </div>
          )}
          {error && <p className="text-xs text-danger-500">{error}</p>}
        </div>
      )}

      {verified && (
        <p className="mt-3 border-t border-accent-200 pt-3 text-sm font-medium text-success-600 dark:border-accent-500/30">
          ✓ {selectedIds.length} reward{selectedIds.length > 1 ? "s" : ""} verified — added when you place your order.
        </p>
      )}
    </div>
  );
}