"use client";

import React from "react";
import { Building2 } from "lucide-react";

export interface CountyTaxMetrics {
  taxBill: string;
  taxesDue: string;
  taxesPaid: string;
  estimatedValue: string;
  lastSoldPrice: string;
  lastSoldDate: string;
}

export interface CountyTaxCardProps {
  metrics: CountyTaxMetrics;
  taxYear?: number | null;
  taxDistrict?: string | null;
  acres?: number | null;
}

export const AvmValuationCard: React.FC<CountyTaxCardProps> = ({
  metrics,
  taxYear = null,
  taxDistrict = null,
  acres = null,
}) => {
  return (
    <div className="p-6 md:p-7 bg-[#0e1726] dark:bg-[#0b1329] text-white rounded-[22px] border border-slate-800 shadow-md space-y-6">
      <div className="flex items-center gap-2.5 text-slate-300">
        <Building2 className="w-5 h-5 text-slate-300" />
        <h3 className="text-sm font-semibold tracking-wide text-slate-200">
          County Tax Record
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-7 space-y-5">
          <div>
            <span className="text-xs font-medium text-slate-400 block">
              Tax Bill{taxYear ? ` (${taxYear})` : ""}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-1">
              {metrics.taxBill}
            </h2>
          </div>

          <div className="space-y-2.5 text-xs pt-1">
            <div className="flex items-center justify-between">
              <span className="font-normal text-slate-400">Taxes Due</span>
              <span className="font-bold text-white">{metrics.taxesDue}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-normal text-slate-400">Taxes Paid</span>
              <span className="font-bold text-white">{metrics.taxesPaid}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-normal text-slate-400">
                Market Value (AVM)
              </span>
              <span className="font-bold text-white">
                {metrics.estimatedValue}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-normal text-slate-400">Last Sold</span>
              <span className="font-bold text-white">
                {metrics.lastSoldPrice}
                {metrics.lastSoldDate !== "—"
                  ? ` · ${metrics.lastSoldDate}`
                  : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 p-5 bg-[#182338] dark:bg-[#080d1e] rounded-2xl border border-white/10 flex flex-col gap-4">
          <div>
            <span className="text-xs font-medium text-slate-300 block">
              Tax District
            </span>
            <p className="text-sm font-bold text-white mt-2 leading-snug">
              {taxDistrict?.trim() || "—"}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-300 block">
              Lot Size
            </span>
            <p className="text-sm font-bold text-white mt-2">
              {acres != null && Number.isFinite(acres)
                ? `${acres.toFixed(2)} acres`
                : "—"}
            </p>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            AVM / comps are not provided by county Ascent records.
          </p>
        </div>
      </div>
    </div>
  );
};
