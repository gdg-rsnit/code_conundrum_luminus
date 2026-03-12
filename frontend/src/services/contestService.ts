import api from "../lib/axios.js";

export type ActiveRound = {
  _id: string;
  roundNumber: number;
  duration: number;
  status: "DRAFT" | "LIVE" | "ENDED";
  startTime: string | null;
  endTime: string | null;
  pauseStartAt?: string | null;
  isPaused?: boolean;
  submissionLocked?: boolean;
  hasSubmitted?: boolean;
  serverNow?: string;
};

export type ContestQuestion = {
  _id: string;
  roundId: string;
  question: string;
};

export type ContestAnswer = {
  _id: string;
  roundId: string;
  code: string;
};

export type ContestDataResponse = {
  round: ActiveRound;
  questions: ContestQuestion[];
  answers: ContestAnswer[];
};

export type SubmitContestPayload = {
  roundId: string;
  answers: { questionId: string; selectedAnswer: string }[];
  timeTaken: number;
};

export type SubmitContestResult = {
  score: number;
  totalQuestions: number;
  accuracy: number;
};

export type LeaderboardEntry = {
  rank: number;
  teamName: string;
  score: number;
  timeSeconds: number;
  accuracy: number;
  roundNumber: number;
};

export const getActiveRoundRequest = async (): Promise<ActiveRound | null> => {
  const { data } = await api.get("/contest/active-round");
  return data?.data ?? null;
};

export const getContestDataRequest = async (roundId: string): Promise<ContestDataResponse> => {
  const { data } = await api.get(`/contest/${roundId}/questions`);
  return data.data;
};

export const submitContestRequest = async (payload: SubmitContestPayload): Promise<SubmitContestResult> => {
  const { data } = await api.post("/submissions", payload);
  return {
    score: data?.data?.score ?? 0,
    totalQuestions: data?.data?.totalQuestions ?? 0,
    accuracy: data?.data?.accuracy ?? 0,
  };
};

export const getRoundLeaderboardRequest = async (roundNumber: number): Promise<LeaderboardEntry[]> => {
  const { data } = await api.get(`/submissions/leaderboard/${roundNumber}`);
  return data?.data ?? [];
};
