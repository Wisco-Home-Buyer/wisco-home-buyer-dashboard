"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowLeft } from "lucide-react";
import {
  useListingInterestDetail,
  useMarkInterestReadMutation,
} from "../../hooks/useWholesaleListingsQuery";

export const ListingInterestDetail: React.FC<{ interestId: string }> = ({
  interestId,
}) => {
  const { data, isLoading, isError, error, refetch } =
    useListingInterestDetail(interestId);
  const markRead = useMarkInterestReadMutation();
  const interest = data?.data;
  const needsRead = interest ? interest.readAt === null : false;
  const { mutate: markReadMutate } = markRead;

  useEffect(() => {
    if (needsRead) markReadMutate(interestId);
  }, [needsRead, interestId, markReadMutate]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/wholesale-listings/interests"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to interested buyers
        </Link>
        <h1 className="mt-2 text-xl sm:text-2xl font-bold text-[#0f2347] dark:text-white tracking-tight">
          {interest ? interest.name : "Interested buyer"}
        </h1>
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-xs font-semibold text-slate-400">
          Loading...
        </p>
      ) : isError || !interest ? (
        <div className="py-12 text-center space-y-3">
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
            {error?.message || "Request not found."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0f2347] hover:bg-[#1a386d] dark:bg-blue-600 rounded-xl cursor-pointer"
          >
            Retry loading
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100/80 dark:border-slate-800/80 shadow-xs p-4 md:p-6 space-y-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <dt className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Email
              </dt>
              <dd className="mt-1 font-semibold text-slate-900 dark:text-white break-all">
                <a href={`mailto:${interest.email}`} className="hover:underline">
                  {interest.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Phone
              </dt>
              <dd className="mt-1 font-semibold text-slate-900 dark:text-white">
                <a href={`tel:${interest.phone}`} className="hover:underline">
                  {interest.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Interested in
              </dt>
              <dd className="mt-1 font-semibold">
                {interest.listingId ? (
                  <Link
                    href={`/wholesale-listings/${interest.listingId}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {interest.listingTitle}
                  </Link>
                ) : (
                  <span className="text-slate-700 dark:text-slate-300">
                    {interest.listingTitle}{" "}
                    <span className="text-slate-400 font-medium">
                      (listing deleted)
                    </span>
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Received
              </dt>
              <dd className="mt-1 font-semibold text-slate-900 dark:text-white">
                {format(new Date(interest.createdAt), "PPP p")}
                <span className="text-slate-400 font-medium">
                  {" "}
                  (
                  {formatDistanceToNow(new Date(interest.createdAt), {
                    addSuffix: true,
                  })}
                  )
                </span>
              </dd>
            </div>
          </dl>

          <div>
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Message
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-pre-line wrap-break-word">
              {interest.message || "No message left."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
