import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { backupService } from "../services/backup.service";

export const STORED_BACKUPS_QUERY_KEY = "stored-backups";

export const useStoredBackups = (enabled: boolean) =>
  useQuery({
    queryKey: [STORED_BACKUPS_QUERY_KEY],
    queryFn: () => backupService.listStored(),
    enabled,
  });

export const useRunBackupNowMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => backupService.runNow(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [STORED_BACKUPS_QUERY_KEY],
      });
      toast.success("Backup saved on the server");
    },
    onError: (err: {
      response?: { data?: { message?: string } };
      message?: string;
    }) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Backup failed"
      );
    },
  });
};
