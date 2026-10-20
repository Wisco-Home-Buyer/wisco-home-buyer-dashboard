import { axiosInstance } from "../lib/axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://tygry8.saikat.com.bd";

export function resolveAssetUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
    return url;
  }
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

const OWN_PHOTO =
  /^\/(?:uploads\/)?([0-9a-f-]{36}\.(?:jpe?g|png|webp|heic|heif|gif|tiff?|avif|bmp))$/i;

/**
 * A smaller copy of an uploaded photo from the API's resize route, so lists
 * and grids do not download 6-12 MB originals. Anything else (blob previews,
 * links to other hosts) is returned unchanged.
 */
export function photoUrl(
  url: string | null | undefined,
  width: 400 | 800 | 1200 | 1600,
): string | null {
  const absolute = resolveAssetUrl(url);
  if (!absolute || !absolute.startsWith(`${API_URL}/`)) return absolute;
  const match = absolute.slice(API_URL.length).split("?")[0].match(OWN_PHOTO);
  return match ? `${API_URL}/api/images/${match[1]}?w=${width}&fmt=webp` : absolute;
}

export async function uploadAvatar(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);

  const { data } = await axiosInstance.post("/api/uploads/avatar", body, {
    headers: { "Content-Type": "multipart/form-data" },
    transformRequest: [
      (payload, headers) => {
        if (payload instanceof FormData && headers) {
          delete headers["Content-Type"];
        }
        return payload;
      },
    ],
  });

  const url = data?.data?.url ?? data?.url;
  if (!url || typeof url !== "string") {
    throw new Error("Upload succeeded but no avatar URL was returned");
  }
  return url;
}

export async function uploadListingImages(files: File[]): Promise<string[]> {
  const body = new FormData();
  files.forEach((file) => body.append("files", file));

  const { data } = await axiosInstance.post(
    "/api/uploads/listing-images",
    body,
    {
      headers: { "Content-Type": "multipart/form-data" },
      transformRequest: [
        (payload, headers) => {
          if (payload instanceof FormData && headers) {
            delete headers["Content-Type"];
          }
          return payload;
        },
      ],
    }
  );

  const urls = data?.data?.urls ?? data?.urls;
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new Error("Upload succeeded but no photo URLs were returned");
  }
  return urls as string[];
}

export const VIDEO_MAX_MB = 200;
export const VIDEO_ACCEPT = "video/mp4,video/quicktime,video/webm";

export async function uploadListingVideo(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const body = new FormData();
  body.append("file", file);

  const { data } = await axiosInstance.post(
    "/api/uploads/listing-video",
    body,
    {
      headers: { "Content-Type": "multipart/form-data" },
      transformRequest: [
        (payload, headers) => {
          if (payload instanceof FormData && headers) {
            delete headers["Content-Type"];
          }
          return payload;
        },
      ],
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    }
  );

  const url = data?.data?.url ?? data?.url;
  if (!url || typeof url !== "string") {
    throw new Error("Upload succeeded but no video URL was returned");
  }
  return url;
}
