import { axiosInstance } from "../lib/axios";

export type ParcelCounty = "WINNEBAGO" | "OUTAGAMIE" | "CALUMET";

export interface AscentCounty {
  code: ParcelCounty;
  baseUrl: string;
}

export interface AscentTaxYear {
  taxYear: number;
  omitted: string | null;
  taxBill: number | null;
  taxesPaid: number | null;
  taxesDue: number | null;
  interest: number | null;
  penalty: number | null;
  fees: number | null;
  totalPayoff: number | null;
}

export interface AscentParcel {
  id: string;
  county: ParcelCounty;
  parcelId: string;
  ownerName: string | null;
  mailingAddress: {
    street: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  };
  siteAddress: {
    street: string | null;
    city: string | null;
    zip: string | null;
  };
  taxDistrict: string | null;
  schoolDistrict: string | null;
  status: string;
  acres: number | null;
  description: string | null;
  propertyId: string | null;
  lastFetchedAt: string;
  taxHistory: AscentTaxYear[];
}

export interface AscentLookupInput {
  county: ParcelCounty;
  parcelId?: string;
  siteAddress?: string;
  siteCity?: string;
  siteZip?: string;
  propertyId?: string;
}

async function unwrap<T>(promise: Promise<{ data: unknown }>): Promise<T> {
  const { data } = await promise;
  const body = data as { data?: T } | T;
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    body.data !== undefined
  ) {
    return body.data as T;
  }
  return body as T;
}

export const ascentService = {
  listCounties() {
    return unwrap<AscentCounty[]>(axiosInstance.get("/api/ascent/counties"));
  },

  listRecent() {
    return unwrap<AscentParcel[]>(axiosInstance.get("/api/ascent/recent"));
  },

  lookup(input: AscentLookupInput) {
    return unwrap<{ parcelId: string }>(
      axiosInstance.post("/api/ascent/lookup", input),
    );
  },

  getParcel(county: ParcelCounty, parcelId: string) {
    return unwrap<AscentParcel>(
      axiosInstance.get(
        `/api/ascent/${encodeURIComponent(county)}/${encodeURIComponent(parcelId)}`,
      ),
    );
  },
};
