import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { loyaltyApi } from "@/lib/loyalty";
import type { PhysicalReward } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

const emptyForm = { item_name: "", point_cost: "", stock_count: "", is_high_end: false, is_active: true };

export function AdminRewards() {
  const [rewards, setRewards] = useState<PhysicalReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    loyaltyApi
      .listAllRewards()
      .then(setRewards)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageUrl(null);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (reward: PhysicalReward) => {
    setEditingId(reward.reward_id);
    setForm({
      item_name: reward.item_name,
      point_cost: String(reward.point_cost),
      stock_count: String(reward.stock_count),
      is_high_end: reward.is_high_end,
      is_active: reward.is_active ?? true,
    });
    setImageUrl(reward.image_url);
    setError(null);
    setShowForm(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const token = localStorage.getItem("gg-token") ?? "";
      const blob = await upload(`rewards/${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        clientPayload: token,
      });
      setImageUrl(blob.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      item_name: form.item_name,
      point_cost: Number(form.point_cost),
      stock_count: Number(form.stock_count),
      image_url: imageUrl,
      is_high_end: form.is_high_end,
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        await loyaltyApi.updateReward(editingId, payload);
      } else {
        await loyaltyApi.createReward(payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save reward.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id: number) => {
    if (!confirm("Archive this reward?")) return;
    await loyaltyApi.archiveReward(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-700">Rewards catalog</h1>
          <p className="mt-1 text-sm text-zinc-500">{rewards.length} total</p>
        </div>
        <Button onClick={openCreate}>+ New reward</Button>
      </div>

      {showForm && (
        <Card className="mt-4 p-5">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="item_name">Item name</Label>
              <Input
                id="item_name"
                required
                value={form.item_name}
                onChange={(e) => setForm({ ...form, item_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="point_cost">Point cost</Label>
              <Input
                id="point_cost"
                type="number"
                min="1"
                required
                value={form.point_cost}
                onChange={(e) => setForm({ ...form, point_cost: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="stock_count">Stock</Label>
              <Input
                id="stock_count"
                type="number"
                min="0"
                required
                value={form.stock_count}
                onChange={(e) => setForm({ ...form, stock_count: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Image</Label>
              {imageUrl && (
                <div className="mb-2 aspect-square w-32 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
                id="reward-image-upload"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? "Uploading…" : imageUrl ? "Replace image" : "+ Upload image"}
              </Button>
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id="is_high_end"
                type="checkbox"
                checked={form.is_high_end}
                onChange={(e) => setForm({ ...form, is_high_end: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300 text-accent-500 dark:border-zinc-700"
              />
              <Label htmlFor="is_high_end" className="mb-0">
                High-end item (limited to 1–2 per order, vs. 1–3 for standard items)
              </Label>
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300 text-accent-500 dark:border-zinc-700"
              />
              <Label htmlFor="is_active" className="mb-0">
                Active (available for redemption)
              </Label>
            </div>

            {error && <p className="text-sm text-danger-500 sm:col-span-2">{error}</p>}

            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={submitting || uploading}>
                {submitting ? "Saving…" : editingId ? "Save changes" : "Create reward"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                  Loading…
                </td>
              </tr>
            )}
            {rewards.map((reward) => (
              <tr key={reward.reward_id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
                <td className="px-4 py-3 font-medium">
                  {reward.item_name}
                  {!reward.is_active && <Badge tone="neutral" className="ml-2">Inactive</Badge>}
                </td>
                <td className="px-4 py-3 font-mono">{reward.point_cost} pts</td>
                <td className="px-4 py-3">
                  {reward.stock_count === 0 ? (
                    <Badge tone="danger">0</Badge>
                  ) : (
                    reward.stock_count
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(reward)} className="mr-3 text-accent-500 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleArchive(reward.reward_id)} className="text-danger-500 hover:underline">
                    Archive
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}