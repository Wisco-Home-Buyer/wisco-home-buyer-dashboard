"use client";

import React, { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useRunBackupNowMutation,
  useStoredBackups,
} from "../../hooks/useStoredBackups";
import {
  backupService,
  blobErrorMessage,
} from "../../services/backup.service";

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export const StoredBackupsCard: React.FC = () => {
  const { data: backups, isLoading, isError, refetch } = useStoredBackups(true);
  const runNow = useRunBackupNowMutation();
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (filename: string) => {
    setDownloading(filename);
    try {
      const blob = await backupService.downloadStored(filename);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(await blobErrorMessage(err));
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#0f2347] dark:text-white">
            Automatic backups
          </h2>
          <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-1">
            A backup is saved on the server every night at 2:30 AM Chicago time.
            The newest ones are kept. They sit on the same server as the
            database, so download a copy now and then and keep it somewhere
            else. You can turn this off in the Automation tab.
          </p>
        </div>
        <button
          type="button"
          onClick={() => runNow.mutate()}
          disabled={runNow.isPending}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer disabled:opacity-60 whitespace-nowrap"
        >
          {runNow.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {runNow.isPending ? "Backing up..." : "Back up now"}
        </button>
      </div>

      {isLoading ? (
        <p className="text-xs font-semibold text-slate-400">Loading...</p>
      ) : isError || !backups ? (
        <p className="text-xs font-semibold text-rose-600">
          Could not load the list.{" "}
          <button
            type="button"
            onClick={() => void refetch()}
            className="underline cursor-pointer"
          >
            Retry
          </button>
        </p>
      ) : backups.length === 0 ? (
        <p className="text-xs font-medium text-slate-400">
          No automatic backups yet. The first one runs tonight, or use
          &quot;Back up now&quot;.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {backups.map((backup) => (
            <li
              key={backup.filename}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {format(new Date(backup.createdAt), "PPP p")}
                </p>
                <p className="text-[11px] font-medium text-slate-400 truncate">
                  {formatDistanceToNow(new Date(backup.createdAt), {
                    addSuffix: true,
                  })}{" "}
                  · {formatSize(backup.sizeBytes)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleDownload(backup.filename)}
                disabled={downloading === backup.filename}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer disabled:opacity-50"
              >
                {downloading === backup.filename ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                Download
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
