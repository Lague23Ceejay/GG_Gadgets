import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import jwt from "jsonwebtoken";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const body = request.body as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        // clientPayload carries the admin's JWT from the browser (see upload call
        // in AdminProducts.tsx). We verify it here with the SAME JWT_SECRET your
        // Express backend uses, so only a logged-in admin can get an upload token —
        // Vercel Blob itself has no idea about your users/roles.
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

        if (decoded.role !== "admin") {
          throw new Error("Only admins can upload product images");
        }

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          maximumSizeInBytes: 5 * 1024 * 1024, // 5MB
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Runs after the file is actually stored in Blob. Just logging for now —
        // the client is responsible for calling POST /products/:id/images with
        // blob.url once the upload() promise resolves.
        console.log("Blob upload completed:", blob.url);
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (error) {
    return response.status(400).json({ error: (error as Error).message });
  }
}