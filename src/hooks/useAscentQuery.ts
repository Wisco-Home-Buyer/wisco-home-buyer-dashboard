"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ascentService,
  type AscentLookupInput,
} from "../services/ascent.service";

export const ASCENT_QUERY_KEY = "ascent";

export function useAscentCounties() {
  return useQuery({
    queryKey: [ASCENT_QUERY_KEY, "counties"],
    queryFn: () => ascentService.listCounties(),
    staleTime: 5 * 60_000,
  });
}

export function useAscentRecent() {
  return useQuery({
    queryKey: [ASCENT_QUERY_KEY, "recent"],
    queryFn: () => ascentService.listRecent(),
    staleTime: 15_000,
  });
}

export function useAscentLookupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AscentLookupInput) => ascentService.lookup(input),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: [ASCENT_QUERY_KEY] });
      toast.success(`Parcel ${result.parcelId} saved from Ascent`);
    },
    onError: (err: {
      response?: { data?: { message?: string } };
      message?: string;
    }) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Ascent lookup failed",
      );
    },
  });
}
