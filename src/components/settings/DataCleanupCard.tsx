"use client";

import React, { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  useDataCleanupPreview,
  useRunDataCleanupMutation,
} from "../../hooks/useDataCleanup";
import { CLEANUP_CONFIRMATION } from "../../services/dataCleanup.service";

const optionClass =
  "flex items-start gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer";

export const DataCleanupCard: React.FC = () => {
  const { data: counts, isLoading, isError, refetch } =
    useDataCleanupPreview(true);
  const cleanup = useRunDataCleanupMutation();

  const [autoLeads, setAutoLeads] = useState(false);
  const [publicRecords, setPublicRecords] = useState(false);
  const [hasBackup, setHasBackup] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const canRun =
    (autoLeads || publicRecords) &&
    hasBackup &&
    confirmText === CLEANUP_CONFIRMATION &&
    !cleanup.isPending;

  const handleRun = () => {
    if (!canRun) return;
    cleanup.mutate(
      { autoLeads, publicRecords },
      {
        onSuccess: () => {
          setAutoLeads(false);
          setPublicRecords(false);
          setHasBackup(false);
          setConfirmText("");
          void refetch();
        },
      }
    );
  };

  return (
    <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-xs space-y-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-bold text-rose-700 dark:text-rose-400">
            Clear imported data
          </h2>
          <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-1">
            Permanently deletes data that came from public records instead of
            from people. This cannot be undone. Leads submitted through the
            website form, buyers, listings and users are never touched by the
            first option. Turn the nightly public records pull off first, or it
            will create new leads at 3 AM.
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-xs font-semibold text-slate-400">Counting...</p>
      ) : isError || !counts ? (
        <p className="text-xs font-semibold text-rose-600">
          Could not load the counts.{" "}
          <button
            type="button"
            onClick={() => void refetch()}
            className="underline cursor-pointer"
          >
            Retry
          </button>
        </p>
      ) : (
        <div className="space-y-3">
          <label className={optionClass}>
            <input
              type="checkbox"
              checked={autoLeads}
              onChange={(e) => setAutoLeads(e.target.checked)}
              disabled={cleanup.isPending}
              className="mt-0.5"
            />
            <span>
              <span className="block text-xs font-bold text-slate-900 dark:text-white">
                Auto-created leads ({counts.autoLeads})
              </span>
              <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                Leads the nightly pull made from county records. They have
                placeholder phone and email. Their property, activity and
                enrichment rows go with them.
              </span>
            </span>
          </label>

          <label className={optionClass}>
            <input
              type="checkbox"
              checked={publicRecords}
              onChange={(e) => setPublicRecords(e.target.checked)}
              disabled={cleanup.isPending}
              className="mt-0.5"
            />
            <span>
              <span className="block text-xs font-bold text-slate-900 dark:text-white">
                All saved public records ({counts.parcels} parcels,{" "}
                {counts.parcelTaxYears} tax years, {counts.attomEnrichments}{" "}
                ATTOM records, {counts.comparableProperties} comparable sales)
              </span>
              <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                Also removes the owner and tax details shown on leads that
                people submitted themselves.
              </span>
            </span>
          </label>
        </div>
      )}

      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={hasBackup}
          onChange={(e) => setHasBackup(e.target.checked)}
          disabled={cleanup.isPending}
        />
        I downloaded a backup first (use the button above).
      </label>

      <div>
        <label
          htmlFor="cleanup-confirm"
          className="block mb-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
        >
          Type {CLEANUP_CONFIRMATION} to confirm
        </label>
        <input
          id="cleanup-confirm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          disabled={cleanup.isPending}
          autoComplete="off"
          className="w-full max-w-xs px-3.5 py-2.5 text-xs font-medium bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <button
        type="button"
        onClick={handleRun}
        disabled={!canRun}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {cleanup.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        {cleanup.isPending ? "Deleting..." : "Delete selected data"}
      </button>
    </div>
  );
};
