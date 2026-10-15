"use client";

import React from "react";
import { useParams } from "next/navigation";
import { WholesalePageShell } from "@/components/wholesale/WholesalePageShell";
import { ListingInterestDetail } from "@/components/wholesale/ListingInterestDetail";

export default function ListingInterestDetailPage() {
  const params = useParams();
  const interestId = (params?.id as string) || "";

  return (
    <WholesalePageShell
      breadcrumbs={[
        { label: "Wholesale Listings", href: "/wholesale-listings" },
        { label: "Interested buyers", href: "/wholesale-listings/interests" },
        { label: "Request" },
      ]}
    >
      <ListingInterestDetail interestId={interestId} />
    </WholesalePageShell>
  );
}
