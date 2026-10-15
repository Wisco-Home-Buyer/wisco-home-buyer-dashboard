import { axiosInstance } from "../lib/axios";

export interface UnusedFilesReport {
  minAgeDays: number;
  count: number;
  totalBytes: number;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const unusedFilesService = {
  async report(): Promise<UnusedFilesReport> {
    const { data } = await axiosInstance.get<ApiResponse<UnusedFilesReport>>(
      "/api/uploads/unused"
    );
    return data.data;
  },

  async clean(): Promise<{ deleted: number; freedBytes: number }> {
    const { data } = await axiosInstance.post<
      ApiResponse<{ deleted: number; freedBytes: number }>
    >("/api/uploads/unused/clean");
    return data.data;
  },
};
