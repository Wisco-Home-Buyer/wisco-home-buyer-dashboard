"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { LeadConversion } from "@/components/dashboard/LeadConversion";
import { RecentLeadsTable } from "@/components/dashboard/RecentLeadsTable";
import { PriorityAlerts } from "@/components/dashboard/PriorityAlerts";
import { useOverview } from "@/hooks/useOverviewQuery";
import {
  formatCompactCurrency,
  formatSignedDays,
  formatSignedPercent,
  OverviewPeriod,
} from "@/services/overview.service";

export default function DashboardPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [period, setPeriod] = useState<OverviewPeriod>("30d");
  const { data, isLoading, isError, refetch } = useOverview(period);

  const metrics = data?.metrics;
  const trendPositive = (value: number) => (value >= 0 ? "positive" : "negative");

  return (
    <div className="flex min-h-screen bg-[#f4f6f8] dark:bg-[#0b1329]">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 transition-all">
        <Header
          onMobileMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {isError && (
            <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3">
              <span>Couldn&apos;t load dashboard overview.</span>
              <button
                type="button"
                onClick={() => void refetch()}
                className="font-bold underline cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-6">
            <MetricCard
              title="Total Leads"
              value={
                isLoading
                  ? "—"
                  : (metrics?.totalLeads.value ?? 2847).toLocaleString()
              }
              iconSrc="/assets/total_leads.svg"
              badgeText={formatSignedPercent(metrics?.totalLeads.changePercent ?? 18.2)}
              badgeTrend={trendPositive(metrics?.totalLeads.changePercent ?? 18.2)}
              subtext="vs last month"
              iconBgColor="bg-[#f0f4f8] dark:bg-slate-800"
            />

            <MetricCard
              title="Active Pipeline"
              value={
                isLoading
                  ? "—"
                  : formatCompactCurrency(metrics?.activePipeline.value ?? 4200000)
              }
              iconSrc="/assets/active_pipeline.svg"
              badgeText={formatSignedPercent(
                metrics?.activePipeline.changePercent ?? 12.5,
              )}
              badgeTrend={trendPositive(
                metrics?.activePipeline.changePercent ?? 12.5,
              )}
              subtext={`${metrics?.activePipeline.dealCount ?? 24} active deals`}
              iconBgColor="bg-[#f0f4f8] dark:bg-slate-800"
            />

            <MetricCard
              title="Deal Closed"
              value={
                isLoading
                  ? "—"
                  : (metrics?.dealsClosed.value ?? 184).toLocaleString()
              }
              iconSrc="/assets/deal_closed.svg"
              badgeText={formatSignedPercent(
                metrics?.dealsClosed.changePercent ?? 8.7,
              )}
              badgeTrend={trendPositive(metrics?.dealsClosed.changePercent ?? 8.7)}
              subtext="This quarter"
              iconBgColor="bg-[#e6f7ed] dark:bg-emerald-950/50"
            />

            <MetricCard
              title="Avg. Close Time"
              value={
                isLoading
                  ? "—"
                  : (metrics?.avgCloseTime.valueDays ?? 7.2).toFixed(1)
              }
              unit="days"
              iconSrc="/assets/avg_close_time.svg"
              badgeText={
                metrics?.avgCloseTime.changeDays !== undefined
                  ? formatSignedDays(metrics.avgCloseTime.changeDays)
                  : "-2.1 days"
              }
              badgeTrend={
                (metrics?.avgCloseTime.changeDays ?? -2.1) <= 0
                  ? "positive"
                  : "negative"
              }
              subtext="Improvement"
              iconBgColor="bg-[#fff7ed] dark:bg-amber-950/50"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8">
              <RevenueChart
                data={data?.revenueTrend}
                period={period}
                onPeriodChange={setPeriod}
                isLoading={isLoading}
              />
            </div>

            <div className="lg:col-span-4">
              <LeadConversion
                stages={data?.conversion.stages}
                windowDays={data?.conversion.windowDays}
                isLoading={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8">
              <RecentLeadsTable
                leads={data?.recentLeads}
                isLoading={isLoading}
              />
            </div>

            <div className="lg:col-span-4">
              <PriorityAlerts
                alerts={data?.priorityAlerts}
                isLoading={isLoading}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
