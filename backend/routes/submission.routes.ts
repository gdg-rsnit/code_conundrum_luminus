import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getRoundLeaderboard, submitRoundAnswers } from "../controllers/submission.controller.js";

const router = express.Router();

router.post("/", authenticate, submitRoundAnswers);
router.get("/leaderboard/:roundNumber", authenticate, getRoundLeaderboard);

export default router;
