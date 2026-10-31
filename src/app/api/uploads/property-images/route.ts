import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/auth";
import {
  PROPERTY_IMAGE_BUCKET,
  MAX_PROPERTY_PHOTOS,
  MAX_PROPERTY_PHOTO_SIZE_BYTES,
  PROPERTY_IMAGE_MIME_TYPES,
  getPropertyImageOwnerPrefix,
} from "@/lib/property-image-constants";

let storageClient: S3Client | undefined;

function getStorageClient() {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ENDPOINT_URL_S3, AWS_REGION } =
    process.env;
  if (
    !AWS_ACCESS_KEY_ID ||
    !AWS_SECRET_ACCESS_KEY ||
    !AWS_ENDPOINT_URL_S3 ||
    !AWS_REGION
  ) {
    throw new Error(
      "Neon Object Storage is not configured. Run `neon env pull` and restart the app."
    );
  }

  storageClient ??= new S3Client({
    endpoint: AWS_ENDPOINT_URL_S3,
    region: AWS_REGION,
    forcePathStyle: true,
  });
  return storageClient;
}

function getImageExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const expectedExtension =
    PROPERTY_IMAGE_MIME_TYPES[
      file.type as keyof typeof PROPERTY_IMAGE_MIME_TYPES
    ];

  if (
    !expectedExtension ||
    extension !== expectedExtension &&
      !(expectedExtension === "jpg" && extension === "jpeg")
  ) {
    return undefined;
  }

  return expectedExtension;
}

function hasValidImageSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }
  if (mimeType === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }
  return false;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "landlord") {
    return Response.json(
      { error: "Only signed-in landlords may upload property photos." },
      { status: 401 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "The photo upload was not valid." }, { status: 400 });
  }

  const files = formData.getAll("files");
  if (files.length === 0 || files.length > MAX_PROPERTY_PHOTOS) {
    return Response.json(
      { error: `Select between 1 and ${MAX_PROPERTY_PHOTOS} photos.` },
      { status: 400 }
    );
  }
  if (!files.every((file): file is File => file instanceof File)) {
    return Response.json({ error: "The selected upload is not a file." }, { status: 400 });
  }

  const preparedFiles: { file: File; key: string; bytes: Uint8Array }[] = [];
  for (const file of files) {
    const extension = getImageExtension(file);
    if (!extension || !hasValidImageSignature(
      new Uint8Array(await file.slice(0, 12).arrayBuffer()),
      file.type
    )) {
      return Response.json(
        { error: `${file.name} is not a supported JPG, PNG, or WEBP image.` },
        { status: 400 }
      );
    }
    if (file.size === 0 || file.size > MAX_PROPERTY_PHOTO_SIZE_BYTES) {
      return Response.json(
        { error: `${file.name} must be smaller than 10 MB.` },
        { status: 400 }
      );
    }

    preparedFiles.push({
      file,
      key: `${getPropertyImageOwnerPrefix(session.id)}${randomUUID()}.${extension}`,
      bytes: new Uint8Array(await file.arrayBuffer()),
    });
  }

  let client: S3Client;
  try {
    client = getStorageClient();
  } catch (error) {
    console.error("Property photo storage configuration is missing.", error);
    return Response.json(
      { error: "Photo storage is not configured on the server." },
      { status: 503 }
    );
  }

  const uploadedKeys: string[] = [];
  try {
    for (const { file, key, bytes } of preparedFiles) {
      await client.send(
        new PutObjectCommand({
          Bucket: PROPERTY_IMAGE_BUCKET,
          Key: key,
          Body: bytes,
          ContentLength: file.size,
          ContentType: file.type,
          CacheControl: "public, max-age=31536000, immutable",
        })
      );
      uploadedKeys.push(key);
    }
  } catch (error) {
    console.error("Property photo upload to Neon Object Storage failed.", error);
    const cleanupResults = await Promise.allSettled(
      uploadedKeys.map((key) =>
        client.send(
          new DeleteObjectCommand({ Bucket: PROPERTY_IMAGE_BUCKET, Key: key })
        )
      )
    );
    cleanupResults.forEach((result) => {
      if (result.status === "rejected") {
        console.error("Failed to clean up an incomplete property photo upload.", result.reason);
      }
    });
    return Response.json(
      { error: "The photos could not be uploaded. Please try again." },
      { status: 502 }
    );
  }

  return Response.json({ keys: uploadedKeys });
}
