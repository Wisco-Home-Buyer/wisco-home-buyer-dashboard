import { useQuery } from "@tanstack/react-query";
import {
  activityLogsService,
  QueryActivityLogsParams,
} from "../services/activityLogs.service";

export const ACTIVITY_LOGS_QUERY_KEY = "activity-logs";

export const useActivityLogs = (
  params: QueryActivityLogsParams = {},
  enabled = true
) => {
  return useQuery({
    queryKey: [ACTIVITY_LOGS_QUERY_KEY, params],
    queryFn: () => activityLogsService.getActivityLogs(params),
    enabled,
    staleTime: 15 * 1000,
  });
};
