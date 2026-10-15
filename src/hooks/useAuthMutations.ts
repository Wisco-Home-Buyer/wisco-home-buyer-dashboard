import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiErrorLike } from "../lib/api-error";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService, LoginPayload } from "../services/auth.service";
import { useAuthStore } from "../store/useAuthStore";

export const AUTH_USER_QUERY_KEY = ["auth-user"];

export const useLoginMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const loginRes = await authService.login(payload);
      const { accessToken, refreshToken } = loginRes.data;

      // Temporarily set tokens to allow authenticated getProfile call
      useAuthStore.getState().setTokens(accessToken, refreshToken);

      let userProfile = loginRes.data.user || null;
      try {
        const profileRes = await authService.getProfile();
        if (profileRes.success && profileRes.data) {
          userProfile = profileRes.data;
        }
      } catch {
        // Fall back to token payload if getProfile is delayed
      }

      setAuth(userProfile, accessToken, refreshToken);
      return { loginRes, userProfile };
    },
    onSuccess: ({ userProfile }) => {
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, userProfile);
      toast.success("Logged in successfully!");
      router.push("/");
    },
    onError: (err: ApiErrorLike) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Login failed. Please try again.",
      );
    },
  });
};

export const useProfileQuery = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: AUTH_USER_QUERY_KEY,
    queryFn: async () => {
      const res = await authService.getProfile();
      if (res.data) {
        setUser(res.data);
      }
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

export const useLogoutMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refreshToken, logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        try {
          await authService.logout(refreshToken);
        } catch {
          // Idempotent logout
        }
      }
    },
    onSettled: () => {
      logout();
      queryClient.clear();
      toast.success("Logged out successfully!");
      router.push("/login");
    },
  });
};
