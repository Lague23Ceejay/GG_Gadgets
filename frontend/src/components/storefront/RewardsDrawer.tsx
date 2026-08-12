import { useEffect, useState } from "react";
import { loyaltyApi } from "@/lib/loyalty";
import type { PhysicalReward } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RewardsDrawerProps {
  email: string;
  onVerifiedRewardChange: (rewardId: number | null) => void;
}

export function RewardsDrawer({ email, onVerifiedRewardChange }: RewardsDrawerProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [rewards, setRewards] = useState<PhysicalReward[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset everything if the email changes after a reward was already picked/verified
  useEffect(() => {
    setSelectedId(null);
    setOtpSent(false);
    setOtpCode("");
    setVerified(false);
    onVerifiedRewardChange(null);
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

  const handleSelect = (reward: PhysicalReward) => {
    if (balance === null || balance < reward.point_cost) return;
    setSelectedId(reward.reward_id);
    setOtpSent(false);
    setOtpCode("");
    setVerified(false);
    onVerifiedRewardChange(null);
    setError(null);
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
        onVerifiedRewardChange(selectedId);
      } else {
        setError("That code didn't work.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  // Hidden state — no valid email with points yet
  if (balance === null || balance <= 0) return null;

  return (
    <div className="rounded-xl border border-accent-200 bg-accent-50 p-4 dark:border-accent-500/30 dark:bg-accent-500/10">
      <p className="text-sm font-semibold text-accent-700 dark:text-accent-300">
        🎁 You have {balance} points available!
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {rewards.map((reward) => {
          const affordable = balance >= reward.point_cost;
          const isSelected = selectedId === reward.reward_id;
          return (
            <button
              key={reward.reward_id}
              type="button"
              disabled={!affordable}
              onClick={() => handleSelect(reward)}
              className={`rounded-lg border p-2 text-left transition-theme ${
                !affordable
                  ? "cursor-not-allowed border-zinc-200 opacity-40 dark:border-zinc-800"
                  : isSelected
                    ? "border-accent-500 bg-white dark:bg-zinc-900"
                    : "border-zinc-200 bg-white hover:border-accent-300 dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              {reward.image_url && (
                <div className="mb-1.5 aspect-square w-full overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
                  <img src={reward.image_url} alt="" className="h-full w-full object-cover" />
                </div>
              )}
              <p className="text-xs font-medium">{reward.item_name}</p>
              <p className="font-mono text-xs text-zinc-500">{reward.point_cost} pts</p>
            </button>
          );
        })}
      </div>

      {selectedId && !verified && (
        <div className="mt-3 flex flex-col gap-2 border-t border-accent-200 pt-3 dark:border-accent-500/30">
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
                {loading ? "Checking…" : "Apply Reward"}
              </Button>
            </div>
          )}
          {error && <p className="text-xs text-danger-500">{error}</p>}
        </div>
      )}

      {verified && (
        <p className="mt-3 border-t border-accent-200 pt-3 text-sm font-medium text-success-600 dark:border-accent-500/30">
          ✓ Reward verified — it'll be added when you place your order.
        </p>
      )}
    </div>
  );
}