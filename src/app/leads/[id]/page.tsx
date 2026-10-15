"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Sidebar } from "../../../components/dashboard/Sidebar";
import { Header } from "../../../components/dashboard/Header";
import { PropertyDetailsCard } from "../../../components/leads/PropertyDetailsCard";
import { LeadScoreCard } from "../../../components/leads/LeadScoreCard";
import { LeadDetailSkeleton } from "../../../components/leads/LeadDetailSkeleton";
import { ArrowLeft, ChevronDown, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLeadDetail, useUpdateLeadStatusMutation } from "../../../hooks/useLeadsQuery";
import { LeadStatus } from "../../../services/leads.service";

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = (params?.id as string) || "";
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useLeadDetail(leadId);
  const updateStatusMutation = useUpdateLeadStatusMutation();

  const lead = data?.data;

  const statusOptions: LeadStatus[] = [
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "NEGOTIATION",
    "CLOSED",
    "REJECTED",
  ];

  const handleStatusChange = (newStatus: LeadStatus) => {
    if (!leadId) return;
    setStatusDropdownOpen(false);
    updateStatusMutation.mutate({ id: leadId, status: newStatus });
  };

  const sellerName = lead?.seller?.name || lead?.sellerName || "Lead Detail";
  const sellerPhone = lead?.seller?.phone || lead?.sellerPhone || "N/A";
  const sellerEmail = lead?.seller?.email || "N/A";

  const formattedSubmitted = lead?.submittedAt
    ? formatDistanceToNow(new Date(lead.submittedAt), { addSuffix: true })
    : "Recently";

  // Map real backend property details
  const prop = lead?.property;
  const imageList =
    prop?.images && prop.images.length > 0
      ? prop.images.sort((a, b) => a.position - b.position).map((img) => img.url)
      : [];

  const propertyData = {
    address: prop?.street || "No Street Address Provided",
    cityStateZip: [prop?.city, prop?.state, prop?.zip]
      .filter(Boolean)
      .join(", ") || "City/State N/A",
    bedsBaths: prop?.bedrooms && prop?.bathrooms
      ? `${prop.bedrooms} / ${prop.bathrooms}`
      : "3 / 2",
    sqft: prop?.squareFeet
      ? `${prop.squareFeet.toLocaleString()} sqft`
      : "1,500 sqft",
    yearBuilt: prop?.yearBuilt ? String(prop.yearBuilt) : "N/A",
    lotSize: prop?.lotSizeAcres ? `${prop.lotSizeAcres} acres` : "N/A",
    roofCondition: typeof prop?.roofCondition === "string" ? prop.roofCondition.replace("_", " ") : "FAIR",
    kitchenCondition: typeof prop?.kitchenCondition === "string" ? prop.kitchenCondition.replace("_", " ") : "GOOD",
    bathroomCondition: typeof prop?.bathroomCondition === "string" ? prop.bathroomCondition.replace("_", " ") : "FAIR",
    foundationCondition: typeof prop?.foundationCondition === "string" ? prop.foundationCondition.replace("_", " ") : "GOOD",
    otherRepairsNeeded: prop?.otherRepairsNeeded || null,
    photos: imageList,
  };

  const contactData = {
    phone: sellerPhone,
    email: sellerEmail,
    timeline: typeof lead?.timeline === "string" ? lead.timeline.replace("_", " ") : "Immediately",
  };

  const valuationData = {
    score: lead?.score || 0,
    priority: (lead?.priority || "MEDIUM") as "HIGH" | "MED" | "LOW",
    estValue: prop?.enrichment?.estimatedValue
      ? `$${prop.enrichment.estimatedValue.toLocaleString()}`
      : "N/A (AVM Pending)",
  };

  return (
    <div className="flex min-h-screen bg-[#f4f6f8] dark:bg-[#0b1329]">
      {/* Sidebar Component */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 transition-all">
        {/* Top Header */}
        <Header
          onMobileMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          breadcrumbs={[
            { label: "Wisco Home Buyer", href: "/" },
            { label: "Leads", href: "/leads" },
            { label: sellerName },
          ]}
        />

        {/* Lead Detail Body */}
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Loading Shimmer / Error / Content */}
          {isLoading ? (
            <LeadDetailSkeleton />
          ) : isError ? (
            <div className="p-12 text-center space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                {error?.message || "Failed to load lead details."}
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/leads"
                  className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Back to Leads
                </Link>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0f2347] dark:bg-blue-600 rounded-xl cursor-pointer"
                >
                  Retry Loading
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Top Lead Back Bar & Status Dropdown */}
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Link
                    href="/leads"
                    className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl shadow-xs transition-colors shrink-0"
                    aria-label="Back to Leads"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Link>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                        {sellerName}
                      </h1>
                      <span className="px-2.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 rounded-full uppercase tracking-wider shrink-0">
                        {lead?.status}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                      {lead?.leadNumber} • Submitted {formattedSubmitted}
                    </p>
                  </div>
                </div>

                {/* Status Dropdown Selector (Aligned Right) */}
                <div className="relative shrink-0">
                  <button
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    disabled={updateStatusMutation.isPending}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  >
                    <span>Status: {lead?.status}</span>
                    {updateStatusMutation.isPending ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {statusDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setStatusDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-44 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-20 space-y-1">
                        {statusOptions.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => handleStatusChange(opt)}
                            className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                              lead?.status === opt
                                ? "bg-[#0f2347] text-white dark:bg-blue-600"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8">
                  <PropertyDetailsCard property={propertyData} />
                </div>

                <div className="lg:col-span-4">
                  <LeadScoreCard
                    contact={contactData}
                    valuation={valuationData}
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
