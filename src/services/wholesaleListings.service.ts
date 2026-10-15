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

export interface ListingInterest {
  id: string;
  listingId: string | null;
  listingTitle: string;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface QueryListingInterestsParams {
  page?: number;
  limit?: number;
  search?: string;
  listingId?: string;
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

export interface PaginatedListingInterestsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ListingInterest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
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

  async getInterests(
    params?: QueryListingInterestsParams
  ): Promise<PaginatedListingInterestsResponse> {
    const { data } =
      await axiosInstance.get<PaginatedListingInterestsResponse>(
        "/api/wholesale-listings/interests",
        { params }
      );
    return data;
  },

  async getInterestById(id: string): Promise<ApiResponse<ListingInterest>> {
    const { data } = await axiosInstance.get<ApiResponse<ListingInterest>>(
      `/api/wholesale-listings/interests/${id}`
    );
    return data;
  },

  async getUnreadInterestsCount(): Promise<number> {
    const { data } = await axiosInstance.get<ApiResponse<{ count: number }>>(
      "/api/wholesale-listings/interests/unread-count"
    );
    return data.data.count;
  },

  async markInterestRead(id: string): Promise<ApiResponse<ListingInterest>> {
    const { data } = await axiosInstance.patch<ApiResponse<ListingInterest>>(
      `/api/wholesale-listings/interests/${id}/read`
    );
    return data;
  },

  async markAllInterestsRead(): Promise<ApiResponse<{ updated: number }>> {
    const { data } = await axiosInstance.patch<ApiResponse<{ updated: number }>>(
      "/api/wholesale-listings/interests/read-all"
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
