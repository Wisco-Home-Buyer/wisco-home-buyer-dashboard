"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { WholesalePageShell } from "@/components/wholesale/WholesalePageShell";
import { WholesaleListingForm } from "@/components/wholesale/WholesaleListingForm";
import { useCreateWholesaleListingMutation } from "@/hooks/useWholesaleListingsQuery";

export default function NewWholesaleListingPage() {
  const router = useRouter();
  const createMutation = useCreateWholesaleListingMutation();

  return (
    <WholesalePageShell
      breadcrumbs={[
        { label: "Wholesale Listings", href: "/wholesale-listings" },
        { label: "New listing" },
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
            New wholesale listing
          </h1>
        </div>

        <WholesaleListingForm
          isSubmitting={createMutation.isPending}
          submitLabel="Create listing"
          onSubmit={(input) =>
            createMutation.mutate(input, {
              onSuccess: () => router.push("/wholesale-listings"),
            })
          }
        />
      </div>
    </WholesalePageShell>
  );
}
