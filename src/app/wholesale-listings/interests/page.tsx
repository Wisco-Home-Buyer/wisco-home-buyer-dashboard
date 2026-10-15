"use client";

import React from "react";
import { WholesalePageShell } from "@/components/wholesale/WholesalePageShell";
import { ListingInterestsTable } from "@/components/wholesale/ListingInterestsTable";

export default function ListingInterestsPage() {
  return (
    <WholesalePageShell
      breadcrumbs={[
        { label: "Wholesale Listings", href: "/wholesale-listings" },
        { label: "Interested buyers" },
      ]}
    >
      <ListingInterestsTable />
    </WholesalePageShell>
  );
}
