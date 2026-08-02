import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import jwt from "jsonwebtoken";

export default async function handler(request: Request): Promise<Response> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
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

        // Matches the roles allowed to manage the product catalog on the backend
        // (products/categories routes use requireRole('super_admin', 'store_manager'))
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

    return Response.json(jsonResponse);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}