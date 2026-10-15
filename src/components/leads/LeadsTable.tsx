"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Download, Filter, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  useLeads,
  useExportLeadsMutation,
  useDeleteLeadMutation,
} from "../../hooks/useLeadsQuery";
import { LeadsTableSkeleton } from "./LeadsTableSkeleton";
import { LeadStatus, Priority } from "../../services/leads.service";

const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    {...props}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    {...props}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    {...props}
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const LeadsTable: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<{
    id: string;
    leadNumber: string;
    sellerName: string;
  } | null>(null);

  // TanStack Query for leads fetching & delete mutation
  const { data, isLoading, isError, error, refetch, isFetching } = useLeads({
    page,
    limit: 20,
    search: searchTerm || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    priority: priorityFilter !== "ALL" ? priorityFilter : undefined,
  });

  const exportMutation = useExportLeadsMutation();
  const deleteMutation = useDeleteLeadMutation();

  const leads = data?.data || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handlePriorityFilter = (priority: string) => {
    setPriorityFilter(priority);
    setPage(1);
  };

  const handleExport = () => {
    exportMutation.mutate();
  };

  const handleConfirmDelete = () => {
    if (!leadToDelete) return;
    deleteMutation.mutate(leadToDelete.id, {
      onSuccess: () => {
        setLeadToDelete(null);
      },
    });
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case "NEW":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50";
      case "CONTACTED":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50";
      case "QUALIFIED":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50";
      case "NEGOTIATION":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50";
      case "CLOSED":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50";
      case "REJECTED":
        return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400";
      case "MEDIUM":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300";
      case "LOW":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return { bar: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" };
    if (score >= 60) return { bar: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" };
    return { bar: "bg-rose-500", text: "text-rose-700 dark:text-rose-400" };
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const activeFiltersCount = (statusFilter !== "ALL" ? 1 : 0) + (priorityFilter !== "ALL" ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Top Title & Export Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f2347] dark:text-white tracking-tight">
            Leads Management
          </h1>
          <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
            Track and manage incoming real estate lead submissions and pipeline status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all disabled:opacity-50 cursor-pointer shrink-0"
            title="Refresh Leads"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{exportMutation.isPending ? "Exporting..." : "Export CSV"}</span>
          </button>
        </div>
      </div>

      {/* Main Table Card Container */}
      <div className="bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100/80 dark:border-slate-800/80 shadow-xs p-4 md:p-6 space-y-6">
        {/* Search & Filter Toolbar (Side-by-side on mobile) */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by lead #, seller name..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-3 py-2.5 text-xs font-medium bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative shrink-0">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-2xl border transition-all cursor-pointer ${
                activeFiltersCount > 0
                  ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-4 px-1 text-[10px] font-extrabold text-white bg-blue-600 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Filter Dropdown Menu */}
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-56 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 space-y-3">
                {/* Status Filter */}
                <div>
                  <p className="px-1 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </p>
                  <div className="space-y-0.5">
                    {["ALL", "NEW", "CONTACTED", "QUALIFIED", "NEGOTIATION", "CLOSED", "REJECTED"].map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusFilter(st)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            statusFilter === st
                              ? "bg-[#0f2347] text-white dark:bg-blue-600"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {st === "ALL" ? "All Statuses" : st}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Priority Filter */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="px-1 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Priority
                  </p>
                  <div className="space-y-0.5">
                    {["ALL", "HIGH", "MEDIUM", "LOW"].map((pr) => (
                      <button
                        key={pr}
                        onClick={() => handlePriorityFilter(pr)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          priorityFilter === pr
                            ? "bg-[#0f2347] text-white dark:bg-blue-600"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {pr === "ALL" ? "All Priorities" : pr}
                      </button>
                    ))}
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => {
                      setStatusFilter("ALL");
                      setPriorityFilter("ALL");
                      setIsFilterOpen(false);
                    }}
                    className="w-full text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1 cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Loading Shimmer / Error / Content */}
        {isLoading ? (
          <LeadsTableSkeleton />
        ) : isError ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
              {error?.message || "Failed to load leads from server."}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-xs font-bold text-white bg-[#0f2347] hover:bg-[#1a386d] dark:bg-blue-600 rounded-xl transition-all cursor-pointer"
            >
              Retry Loading
            </button>
          </div>
        ) : (
          /* Leads Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 px-3">LEAD ID</th>
                  <th className="pb-3 px-3">SELLER INFO</th>
                  <th className="pb-3 px-3">PROPERTY</th>
                  <th className="pb-3 px-3">STATUS</th>
                  <th className="pb-3 px-3">PRIORITY</th>
                  <th className="pb-3 px-3">SCORE</th>
                  <th className="pb-3 px-3">SUBMITTED</th>
                  <th className="pb-3 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {leads.length > 0 ? (
                  leads.map((lead) => {
                    const scoreStyle = getScoreColor(lead.score);

                    return (
                      <tr
                        key={lead.id}
                        className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Lead Number */}
                        <td className="py-4 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {lead.leadNumber}
                        </td>

                        {/* Seller Info */}
                        <td className="py-4 px-3">
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {lead.sellerName}
                            </h4>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                              {lead.sellerPhone}
                            </p>
                          </div>
                        </td>

                        {/* Property Address */}
                        <td className="py-4 px-3">
                          <div>
                            <h5 className="font-bold text-slate-800 dark:text-slate-200">
                              {lead.property?.street || "No street provided"}
                            </h5>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                              {[lead.property?.city, lead.property?.state, lead.property?.zip]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusBadge(
                              lead.status
                            )}`}
                          >
                            {lead.status}
                          </span>
                        </td>

                        {/* Priority Badge */}
                        <td className="py-4 px-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getPriorityBadge(
                              lead.priority
                            )}`}
                          >
                            {lead.priority}
                          </span>
                        </td>

                        {/* Score Indicator Bar & Number */}
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${scoreStyle.bar}`}
                                style={{ width: `${Math.min(100, Math.max(0, lead.score))}%` }}
                              />
                            </div>
                            <span className={`font-extrabold text-xs ${scoreStyle.text}`}>
                              {lead.score}
                            </span>
                          </div>
                        </td>

                        {/* Added Time */}
                        <td className="py-4 px-3 font-medium text-slate-500 dark:text-slate-400">
                          {formatDate(lead.submittedAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/leads/${lead.id}`}
                              className="inline-block px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                            >
                              View
                            </Link>

                            <button
                              onClick={() =>
                                setLeadToDelete({
                                  id: lead.id,
                                  leadNumber: lead.leadNumber,
                                  sellerName: lead.sellerName || lead.seller?.name || "Unknown Seller",
                                })
                              }
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition-colors cursor-pointer"
                              title="Delete Lead"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                      No leads found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination Row */}
        {!isLoading && !isError && pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Showing {leads.length} of {pagination.total} leads (Page {pagination.page} of{" "}
              {pagination.totalPages})
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Next</span>
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {leadToDelete && (
        <div
          onClick={() => setLeadToDelete(null)}
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl p-6 md:p-8 max-w-md w-full space-y-6 text-center animate-in zoom-in-95 duration-150"
          >
            <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <TrashIcon className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Delete Lead {leadToDelete.leadNumber}?
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to delete lead submission for{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {leadToDelete.sellerName}
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setLeadToDelete(null)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {deleteMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
