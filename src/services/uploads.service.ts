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
