import { axiosInstance } from "../lib/axios";

export type ListingStatus = "AVAILABLE" | "UNDER_CONTRACT" | "SOLD";
export type ListingVisibility = "PUBLIC" | "PRIVATE";

export interface WholesaleListing {
  id: string;
  title: string;
  description: string;
  price: number;
  street: string;
  city: string;
  state: string;
  zip: string;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  videoUrl: string | null;
  status: ListingStatus;
  visibility: ListingVisibility;
  notifiedAt: string | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WholesaleListingInput {
  title: string;
  description: string;
  price: number;
  street: string;
  city: string;
  state?: string;
  zip: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  videoUrl?: string;
  status?: ListingStatus;
  visibility?: ListingVisibility;
  imageUrls?: string[];
}

export interface QueryWholesaleListingsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ListingStatus;
  visibility?: ListingVisibility;
}

export interface NotifyBuyersResult {
  total: number;
  sent: number;
  failed: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface PaginatedWholesaleListingsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: WholesaleListing[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const wholesaleListingsService = {
  async getListings(
    params?: QueryWholesaleListingsParams
  ): Promise<PaginatedWholesaleListingsResponse> {
    const { data } =
      await axiosInstance.get<PaginatedWholesaleListingsResponse>(
        "/api/wholesale-listings",
        { params }
      );
    return data;
  },

  async getListingById(id: string): Promise<ApiResponse<WholesaleListing>> {
    const { data } = await axiosInstance.get<ApiResponse<WholesaleListing>>(
      `/api/wholesale-listings/${id}`
    );
    return data;
  },

  async createListing(
    input: WholesaleListingInput
  ): Promise<ApiResponse<WholesaleListing>> {
    const { data } = await axiosInstance.post<ApiResponse<WholesaleListing>>(
      "/api/wholesale-listings",
      input
    );
    return data;
  },

  async updateListing(
    id: string,
    input: Partial<WholesaleListingInput>
  ): Promise<ApiResponse<WholesaleListing>> {
    const { data } = await axiosInstance.patch<ApiResponse<WholesaleListing>>(
      `/api/wholesale-listings/${id}`,
      input
    );
    return data;
  },

  async notifyBuyers(id: string): Promise<ApiResponse<NotifyBuyersResult>> {
    const { data } = await axiosInstance.post<ApiResponse<NotifyBuyersResult>>(
      `/api/wholesale-listings/${id}/notify-buyers`
    );
    return data;
  },

  async deleteListing(id: string): Promise<ApiResponse<void>> {
    const { data } = await axiosInstance.delete<ApiResponse<void>>(
      `/api/wholesale-listings/${id}`
    );
    return data;
  },
};
