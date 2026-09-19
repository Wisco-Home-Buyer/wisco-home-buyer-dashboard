import { axiosInstance } from "../lib/axios";

export type BuyerServiceArea =
  | "NORTHEAST_WI"
  | "GREATER_MADISON"
  | "GREATER_MILWAUKEE";

export type BuyerReferralSource =
  | "WEB"
  | "REFERRAL"
  | "SOCIAL_MEDIA"
  | "REI_SUCCESS"
  | "ORGANIC_SEARCH"
  | "CAFFEINE_AND_CASH_FLOW"
  | "WISCO_REIA"
  | "WISCONSIN_INVESTOR_PODCAST";

export interface BuyerLead {
  id: string;
  buyerNumber: string;
  name: string;
  phone: string;
  email: string;
  areas: BuyerServiceArea[];
  consent: boolean;
  questions?: string | null;
  referralSource?: BuyerReferralSource | null;
  referredBy?: string | null;
  submittedAt: string;
  updatedAt?: string;
}

export interface QueryBuyerLeadsParams {
  page?: number;
  limit?: number;
  search?: string;
  area?: BuyerServiceArea;
}

export interface PaginatedBuyerLeadsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: BuyerLead[];
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

export const buyerLeadsService = {
  async getBuyerLeads(
    params?: QueryBuyerLeadsParams
  ): Promise<PaginatedBuyerLeadsResponse> {
    const { data } = await axiosInstance.get<PaginatedBuyerLeadsResponse>(
      "/api/buyer-leads",
      { params }
    );
    return data;
  },

  async getBuyerLeadById(id: string): Promise<ApiResponse<BuyerLead>> {
    const { data } = await axiosInstance.get<ApiResponse<BuyerLead>>(
      `/api/buyer-leads/${id}`
    );
    return data;
  },

  async deleteBuyerLead(id: string): Promise<ApiResponse<void>> {
    const { data } = await axiosInstance.delete<ApiResponse<void>>(
      `/api/buyer-leads/${id}`
    );
    return data;
  },

  async exportBuyerLeadsCsv(): Promise<Blob> {
    const response = await axiosInstance.get("/api/buyer-leads/export", {
      responseType: "blob",
    });
    return response.data;
  },
};
