"use client";

import React, { useState } from "react";
import { Search, Download, Filter, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  useBuyerLeads,
  useExportBuyerLeadsMutation,
  useDeleteBuyerLeadMutation,
} from "../../hooks/useBuyerLeadsQuery";
import { BuyersTableSkeleton } from "./BuyersTableSkeleton";
import {
  BuyerServiceArea,
  BuyerReferralSource,
} from "../../services/buyerLeads.service";

const AREA_LABELS: Record<BuyerServiceArea, string> = {
  NORTHEAST_WI: "Northeast WI",
  GREATER_MADISON: "Greater Madison",
  GREATER_MILWAUKEE: "Greater Milwaukee",
};

const REFERRAL_LABELS: Record<BuyerReferralSource, string> = {
  WEB: "Web",
  REFERRAL: "Referral",
  SOCIAL_MEDIA: "Social Media",
  REI_SUCCESS: "REI Success",
  ORGANIC_SEARCH: "Organic Search",
  CAFFEINE_AND_CASH_FLOW: "Caffeine and Cash Flow",
  WISCO_REIA: "Wisco REIA",
  WISCONSIN_INVESTOR_PODCAST: "The Wisconsin Investor Podcast",
};

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

export const BuyersTable: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [areaFilter, setAreaFilter] = useState<BuyerServiceArea | "ALL">(
    "ALL"
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [buyerToDelete, setBuyerToDelete] = useState<{
    id: string;
    buyerNumber: string;
    name: string;
  } | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useBuyerLeads({
      page,
      limit: 20,
      search: searchTerm || undefined,
      area: areaFilter !== "ALL" ? areaFilter : undefined,
    });

  const exportMutation = useExportBuyerLeadsMutation();
  const deleteMutation = useDeleteBuyerLeadMutation();

  const buyers = data?.data || [];
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

  const handleAreaFilter = (area: BuyerServiceArea | "ALL") => {
    setAreaFilter(area);
    setPage(1);
  };

  const handleExport = () => {
    exportMutation.mutate();
  };

  const handleConfirmDelete = () => {
    if (!buyerToDelete) return;
    deleteMutation.mutate(buyerToDelete.id, {
      onSuccess: () => setBuyerToDelete(null),
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const activeFiltersCount = areaFilter !== "ALL" ? 1 : 0;

  return (
    <div className="space-y-6">
      {/* Top Title & Export Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f2347] dark:text-white tracking-tight">
            Buyers List
          </h1>
          <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
            Investors and cash buyers signed up for off-market deal alerts via the Wholesale tab.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all disabled:opacity-50 cursor-pointer shrink-0"
            title="Refresh Buyers"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
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
        {/* Search & Filter Toolbar */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by buyer #, name, phone, email..."
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

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-56 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 space-y-3">
                <div>
                  <p className="px-1 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Area
                  </p>
                  <div className="space-y-0.5">
                    {(
                      ["ALL", ...Object.keys(AREA_LABELS)] as (
                        | BuyerServiceArea
                        | "ALL"
                      )[]
                    ).map((area) => (
                      <button
                        key={area}
                        onClick={() => handleAreaFilter(area)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          areaFilter === area
                            ? "bg-[#0f2347] text-white dark:bg-blue-600"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {area === "ALL" ? "All Areas" : AREA_LABELS[area]}
                      </button>
                    ))}
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => {
                      setAreaFilter("ALL");
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

        {isLoading ? (
          <BuyersTableSkeleton />
        ) : isError ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
              {(error as any)?.message || "Failed to load buyers from server."}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-xs font-bold text-white bg-[#0f2347] hover:bg-[#1a386d] dark:bg-blue-600 rounded-xl transition-all cursor-pointer"
            >
              Retry Loading
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 px-3">BUYER ID</th>
                  <th className="pb-3 px-3">CONTACT</th>
                  <th className="pb-3 px-3">AREAS</th>
                  <th className="pb-3 px-3">SOURCE</th>
                  <th className="pb-3 px-3">JOINED</th>
                  <th className="pb-3 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {buyers.length > 0 ? (
                  buyers.map((buyer) => (
                    <React.Fragment key={buyer.id}>
                      <tr className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {buyer.buyerNumber}
                        </td>

                        <td className="py-4 px-3">
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {buyer.name}
                            </h4>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                              {buyer.phone} &middot; {buyer.email}
                            </p>
                          </div>
                        </td>

                        <td className="py-4 px-3">
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {buyer.areas.map((area) => (
                              <span
                                key={area}
                                className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50"
                              >
                                {AREA_LABELS[area]}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-4 px-3 font-medium text-slate-500 dark:text-slate-400">
                          {buyer.referralSource
                            ? REFERRAL_LABELS[buyer.referralSource]
                            : "—"}
                        </td>

                        <td className="py-4 px-3 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(buyer.submittedAt)}
                        </td>

                        <td className="py-4 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                setExpandedId(
                                  expandedId === buyer.id ? null : buyer.id
                                )
                              }
                              className="inline-block px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
                            >
                              {expandedId === buyer.id ? "Hide" : "View"}
                            </button>

                            <button
                              onClick={() =>
                                setBuyerToDelete({
                                  id: buyer.id,
                                  buyerNumber: buyer.buyerNumber,
                                  name: buyer.name,
                                })
                              }
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition-colors cursor-pointer"
                              title="Remove Buyer"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedId === buyer.id && (
                        <tr className="bg-slate-50/60 dark:bg-slate-800/30">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px]">
                              <div>
                                <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  Consent
                                </p>
                                <p className="font-semibold text-slate-700 dark:text-slate-300">
                                  {buyer.consent
                                    ? "Agreed to texts & emails"
                                    : "Not confirmed"}
                                </p>
                              </div>
                              <div>
                                <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  Referred By
                                </p>
                                <p className="font-semibold text-slate-700 dark:text-slate-300">
                                  {buyer.referredBy || "—"}
                                </p>
                              </div>
                              <div className="sm:col-span-1">
                                <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  Questions / Comments
                                </p>
                                <p className="font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                                  {buyer.questions || "—"}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-slate-400 font-medium"
                    >
                      No buyers found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isError && pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Showing {buyers.length} of {pagination.total} buyers (Page{" "}
              {pagination.page} of {pagination.totalPages})
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
      {buyerToDelete && (
        <div
          onClick={() => setBuyerToDelete(null)}
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
                Remove Buyer {buyerToDelete.buyerNumber}?
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to remove{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {buyerToDelete.name}
                </span>{" "}
                from the buyers list? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setBuyerToDelete(null)}
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
                    <span>Removing...</span>
                  </>
                ) : (
                  <span>Yes, Remove</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
