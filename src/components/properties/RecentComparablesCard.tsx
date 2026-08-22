"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Loader2, MapPin, TrendingUp } from "lucide-react";
import type { Marker as LeafletMarker } from "leaflet";

export interface ComparableSale {
  id: string;
  address: string;
  distance: string;
  soldDate: string;
  soldPrice: string;
  distanceMiles: number;
  latitude: number;
  longitude: number;
}

export interface RecentComparablesCardProps {
  subjectAddress?: string;
  subjectLatitude?: number | null;
  subjectLongitude?: number | null;
  comparables?: ComparableSale[];
}

const ComparablesMap = dynamic(() => import("./ComparablesMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-100/60 dark:bg-slate-800/40 rounded-2xl">
      <Loader2 className="w-4 h-4 animate-spin" />
      Loading map…
    </div>
  ),
});

export const RecentComparablesCard: React.FC<RecentComparablesCardProps> = ({
  subjectAddress,
  subjectLatitude,
  subjectLongitude,
  comparables = [],
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const stats = useMemo(() => {
    if (comparables.length === 0) {
      return { medianPrice: null, averageDistance: null, lowestPrice: null, highestPrice: null };
    }
    const prices = comparables
      .map((c) => parseInt(c.soldPrice.replace(/[^\d]/g, ""), 10))
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b);
    const medianPrice =
      prices.length === 0
        ? null
        : prices.length % 2
          ? prices[(prices.length - 1) / 2]
          : Math.round((prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2);
    const averageDistance =
      comparables.reduce((sum, c) => sum + c.distanceMiles, 0) /
      comparables.length;
    return {
      medianPrice,
      averageDistance,
      lowestPrice: prices[0] ?? null,
      highestPrice: prices[prices.length - 1] ?? null,
    };
  }, [comparables]);

  const subjectCoords: [number, number] | null =
    subjectLatitude != null && subjectLongitude != null
      ? [subjectLatitude, subjectLongitude]
      : null;

  return (
    <div className="p-6 md:p-7 bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100/80 dark:border-slate-800/80 shadow-xs space-y-5">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#0f2347] dark:text-white tracking-tight">
            Recent Comparables
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Nearby sales ranked by distance from this property
          </p>
        </div>
        {comparables.length > 0 && stats.medianPrice !== null && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-xl">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              Median{" "}
              <span className="text-emerald-900 dark:text-emerald-200">
                ${stats.medianPrice.toLocaleString()}
              </span>
            </span>
          </div>
        )}
      </header>

      {comparables.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
            <ComparablesTable
              comparables={comparables}
              hoveredId={hoveredId}
              setHoveredId={setHoveredId}
            />
          </div>
          <div className="lg:col-span-2 space-y-3">
            <div className="h-[360px] overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
              <ComparablesMap
                subjectAddress={subjectAddress}
                subjectCoords={subjectCoords}
                comparables={comparables}
                hoveredId={hoveredId}
                onHover={setHoveredId}
              />
            </div>
            <StatsPanel stats={stats} count={comparables.length} />
          </div>
        </div>
      )}
    </div>
  );
};

function ComparablesTable({
  comparables,
  hoveredId,
  setHoveredId,
}: {
  comparables: ComparableSale[];
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
}) {
  return (
    <div className="overflow-x-auto h-full">
      <table className="w-full text-left border-collapse min-w-[480px]">
        <thead>
          <tr className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            <th className="py-3 px-4">Address</th>
            <th className="py-3 px-4">Distance</th>
            <th className="py-3 px-4">Sold</th>
            <th className="py-3 px-4 text-right">Price</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {comparables.map((c, idx) => {
            const isHovered = hoveredId === c.id;
            const range =
              idx === 0 ? "closest" : idx === comparables.length - 1 ? "farthest" : null;
            return (
              <tr
                key={c.id}
                onMouseEnter={() => setHoveredId(c.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group cursor-default transition-colors ${
                  isHovered
                    ? "bg-blue-50/70 dark:bg-blue-950/30"
                    : "hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
                }`}
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isHovered
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-red-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0f2347] dark:text-slate-100 truncate">
                        {extractStreet(c.address)}
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {extractLocality(c.address)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <DistancePill miles={c.distanceMiles} />
                  {range && (
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">
                      {range}
                    </p>
                  )}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap text-xs font-medium text-slate-600 dark:text-slate-300">
                  {c.soldDate}
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <p className="text-sm font-bold text-[#0f2347] dark:text-white tabular-nums">
                    {c.soldPrice}
                  </p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatsPanel({
  stats,
  count,
}: {
  stats: {
    medianPrice: number | null;
    averageDistance: number | null;
    lowestPrice: number | null;
    highestPrice: number | null;
  };
  count: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <StatTile
        label="Comps Found"
        value={count.toString()}
        accent="blue"
      />
      <StatTile
        label="Avg Distance"
        value={
          stats.averageDistance != null
            ? `${stats.averageDistance.toFixed(2)} mi`
            : "—"
        }
        accent="slate"
      />
      <StatTile
        label="Lowest Sale"
        value={
          stats.lowestPrice != null
            ? `$${stats.lowestPrice.toLocaleString()}`
            : "—"
        }
        accent="emerald"
      />
      <StatTile
        label="Highest Sale"
        value={
          stats.highestPrice != null
            ? `$${stats.highestPrice.toLocaleString()}`
            : "—"
        }
        accent="amber"
      />
    </div>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "blue" | "slate" | "emerald" | "amber";
}) {
  const accents: Record<typeof accent, string> = {
    blue: "text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/60",
    slate: "text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800",
    emerald:
      "text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/60",
    amber:
      "text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/60",
  };
  return (
    <div
      className={`p-3 rounded-xl border ${accents[accent]} flex flex-col gap-1`}
    >
      <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">
        {label}
      </span>
      <span className="text-sm font-bold tabular-nums">{value}</span>
    </div>
  );
}

function DistancePill({ miles }: { miles: number }) {
  const tone =
    miles < 0.25
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
      : miles < 0.5
        ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
        : miles < 1
          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
          : "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300";
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold tabular-nums ${tone}`}
    >
      {miles.toFixed(2)} mi
    </span>
  );
}

function EmptyState() {
  return (
    <div className="py-12 flex flex-col items-center justify-center gap-2 text-center">
      <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center">
        <MapPin className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-sm font-bold text-[#0f2347] dark:text-slate-200">
        No comparable sales available
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
        County Ascent records do not include area comps. Market comps are
        unavailable for this property.
      </p>
    </div>
  );
}

function extractStreet(oneLine: string): string {
  const comma = oneLine.indexOf(",");
  return comma > 0 ? oneLine.slice(0, comma).trim() : oneLine;
}

function extractLocality(oneLine: string): string {
  const comma = oneLine.indexOf(",");
  return comma > 0 ? oneLine.slice(comma + 1).trim() : "";
}
