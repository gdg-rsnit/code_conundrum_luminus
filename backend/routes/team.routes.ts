import express from "express"

import {
    getTeams,
    getBannedTeams,
    penalizeTeams,
    getPenalizedTeams,
    deletePenalty,
    updateTeamStatus
} from "../controllers/team.controller.js"

import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware.js"

const router = express.Router();

// Team routes
router.get("/teams", authenticate, authorizeAdmin, getTeams);
router.patch("/:teamId/status",authenticate,authorizeAdmin,updateTeamStatus)
router.get("/bannedTeams", authenticate, authorizeAdmin, getBannedTeams);

// Penalty routes
router.post("/:teamId/penalties", authenticate, authorizeAdmin, penalizeTeams);
router.get("/penalties", authenticate, authorizeAdmin, getPenalizedTeams);
router.delete("/penalties/:penaltyId", authenticate, authorizeAdmin, deletePenalty);

export default router;