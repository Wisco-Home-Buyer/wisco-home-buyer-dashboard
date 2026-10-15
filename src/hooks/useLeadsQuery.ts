import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiErrorLike } from "../lib/api-error";
import { toast } from "sonner";
import {
  leadsService,
  QueryLeadsParams,
  LeadStatus,
} from "../services/leads.service";

export const LEADS_QUERY_KEY = "leads";
export const NEW_LEADS_COUNT_QUERY_KEY = [LEADS_QUERY_KEY, "new-count"] as const;

export const useLeads = (params: QueryLeadsParams = {}) => {
  return useQuery({
    queryKey: [LEADS_QUERY_KEY, params],
    queryFn: () => leadsService.getLeads(params),
    staleTime: 60 * 1000,
  });
};

/** Sidebar badge: count of leads still in NEW status. */
export const useNewLeadsCount = () => {
  return useQuery({
    queryKey: NEW_LEADS_COUNT_QUERY_KEY,
    queryFn: async () => {
      const res = await leadsService.getLeads({
        page: 1,
        limit: 1,
        status: "NEW",
      });
      return (
        res.pagination?.total ??
        (res as { meta?: { totalItems?: number } }).meta?.totalItems ??
        0
      );
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
};

export const useLeadDetail = (id: string) => {
  return useQuery({
    queryKey: [LEADS_QUERY_KEY, id],
    queryFn: () => leadsService.getLeadById(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
};

export const useUpdateLeadStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      note,
    }: {
      id: string;
      status: LeadStatus;
      note?: string;
    }) => leadsService.updateLeadStatus(id, status, note),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
      toast.success(`Lead status updated to ${variables.status}`);
    },
    onError: (err: ApiErrorLike) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update status"
      );
    },
  });
};

export const useAssignLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      leadsService.assignLead(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
      toast.success("Lead assignment updated successfully");
    },
    onError: (err: ApiErrorLike) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to assign lead"
      );
    },
  });
};

export const useDeleteLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leadsService.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
      toast.success("Lead deleted successfully");
    },
    onError: (err: ApiErrorLike) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to delete lead"
      );
    },
  });
};

export const useExportLeadsMutation = () => {
  return useMutation({
    mutationFn: () => leadsService.exportLeadsCsv(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wisco_leads_export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Leads CSV exported successfully");
    },
    onError: (err: ApiErrorLike) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to export CSV"
      );
    },
  });
};
