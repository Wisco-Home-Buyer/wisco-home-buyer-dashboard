import { axiosInstance } from "../lib/axios";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "NEGOTIATION"
  | "CLOSED"
  | "REJECTED";

export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  position: number;
  createdAt: string;
}

export interface PropertyEnrichment {
  id: string;
  propertyId: string;
  status: string;
  attomPropertyId?: string | null;
  estimatedValue?: number | null;
  confidenceScore?: number | null;
  taxAssessedValue?: number | null;
  taxAssessedYear?: number | null;
  lastSoldPrice?: number | null;
  lastSoldDate?: string | null;
  ownerType?: string | null;
  occupancyStatus?: string | null;
  lastSyncedAt?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  comparables?: unknown[];
}

export interface PropertyDetail {
  id: string;
  leadId: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  latitude?: number | null;
  longitude?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  squareFeet?: number | null;
  yearBuilt?: number | null;
  lotSizeAcres?: number | null;
  roofCondition?: string | null;
  kitchenCondition?: string | null;
  bathroomCondition?: string | null;
  foundationCondition?: string | null;
  otherRepairsNeeded?: string | null;
  createdAt?: string;
  updatedAt?: string;
  images?: PropertyImage[];
  enrichment?: PropertyEnrichment | null;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  userId?: string | null;
  type: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  note?: string | null;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string;
  } | null;
}

export interface LeadDetail {
  id: string;
  leadNumber: string;
  status: LeadStatus;
  priority: Priority;
  score: number;
  seller?: {
    name: string;
    phone: string;
    email?: string;
  };
  sellerName?: string;
  sellerPhone?: string;
  occupancy?: string;
  timeline?: string;
  assignedTo?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  } | null;
  submittedAt: string;
  updatedAt?: string;
  property?: PropertyDetail | null;
  activities?: LeadActivity[];
}

export type Lead = LeadDetail;

export interface QueryLeadsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
}

export interface PaginatedLeadsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Lead[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  meta?: {
    timestamp: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const leadsService = {
  async getLeads(params?: QueryLeadsParams): Promise<PaginatedLeadsResponse> {
    const { data } = await axiosInstance.get<PaginatedLeadsResponse>("/api/leads", {
      params,
    });
    return data;
  },

  async getLeadById(id: string): Promise<ApiResponse<LeadDetail>> {
    const { data } = await axiosInstance.get<ApiResponse<LeadDetail>>(`/api/leads/${id}`);
    return data;
  },

  async updateLeadStatus(
    id: string,
    status: LeadStatus,
    note?: string
  ): Promise<ApiResponse<LeadDetail>> {
    const { data } = await axiosInstance.patch<ApiResponse<LeadDetail>>(
      `/api/leads/${id}/status`,
      { status, note }
    );
    return data;
  },

  async assignLead(id: string, userId: string): Promise<ApiResponse<LeadDetail>> {
    const { data } = await axiosInstance.patch<ApiResponse<LeadDetail>>(
      `/api/leads/${id}/assign`,
      { userId }
    );
    return data;
  },

  async deleteLead(id: string): Promise<ApiResponse<void>> {
    const { data } = await axiosInstance.delete<ApiResponse<void>>(`/api/leads/${id}`);
    return data;
  },

  async exportLeadsCsv(): Promise<Blob> {
    const response = await axiosInstance.get("/api/leads/export", {
      responseType: "blob",
    });
    return response.data;
  },
};
