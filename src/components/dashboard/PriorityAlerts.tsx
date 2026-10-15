"use client";

import React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import type { OverviewAlert } from "../../services/overview.service";

interface PriorityAlertsProps {
  alerts?: OverviewAlert[];
  isLoading?: boolean;
}

export const PriorityAlerts: React.FC<PriorityAlertsProps> = ({
  alerts = [],
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col justify-between p-4 md:p-5 bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-200 h-full">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3.5 md:mb-4">
          <Bell className="w-4.5 h-4.5 text-[#f59e0b] fill-[#f59e0b]" />
          <h3 className="text-base font-bold text-[#0f2347] dark:text-white tracking-tight">
            High Priority Alerts
          </h3>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-2.5">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-3 md:p-3.5 rounded-xl bg-[#fffbf5] dark:bg-amber-950/20 border border-[#feeecd] dark:border-amber-900/30 animate-pulse h-16"
              />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <p className="py-6 text-center text-xs font-medium text-[#64748b] dark:text-slate-400">
            No alerts right now.
          </p>
        ) : (
          <div className="space-y-2.5">
            {alerts.map((alert) => {
              const body = (
                <div className="px-3.5 py-3 md:px-4 md:py-3.5 rounded-xl bg-[#fffbf5] dark:bg-amber-950/20 border border-[#feeecd] dark:border-amber-900/30 transition-all hover:bg-[#fff7ec] dark:hover:bg-amber-950/30 cursor-pointer">
                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#f59e0b] mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#0f2347] dark:text-slate-100">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-[#64748b] dark:text-slate-400 font-normal mt-0.5 leading-relaxed">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </div>
              );

              if (alert.leadId) {
                return (
                  <Link key={alert.id} href={`/leads/${alert.leadId}`} className="block">
                    {body}
                  </Link>
                );
              }

              return <div key={alert.id}>{body}</div>;
            })}
          </div>
        )}
      </div>
    </div>
  );
};
