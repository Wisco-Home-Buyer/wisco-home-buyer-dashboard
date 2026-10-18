import { axiosInstance } from "../lib/axios";
import type { ApiRole } from "./users.service";

export interface ActivityLog {
  id: string;
  createdAt: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  userRole: ApiRole | null;
  action: string;
  method: string;
  route: string;
  resourceId: string | null;
  success: boolean;
  errorMessage: string | null;
  statusCode: number;
  ip: string | null;
  userAgent: string | null;
  details: {
    fields?: string[];
    values?: Record<string, string | number | boolean>;
  } | null;
}

export interface QueryActivityLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  success?: boolean;
  from?: string;
  to?: string;
}

export interface PaginatedActivityLogsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ActivityLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const activityLogsService = {
  async getActivityLogs(
    params?: QueryActivityLogsParams
  ): Promise<PaginatedActivityLogsResponse> {
    const { data } = await axiosInstance.get<PaginatedActivityLogsResponse>(
      "/api/activity-logs",
      { params }
    );
    return data;
  },
};
