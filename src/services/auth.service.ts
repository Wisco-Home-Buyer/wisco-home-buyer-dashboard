import { axiosInstance } from "../lib/axios";
import { UserProfile } from "../store/useAuthStore";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  user?: UserProfile;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const authService = {
  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponseData>> {
    const { data } = await axiosInstance.post<ApiResponse<AuthResponseData>>(
      "/api/auth/login",
      payload
    );
    return data;
  },

  async acceptInvite(payload: {
    token: string;
    password: string;
  }): Promise<ApiResponse<AuthResponseData>> {
    const { data } = await axiosInstance.post<ApiResponse<AuthResponseData>>(
      "/api/auth/accept-invite",
      payload
    );
    return data;
  },

  async forgotPassword(payload: { email: string }): Promise<ApiResponse<null>> {
    const { data } = await axiosInstance.post<ApiResponse<null>>(
      "/api/auth/forgot-password",
      payload
    );
    return data;
  },

  async resetPassword(payload: {
    token: string;
    password: string;
  }): Promise<ApiResponse<null>> {
    const { data } = await axiosInstance.post<ApiResponse<null>>(
      "/api/auth/reset-password",
      payload
    );
    return data;
  },

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    const { data } = await axiosInstance.get<ApiResponse<UserProfile>>(
      "/api/auth/me"
    );
    return data;
  },

  async updateProfile(payload: {
    name?: string;
    avatarUrl?: string | null;
  }): Promise<ApiResponse<UserProfile>> {
    const { data } = await axiosInstance.patch<ApiResponse<UserProfile>>(
      "/api/auth/me",
      payload
    );
    return data;
  },

  async logout(refreshToken: string): Promise<void> {
    await axiosInstance.post("/api/auth/logout", { refreshToken });
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponseData>> {
    const { data } = await axiosInstance.post<ApiResponse<AuthResponseData>>(
      "/api/auth/refresh",
      { refreshToken }
    );
    return data;
  },
};
