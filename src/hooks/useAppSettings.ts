import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  appSettingsService,
  AppSettingValue,
} from "../services/appSettings.service";

export const APP_SETTINGS_QUERY_KEY = "app-settings";

const errorMessage = (err: unknown, fallback: string): string => {
  const e = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return e?.response?.data?.message || e?.message || fallback;
};

export const useAppSettings = (enabled: boolean) =>
  useQuery({
    queryKey: [APP_SETTINGS_QUERY_KEY],
    queryFn: () => appSettingsService.list(),
    enabled,
  });

export const useUpdateAppSettingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: AppSettingValue }) =>
      appSettingsService.update(key, value),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [APP_SETTINGS_QUERY_KEY] });
      toast.success("Setting saved");
    },
    onError: (err) => {
      toast.error(errorMessage(err, "Failed to save setting"));
    },
  });
};

export const useResetAppSettingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => appSettingsService.reset(key),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [APP_SETTINGS_QUERY_KEY] });
      toast.success("Setting reset to default");
    },
    onError: (err) => {
      toast.error(errorMessage(err, "Failed to reset setting"));
    },
  });
};
