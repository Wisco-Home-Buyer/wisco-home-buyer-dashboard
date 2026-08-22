import { axiosInstance } from "../lib/axios";

export type EnrichmentStatus = "SUCCESS" | "PENDING" | "FAILED";

export interface ParcelTaxYearSummary {
  taxYear: number;
  taxBill: number | null;
  taxesDue: number | null;
  taxesPaid: number | null;
  totalPayoff?: number | null;
}

export interface PropertyParcelSummary {
  ownerName: string | null;
  acres: number | null;
  taxDistrict: string | null;
  schoolDistrict?: string | null;
  mailingStreet?: string | null;
  mailingCity?: string | null;
  mailingState?: string | null;
  mailingZip?: string | null;
  taxHistory: ParcelTaxYearSummary[];
}

export interface PropertyListItem {
  id: string;
  leadId: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  lotSizeAcres?: number | null;
  enrichment: {
    status: EnrichmentStatus;
    estimatedValue: number | null;
    taxAssessedValue: number | null;
    taxAssessedYear?: number | null;
    ownerType?: string | null;
  } | null;
  parcel?: PropertyParcelSummary | null;
}

export interface PropertyComparable {
  id: string;
  address: string;
  distanceMiles: number;
  latitude: number;
  longitude: number;
  soldDate: string;
  soldPrice: number;
}

export interface PropertyDetail {
  id: string;
  leadId: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  yearBuilt: number | null;
  lotSizeAcres?: number | null;
  images: { id: string; url: string; position: number }[];
  enrichment: {
    status: EnrichmentStatus;
    estimatedValue: number | null;
    confidenceScore: number | null;
    taxAssessedValue: number | null;
    taxAssessedYear: number | null;
    lastSoldPrice: number | null;
    lastSoldDate: string | null;
    ownerType: string | null;
    occupancyStatus: string | null;
    lastSyncedAt: string | null;
    comparables: PropertyComparable[];
  } | null;
  parcel?: PropertyParcelSummary | null;
  lead: {
    id: string;
    sequence: number;
    sellerName: string;
    sellerPhone: string;
    sellerEmail: string | null;
    status: string;
  } | null;
}

export interface PaginatedProperties {
  data: PropertyListItem[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  meta?: {
    totalItems?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export const propertiesService = {
  async getProperties(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedProperties> {
    const { data } = await axiosInstance.get("/api/properties", { params });
    return data as PaginatedProperties;
  },

  async getPropertyById(id: string): Promise<PropertyDetail> {
    const { data } = await axiosInstance.get(`/api/properties/${id}`);
    const body = data as { data?: PropertyDetail } | PropertyDetail;
    if (body && typeof body === "object" && "data" in body && body.data) {
      return body.data;
    }
    return body as PropertyDetail;
  },
};

export function formatMoney(value: number | null | undefined): string {
  if (value == null) return "—";
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function formatMoneyExact(value: number | null | undefined): string {
  if (value == null) return "—";
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatEnumLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function enrichmentLabel(
  status: EnrichmentStatus | null | undefined,
): "Enriched" | "Pending" | "Failed" {
  if (status === "SUCCESS") return "Enriched";
  if (status === "FAILED") return "Failed";
  return "Pending";
}

export function latestTaxBill(
  parcel: PropertyParcelSummary | null | undefined,
): ParcelTaxYearSummary | null {
  return parcel?.taxHistory?.[0] ?? null;
}
