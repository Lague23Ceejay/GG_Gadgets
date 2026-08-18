import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { promoEventsApi } from "@/lib/promoEvents";
import type { PromoEvent } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ProductLinkPicker } from "@/pages/admin/ProductLinkPicker";

const emptyForm = {
  title: "",
  description: "",
  discount_percent: "",
  link_url: "",
  is_active: true,
  starts_at: "",
  ends_at: "",
};

export function AdminPromoEvents() {
  const [events, setEvents] = useState<PromoEvent[]>([]);
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
    promoEventsApi
      .listAll()
      .then(setEvents)
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

  const openEdit = (event: PromoEvent) => {
    setEditingId(event.event_id);
    setForm({
      title: event.title,
      description: event.description ?? "",
      discount_percent: event.discount_percent ? String(event.discount_percent) : "",
      link_url: event.link_url ?? "",
      is_active: event.is_active ?? true,
      starts_at: event.starts_at ? event.starts_at.slice(0, 16) : "",
      ends_at: event.ends_at ? event.ends_at.slice(0, 16) : "",
    });
    setImageUrl(event.image_url);
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
      const blob = await upload(`promo-events/${Date.now()}-${file.name}`, file, {
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

    if (!imageUrl) {
      setError("Upload an image for this event.");
      setSubmitting(false);
      return;
    }

    const payload = {
      title: form.title,
      description: form.description || null,
      image_url: imageUrl,
      discount_percent: form.discount_percent ? Number(form.discount_percent) : null,
      link_url: form.link_url || null,
      is_active: form.is_active,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
    };

    try {
      if (editingId) {
        await promoEventsApi.update(editingId, payload);
      } else {
        await promoEventsApi.create(payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id: number) => {
    if (!confirm("Archive this event? It will be removed from the homepage.")) return;
    await promoEventsApi.archive(id);
    load();
  };

  const toggleActive = async (event: PromoEvent) => {
    await promoEventsApi.update(event.event_id, {
      title: event.title,
      description: event.description,
      image_url: event.image_url,
      discount_percent: event.discount_percent,
      link_url: event.link_url,
      is_active: !event.is_active,
    });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-700">Homepage events</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {events.length} total — shown as a carousel on the homepage
          </p>
        </div>
        <Button onClick={openCreate}>+ New event</Button>
      </div>

      {showForm && (
        <Card className="mt-4 p-5">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="title">Event name</Label>
              <Input
                id="title"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Weekend Deal, Franchise Sale"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="discount_percent">Discount % (optional)</Label>
              <Input
                id="discount_percent"
                type="number"
                min="1"
                max="100"
                value={form.discount_percent}
                onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                placeholder="e.g. 60"
              />
            </div>

            <div className="sm:col-span-2">
              <ProductLinkPicker
                value={form.link_url}
                onChange={(url) => setForm({ ...form, link_url: url })}
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Banner image</Label>
              {imageUrl && (
                <div className="mb-2 aspect-[21/9] w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
                id="event-image-upload"
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

            <div>
              <Label htmlFor="starts_at">Starts (optional — blank launches immediately)</Label>
              <Input
                id="starts_at"
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="ends_at">Ends (optional — blank runs indefinitely)</Label>
              <Input
                id="ends_at"
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              />
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
                Active (visible on homepage)
              </Label>
            </div>

            {error && <p className="text-sm text-danger-500 sm:col-span-2">{error}</p>}

            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={submitting || uploading}>
                {submitting ? "Saving…" : editingId ? "Save changes" : "Create event"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <p className="text-sm text-zinc-500">Loading…</p>}
        {!loading && events.length === 0 && (
          <p className="text-sm text-zinc-500">No events yet. Create your first one above.</p>
        )}
        {events.map((event) => (
          <Card key={event.event_id} className="overflow-hidden p-0">
            <div className="aspect-[21/9] w-full bg-zinc-100 dark:bg-zinc-800">
              <img src={event.image_url} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{event.title}</p>
                {event.discount_percent && <Badge tone="spark">-{event.discount_percent}%</Badge>}
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {event.is_active ? "Active" : "Paused"}
              </p>
              <div className="mt-3 flex gap-3 text-sm">
                <button onClick={() => openEdit(event)} className="text-accent-500 hover:underline">
                  Edit
                </button>
                <button onClick={() => toggleActive(event)} className="text-zinc-500 hover:underline">
                  {event.is_active ? "Pause" : "Activate"}
                </button>
                <button
                  onClick={() => handleArchive(event.event_id)}
                  className="text-danger-500 hover:underline"
                >
                  Archive
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}