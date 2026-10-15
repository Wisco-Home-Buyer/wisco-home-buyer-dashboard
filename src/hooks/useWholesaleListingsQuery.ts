import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  wholesaleListingsService,
  QueryListingInterestsParams,
  QueryWholesaleListingsParams,
  WholesaleListingInput,
} from "../services/wholesaleListings.service";

export const WHOLESALE_LISTINGS_QUERY_KEY = "wholesale-listings";

const errorMessage = (err: unknown, fallback: string): string => {
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e?.response?.data?.message || e?.message || fallback;
};

export const useWholesaleListings = (
  params: QueryWholesaleListingsParams = {}
) => {
  return useQuery({
    queryKey: [WHOLESALE_LISTINGS_QUERY_KEY, params],
    queryFn: () => wholesaleListingsService.getListings(params),
    staleTime: 60 * 1000,
  });
};

export const useListingInterests = (params: QueryListingInterestsParams = {}) => {
  return useQuery({
    queryKey: [WHOLESALE_LISTINGS_QUERY_KEY, "interests", params],
    queryFn: () => wholesaleListingsService.getInterests(params),
    staleTime: 30 * 1000,
  });
};

export const useWholesaleListingDetail = (id: string) => {
  return useQuery({
    queryKey: [WHOLESALE_LISTINGS_QUERY_KEY, id],
    queryFn: () => wholesaleListingsService.getListingById(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
};

export const useCreateWholesaleListingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WholesaleListingInput) =>
      wholesaleListingsService.createListing(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WHOLESALE_LISTINGS_QUERY_KEY],
      });
      toast.success("Listing created successfully");
    },
    onError: (err) => {
      toast.error(errorMessage(err, "Failed to create listing"));
    },
  });
};

export const useUpdateWholesaleListingMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<WholesaleListingInput>) =>
      wholesaleListingsService.updateListing(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WHOLESALE_LISTINGS_QUERY_KEY],
      });
      toast.success("Listing updated successfully");
    },
    onError: (err) => {
      toast.error(errorMessage(err, "Failed to update listing"));
    },
  });
};

export const useNotifyBuyersMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => wholesaleListingsService.notifyBuyers(id),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({
        queryKey: [WHOLESALE_LISTINGS_QUERY_KEY],
      });
      if (data.failed > 0) {
        toast.warning(
          `Sent to ${data.sent} of ${data.total} buyers. ${data.failed} failed.`
        );
      } else {
        toast.success(`Listing emailed to ${data.sent} buyers`);
      }
    },
    onError: (err) => {
      toast.error(errorMessage(err, "Failed to notify buyers"));
    },
  });
};

export const useDeleteWholesaleListingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => wholesaleListingsService.deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [WHOLESALE_LISTINGS_QUERY_KEY],
      });
      toast.success("Listing deleted successfully");
    },
    onError: (err) => {
      toast.error(errorMessage(err, "Failed to delete listing"));
    },
  });
};
