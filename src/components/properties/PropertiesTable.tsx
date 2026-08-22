"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Search,
  Map,
  Layers,
  MapPin,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useProperties } from "../../hooks/usePropertiesQuery";
import {
  enrichmentLabel,
  formatMoneyExact,
  latestTaxBill,
} from "../../services/properties.service";

const PropertiesMap = dynamic(() => import("./PropertiesMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800">
      <Loader2 className="w-4 h-4 animate-spin" />
      Loading map…
    </div>
  ),
});

export const PropertiesTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isMapView, setIsMapView] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isError, refetch, isFetching } = useProperties({
    page: 1,
    limit: 50,
    search: debouncedSearch || undefined,
  });

  const properties = data?.data ?? [];

  // Keep selection valid when the list changes; do not auto-pick the first item
  // so map view can open in "show all" mode.
  useEffect(() => {
    if (!selectedPropertyId) return;
    if (!properties.some((p) => p.id === selectedPropertyId)) {
      setSelectedPropertyId(null);
    }
  }, [properties, selectedPropertyId]);

  const openMapView = () => {
    setSelectedPropertyId(null);
    setIsMapView(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Properties
        </h1>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
          View property details and county public-record enrichment.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs p-4 md:p-6 space-y-6">
        {!isMapView && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={openMapView}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              <Map className="w-3.5 h-3.5 text-slate-500" />
              <span>Map View</span>
            </button>
          </div>
        )}

        {!isMapView ? (
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-10 flex items-center justify-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading properties…
              </div>
            ) : isError ? (
              <div className="py-10 text-center space-y-2">
                <p className="text-xs text-slate-400">
                  Couldn&apos;t load properties.
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
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 px-3">ADDRESS</th>
                    <th className="pb-3 px-3">SPECS</th>
                    <th className="pb-3 px-3">TAX BILL</th>
                    <th className="pb-3 px-3">OWNER</th>
                    <th className="pb-3 px-3">ENRICHMENT</th>
                    <th className="pb-3 px-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {properties.length > 0 ? (
                    properties.map((item) => {
                      const status = item.enrichment?.status;
                      const label = enrichmentLabel(status);
                      const badgeClass =
                        label === "Enriched"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : label === "Failed"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300";
                      const BadgeIcon =
                        label === "Enriched"
                          ? Layers
                          : label === "Failed"
                            ? AlertCircle
                            : Clock;

                      return (
                        <tr
                          key={item.id}
                          className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-4 px-3">
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {item.street}
                              </h4>
                              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                                {item.city}, {item.state} {item.zip}
                              </p>
                            </div>
                          </td>

                          <td className="py-4 px-3 font-bold text-slate-800 dark:text-slate-200">
                            {item.bedrooms != null
                              ? `${item.bedrooms} bd`
                              : item.parcel?.acres != null
                                ? `${item.parcel.acres.toFixed(2)} ac`
                                : "—"}
                            {item.bathrooms != null
                              ? ` / ${item.bathrooms} ba`
                              : ""}
                          </td>

                          <td className="py-4 px-3 font-extrabold text-slate-900 dark:text-white">
                            {formatMoneyExact(
                              latestTaxBill(item.parcel)?.taxBill ?? null,
                            )}
                          </td>

                          <td className="py-4 px-3 font-semibold text-slate-600 dark:text-slate-300 max-w-[160px] truncate">
                            {item.parcel?.ownerName?.trim() || "—"}
                          </td>

                          <td className="py-4 px-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${badgeClass}`}
                            >
                              <BadgeIcon className="w-3 h-3" />
                              {label}
                            </span>
                          </td>

                          <td className="py-4 px-3 text-right">
                            <Link
                              href={`/properties/${item.id}`}
                              className="inline-block px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-slate-400 font-medium"
                      >
                        {isFetching
                          ? "Searching…"
                          : "No properties found matching your search."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setIsMapView(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                ← Back to Table View
              </button>
              {selectedPropertyId && (
                <button
                  type="button"
                  onClick={() => setSelectedPropertyId(null)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Show all properties
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="py-10 flex items-center justify-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading map…
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      MAP View
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {selectedPropertyId
                        ? "1 selected"
                        : `${properties.length} properties`}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[560px] overflow-y-auto pr-2.5">
                    {properties.map((item) => {
                      const isSelected = item.id === selectedPropertyId;
                      return (
                        <div
                          key={item.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedPropertyId(item.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedPropertyId(item.id);
                            }
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? "bg-sky-100/90 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700 ring-2 ring-sky-300/40"
                              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          <MapPin
                            className={`w-5 h-5 mt-0.5 shrink-0 ${
                              isSelected
                                ? "text-slate-900 dark:text-white"
                                : "text-red-500"
                            }`}
                          />
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                              {item.street}
                            </h4>
                            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                              {item.city}, {item.state} {item.zip}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {properties.length === 0 && (
                      <p className="text-xs text-slate-400">No properties.</p>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-8 relative h-[600px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-200">
                  <PropertiesMap
                    properties={properties}
                    selectedPropertyId={selectedPropertyId}
                    onSelectProperty={setSelectedPropertyId}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
