export const PROPERTY_IMAGE_BUCKET = "property-images";
export const PROPERTY_IMAGE_REFERENCE_PREFIX = "neon-object://";
export const MAX_PROPERTY_PHOTOS = 8;
export const MAX_PROPERTY_PHOTO_SIZE_BYTES = 10 * 1024 * 1024;
export const PROPERTY_IMAGE_MIME_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export function createPropertyImageReference(key: string) {
  return `${PROPERTY_IMAGE_REFERENCE_PREFIX}${key}`;
}

export function getPropertyImageOwnerPrefix(ownerId: string) {
  return `landlords/${encodeURIComponent(ownerId)}/`;
}

export function isPropertyImageKeyOwnedBy(key: string, ownerId: string) {
  const ownerPrefix = getPropertyImageOwnerPrefix(ownerId);
  return (
    key.startsWith(ownerPrefix) &&
    /^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(key.slice(ownerPrefix.length))
  );
}
