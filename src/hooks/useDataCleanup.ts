import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  dataCleanupService,
  RunDataCleanupPayload,
} from "../services/dataCleanup.service";

export const DATA_CLEANUP_QUERY_KEY = "data-cleanup-preview";

export const useDataCleanupPreview = (enabled: boolean) =>
  useQuery({
    queryKey: [DATA_CLEANUP_QUERY_KEY],
    queryFn: () => dataCleanupService.preview(),
    enabled,
    staleTime: 0,
  });

export const useRunDataCleanupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RunDataCleanupPayload) =>
      dataCleanupService.run(payload),
    onSuccess: (deleted) => {
      // Leads, properties, analytics and badges all read the deleted tables.
      void queryClient.invalidateQueries();
      toast.success(
        `Cleanup done: ${deleted.autoLeads} leads, ${deleted.parcels} parcels, ${deleted.attomEnrichments} ATTOM records removed`
      );
    },
    onError: (err: {
      response?: { data?: { message?: string } };
      message?: string;
    }) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Cleanup failed"
      );
    },
  });
};
