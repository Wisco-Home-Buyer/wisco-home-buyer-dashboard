"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  useCleanUnusedFilesMutation,
  useUnusedFilesReport,
} from "../../hooks/useUnusedFiles";

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export const UnusedFilesCard: React.FC = () => {
  const { data, isLoading, isError, refetch } = useUnusedFilesReport();
  const clean = useCleanUnusedFilesMutation();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
      <div>
        <h2 className="text-sm font-bold text-[#0f2347] dark:text-white">
          Unused uploaded files
        </h2>
        <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-1">
          Photos and videos that no listing, lead or profile uses any more, for
          example a file uploaded in a form that was never saved. Only files
          older than {data?.minAgeDays ?? 7} days are counted, so uploads in
          progress are safe. Deleting them cannot be undone.
        </p>
      </div>

      {isLoading ? (
        <p className="text-xs font-semibold text-slate-400">Checking...</p>
      ) : isError || !data ? (
        <p className="text-xs font-semibold text-rose-600">
          Could not check the files.{" "}
          <button
            type="button"
            onClick={() => void refetch()}
            className="underline cursor-pointer"
          >
            Retry
          </button>
        </p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {data.count === 0
              ? "No unused files."
              : `${data.count} unused file${data.count === 1 ? "" : "s"}, ${formatSize(data.totalBytes)}`}
          </p>
          <div className="flex items-center gap-2">
            {confirming && !clean.isPending && (
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (!confirming) {
                  setConfirming(true);
                  return;
                }
                clean.mutate(undefined, {
                  onSettled: () => setConfirming(false),
                });
              }}
              disabled={clean.isPending || data.count === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {clean.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {clean.isPending
                ? "Deleting..."
                : confirming
                  ? `Yes, delete ${data.count} file${data.count === 1 ? "" : "s"}`
                  : "Delete unused files"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
