import type { Property } from "@/types/property";
import {
  PROPERTY_IMAGE_BUCKET,
  PROPERTY_IMAGE_REFERENCE_PREFIX,
} from "@/lib/property-image-constants";

export function resolvePropertyImageReference(reference: string) {
  if (!reference.startsWith(PROPERTY_IMAGE_REFERENCE_PREFIX)) {
    return reference;
  }

  const key = reference.slice(PROPERTY_IMAGE_REFERENCE_PREFIX.length);
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  if (!endpoint) {
    throw new Error("AWS_ENDPOINT_URL_S3 is required to serve property photos.");
  }

  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `${endpoint.replace(/\/+$/, "")}/${PROPERTY_IMAGE_BUCKET}/${encodedKey}`;
}

export function resolvePropertyImages(property: Property): Property {
  return {
    ...property,
    imageUrl: resolvePropertyImageReference(property.imageUrl),
    images: property.images.map(resolvePropertyImageReference),
  };
}
