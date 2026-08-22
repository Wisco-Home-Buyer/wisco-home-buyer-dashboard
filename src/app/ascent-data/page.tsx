"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { AscentLookupPanel } from "@/components/ascent/AscentLookupPanel";

export default function AscentDataPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
            { label: "Public Records" },
          ]}
        />

        <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0f2347] dark:text-white tracking-tight">
              Ascent Public Records
            </h1>
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-1">
              Live county parcel ownership and tax history from Winnebago,
              Outagamie, and Calumet Ascent sites.
            </p>
          </div>

          <AscentLookupPanel />
        </main>
      </div>
    </div>
  );
}
