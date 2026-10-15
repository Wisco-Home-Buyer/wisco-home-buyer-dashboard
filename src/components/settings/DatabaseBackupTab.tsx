"use client";

import React, { useRef, useState } from "react";
import { AlertTriangle, Download, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { DataCleanupCard } from "./DataCleanupCard";
import { StoredBackupsCard } from "./StoredBackupsCard";
import {
  backupService,
  blobErrorMessage,
  RESTORE_CONFIRMATION,
  RESTORE_MAX_MB,
} from "../../services/backup.service";

const cardClass =
  "p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4";

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const triggerDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const DatabaseBackupTab: React.FC = () => {
  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);
  const [progress, setProgress] = useState(0);

  if (user?.role !== "SUPER_ADMIN") {
    return (
      <div className={cardClass}>
        <p className="text-xs text-slate-500">
          Only a Super Admin can back up or restore the database.
        </p>
      </div>
    );
  }

  const tooLarge = file !== null && file.size > RESTORE_MAX_MB * 1024 * 1024;
  const canRestore =
    file !== null &&
    !tooLarge &&
    confirmText === RESTORE_CONFIRMATION &&
    !isRestoring;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const { blob, filename } = await backupService.downloadBackup();
      triggerDownload(blob, filename);
      toast.success("Backup downloaded");
    } catch (err) {
      toast.error(await blobErrorMessage(err));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRestore = async () => {
    if (!file || !canRestore) return;
    setIsRestoring(true);
    setProgress(0);
    try {
      await backupService.restoreBackup(file, setProgress);
      toast.success("Database restored. Please sign in again.");
      await logout();
    } catch (err) {
      const e = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        e?.response?.data?.message || e?.message || "Failed to restore database"
      );
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <div>
          <h2 className="text-sm font-bold text-[#0f2347] dark:text-white">
            Download a backup
          </h2>
          <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-1">
            Saves the whole database (leads, buyers, listings, users) as one
            file. It contains personal information, so store it somewhere
            private.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0f2347] hover:bg-[#1a386d] dark:bg-blue-600 rounded-xl cursor-pointer disabled:opacity-60"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isDownloading ? "Preparing backup..." : "Download backup"}
        </button>
      </div>

      <StoredBackupsCard />

      <DataCleanupCard />

      <div className={`${cardClass} border-rose-200 dark:border-rose-900/60`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-rose-700 dark:text-rose-400">
              Restore from a backup
            </h2>
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-1">
              This replaces <strong>all current data</strong> with the contents
              of the backup file. Anything added since that backup is lost.
              Download a fresh backup first so you can undo this. You will be
              signed out afterwards.
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".dump"
          disabled={isRestoring}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="sr-only"
          aria-label="Backup file"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isRestoring}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer disabled:opacity-60"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            Choose backup file
          </button>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 break-all">
            {file ? `${file.name} (${formatSize(file.size)})` : "No file chosen"}
          </span>
        </div>
        {tooLarge && (
          <p role="alert" className="text-xs font-semibold text-rose-600">
            This file is larger than the {RESTORE_MAX_MB} MB limit.
          </p>
        )}

        <div>
          <label
            htmlFor="restore-confirm"
            className="block mb-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
          >
            Type {RESTORE_CONFIRMATION} to confirm
          </label>
          <input
            id="restore-confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isRestoring}
            autoComplete="off"
            className="w-full max-w-xs px-3.5 py-2.5 text-xs font-medium bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {isRestoring && (
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {progress < 100
              ? `Uploading... ${progress}%`
              : "Restoring the database. Do not close this page."}
          </p>
        )}

        <button
          type="button"
          onClick={() => void handleRestore()}
          disabled={!canRestore}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isRestoring && <Loader2 className="w-4 h-4 animate-spin" />}
          {isRestoring ? "Restoring..." : "Restore database"}
        </button>
      </div>
    </div>
  );
};
