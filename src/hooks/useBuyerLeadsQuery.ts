import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  buyerLeadsService,
  QueryBuyerLeadsParams,
} from "../services/buyerLeads.service";

export const BUYER_LEADS_QUERY_KEY = "buyer-leads";

export const useBuyerLeads = (params: QueryBuyerLeadsParams = {}) => {
  return useQuery({
    queryKey: [BUYER_LEADS_QUERY_KEY, params],
    queryFn: () => buyerLeadsService.getBuyerLeads(params),
    staleTime: 60 * 1000,
  });
};

export const useBuyerLeadDetail = (id: string) => {
  return useQuery({
    queryKey: [BUYER_LEADS_QUERY_KEY, id],
    queryFn: () => buyerLeadsService.getBuyerLeadById(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
};

export const useDeleteBuyerLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => buyerLeadsService.deleteBuyerLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUYER_LEADS_QUERY_KEY] });
      toast.success("Buyer removed successfully");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to remove buyer"
      );
    },
  });
};

export const useExportBuyerLeadsMutation = () => {
  return useMutation({
    mutationFn: () => buyerLeadsService.exportBuyerLeadsCsv(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wisco_buyers_list_export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Buyers list CSV exported successfully");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to export CSV"
      );
    },
  });
};
