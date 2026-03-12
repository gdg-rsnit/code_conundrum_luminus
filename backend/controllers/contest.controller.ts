import type { Request, Response } from "express";
import mongoose from "mongoose";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import { Round } from "../models/roundModel.js";
import { Question } from "../models/questionModel.js";
import { Answer } from "../models/answerModel.js";
import { Submission } from "../models/submissionModel.js";
import { Team } from "../models/teamModel.js";
import { User } from "../models/userModel.js";

interface AuthRequest extends Request {
  user?: {
    _id?: string;
    email?: string;
    role?: "ADMIN" | "TEAM";
    teamId?: mongoose.Types.ObjectId | string | null;
  };
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const resolveTeamId = async (user?: AuthRequest["user"]) => {
  if (user?.teamId && mongoose.Types.ObjectId.isValid(String(user.teamId))) {
    return String(user.teamId);
  }

  if (!user?.email) {
    return "";
  }

  const emailPrefix = user.email.split("@")[0]?.trim();
  if (!emailPrefix) {
    return "";
  }

  const escapedPrefix = escapeRegex(emailPrefix);
  const fallbackTeam = await Team.findOne({
    teamName: { $regex: new RegExp(`^${escapedPrefix}$`, "i") },
  })
    .select("_id")
    .lean();

  if (fallbackTeam?._id && user?._id) {
    await User.findByIdAndUpdate(user._id, {
      $set: { teamId: fallbackTeam._id },
    });
  }

  return fallbackTeam?._id ? String(fallbackTeam._id) : "";
};

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

const getActiveRound = asyncHandler(async (req: AuthRequest, res: Response) => {
  await autoEndExpiredLiveRounds();

  const liveRound = await Round.findOne({ status: "LIVE" }).sort({ roundNumber: 1 }).lean();
  const serverNow = new Date().toISOString();

  if (!liveRound) {
    return res.status(200).json({
      success: true,
      message: "No active round",
      data: null,
      serverNow,
    });
  }

  let hasSubmitted = false;
  if (req.user?.role === "TEAM") {
    const teamId = await resolveTeamId(req.user);

    if (teamId) {
      const existingSubmission = await Submission.findOne({
        teamId: new mongoose.Types.ObjectId(teamId),
        roundId: liveRound._id,
        isInvalidated: false,
      })
        .select("_id")
        .lean();

      hasSubmitted = Boolean(existingSubmission);
    }
  }

  return res.status(200).json({
    success: true,
    message: "Active round fetched",
    data: {
      ...liveRound,
      serverNow,
      hasSubmitted,
    },
    serverNow,
  });
});

const getContestDataByRound = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { roundId } = req.params;
  const serverNow = new Date().toISOString();

  if (!roundId || !mongoose.Types.ObjectId.isValid(roundId)) {
    return res.status(400).json({ success: false, message: "Invalid round ID" });
  }

  await autoEndExpiredLiveRounds();

  const round = await Round.findById(roundId).lean();

  if (!round) {
    return res.status(404).json({ success: false, message: "Round not found" });
  }

  if (round.status === "DRAFT") {
    return res.status(400).json({ success: false, message: "Round has not started yet" });
  }

  if (req.user?.role === "TEAM") {
    const teamId = await resolveTeamId(req.user);

    if (teamId) {
      const existingSubmission = await Submission.findOne({
        teamId: new mongoose.Types.ObjectId(teamId),
        roundId: new mongoose.Types.ObjectId(roundId),
        isInvalidated: false,
      })
        .select("_id")
        .lean();

      if (existingSubmission) {
        return res.status(403).json({
          success: false,
          code: "ALREADY_SUBMITTED",
          message: "You have already submitted this round",
        });
      }
    }
  }

  const [questions, answers] = await Promise.all([
    Question.find({ roundId }).sort({ createdAt: 1 }).lean(),
    Answer.find({ roundId }).sort({ createdAt: 1 }).lean(),
  ]);

  return res.status(200).json({
    success: true,
    message: "Contest data fetched",
    serverNow,
    data: {
      round: {
        ...round,
        serverNow,
      },
      questions: questions.map((question) => ({
        _id: String(question._id),
        roundId: String(question.roundId),
        question: question.question,
      })),
      answers: answers.map((answer) => ({
        _id: String(answer._id),
        roundId: String(answer.roundId),
        code: answer.code,
      })),
    },
  });
});

export { getActiveRound, getContestDataByRound };
