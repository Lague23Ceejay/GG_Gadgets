import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import type { PublicSettings } from "@/types";

export function AdminSettings() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .get<PublicSettings>("/settings/public")
      .then(setSettings)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleSetting = async (key: "points_enabled" | "maintenance_mode") => {
    if (!settings) return;
    setError(null);
    setSaving(key);

    const newValue = !settings[key];
    // Optimistic update so the toggle feels instant
    setSettings({ ...settings, [key]: newValue });

    try {
      await api.put("/settings", { key, value: newValue });
    } catch (err) {
      // Roll back on failure
      setSettings({ ...settings, [key]: !newValue });
      setError(err instanceof Error ? err.message : "Failed to update setting.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-700">Settings</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Global toggles affecting the whole storefront — Super Admin only.
      </p>

      {loading && <p className="mt-4 text-sm text-zinc-500">Loading…</p>}
      {error && <p className="mt-4 text-sm text-danger-500">{error}</p>}

      {!loading && settings && (
        <div className="mt-4 flex flex-col gap-4">
          <Card className="flex items-center justify-between p-5">
            <div>
              <p className="font-medium">Loyalty points</p>
              <p className="mt-0.5 text-sm text-zinc-500">
                When on, customers earn points from completed orders (1 point per ₱
                {settings.points_per_currency} spent) and can view them via "My Orders."
              </p>
            </div>
            <ToggleSwitch
              checked={settings.points_enabled}
              disabled={saving === "points_enabled"}
              onClick={() => toggleSetting("points_enabled")}
            />
          </Card>

          <Card className="flex items-center justify-between p-5">
            <div>
              <p className="font-medium">Maintenance mode</p>
              <p className="mt-0.5 text-sm text-zinc-500">
                When on, the public storefront shows a "back soon" page instead of the shop. The
                admin panel stays accessible so staff can turn it back off.
              </p>
            </div>
            <ToggleSwitch
              checked={settings.maintenance_mode}
              disabled={saving === "maintenance_mode"}
              onClick={() => toggleSetting("maintenance_mode")}
            />
          </Card>
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({
  checked,
  disabled,
  onClick,
}: {
  checked: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out
        ${checked ? "bg-accent-500" : "bg-zinc-300 dark:bg-zinc-700"}
        disabled:opacity-50`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out
          ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}
