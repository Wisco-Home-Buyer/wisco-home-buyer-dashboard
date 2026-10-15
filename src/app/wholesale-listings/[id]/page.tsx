"use client";

import React from "react";
import { useParams } from "next/navigation";
import { WholesalePageShell } from "@/components/wholesale/WholesalePageShell";
import { WholesaleListingDetail } from "@/components/wholesale/WholesaleListingDetail";

export default function WholesaleListingDetailPage() {
  const params = useParams();
  const listingId = (params?.id as string) || "";

  return (
    <WholesalePageShell
      breadcrumbs={[
        { label: "Wholesale Listings", href: "/wholesale-listings" },
        { label: "Listing" },
      ]}
    >
      <WholesaleListingDetail listingId={listingId} />
    </WholesalePageShell>
  );
}
