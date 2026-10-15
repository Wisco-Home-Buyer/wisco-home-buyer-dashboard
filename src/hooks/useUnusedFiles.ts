import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { unusedFilesService } from "../services/unusedFiles.service";
import type { ApiErrorLike } from "../lib/api-error";

export const UNUSED_FILES_QUERY_KEY = "unused-files";

export const useUnusedFilesReport = () =>
  useQuery({
    queryKey: [UNUSED_FILES_QUERY_KEY],
    queryFn: () => unusedFilesService.report(),
    staleTime: 0,
  });

export const useCleanUnusedFilesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unusedFilesService.clean(),
    onSuccess: ({ deleted }) => {
      void queryClient.invalidateQueries({
        queryKey: [UNUSED_FILES_QUERY_KEY],
      });
      toast.success(`Deleted ${deleted} unused file${deleted === 1 ? "" : "s"}`);
    },
    onError: (err: ApiErrorLike) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Cleanup failed"
      );
    },
  });
};
