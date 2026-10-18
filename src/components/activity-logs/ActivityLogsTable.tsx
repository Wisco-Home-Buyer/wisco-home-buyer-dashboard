"use client";

import React, { useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../../hooks/useAuth";
import { useActivityLogs } from "../../hooks/useActivityLogsQuery";
import type { ActivityLog } from "../../services/activityLogs.service";
import { ROLE_LABELS } from "../../services/users.service";

type ResultFilter = "ALL" | "SUCCESS" | "FAILED";

const inputClass =
  "px-3 py-2.5 text-xs font-medium bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const formatTime = (value: string) => {
  try {
    return format(new Date(value), "MMM d, yyyy h:mm a");
  } catch {
    return value;
  }
};

const describeDetails = (log: ActivityLog): string => {
  if (!log.details) return "";
  const parts: string[] = [];
  for (const [key, value] of Object.entries(log.details.values ?? {})) {
    parts.push(`${key}: ${String(value)}`);
  }
  const shown = new Set(Object.keys(log.details.values ?? {}));
  const others = (log.details.fields ?? []).filter((f) => !shown.has(f));
  if (others.length > 0) parts.push(`changed ${others.join(", ")}`);
  return parts.join(" · ");
};

export const ActivityLogsTable: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [result, setResult] = useState<ResultFilter>("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, isLoading, isError, refetch, isFetching } = useActivityLogs(
    {
      page,
      limit: 25,
      search: searchTerm || undefined,
      success: result === "ALL" ? undefined : result === "SUCCESS",
      from: from || undefined,
      to: to || undefined,
    },
    isSuperAdmin
  );

  if (!isSuperAdmin) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100/80 dark:border-slate-800/80 p-6">
        <p className="text-sm text-slate-500">
          Only a Super Admin can view the activity log.
        </p>
      </div>
    );
  }

  const logs = data?.data ?? [];
  const pagination = data?.pagination;

  const resetPageThen = (apply: () => void) => {
    apply();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f2347] dark:text-white tracking-tight">
            Activity Log
          </h1>
          <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
            Who changed what in the admin area. Only Super Admins can see this.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-2.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all disabled:opacity-50 cursor-pointer shrink-0"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100/80 dark:border-slate-800/80 shadow-xs p-4 md:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row gap-2.5">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by person, action or item..."
              value={searchTerm}
              onChange={(e) =>
                resetPageThen(() => setSearchTerm(e.target.value))
              }
              className={`${inputClass} w-full pl-10`}
            />
          </div>
          <select
            value={result}
            onChange={(e) =>
              resetPageThen(() => setResult(e.target.value as ResultFilter))
            }
            className={inputClass}
            aria-label="Result"
          >
            <option value="ALL">All results</option>
            <option value="SUCCESS">Succeeded</option>
            <option value="FAILED">Failed</option>
          </select>
          <input
            type="date"
            value={from}
            onChange={(e) => resetPageThen(() => setFrom(e.target.value))}
            className={inputClass}
            aria-label="From date"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => resetPageThen(() => setTo(e.target.value))}
            className={inputClass}
            aria-label="To date"
          />
        </div>

        {isLoading ? (
          <p className="text-xs text-slate-500 py-8 text-center">Loading...</p>
        ) : isError ? (
          <p className="text-xs text-red-500 py-8 text-center">
            Could not load the activity log. Try refreshing.
          </p>
        ) : logs.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">
            No activity found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-2.5 pr-4 font-semibold">When</th>
                  <th className="py-2.5 pr-4 font-semibold">Who</th>
                  <th className="py-2.5 pr-4 font-semibold">Action</th>
                  <th className="py-2.5 pr-4 font-semibold">Result</th>
                  <th className="py-2.5 font-semibold">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => {
                  const details = describeDetails(log);
                  return (
                    <tr key={log.id} className="align-top">
                      <td className="py-3 pr-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {formatTime(log.createdAt)}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">
                          {log.userName || log.userEmail || "Unknown"}
                        </div>
                        <div className="text-slate-400">
                          {log.userName && log.userEmail
                            ? `${log.userEmail} · `
                            : ""}
                          {log.userRole ? ROLE_LABELS[log.userRole] : "Not signed in"}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">
                          {log.action}
                        </div>
                        <div className="text-slate-400 break-all">
                          {log.method} {log.route}
                          {log.resourceId ? ` · ${log.resourceId}` : ""}
                        </div>
                        {!log.success && log.errorMessage && (
                          <div className="text-red-600 dark:text-red-400 font-semibold mt-0.5">
                            Why it failed: {log.errorMessage}
                          </div>
                        )}
                        {details && (
                          <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                            {details}
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full font-bold ${
                            log.success
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                          }`}
                        >
                          {log.success ? "Success" : "Failed"} · {log.statusCode}
                        </span>
                      </td>
                      <td className="py-3 whitespace-nowrap text-slate-500">
                        {log.ip ?? "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {pagination.page} of {pagination.totalPages} ·{" "}
              {pagination.total} entries
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1.5 font-bold border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1.5 font-bold border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
