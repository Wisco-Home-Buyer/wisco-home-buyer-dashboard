"use client";

import React from "react";
import { WholesalePageShell } from "@/components/wholesale/WholesalePageShell";
import { WholesaleListingsTable } from "@/components/wholesale/WholesaleListingsTable";

export default function WholesaleListingsPage() {
  return (
    <WholesalePageShell breadcrumbs={[{ label: "Wholesale Listings" }]}>
      <WholesaleListingsTable />
    </WholesalePageShell>
  );
}
