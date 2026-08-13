import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { HomepageSectionKey, PublicSettings } from "@/types";

const SECTION_LABELS: Record<HomepageSectionKey, string> = {
  events: "Promo events carousel",
  on_sale: "On sale products",
  best_sellers: "Best sellers (featured products)",
};

const DEFAULT_ORDER: HomepageSectionKey[] = ["events", "on_sale", "best_sellers"];

export function AdminHomepageLayout() {
  const [order, setOrder] = useState<HomepageSectionKey[]>(DEFAULT_ORDER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    api
      .get<PublicSettings>("/settings/public")
      .then((s) => {
        if (s.homepage_layout && s.homepage_layout.length === DEFAULT_ORDER.length) {
          setOrder(s.homepage_layout);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.put("/settings", { key: "homepage_layout", value: order });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-zinc-500">Loading…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-700">Homepage layout</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Drag to reorder the sections shown on the homepage below the hero banner (the hero itself is
        always first and can't be reordered).
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {order.map((key, index) => (
          <Card
            key={key}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
            className={`flex cursor-grab items-center justify-between p-4 active:cursor-grabbing ${
              dragIndex === index ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-zinc-400" aria-hidden>
                ⠿
              </span>
              <span className="font-mono text-xs text-zinc-400">{index + 1}</span>
              <span className="font-medium">{SECTION_LABELS[key]}</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="rounded p-1 text-zinc-400 hover:text-accent-500 disabled:opacity-30"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                onClick={() => move(index, 1)}
                disabled={index === order.length - 1}
                className="rounded p-1 text-zinc-400 hover:text-accent-500 disabled:opacity-30"
                aria-label="Move down"
              >
                ↓
              </button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save order"}
        </Button>
        {saved && <span className="text-sm text-success-600">Saved ✓</span>}
      </div>
    </div>
  );
}