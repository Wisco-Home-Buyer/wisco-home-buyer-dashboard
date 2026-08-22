"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { AvmValuationCard } from "@/components/properties/AvmValuationCard";
import { RecentComparablesCard } from "@/components/properties/RecentComparablesCard";
import { OwnershipCard } from "@/components/properties/OwnershipCard";
import { usePropertyDetail } from "@/hooks/usePropertiesQuery";
import {
  enrichmentLabel,
  formatEnumLabel,
  formatMoney,
  formatMoneyExact,
  latestTaxBill,
} from "@/services/properties.service";
import { ArrowLeft, Layers, Loader2, AlertCircle, Clock } from "lucide-react";

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = (params?.id as string) || "";
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { data, isLoading, isError, refetch } = usePropertyDetail(propertyId);

  const address = data?.street ?? "Property";
  const cityStateZip = data
    ? `${data.city}, ${data.state} ${data.zip}`
    : "";
  const enrichment = data?.enrichment;
  const parcel = data?.parcel;
  const tax = latestTaxBill(parcel);
  const label = enrichmentLabel(enrichment?.status);
  const BadgeIcon =
    label === "Enriched" ? Layers : label === "Failed" ? AlertCircle : Clock;
  const badgeClass =
    label === "Enriched"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
      : label === "Failed"
        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
        : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300";

  const countyMetrics = {
    taxBill: formatMoneyExact(tax?.taxBill),
    taxesDue: formatMoneyExact(tax?.taxesDue),
    taxesPaid: formatMoneyExact(tax?.taxesPaid),
    estimatedValue: enrichment?.estimatedValue
      ? formatMoney(enrichment.estimatedValue)
      : "—",
    lastSoldPrice: enrichment?.lastSoldPrice
      ? formatMoney(enrichment.lastSoldPrice)
      : "—",
    lastSoldDate: enrichment?.lastSoldDate
      ? format(new Date(enrichment.lastSoldDate), "MMM yyyy")
      : "—",
  };

  const ownership = {
    ownerName: parcel?.ownerName?.trim() || data?.lead?.sellerName || "—",
    ownerType: enrichment?.ownerType
      ? formatEnumLabel(enrichment.ownerType)
      : "—",
    occupancyStatus: enrichment?.occupancyStatus
      ? formatEnumLabel(enrichment.occupancyStatus)
      : "—",
  };

  const comparables =
    enrichment?.comparables?.map((c) => ({
      id: c.id,
      address: c.address,
      distance: `${c.distanceMiles.toFixed(2)} miles`,
      distanceMiles: c.distanceMiles,
      latitude: c.latitude,
      longitude: c.longitude,
      soldDate: format(new Date(c.soldDate), "MMM d, yyyy"),
      soldPrice: formatMoney(c.soldPrice),
    })) ?? [];

  return (
    <div className="flex min-h-screen bg-[#f4f6f8] dark:bg-[#0b1329]">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 transition-all">
        <Header
          onMobileMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          breadcrumbs={[
            { label: "Wisco Home Buyer", href: "/" },
            { label: "Properties", href: "/properties" },
            { label: address },
          ]}
        />

        <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {isLoading ? (
            <div className="py-16 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading property…
            </div>
          ) : isError || !data ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-xs text-slate-400">
                Couldn&apos;t load this property.
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start sm:items-center gap-3">
                <Link
                  href="/properties"
                  className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl shadow-xs transition-colors shrink-0 mt-0.5 sm:mt-0"
                  aria-label="Back to Properties"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-2xl font-bold text-[#0f2347] dark:text-white tracking-tight leading-snug">
                      {address}
                    </h1>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold rounded-full shrink-0 ${badgeClass}`}
                    >
                      <BadgeIcon className="w-3 h-3" />
                      {label === "Enriched" ? "County Verified" : label}
                    </span>
                  </div>
                  <p className="text-xs font-normal text-slate-400 dark:text-slate-500 mt-0.5">
                    {cityStateZip}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-8">
                    <AvmValuationCard
                      metrics={countyMetrics}
                      taxYear={
                        tax?.taxYear ?? enrichment?.taxAssessedYear ?? null
                      }
                      taxDistrict={parcel?.taxDistrict ?? null}
                      acres={parcel?.acres ?? data.lotSizeAcres ?? null}
                    />
                  </div>

                  <div className="lg:col-span-4">
                    <OwnershipCard ownership={ownership} />
                  </div>
                </div>

                <div>
                  <RecentComparablesCard
                    comparables={comparables}
                    subjectAddress={address}
                    subjectLatitude={data?.latitude ?? null}
                    subjectLongitude={data?.longitude ?? null}
                  />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
