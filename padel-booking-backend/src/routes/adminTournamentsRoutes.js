import express from "express";
import { adminAuth } from "../middlewares/adminAuth.js";
import {
  createAdminTournament,
  listAdminTournaments,
  getAdminTournament,
  updateAdminTournament,
  deleteAdminTournament,
  activateTournament,
  deactivateTournament,
  publishTournament,
  unpublishTournament,
  addTournamentTeam,
  updateTournamentTeam,
  deleteTournamentTeam,
  generateTournamentGroups,
  generateTournamentBracket,
  updateTournamentMatch,
  setTournamentChampion,
} from "../controllers/tournamentsController.js";

const router = express.Router();

router.use(adminAuth);

router.post("/", createAdminTournament);
router.get("/", listAdminTournaments);
router.get("/:id", getAdminTournament);
router.patch("/:id", updateAdminTournament);
router.delete("/:id", deleteAdminTournament);
router.patch("/:id/activate", activateTournament);
router.patch("/:id/deactivate", deactivateTournament);
router.patch("/:id/publish", publishTournament);
router.patch("/:id/unpublish", unpublishTournament);
router.post("/:id/teams", addTournamentTeam);
router.patch("/:id/teams/:teamId", updateTournamentTeam);
router.delete("/:id/teams/:teamId", deleteTournamentTeam);
router.post("/:id/groups/generate", generateTournamentGroups);
router.post("/:id/bracket/generate", generateTournamentBracket);
router.patch("/:id/matches/:matchId", updateTournamentMatch);
router.patch("/:id/champion", setTournamentChampion);

export default router;
