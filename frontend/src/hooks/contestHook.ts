import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getActiveRoundRequest,
  getContestDataRequest,
  getRoundLeaderboardRequest,
  submitContestRequest,
  type SubmitContestPayload,
} from "../services/contestService.js";

export const useGetActiveContestRound = (enabled = true, refetchInterval = 1000) => {
  return useQuery({
    queryKey: ["contest", "activeRound"],
    queryFn: getActiveRoundRequest,
    enabled,
    staleTime: 2000,
    refetchInterval: enabled ? refetchInterval : false,
    retry: 1,
  });
};

export const useGetContestData = (roundId?: string) => {
  return useQuery({
    queryKey: ["contest", "data", roundId],
    queryFn: () => getContestDataRequest(roundId as string),
    enabled: Boolean(roundId),
    staleTime: 15 * 1000,
    retry: 1,
  });
};

export const useSubmitContest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitContestPayload) => submitContestRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
};

export const useGetRoundLeaderboard = (roundNumber: number) => {
  return useQuery({
    queryKey: ["leaderboard", roundNumber],
    queryFn: () => getRoundLeaderboardRequest(roundNumber),
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    retry: 1,
  });
};
