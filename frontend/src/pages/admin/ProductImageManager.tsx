import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { productsApi } from "@/lib/products";
import type { ProductImage } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Label } from "@/components/ui/Input";

export function ProductImageManager({ productId }: { productId: number }) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCaption, setPendingCaption] = useState("");
  const [editingCaptionId, setEditingCaptionId] = useState<number | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    productsApi
      .listImages(productId)
      .then(setImages)
      .finally(() => setLoading(false));
  };

  useEffect(load, [productId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);

    try {
      const token = localStorage.getItem("gg-token") ?? "";

      const blob = await upload(`products/${productId}/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        clientPayload: token,
      });

      const isFirstImage = images.length === 0;
      await productsApi.addImage(productId, blob.url, isFirstImage, pendingCaption.trim() || undefined);

      setPendingCaption("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!confirm("Delete this image?")) return;
    await productsApi.deleteImage(imageId);
    load();
  };

  const startEditCaption = (image: ProductImage) => {
    setEditingCaptionId(image.image_id);
    setCaptionDraft(image.caption ?? "");
  };

  const saveCaption = async (imageId: number) => {
    await productsApi.updateImageCaption(imageId, captionDraft.trim());
    setEditingCaptionId(null);
    load();
  };

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Product images
      </p>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : images.length === 0 ? (
        <p className="mb-3 text-sm text-zinc-500">No images yet.</p>
      ) : (
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image) => (
            <div key={image.image_id}>
              <div className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <img src={image.image_url} alt={image.caption ?? ""} className="h-full w-full object-cover" />
                {image.is_primary && (
                  <Badge tone="accent" className="absolute left-1 top-1">
                    Primary
                  </Badge>
                )}
                <button
                  onClick={() => handleDelete(image.image_id)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Delete image"
                >
                  ✕
                </button>
              </div>

              {editingCaptionId === image.image_id ? (
                <div className="mt-1 flex gap-1">
                  <input
                    autoFocus
                    value={captionDraft}
                    onChange={(e) => setCaptionDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveCaption(image.image_id)}
                    placeholder="Caption…"
                    className="h-7 w-full rounded border border-zinc-300 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <button
                    onClick={() => saveCaption(image.image_id)}
                    className="text-xs text-accent-500"
                    aria-label="Save caption"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEditCaption(image)}
                  className="mt-1 block w-full truncate text-left text-xs text-zinc-500 hover:text-accent-500"
                >
                  {image.caption || "+ Add caption"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="mb-2 text-sm text-danger-500">{error}</p>}

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[200px] flex-1">
          <Label htmlFor={`caption-${productId}`}>Caption for next upload (optional)</Label>
          <Input
            id={`caption-${productId}`}
            value={pendingCaption}
            onChange={(e) => setPendingCaption(e.target.value)}
            placeholder="e.g. Front view, black colorway"
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
          id={`upload-${productId}`}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? "Uploading…" : "+ Upload image"}
        </Button>
      </div>
    </div>
  );
}