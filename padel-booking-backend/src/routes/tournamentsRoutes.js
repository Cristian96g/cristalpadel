import express from "express";
import {
  getActiveTournament,
  getPublicTournament,
  getPublicTournamentTeams,
  getPublicTournamentGroups,
  getPublicTournamentMatches,
  registerTournamentTeam,
} from "../controllers/tournamentsController.js";

const router = express.Router();

router.get("/active", getActiveTournament);
router.get("/:id", getPublicTournament);
router.get("/:id/teams", getPublicTournamentTeams);
router.get("/:id/groups", getPublicTournamentGroups);
router.get("/:id/matches", getPublicTournamentMatches);
router.post("/:id/register", registerTournamentTeam);

export default router;
