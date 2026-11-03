import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary,
} from "@/lib/cloudinary";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export interface UploadedImageMeta {
  url: string;
  publicId?: string;
  provider: "cloudinary" | "local";
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "landlord" && session.role !== "admin")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Landlord or Administrator account required." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files were provided for upload." },
        { status: 400 }
      );
    }

    const cloudinaryActive = isCloudinaryConfigured();
    const uploadedItems: UploadedImageMeta[] = [];
    const uploadedUrls: string[] = [];

    // Local fallback directory (ensured if local storage is used)
    let uploadDir = "";
    if (!cloudinaryActive) {
      uploadDir = path.join(process.cwd(), "public", "images", "properties");
      await fs.mkdir(uploadDir, { recursive: true });
    }

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" has an unsupported format. Supported formats are JPG, JPEG, PNG, and WEBP.`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" exceeds the maximum allowed size of 10MB.`,
          },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (cloudinaryActive) {
        try {
          const cloudResult = await uploadToCloudinary(buffer, "kiraylink/properties");
          uploadedUrls.push(cloudResult.secureUrl);
          uploadedItems.push({
            url: cloudResult.secureUrl,
            publicId: cloudResult.publicId,
            provider: "cloudinary",
          });
        } catch (cloudErr) {
          console.error("Cloudinary upload failed, attempting local fallback:", cloudErr);
          // Fallback to local storage if Cloudinary network request fails
          if (!uploadDir) {
            uploadDir = path.join(process.cwd(), "public", "images", "properties");
            await fs.mkdir(uploadDir, { recursive: true });
          }
          const ext = EXTENSION_MAP[file.type] || ".jpg";
          const randomSuffix = crypto.randomBytes(8).toString("hex");
          const filename = `prop_${Date.now()}_${randomSuffix}${ext}`;
          const filePath = path.join(uploadDir, filename);
          await fs.writeFile(filePath, buffer);
          const localUrl = `/images/properties/${filename}`;
          uploadedUrls.push(localUrl);
          uploadedItems.push({
            url: localUrl,
            provider: "local",
          });
        }
      } else {
        const ext = EXTENSION_MAP[file.type] || ".jpg";
        const randomSuffix = crypto.randomBytes(8).toString("hex");
        const filename = `prop_${Date.now()}_${randomSuffix}${ext}`;
        const filePath = path.join(uploadDir, filename);
        await fs.writeFile(filePath, buffer);

        const localUrl = `/images/properties/${filename}`;
        uploadedUrls.push(localUrl);
        uploadedItems.push({
          url: localUrl,
          provider: "local",
        });
      }
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      items: uploadedItems,
      provider: cloudinaryActive ? "cloudinary" : "local",
      ...(cloudinaryActive
        ? {}
        : {
            note: "Cloudinary credentials not detected in environment variables. Stored securely in local property storage.",
          }),
    });
  } catch (error) {
    console.error("Image upload handler error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload image. Please verify file integrity and try again.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "landlord" && session.role !== "admin")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Landlord or Administrator account required." },
        { status: 401 }
      );
    }

    const { url, publicId } = await request.json();

    if (publicId && isCloudinaryConfigured()) {
      await deleteFromCloudinary(publicId);
      return NextResponse.json({ success: true, message: "Deleted from Cloudinary" });
    }

    if (url && typeof url === "string" && url.startsWith("/images/properties/")) {
      const filename = path.basename(url);
      const filePath = path.join(process.cwd(), "public", "images", "properties", filename);
      try {
        await fs.unlink(filePath);
      } catch {
        // file may already be removed
      }
      return NextResponse.json({ success: true, message: "Deleted from local storage" });
    }

    return NextResponse.json({ success: true, message: "Image record removed" });
  } catch (err) {
    console.error("Delete image error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
