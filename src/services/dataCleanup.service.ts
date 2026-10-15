import { axiosInstance } from "../lib/axios";

export const CLEANUP_CONFIRMATION = "DELETE";

export interface DataCleanupCounts {
  autoLeads: number;
  parcels: number;
  parcelTaxYears: number;
  attomEnrichments: number;
  comparableProperties: number;
}

export interface RunDataCleanupPayload {
  autoLeads: boolean;
  publicRecords: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const dataCleanupService = {
  async preview(): Promise<DataCleanupCounts> {
    const { data } = await axiosInstance.get<
      ApiResponse<{ counts: DataCleanupCounts }>
    >("/api/data-cleanup/preview");
    return data.data.counts;
  },

  async run(payload: RunDataCleanupPayload): Promise<DataCleanupCounts> {
    const { data } = await axiosInstance.post<
      ApiResponse<{ deleted: DataCleanupCounts }>
    >("/api/data-cleanup/run", { ...payload, confirm: CLEANUP_CONFIRMATION });
    return data.data.deleted;
  },
};
