"use client";

import React, { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Search, MapPin } from "lucide-react";
import {
  useAscentLookupMutation,
  useAscentRecent,
} from "../../hooks/useAscentQuery";
import {
  ascentService,
  type AscentParcel,
  type ParcelCounty,
} from "../../services/ascent.service";

const COUNTIES: Array<{ code: ParcelCounty; label: string }> = [
  { code: "WINNEBAGO", label: "Winnebago" },
  { code: "OUTAGAMIE", label: "Outagamie" },
  { code: "CALUMET", label: "Calumet" },
];

function money(v: number | null | undefined): string {
  if (v == null) return "—";
  return `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function ParcelCard({ parcel }: { parcel: AscentParcel }) {
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {parcel.county} · {parcel.parcelId}
          </p>
          <h3 className="text-lg font-bold text-[#0f2347] dark:text-white mt-1">
            {parcel.ownerName || "Owner not listed"}
          </h3>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {parcel.siteAddress.street ||
              parcel.mailingAddress.street ||
              "No site address"}
            {parcel.siteAddress.city ? `, ${parcel.siteAddress.city}` : ""}
            {parcel.siteAddress.zip ? ` ${parcel.siteAddress.zip}` : ""}
          </p>
        </div>
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          {parcel.status}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <p className="text-[11px] text-slate-400 uppercase">Mailing</p>
          <p className="text-slate-700 dark:text-slate-200">
            {[parcel.mailingAddress.street, parcel.mailingAddress.city]
              .filter(Boolean)
              .join(", ") || "—"}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400 uppercase">Tax district</p>
          <p className="text-slate-700 dark:text-slate-200">
            {parcel.taxDistrict || "—"}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400 uppercase">School</p>
          <p className="text-slate-700 dark:text-slate-200">
            {parcel.schoolDistrict || "—"}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400 uppercase">Acres</p>
          <p className="text-slate-700 dark:text-slate-200">
            {parcel.acres ?? "—"}
          </p>
        </div>
      </div>

      {parcel.description ? (
        <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
          {parcel.description}
        </p>
      ) : null}

      {parcel.taxHistory.length > 0 ? (
        <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-800 pt-3">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-400 uppercase tracking-wide">
                <th className="py-1.5 pr-3 font-semibold">Year</th>
                <th className="py-1.5 pr-3 font-semibold">Bill</th>
                <th className="py-1.5 pr-3 font-semibold">Paid</th>
                <th className="py-1.5 pr-3 font-semibold">Due</th>
                <th className="py-1.5 font-semibold">Payoff</th>
              </tr>
            </thead>
            <tbody>
              {parcel.taxHistory.slice(0, 8).map((row) => (
                <tr
                  key={row.taxYear}
                  className="border-t border-slate-50 dark:border-slate-800/80 text-slate-700 dark:text-slate-200"
                >
                  <td className="py-1.5 pr-3 font-medium">{row.taxYear}</td>
                  <td className="py-1.5 pr-3">{money(row.taxBill)}</td>
                  <td className="py-1.5 pr-3">{money(row.taxesPaid)}</td>
                  <td className="py-1.5 pr-3">{money(row.taxesDue)}</td>
                  <td className="py-1.5">{money(row.totalPayoff)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          No tax history returned for this parcel.
        </p>
      )}
    </div>
  );
}

export const AscentLookupPanel: React.FC = () => {
  const [county, setCounty] = useState<ParcelCounty>("WINNEBAGO");
  const [mode, setMode] = useState<"parcel" | "address">("parcel");
  const [parcelId, setParcelId] = useState("7010004");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [lastResult, setLastResult] = useState<AscentParcel | null>(null);

  const lookup = useAscentLookupMutation();
  const recent = useAscentRecent();

  const stats = useMemo(() => {
    const rows = recent.data ?? [];
    return {
      total: rows.length,
      withOwner: rows.filter((r) => !!r.ownerName).length,
      withTax: rows.filter((r) => r.taxHistory.length > 0).length,
    };
  }, [recent.data]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input =
      mode === "parcel"
        ? { county, parcelId: parcelId.trim() }
        : {
            county,
            siteAddress: street.trim(),
            siteCity: city.trim(),
            siteZip: zip.trim(),
          };
    const result = await lookup.mutateAsync(input);
    const parcel = await ascentService.getParcel(county, result.parcelId);
    setLastResult(parcel);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Recent lookups", value: stats.total },
          { label: "With owner", value: stats.withOwner },
          { label: "With tax years", value: stats.withTax },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4"
          >
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              {card.label}
            </p>
            <p className="text-2xl font-bold text-[#0f2347] dark:text-white mt-1">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 space-y-4"
      >
        <div className="flex flex-wrap gap-2">
          {COUNTIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setCounty(c.code)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                county === c.code
                  ? "bg-[#0f2347] text-white"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode("parcel")}
            className={
              mode === "parcel"
                ? "text-[#0f2347] dark:text-white"
                : "text-slate-400"
            }
          >
            Parcel ID
          </button>
          <span className="text-slate-300">/</span>
          <button
            type="button"
            onClick={() => setMode("address")}
            className={
              mode === "address"
                ? "text-[#0f2347] dark:text-white"
                : "text-slate-400"
            }
          >
            Site address
          </button>
        </div>

        {mode === "parcel" ? (
          <input
            value={parcelId}
            onChange={(e) => setParcelId(e.target.value)}
            placeholder="e.g. 7010004"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm"
            required
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Street"
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm"
              required
            />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm"
              required
            />
            <input
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="ZIP"
              pattern="\d{5}"
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2.5 text-sm"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={lookup.isPending}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0e1726] hover:bg-[#1a2942] disabled:opacity-70"
        >
          {lookup.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
          {lookup.isPending ? "Looking up…" : "Lookup on Ascent"}
        </button>
      </form>

      {lastResult ? <ParcelCard parcel={lastResult} /> : null}

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5">
        <h3 className="text-sm font-bold text-[#0f2347] dark:text-white mb-3">
          Recent public-record lookups
        </h3>
        {recent.isLoading ? (
          <p className="text-xs text-slate-400">Loading…</p>
        ) : (recent.data ?? []).length === 0 ? (
          <p className="text-xs text-slate-400">
            No parcels fetched yet. Run a lookup above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wide">
                  <th className="py-2 pr-3">County</th>
                  <th className="py-2 pr-3">Parcel</th>
                  <th className="py-2 pr-3">Owner</th>
                  <th className="py-2 pr-3">Site</th>
                  <th className="py-2 pr-3">Tax yrs</th>
                  <th className="py-2">Fetched</th>
                </tr>
              </thead>
              <tbody>
                {(recent.data ?? []).map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-slate-50 dark:border-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    onClick={() => setLastResult(row)}
                  >
                    <td className="py-2 pr-3">{row.county}</td>
                    <td className="py-2 pr-3 font-medium">{row.parcelId}</td>
                    <td className="py-2 pr-3">{row.ownerName || "—"}</td>
                    <td className="py-2 pr-3">
                      {row.siteAddress.street || "—"}
                    </td>
                    <td className="py-2 pr-3">{row.taxHistory.length}</td>
                    <td className="py-2 text-slate-400">
                      {formatDistanceToNow(new Date(row.lastFetchedAt), {
                        addSuffix: true,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
