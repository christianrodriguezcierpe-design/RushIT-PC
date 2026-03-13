import { getSupabaseBrowserClient } from "@/integrations/supabase/client";
import type { ImageAsset } from "@/types/site";
import { SITE_MEDIA_BUCKET, isManagedStoragePath } from "@/features/media/site-media-paths";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/svg+xml",
]);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const toPathSegment = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "asset";

const getFileExtension = (file: File) => {
  const fileNameSegments = file.name.split(".");
  const rawExtension = fileNameSegments.length > 1 ? fileNameSegments.at(-1) : undefined;

  if (rawExtension) {
    return rawExtension.toLowerCase();
  }

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    case "image/svg+xml":
      return "svg";
    default:
      return "png";
  }
};

const createUploadId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}`;
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to create a preview for the selected file."));
    };

    reader.readAsDataURL(file);
  });

const assertSupportedImage = (file: File) => {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Unsupported image format. Use PNG, JPG, WebP, AVIF, or SVG.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }
};

export const createEmptyImageAsset = (): ImageAsset => ({
  url: "",
  path: "",
  alt: "",
});

export const uploadImageAsset = async ({
  file,
  folder,
  alt,
}: {
  file: File;
  folder: string;
  alt: string;
}): Promise<ImageAsset> => {
  assertSupportedImage(file);

  const trimmedAlt = alt.trim();
  const uploadId = createUploadId();
  const fileExtension = getFileExtension(file);
  const path = `${toPathSegment(folder)}/${uploadId}.${fileExtension}`;
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    const { error } = await supabase.storage.from(SITE_MEDIA_BUCKET).upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(SITE_MEDIA_BUCKET).getPublicUrl(path);

    return {
      url: publicUrl,
      path,
      alt: trimmedAlt,
    };
  }

  return {
    url: await readFileAsDataUrl(file),
    path: `local-media/${path}`,
    alt: trimmedAlt,
  };
};

export const deleteImageAssets = async (paths: string[]) => {
  const managedPaths = [...new Set(paths.filter(isManagedStoragePath))];

  if (managedPaths.length === 0) {
    return;
  }

  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return;
  }

  const { error } = await supabase.storage.from(SITE_MEDIA_BUCKET).remove(managedPaths);

  if (error) {
    throw error;
  }
};
