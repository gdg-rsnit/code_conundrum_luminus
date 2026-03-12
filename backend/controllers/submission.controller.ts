import type { Request, Response } from "express";
import mongoose from "mongoose";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import { Submission } from "../models/submissionModel.js";
import { Question } from "../models/questionModel.js";
import { Round } from "../models/roundModel.js";
import { TeamRound } from "../models/teamRoundSchema.js";
import { Team } from "../models/teamModel.js";
import { User } from "../models/userModel.js";
import { addToLeaderboard } from "../services/redisLeaderboard.js";
import { upsertParticipant } from "../services/participantService.js";

interface AuthRequest extends Request {
  user?: {
    _id?: string;
    email?: string;
    role?: "ADMIN" | "TEAM";
    teamId?: mongoose.Types.ObjectId | string | null;
  };
}

type SubmissionAnswer = {
  questionId: string;
  selectedAnswer: string;
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const autoEndExpiredLiveRounds = async () => {
  const now = new Date();

  await Round.updateMany(
    {
      status: "LIVE",
      isPaused: false,
      endTime: { $ne: null, $lte: now },
    },
    {
      $set: {
        status: "ENDED",
        submissionLocked: true,
        isPaused: false,
        pauseStartAt: null,
        endTime: now,
      },
    }
  );
};

const submitRoundAnswers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { roundId, answers, timeTaken } = req.body as {
    roundId?: string;
    answers?: SubmissionAnswer[];
    timeTaken?: number;
  };

  if (req.user?.role !== "TEAM") {
    return res.status(403).json({ success: false, message: "Only team users can submit" });
  }

  if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
    return res.status(400).json({ success: false, message: "Invalid roundId" });
  }

  if (!Array.isArray(answers)) {
    return res.status(400).json({ success: false, message: "answers must be an array" });
  }

  let normalizedTeamId = req.user.teamId ? String(req.user.teamId) : "";

  // Fallback for older team users that were created without teamId linkage.
  if (!normalizedTeamId && req.user?.email) {
    const emailPrefix = req.user.email.split("@")[0]?.trim();

    if (emailPrefix) {
      const escapedPrefix = escapeRegex(emailPrefix);
      const fallbackTeam = await Team.findOne({
        teamName: { $regex: new RegExp(`^${escapedPrefix}$`, "i") },
      })
        .select("_id")
        .lean();

      if (fallbackTeam?._id && req.user?._id) {
        normalizedTeamId = String(fallbackTeam._id);

        await User.findByIdAndUpdate(req.user._id, {
          $set: { teamId: fallbackTeam._id },
        });
      }
    }
  }

  if (!normalizedTeamId || !mongoose.Types.ObjectId.isValid(normalizedTeamId)) {
    return res.status(400).json({ success: false, message: "User is not linked to a team" });
  }

  await autoEndExpiredLiveRounds();

  const round = await Round.findById(roundId).lean();
  if (!round) {
    return res.status(404).json({ success: false, message: "Round not found" });
  }

  if (round.status !== "LIVE" || round.submissionLocked) {
    return res.status(400).json({ success: false, message: "Round is not accepting submissions" });
  }

  const teamObjectId = new mongoose.Types.ObjectId(normalizedTeamId);
  const roundObjectId = new mongoose.Types.ObjectId(roundId);

  const existingSubmission = await Submission.findOne({
    teamId: teamObjectId,
    roundId: roundObjectId,
    isInvalidated: false,
  })
    .select("_id")
    .lean();

  if (existingSubmission) {
    return res.status(409).json({
      success: false,
      code: "ALREADY_SUBMITTED",
      message: "You have already submitted this round",
    });
  }

  const questions = await Question.find({ roundId }).lean();
  const questionMap = new Map(questions.map((q) => [String(q._id), String(q.correctAnswerId)]));

  const sanitizedAnswers = answers
    .filter((item): item is SubmissionAnswer => {
      if (!item || typeof item !== "object") {
        return false;
      }

      if (typeof item.questionId !== "string" || typeof item.selectedAnswer !== "string") {
        return false;
      }

      return mongoose.Types.ObjectId.isValid(item.questionId) && mongoose.Types.ObjectId.isValid(item.selectedAnswer);
    })
    .map((item) => ({
      questionId: new mongoose.Types.ObjectId(item.questionId),
      selectedAnswer: new mongoose.Types.ObjectId(item.selectedAnswer),
    }));

  let questionsSolved = 0;
  for (const item of sanitizedAnswers) {
    const correctAnswerId = questionMap.get(String(item.questionId));
    if (correctAnswerId && correctAnswerId === String(item.selectedAnswer)) {
      questionsSolved += 1;
    }
  }

  const boundedTimeTaken = Math.max(0, Number(timeTaken) || 0);

  const previousTeamRound = await TeamRound.findOne({ teamId: teamObjectId, roundId: roundObjectId }).lean();

  const submission = await Submission.create({
    teamId: teamObjectId,
    roundId: roundObjectId,
    answers: sanitizedAnswers,
    timeTaken: boundedTimeTaken,
    questionsSolved,
    submittedAt: new Date(),
    isInvalidated: false,
  });

  await TeamRound.findOneAndUpdate(
    { teamId: teamObjectId, roundId: roundObjectId },
    {
      $set: {
        score: questionsSolved,
        time: boundedTimeTaken,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const previousScore = previousTeamRound?.score ?? 0;
  const previousTime = previousTeamRound?.time ?? 0;

  await Team.findByIdAndUpdate(teamObjectId, {
    $inc: {
      score: questionsSolved - previousScore,
      time: boundedTimeTaken - previousTime,
    },
  });

  const team = await Team.findById(teamObjectId).lean();
  const totalQuestions = questions.length;
  const accuracy = totalQuestions > 0 ? Number(((questionsSolved / totalQuestions) * 100).toFixed(2)) : 0;

  if (team?.teamName) {
    const sideEffects = await Promise.allSettled([
      addToLeaderboard(round.roundNumber, team.teamName, questionsSolved, boundedTimeTaken, accuracy),
      upsertParticipant(team.teamName, questionsSolved, boundedTimeTaken, round.roundNumber, accuracy),
    ]);

    if (sideEffects[0].status === "rejected") {
      console.warn("Leaderboard cache update failed:", sideEffects[0].reason);
    }

    if (sideEffects[1].status === "rejected") {
      console.warn("Participant upsert failed:", sideEffects[1].reason);
    }
  }

  return res.status(201).json({
    success: true,
    message: "Submission saved and leaderboard updated",
    data: {
      submission,
      score: questionsSolved,
      totalQuestions,
      accuracy,
    },
  });
});

const getRoundLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const roundNumber = Number(req.params.roundNumber);

  if (![1, 2, 3].includes(roundNumber)) {
    return res.status(400).json({ success: false, message: "roundNumber must be 1, 2, or 3" });
  }

  const round = await Round.findOne({ roundNumber }).lean();
  if (!round) {
    return res.status(200).json({ success: true, message: "No round found", data: [] });
  }

  const submissions = await Submission.find({ roundId: round._id, isInvalidated: false })
    .sort({ questionsSolved: -1, timeTaken: 1, submittedAt: 1 })
    .populate("teamId", "teamName")
    .lean();

  const totalQuestions = await Question.countDocuments({ roundId: round._id });

  const leaderboard = submissions.map((entry, index) => ({
    rank: index + 1,
    teamName: (entry.teamId as { teamName?: string } | null)?.teamName || "UNKNOWN",
    score: entry.questionsSolved,
    timeSeconds: entry.timeTaken,
    accuracy: totalQuestions > 0 ? Number(((entry.questionsSolved / totalQuestions) * 100).toFixed(2)) : 0,
    roundNumber,
  }));

  return res.status(200).json({
    success: true,
    message: "Leaderboard fetched",
    data: leaderboard,
  });
});

export { submitRoundAnswers, getRoundLeaderboard };
