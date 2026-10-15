"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowLeft, Pencil } from "lucide-react";
import {
  useListingInterests,
  useWholesaleListingDetail,
} from "../../hooks/useWholesaleListingsQuery";
import { resolveAssetUrl } from "../../services/uploads.service";
import { isUploadedVideo } from "../../lib/video";
import { ImageLightbox } from "./ImageLightbox";

const STATUS_LABELS = {
  AVAILABLE: "Available",
  UNDER_CONTRACT: "Under contract",
  SOLD: "Sold",
} as const;

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);

export const WholesaleListingDetail: React.FC<{ listingId: string }> = ({
  listingId,
}) => {
  const { data, isLoading, isError, error, refetch } =
    useWholesaleListingDetail(listingId);
  const { data: interestsData } = useListingInterests({
    listingId,
    limit: 10,
  });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const listing = data?.data;
  const interests = interestsData?.data ?? [];
  const interestTotal = interestsData?.pagination?.total ?? 0;
  const images = (listing?.images ?? []).map((url) => resolveAssetUrl(url) ?? "");

  if (isLoading) {
    return (
      <p className="py-12 text-center text-xs font-semibold text-slate-400">
        Loading listing...
      </p>
    );
  }

  if (isError || !listing) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
          {error?.message || "Listing not found."}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 text-xs font-bold text-white bg-[#0f2347] hover:bg-[#1a386d] dark:bg-blue-600 rounded-xl cursor-pointer"
        >
          Retry loading
        </button>
      </div>
    );
  }

  const facts = [
    listing.bedrooms != null ? `${listing.bedrooms} bedrooms` : null,
    listing.bathrooms != null ? `${listing.bathrooms} bathrooms` : null,
    listing.squareFeet != null
      ? `${listing.squareFeet.toLocaleString("en-US")} sqft`
      : null,
  ].filter(Boolean);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <Link
            href="/wholesale-listings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to listings
          </Link>
          <h1 className="mt-2 text-xl sm:text-2xl font-bold text-[#0f2347] dark:text-white tracking-tight">
            {listing.title}
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            {listing.street}, {listing.city}, {listing.state} {listing.zip}
          </p>
        </div>

        <Link
          href={`/wholesale-listings/${listing.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0f2347] hover:bg-[#1a386d] dark:bg-blue-600 rounded-xl whitespace-nowrap self-start"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit listing
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100/80 dark:border-slate-800/80 shadow-xs p-4 md:p-6 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-2xl font-extrabold text-[#0f2347] dark:text-white">
            {formatPrice(listing.price)}
          </p>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {STATUS_LABELS[listing.status]}
          </span>
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              listing.visibility === "PUBLIC"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
            }`}
          >
            {listing.visibility === "PUBLIC" ? "Public" : "Private"}
          </span>
        </div>

        {facts.length > 0 && (
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {facts.join(" · ")}
          </p>
        )}

        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-pre-line wrap-break-word">
          {listing.description}
        </p>

        {listing.videoUrl && isUploadedVideo(listing.videoUrl) && (
          <video
            controls
            preload="metadata"
            src={resolveAssetUrl(listing.videoUrl) ?? undefined}
            className="w-full max-w-xl rounded-2xl bg-black"
          />
        )}
        {listing.videoUrl && !isUploadedVideo(listing.videoUrl) && (
          <a
            href={listing.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Open the property video
          </a>
        )}

        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <dt className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Created
            </dt>
            <dd className="mt-1 font-semibold text-slate-700 dark:text-slate-300">
              {format(new Date(listing.createdAt), "PPP")}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Last updated
            </dt>
            <dd className="mt-1 font-semibold text-slate-700 dark:text-slate-300">
              {format(new Date(listing.updatedAt), "PPP")}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Emailed to Buyers List
            </dt>
            <dd className="mt-1 font-semibold text-slate-700 dark:text-slate-300">
              {listing.notifiedAt
                ? formatDistanceToNow(new Date(listing.notifiedAt), {
                    addSuffix: true,
                  })
                : "Not yet"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100/80 dark:border-slate-800/80 shadow-xs p-4 md:p-6 space-y-4">
        <h2 className="text-sm font-bold text-[#0f2347] dark:text-white">
          Photos ({images.length})
        </h2>
        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((url, index) => (
              <button
                key={url}
                type="button"
                onClick={() => setLightboxIndex(index)}
                aria-label={`View photo ${index + 1} larger`}
                className="aspect-4/3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 cursor-zoom-in"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Listing photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs font-medium text-slate-400">No photos yet.</p>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100/80 dark:border-slate-800/80 shadow-xs p-4 md:p-6 space-y-4">
        <h2 className="text-sm font-bold text-[#0f2347] dark:text-white">
          Interested buyers ({interestTotal})
        </h2>
        {interests.length === 0 ? (
          <p className="text-xs font-medium text-slate-400">
            Nobody has clicked &quot;I&apos;m interested&quot; yet.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {interests.map((interest) => (
              <li key={interest.id}>
                <Link
                  href={`/wholesale-listings/interests/${interest.id}`}
                  className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 rounded-xl px-2 -mx-2 transition-colors"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {interest.readAt === null && (
                      <span
                        aria-label="Unread"
                        className="w-2 h-2 rounded-full bg-blue-600 shrink-0"
                      />
                    )}
                    <span className="min-w-0">
                      <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                        {interest.name}
                      </span>
                      <span className="block text-[11px] font-medium text-slate-400 truncate">
                        {interest.email} · {interest.phone}
                      </span>
                    </span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                    {formatDistanceToNow(new Date(interest.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ImageLightbox
        images={images}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
      />
    </div>
  );
};
