"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ApiRole,
  InviteUserPayload,
  usersService,
} from "../services/users.service";
import { AUTH_USER_QUERY_KEY } from "./useAuthMutations";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/useAuthStore";

export const USERS_QUERY_KEY = "users";

export function useUsersList(enabled = true) {
  return useQuery({
    queryKey: [USERS_QUERY_KEY],
    queryFn: () => usersService.listUsers(),
    enabled,
    staleTime: 30_000,
  });
}

export function useInviteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InviteUserPayload) => usersService.inviteUser(payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      if (data?.emailSent === false && data.inviteUrl) {
        toast.warning("Email not configured — share this invite link", {
          description: data.inviteUrl,
          duration: 15000,
        });
      } else {
        toast.success("Invite sent successfully");
      }
    },
    onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to send invite",
      );
    },
  });
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: ApiRole }) =>
      usersService.updateRole(id, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      toast.success("Role updated");
    },
    onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update role",
      );
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (payload: { name?: string; avatarUrl?: string | null }) =>
      authService.updateProfile(payload),
    onSuccess: (res) => {
      const user = res.data;
      if (user) {
        setUser(user);
        queryClient.setQueryData(AUTH_USER_QUERY_KEY, user);
      }
      toast.success("Profile saved");
    },
    onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save profile",
      );
    },
  });
}
