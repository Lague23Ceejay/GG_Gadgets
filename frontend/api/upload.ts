import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import jwt from "jsonwebtoken";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // VercelRequest is Node's http.IncomingMessage under the hood, not a Fetch
  // API Request — but @vercel/blob's handleUpload expects a real Request
  // object (it reads headers/url off it). We build one manually here rather
  // than switching this function to the Edge runtime, since jsonwebtoken
  // needs Node's crypto module, which Edge doesn't provide.
  const host = request.headers.host;
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const url = `${protocol}://${host}${request.url}`;

  const fetchRequest = new Request(url, {
    method: request.method,
    headers: new Headers(request.headers as Record<string, string>),
    body: JSON.stringify(request.body),
  });

  try {
    const jsonResponse = await handleUpload({
      body: request.body as HandleUploadBody,
      request: fetchRequest,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        // clientPayload carries the admin's JWT from the browser (see upload call
        // in ProductImageManager.tsx). We verify it here with the SAME JWT_SECRET
        // your Express backend uses, so only a logged-in admin can get an upload
        // token — Vercel Blob itself has no idea about your users/roles.
        const token = typeof clientPayload === "string" ? clientPayload : null;
        if (!token) {
          throw new Error("Missing auth token for upload");
        }

        let decoded: { role?: string };
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { role?: string };
        } catch {
          throw new Error("Invalid or expired session — please log in again");
        }

        const ALLOWED_ROLES = ["super_admin", "store_manager"];
        if (!decoded.role || !ALLOWED_ROLES.includes(decoded.role)) {
          throw new Error("You don't have permission to upload product images");
        }

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          maximumSizeInBytes: 5 * 1024 * 1024, // 5MB
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("Blob upload completed:", blob.url);
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (error) {
    return response.status(400).json({ error: (error as Error).message });
  }
}