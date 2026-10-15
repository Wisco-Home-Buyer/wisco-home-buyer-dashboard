"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { WholesalePageShell } from "@/components/wholesale/WholesalePageShell";
import { WholesaleListingForm } from "@/components/wholesale/WholesaleListingForm";
import {
  useUpdateWholesaleListingMutation,
  useWholesaleListingDetail,
} from "@/hooks/useWholesaleListingsQuery";

export default function EditWholesaleListingPage() {
  const params = useParams();
  const listingId = (params?.id as string) || "";
  const router = useRouter();

  const { data, isLoading, isError, error, refetch } =
    useWholesaleListingDetail(listingId);
  const updateMutation = useUpdateWholesaleListingMutation(listingId);

  const listing = data?.data;

  return (
    <WholesalePageShell
      breadcrumbs={[
        { label: "Wholesale Listings", href: "/wholesale-listings" },
        { label: "Edit listing" },
      ]}
    >
      <div className="space-y-6 max-w-4xl">
        <div>
          <Link
            href="/wholesale-listings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to listings
          </Link>
          <h1 className="mt-2 text-xl sm:text-2xl font-bold text-[#0f2347] dark:text-white tracking-tight">
            Edit wholesale listing
          </h1>
        </div>

        {isLoading ? (
          <p className="py-12 text-center text-xs font-semibold text-slate-400">
            Loading listing...
          </p>
        ) : isError || !listing ? (
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
        ) : (
          <WholesaleListingForm
            listing={listing}
            isSubmitting={updateMutation.isPending}
            submitLabel="Save changes"
            onSubmit={(input) =>
              updateMutation.mutate(input, {
                onSuccess: () => router.push("/wholesale-listings"),
              })
            }
          />
        )}
      </div>
    </WholesalePageShell>
  );
}
