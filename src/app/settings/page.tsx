"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { CompanyProfileForm } from "@/components/settings/CompanyProfileForm";
import { UsersRolesTab } from "@/components/settings/UsersRolesTab";
import { DatabaseBackupTab } from "@/components/settings/DatabaseBackupTab";
import { AutomationSettingsTab } from "@/components/settings/AutomationSettingsTab";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "users" | "automation" | "database">(
    "profile"
  );

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
            { label: "Settings" },
          ]}
        />

        {/* Body Container */}
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Top Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-[#0f2347] dark:text-white tracking-tight">
              Settings
            </h1>
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-1">
              Manage your platform configuration and integrations.
            </p>
          </div>

          {/* Settings Layout: Left Navigation Tab Card & Right Constrained Profile Card */}
          <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* Left Tab Card (Fixed Width 220px) */}
            <div className="w-full lg:w-56 shrink-0 p-2 bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100/80 dark:border-slate-800/80 shadow-xs space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "profile"
                    ? "bg-[#0e1726] text-white shadow-xs dark:bg-blue-600"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                Profile
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("users")}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "users"
                    ? "bg-[#0e1726] text-white shadow-xs dark:bg-blue-600"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                Users & Roles
              </button>

              {user?.role === "SUPER_ADMIN" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("automation")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === "automation"
                      ? "bg-[#0e1726] text-white shadow-xs dark:bg-blue-600"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  Automation
                </button>
              )}

              {user?.role === "SUPER_ADMIN" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("database")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === "database"
                      ? "bg-[#0e1726] text-white shadow-xs dark:bg-blue-600"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  Database
                </button>
              )}
            </div>

            {/* Right Form Card (Comfortable Max Width 820px) */}
            <div className="w-full max-w-[820px]">
              {activeTab === "profile" ? (
                <CompanyProfileForm />
              ) : activeTab === "users" ? (
                <UsersRolesTab />
              ) : activeTab === "automation" ? (
                <AutomationSettingsTab />
              ) : (
                <DatabaseBackupTab />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
