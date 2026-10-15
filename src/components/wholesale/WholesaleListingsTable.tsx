"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw, Search } from "lucide-react";
import {
  useDeleteWholesaleListingMutation,
  useNotifyBuyersMutation,
  useWholesaleListings,
} from "../../hooks/useWholesaleListingsQuery";
import {
  ListingStatus,
  ListingVisibility,
} from "../../services/wholesaleListings.service";
import { resolveAssetUrl } from "../../services/uploads.service";

const STATUS_LABELS: Record<ListingStatus, string> = {
  AVAILABLE: "Available",
  UNDER_CONTRACT: "Under contract",
  SOLD: "Sold",
};

const STATUS_STYLES: Record<ListingStatus, string> = {
  AVAILABLE:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  UNDER_CONTRACT:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  SOLD: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const VISIBILITY_LABELS: Record<ListingVisibility, string> = {
  PUBLIC: "Public",
  PRIVATE: "Private",
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);

export const WholesaleListingsTable: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibility, setVisibility] = useState<ListingVisibility | "ALL">(
    "ALL"
  );
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useWholesaleListings({
      page,
      limit: 20,
      search: searchTerm || undefined,
      visibility: visibility !== "ALL" ? visibility : undefined,
    });
  const deleteMutation = useDeleteWholesaleListingMutation();
  const notifyMutation = useNotifyBuyersMutation();
  const [pendingNotify, setPendingNotify] = useState<{
    id: string;
    title: string;
    notifiedAt: string | null;
  } | null>(null);

  const listings = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  const confirmNotify = () => {
    if (!pendingNotify) return;
    notifyMutation.mutate(pendingNotify.id, {
      onSettled: () => setPendingNotify(null),
    });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate(pendingDelete.id, {
      onSuccess: () => setPendingDelete(null),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f2347] dark:text-white tracking-tight">
            Wholesale Listings
          </h1>
          <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
            Properties you list for investors. Public listings appear on the
            website; private ones are only for the Buyers List.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all disabled:opacity-50 cursor-pointer shrink-0"
            title="Refresh listings"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
          <Link
            href="/wholesale-listings/interests"
            className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all whitespace-nowrap"
          >
            Interested buyers
          </Link>
          <Link
            href="/wholesale-listings/new"
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0f2347] hover:bg-[#1a386d] dark:bg-blue-600 rounded-xl transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New listing</span>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100/80 dark:border-slate-800/80 shadow-xs p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, street, city, ZIP..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-3 py-2.5 text-xs font-medium bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={visibility}
            onChange={(e) => {
              setVisibility(e.target.value as ListingVisibility | "ALL");
              setPage(1);
            }}
            aria-label="Filter by visibility"
            className="px-3.5 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All visibility</option>
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>
        </div>

        {isLoading ? (
          <p className="py-12 text-center text-xs font-semibold text-slate-400">
            Loading listings...
          </p>
        ) : isError ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
              {error?.message || "Failed to load listings from server."}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-xs font-bold text-white bg-[#0f2347] hover:bg-[#1a386d] dark:bg-blue-600 rounded-xl cursor-pointer"
            >
              Retry loading
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              No listings yet.
            </p>
            <Link
              href="/wholesale-listings/new"
              className="inline-block px-4 py-2 text-xs font-bold text-white bg-[#0f2347] hover:bg-[#1a386d] dark:bg-blue-600 rounded-xl"
            >
              Create the first listing
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 px-3">LISTING</th>
                  <th className="pb-3 px-3">PRICE</th>
                  <th className="pb-3 px-3">STATUS</th>
                  <th className="pb-3 px-3">VISIBILITY</th>
                  <th className="pb-3 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {listings.map((listing) => (
                  <tr
                    key={listing.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                          {listing.images[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={resolveAssetUrl(listing.images[0]) ?? ""}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-white truncate">
                            {listing.title}
                          </h4>
                          <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">
                            {listing.street}, {listing.city}, {listing.state}{" "}
                            {listing.zip}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatPrice(listing.price)}
                    </td>
                    <td className="py-4 px-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[listing.status]}`}
                      >
                        {STATUS_LABELS[listing.status]}
                      </span>
                    </td>
                    <td className="py-4 px-3 font-medium text-slate-500 dark:text-slate-400">
                      {VISIBILITY_LABELS[listing.visibility]}
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/wholesale-listings/${listing.id}`}
                          className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() =>
                            setPendingNotify({
                              id: listing.id,
                              title: listing.title,
                              notifiedAt: listing.notifiedAt,
                            })
                          }
                          className="font-bold text-slate-700 dark:text-slate-300 hover:underline cursor-pointer whitespace-nowrap"
                        >
                          Notify buyers
                        </button>
                        <button
                          onClick={() =>
                            setPendingDelete({
                              id: listing.id,
                              title: listing.title,
                            })
                          }
                          className="font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
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

      {pendingNotify && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm notify buyers"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        >
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[22px] p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[#0f2347] dark:text-white">
              Email this listing to the Buyers List?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              &quot;{pendingNotify.title}&quot; will be emailed to every buyer
              who gave consent.
              {pendingNotify.notifiedAt
                ? ` It was already sent on ${new Date(pendingNotify.notifiedAt).toLocaleString()}. Sending again will email them a second time.`
                : ""}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingNotify(null)}
                disabled={notifyMutation.isPending}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmNotify}
                disabled={notifyMutation.isPending}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0f2347] hover:bg-[#1a386d] dark:bg-blue-600 rounded-xl cursor-pointer disabled:opacity-50"
              >
                {notifyMutation.isPending ? "Sending..." : "Send emails"}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm delete"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        >
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[22px] p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[#0f2347] dark:text-white">
              Delete listing?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              &quot;{pendingDelete.title}&quot; and its photos will be removed.
              This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
