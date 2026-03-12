import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getActiveRound, getContestDataByRound } from "../controllers/contest.controller.js";

const router = express.Router();

router.get("/active-round", authenticate, getActiveRound);
router.get("/:roundId/questions", authenticate, getContestDataByRound);

export default router;
