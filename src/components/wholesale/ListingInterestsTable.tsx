"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, RefreshCw, Search } from "lucide-react";
import { useListingInterests } from "../../hooks/useWholesaleListingsQuery";

const formatDate = (value: string) => {
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return value;
  }
};

export const ListingInterestsTable: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError, error, refetch, isFetching } =
    useListingInterests({
      page,
      limit: 20,
      search: searchTerm || undefined,
    });

  const interests = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Link
            href="/wholesale-listings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to listings
          </Link>
          <h1 className="mt-2 text-xl sm:text-2xl font-bold text-[#0f2347] dark:text-white tracking-tight">
            Interested buyers
          </h1>
          <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
            People who clicked &quot;I&apos;m interested&quot; on a public
            listing.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-auto p-2.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all disabled:opacity-50 cursor-pointer shrink-0"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100/80 dark:border-slate-800/80 shadow-xs p-4 md:p-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, listing..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-3 py-2.5 text-xs font-medium bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isLoading ? (
          <p className="py-12 text-center text-xs font-semibold text-slate-400">
            Loading...
          </p>
        ) : isError ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
              {error?.message || "Failed to load requests from server."}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-xs font-bold text-white bg-[#0f2347] hover:bg-[#1a386d] dark:bg-blue-600 rounded-xl cursor-pointer"
            >
              Retry loading
            </button>
          </div>
        ) : interests.length === 0 ? (
          <p className="py-12 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
            No requests yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 px-3">CONTACT</th>
                  <th className="pb-3 px-3">LISTING</th>
                  <th className="pb-3 px-3">MESSAGE</th>
                  <th className="pb-3 px-3">RECEIVED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {interests.map((interest) => (
                  <tr
                    key={interest.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors align-top"
                  >
                    <td className="py-4 px-3">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {interest.name}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                        <a
                          href={`mailto:${interest.email}`}
                          className="hover:underline"
                        >
                          {interest.email}
                        </a>
                        {" · "}
                        <a
                          href={`tel:${interest.phone}`}
                          className="hover:underline"
                        >
                          {interest.phone}
                        </a>
                      </p>
                    </td>
                    <td className="py-4 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {interest.listingId ? (
                        <Link
                          href={`/wholesale-listings/${interest.listingId}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {interest.listingTitle}
                        </Link>
                      ) : (
                        <span title="This listing was deleted">
                          {interest.listingTitle}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-3 font-medium text-slate-500 dark:text-slate-400 max-w-[320px] whitespace-pre-line wrap-break-word">
                      {interest.message || "—"}
                    </td>
                    <td className="py-4 px-3 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(interest.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 text-xs font-bold">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
