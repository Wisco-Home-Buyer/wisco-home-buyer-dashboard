"use client";

import React, { useState } from "react";
import { Sidebar } from "../dashboard/Sidebar";
import { Header } from "../dashboard/Header";

interface WholesalePageShellProps {
  breadcrumbs: { label: string; href?: string }[];
  children: React.ReactNode;
}

export const WholesalePageShell: React.FC<WholesalePageShellProps> = ({
  breadcrumbs,
  children,
}) => {
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
            ...breadcrumbs,
          ]}
        />

        <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
