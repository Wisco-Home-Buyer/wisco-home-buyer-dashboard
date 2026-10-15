import { axiosInstance } from "../lib/axios";

export const RESTORE_CONFIRMATION = "RESTORE";

/** Mirrors the server's default BACKUP_MAX_FILE_SIZE_MB. */
export const RESTORE_MAX_MB = 512;

export interface BackupDownload {
  blob: Blob;
  filename: string;
}

const filenameFrom = (disposition: string | undefined): string => {
  const match = disposition?.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? `wisco-backup-${Date.now()}.dump`;
};

/** Error bodies of blob requests arrive as a Blob; pull the JSON message out. */
export async function blobErrorMessage(error: unknown): Promise<string> {
  const response = (error as { response?: { data?: unknown } })?.response;
  if (response?.data instanceof Blob) {
    try {
      const parsed = JSON.parse(await response.data.text()) as {
        message?: string;
      };
      if (parsed.message) return parsed.message;
    } catch {
      // fall through to the generic message
    }
  }
  return (error as Error)?.message || "Request failed";
}

export const backupService = {
  async downloadBackup(): Promise<BackupDownload> {
    const response = await axiosInstance.get<Blob>("/api/backup", {
      responseType: "blob",
    });
    return {
      blob: response.data,
      filename: filenameFrom(
        response.headers["content-disposition"] as string | undefined
      ),
    };
  },

  async restoreBackup(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<void> {
    const body = new FormData();
    body.append("confirm", RESTORE_CONFIRMATION);
    body.append("file", file);

    await axiosInstance.post("/api/backup/restore", body, {
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
    });
  },
};
