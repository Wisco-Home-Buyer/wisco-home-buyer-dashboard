import { axiosInstance } from "../lib/axios";

export type AppSettingType = "boolean" | "email" | "url";
export type AppSettingValue = boolean | string;

export interface AppSetting {
  key: string;
  label: string;
  description: string;
  type: AppSettingType;
  value: AppSettingValue;
  defaultValue: AppSettingValue;
  isCustom: boolean;
  updatedAt: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const appSettingsService = {
  async list(): Promise<AppSetting[]> {
    const { data } = await axiosInstance.get<ApiResponse<AppSetting[]>>(
      "/api/app-settings"
    );
    return data.data;
  },

  async update(key: string, value: AppSettingValue): Promise<AppSetting> {
    const { data } = await axiosInstance.patch<ApiResponse<AppSetting>>(
      `/api/app-settings/${encodeURIComponent(key)}`,
      { value }
    );
    return data.data;
  },

  async reset(key: string): Promise<AppSetting> {
    const { data } = await axiosInstance.delete<ApiResponse<AppSetting>>(
      `/api/app-settings/${encodeURIComponent(key)}`
    );
    return data.data;
  },
};
