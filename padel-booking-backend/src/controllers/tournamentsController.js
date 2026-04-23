import mongoose from "mongoose";
import Tournament from "../models/Tournament.js";
import TournamentTeam from "../models/TournamentTeam.js";
import TournamentGroup from "../models/TournamentGroup.js";
import TournamentMatch from "../models/TournamentMatch.js";

const STATUSES = ["draft", "registration", "in_progress", "finished"];
const GROUP_NAMES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function cleanString(value) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function parseBoolean(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function parseTournamentPayload(body = {}, userId = null) {
  const status = STATUSES.includes(body.status) ? body.status : "draft";
  const mode = body.settings?.mode === "singles" || body.mode === "singles" ? "singles" : "doubles";

  return {
    name: cleanString(body.name),
    description: cleanString(body.description),
    category: cleanString(body.category),
    format: cleanString(body.format) || "groups_playoffs",
    startDate: cleanString(body.startDate),
    endDate: cleanString(body.endDate),
    registrationOpen: parseBoolean(body.registrationOpen, status === "registration"),
    isActive: parseBoolean(body.isActive, false),
    isPublished: parseBoolean(body.isPublished, false),
    status,
    rules: cleanString(body.rules),
    settings: {
      mode,
      groupCount: Math.max(Number(body.settings?.groupCount || body.groupCount || 2), 1),
      playoffQualifiersPerGroup: Math.max(
        Number(body.settings?.playoffQualifiersPerGroup || body.playoffQualifiersPerGroup || 2),
        1
      ),
      hasThirdPlaceMatch: parseBoolean(body.settings?.hasThirdPlaceMatch, false),
      showSchedulePublicly: parseBoolean(body.settings?.showSchedulePublicly, true),
    },
    createdBy: userId,
  };
}

function parseTournamentUpdate(body = {}) {
  const data = {};
  const stringFields = ["name", "description", "category", "format", "startDate", "endDate", "rules"];

  for (const field of stringFields) {
    if (body[field] !== undefined) data[field] = cleanString(body[field]);
  }

  if (body.status !== undefined && STATUSES.includes(body.status)) data.status = body.status;
  if (body.registrationOpen !== undefined) data.registrationOpen = Boolean(body.registrationOpen);
  if (body.isPublished !== undefined) data.isPublished = Boolean(body.isPublished);

  if (body.settings || body.groupCount || body.playoffQualifiersPerGroup || body.mode) {
    data.settings = {
      mode: body.settings?.mode === "singles" || body.mode === "singles" ? "singles" : "doubles",
      groupCount: Math.max(Number(body.settings?.groupCount || body.groupCount || 2), 1),
      playoffQualifiersPerGroup: Math.max(
        Number(body.settings?.playoffQualifiersPerGroup || body.playoffQualifiersPerGroup || 2),
        1
      ),
      hasThirdPlaceMatch: Boolean(body.settings?.hasThirdPlaceMatch),
      showSchedulePublicly:
        body.settings?.showSchedulePublicly === undefined
          ? true
          : Boolean(body.settings.showSchedulePublicly),
    };
  }

  return data;
}

function getTeamLabel(team) {
  if (!team) return "";
  if (!team.player2Name) return team.player1Name || "";
  return [team.player1Name, team.player2Name].filter(Boolean).join(" / ");
}

function normalizeScore(score = {}) {
  const sets = Array.isArray(score.sets)
    ? score.sets
        .map((set) => ({
          teamAGames: Number(set.teamAGames || 0),
          teamBGames: Number(set.teamBGames || 0),
        }))
        .filter((set) => set.teamAGames || set.teamBGames)
    : [];

  let teamASets = Number(score.teamASets || 0);
  let teamBSets = Number(score.teamBSets || 0);

  if (sets.length) {
    teamASets = sets.filter((set) => set.teamAGames > set.teamBGames).length;
    teamBSets = sets.filter((set) => set.teamBGames > set.teamAGames).length;
  }

  return {
    sets,
    teamASets,
    teamBSets,
    summary: cleanString(score.summary),
  };
}

async function populateTournamentDetail(tournament) {
  if (!tournament) return null;

  const [teams, groups, matches] = await Promise.all([
    TournamentTeam.find({ tournamentId: tournament._id }).sort({ seed: 1, createdAt: 1 }).lean(),
    TournamentGroup.find({ tournamentId: tournament._id })
      .populate("teams")
      .populate("standings.teamId")
      .sort({ name: 1 })
      .lean(),
    TournamentMatch.find({ tournamentId: tournament._id })
      .populate("teamA")
      .populate("teamB")
      .populate("winner")
      .sort({ roundOrder: 1, bracketPosition: 1, scheduledDate: 1, scheduledTime: 1 })
      .lean(),
  ]);

  return {
    tournament,
    teams,
    groups,
    matches,
  };
}

async function getPublishedTournamentById(id) {
  if (!isValidId(id)) return null;
  return Tournament.findOne({ _id: id, isActive: true, isPublished: true }).lean();
}

function sortStandings(standings = []) {
  return [...standings].sort((a, b) => {
    const pointsDiff = (b.points || 0) - (a.points || 0);
    if (pointsDiff) return pointsDiff;

    const setsDiff =
      (b.setsWon || 0) - (b.setsLost || 0) - ((a.setsWon || 0) - (a.setsLost || 0));
    if (setsDiff) return setsDiff;

    const gamesDiff =
      (b.gamesWon || 0) - (b.gamesLost || 0) - ((a.gamesWon || 0) - (a.gamesLost || 0));
    if (gamesDiff) return gamesDiff;

    return (b.won || 0) - (a.won || 0);
  });
}

async function recalculateGroupStandings(groupId) {
  const group = await TournamentGroup.findById(groupId);
  if (!group) return null;

  const standingsMap = new Map(
    group.teams.map((teamId) => [
      String(teamId),
      {
        teamId,
        played: 0,
        won: 0,
        lost: 0,
        points: 0,
        setsWon: 0,
        setsLost: 0,
        gamesWon: 0,
        gamesLost: 0,
      },
    ])
  );

  const matches = await TournamentMatch.find({
    groupId: group._id,
    phase: "group",
    status: "finished",
  }).lean();

  for (const match of matches) {
    if (!match.teamA || !match.teamB || !match.winner) continue;

    const teamAId = String(match.teamA);
    const teamBId = String(match.teamB);
    const winnerId = String(match.winner);
    const teamAStats = standingsMap.get(teamAId);
    const teamBStats = standingsMap.get(teamBId);
    if (!teamAStats || !teamBStats) continue;

    teamAStats.played += 1;
    teamBStats.played += 1;

    if (winnerId === teamAId) {
      teamAStats.won += 1;
      teamAStats.points += 3;
      teamBStats.lost += 1;
    } else if (winnerId === teamBId) {
      teamBStats.won += 1;
      teamBStats.points += 3;
      teamAStats.lost += 1;
    }

    const score = match.score || {};
    teamAStats.setsWon += Number(score.teamASets || 0);
    teamAStats.setsLost += Number(score.teamBSets || 0);
    teamBStats.setsWon += Number(score.teamBSets || 0);
    teamBStats.setsLost += Number(score.teamASets || 0);

    for (const set of score.sets || []) {
      teamAStats.gamesWon += Number(set.teamAGames || 0);
      teamAStats.gamesLost += Number(set.teamBGames || 0);
      teamBStats.gamesWon += Number(set.teamBGames || 0);
      teamBStats.gamesLost += Number(set.teamAGames || 0);
    }
  }

  group.standings = sortStandings([...standingsMap.values()]);
  await group.save();
  return group;
}

function getBracketPhase(count) {
  if (count <= 2) return "final";
  if (count <= 4) return "semifinal";
  if (count <= 8) return "cuartos";
  return "octavos";
}

async function getBracketTeams(tournament) {
  const groups = await TournamentGroup.find({ tournamentId: tournament._id }).lean();
  const qualifiersPerGroup = tournament.settings?.playoffQualifiersPerGroup || 2;

  if (groups.length) {
    const qualifiers = [];
    for (const group of groups) {
      const sorted = sortStandings(group.standings || []);
      qualifiers.push(...sorted.slice(0, qualifiersPerGroup).map((item) => item.teamId));
    }

    return qualifiers.filter(Boolean);
  }

  const teams = await TournamentTeam.find({
    tournamentId: tournament._id,
    isApproved: true,
    isConfirmed: true,
  })
    .sort({ seed: 1, createdAt: 1 })
    .lean();

  return teams.map((team) => team._id);
}

export async function getActiveTournament(req, res) {
  try {
    const tournament = await Tournament.findOne({ isActive: true, isPublished: true })
      .sort({ updatedAt: -1 })
      .lean();

    if (!tournament) {
      return res.json({ tournament: null });
    }

    const detail = await populateTournamentDetail(tournament);
    return res.json(detail);
  } catch (error) {
    console.error("active tournament error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getPublicTournament(req, res) {
  try {
    const tournament = await getPublishedTournamentById(req.params.id);
    if (!tournament) return res.status(404).json({ message: "Torneo no encontrado" });

    const detail = await populateTournamentDetail(tournament);
    return res.json(detail);
  } catch (error) {
    console.error("public tournament error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getPublicTournamentTeams(req, res) {
  try {
    const tournament = await getPublishedTournamentById(req.params.id);
    if (!tournament) return res.status(404).json({ message: "Torneo no encontrado" });

    const teams = await TournamentTeam.find({ tournamentId: tournament._id, isApproved: true })
      .sort({ seed: 1, createdAt: 1 })
      .lean();

    return res.json({ teams });
  } catch (error) {
    console.error("public teams error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getPublicTournamentGroups(req, res) {
  try {
    const tournament = await getPublishedTournamentById(req.params.id);
    if (!tournament) return res.status(404).json({ message: "Torneo no encontrado" });

    const groups = await TournamentGroup.find({ tournamentId: tournament._id })
      .populate("teams")
      .populate("standings.teamId")
      .sort({ name: 1 })
      .lean();

    return res.json({ groups });
  } catch (error) {
    console.error("public groups error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getPublicTournamentMatches(req, res) {
  try {
    const tournament = await getPublishedTournamentById(req.params.id);
    if (!tournament) return res.status(404).json({ message: "Torneo no encontrado" });

    const matches = await TournamentMatch.find({ tournamentId: tournament._id })
      .populate("teamA")
      .populate("teamB")
      .populate("winner")
      .sort({ roundOrder: 1, bracketPosition: 1, scheduledDate: 1, scheduledTime: 1 })
      .lean();

    return res.json({ matches });
  } catch (error) {
    console.error("public matches error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function registerTournamentTeam(req, res) {
  try {
    const tournament = await getPublishedTournamentById(req.params.id);
    if (!tournament) return res.status(404).json({ message: "Torneo no encontrado" });
    if (!tournament.registrationOpen) {
      return res.status(400).json({ message: "La inscripcion no esta abierta" });
    }

    const { player1Name, player2Name, phone, notes } = req.body;
    const isSingles = tournament.settings?.mode === "singles";
    if (!cleanString(player1Name) || (!isSingles && !cleanString(player2Name))) {
      return res.status(400).json({ message: "Faltan nombres de jugadores" });
    }

    const team = await TournamentTeam.create({
      tournamentId: tournament._id,
      player1Name: cleanString(player1Name),
      player2Name: isSingles ? "" : cleanString(player2Name),
      phone: cleanString(phone),
      notes: cleanString(notes),
      isApproved: false,
      isConfirmed: false,
    });

    return res.status(201).json({ message: "Inscripcion recibida", team });
  } catch (error) {
    console.error("register tournament team error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function createAdminTournament(req, res) {
  try {
    const payload = parseTournamentPayload(req.body, req.user?.id);
    if (!payload.name || !payload.startDate) {
      return res.status(400).json({ message: "Nombre y fecha de inicio son obligatorios" });
    }

    if (payload.isActive) {
      await Tournament.updateMany({ isActive: true }, { $set: { isActive: false } });
    }

    const tournament = await Tournament.create(payload);
    return res.status(201).json({ tournament });
  } catch (error) {
    console.error("create tournament error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function listAdminTournaments(req, res) {
  try {
    const tournaments = await Tournament.find().sort({ createdAt: -1 }).lean();
    return res.json({ tournaments });
  } catch (error) {
    console.error("list tournaments error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getAdminTournament(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Id invalido" });
    }

    const tournament = await Tournament.findById(req.params.id).lean();
    if (!tournament) return res.status(404).json({ message: "Torneo no encontrado" });

    const detail = await populateTournamentDetail(tournament);
    return res.json(detail);
  } catch (error) {
    console.error("admin tournament detail error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateAdminTournament(req, res) {
  try {
    const data = parseTournamentUpdate(req.body);
    if (data.name === "" || data.startDate === "") {
      return res.status(400).json({ message: "Nombre y fecha de inicio son obligatorios" });
    }

    const tournament = await Tournament.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!tournament) return res.status(404).json({ message: "Torneo no encontrado" });
    return res.json({ tournament });
  } catch (error) {
    console.error("update tournament error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteAdminTournament(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Id invalido" });
    }

    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: "Torneo no encontrado" });

    await Promise.all([
      TournamentTeam.deleteMany({ tournamentId: tournament._id }),
      TournamentGroup.deleteMany({ tournamentId: tournament._id }),
      TournamentMatch.deleteMany({ tournamentId: tournament._id }),
    ]);

    await tournament.deleteOne();

    return res.json({ message: "Torneo eliminado correctamente" });
  } catch (error) {
    console.error("delete tournament error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function activateTournament(req, res) {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: "Torneo no encontrado" });

    await Tournament.updateMany(
      { _id: { $ne: tournament._id }, isActive: true },
      { $set: { isActive: false } }
    );

    tournament.isActive = true;
    await tournament.save();

    return res.json({ tournament });
  } catch (error) {
    console.error("activate tournament error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deactivateTournament(req, res) {
  try {
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!tournament) return res.status(404).json({ message: "Torneo no encontrado" });
    return res.json({ tournament });
  } catch (error) {
    console.error("deactivate tournament error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function publishTournament(req, res) {
  try {
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      { isPublished: true },
      { new: true }
    );
    if (!tournament) return res.status(404).json({ message: "Torneo no encontrado" });
    return res.json({ tournament });
  } catch (error) {
    console.error("publish tournament error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function unpublishTournament(req, res) {
  try {
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      { isPublished: false },
      { new: true }
    );
    if (!tournament) return res.status(404).json({ message: "Torneo no encontrado" });
    return res.json({ tournament });
  } catch (error) {
    console.error("unpublish tournament error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function addTournamentTeam(req, res) {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: "Torneo no encontrado" });

    const { player1Name, player2Name, phone, notes, seed, isApproved, isConfirmed } = req.body;
    const isSingles = tournament.settings?.mode === "singles";
    if (!cleanString(player1Name) || (!isSingles && !cleanString(player2Name))) {
      return res.status(400).json({ message: "Faltan nombres de jugadores" });
    }

    const team = await TournamentTeam.create({
      tournamentId: tournament._id,
      player1Name: cleanString(player1Name),
      player2Name: isSingles ? "" : cleanString(player2Name),
      phone: cleanString(phone),
      notes: cleanString(notes),
      seed: seed === undefined || seed === "" ? null : Number(seed),
      isApproved: isApproved === undefined ? true : Boolean(isApproved),
      isConfirmed: isConfirmed === undefined ? true : Boolean(isConfirmed),
    });

    return res.status(201).json({ team });
  } catch (error) {
    console.error("add tournament team error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateTournamentTeam(req, res) {
  try {
    const data = {};
    for (const field of ["player1Name", "player2Name", "phone", "notes"]) {
      if (req.body[field] !== undefined) data[field] = cleanString(req.body[field]);
    }
    if (req.body.seed !== undefined) data.seed = req.body.seed === "" ? null : Number(req.body.seed);
    if (req.body.isApproved !== undefined) data.isApproved = Boolean(req.body.isApproved);
    if (req.body.isConfirmed !== undefined) data.isConfirmed = Boolean(req.body.isConfirmed);

    const team = await TournamentTeam.findOneAndUpdate(
      { _id: req.params.teamId, tournamentId: req.params.id },
      data,
      { new: true, runValidators: true }
    );

    if (!team) return res.status(404).json({ message: "Pareja no encontrada" });
    return res.json({ team });
  } catch (error) {
    console.error("update tournament team error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteTournamentTeam(req, res) {
  try {
    const team = await TournamentTeam.findOneAndDelete({
      _id: req.params.teamId,
      tournamentId: req.params.id,
    });

    if (!team) return res.status(404).json({ message: "Participante no encontrado" });

    await TournamentGroup.updateMany(
      { tournamentId: req.params.id },
      {
        $pull: {
          teams: team._id,
          standings: { teamId: team._id },
        },
      }
    );

    await TournamentMatch.deleteMany({
      tournamentId: req.params.id,
      $or: [{ teamA: team._id }, { teamB: team._id }],
    });

    return res.json({ message: "Participante eliminado correctamente" });
  } catch (error) {
    console.error("delete tournament team error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function generateTournamentGroups(req, res) {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: "Torneo no encontrado" });

    const groupCount = Math.max(Number(req.body.groupCount || tournament.settings?.groupCount || 2), 1);
    const teams = await TournamentTeam.find({
      tournamentId: tournament._id,
      isApproved: true,
      isConfirmed: true,
    }).sort({ seed: 1, createdAt: 1 });

    if (teams.length < groupCount) {
      return res.status(400).json({ message: "No hay suficientes parejas confirmadas" });
    }

    await TournamentGroup.deleteMany({ tournamentId: tournament._id });
    await TournamentMatch.deleteMany({ tournamentId: tournament._id, phase: "group" });
    await TournamentTeam.updateMany({ tournamentId: tournament._id }, { $set: { groupId: null } });

    const buckets = Array.from({ length: groupCount }, () => []);
    teams.forEach((team, index) => {
      buckets[index % groupCount].push(team);
    });

    const groups = [];
    for (let index = 0; index < buckets.length; index += 1) {
      const bucket = buckets[index];
      const name = `Grupo ${GROUP_NAMES[index] || index + 1}`;
      const group = await TournamentGroup.create({
        tournamentId: tournament._id,
        name,
        teams: bucket.map((team) => team._id),
        standings: bucket.map((team) => ({ teamId: team._id })),
      });

      await TournamentTeam.updateMany(
        { _id: { $in: bucket.map((team) => team._id) } },
        { $set: { groupId: group._id } }
      );

      for (let i = 0; i < bucket.length; i += 1) {
        for (let j = i + 1; j < bucket.length; j += 1) {
          await TournamentMatch.create({
            tournamentId: tournament._id,
            phase: "group",
            groupId: group._id,
            teamA: bucket[i]._id,
            teamB: bucket[j]._id,
            status: "pending",
            roundOrder: 1,
            bracketPosition: groups.length * 100 + i * 10 + j,
          });
        }
      }

      groups.push(group);
    }

    return res.status(201).json({ groups, generatedCount: groups.length });
  } catch (error) {
    console.error("generate groups error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function generateTournamentBracket(req, res) {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: "Torneo no encontrado" });

    const teamIds = await getBracketTeams(tournament);
    if (teamIds.length < 2) {
      return res.status(400).json({ message: "Se necesitan al menos 2 parejas" });
    }

    await TournamentMatch.deleteMany({
      tournamentId: tournament._id,
      phase: { $ne: "group" },
    });

    const phase = getBracketPhase(teamIds.length);
    const matches = [];
    const ordered = [...teamIds];

    while (ordered.length >= 2) {
      const teamA = ordered.shift();
      const teamB = ordered.pop();
      matches.push({
        tournamentId: tournament._id,
        phase,
        teamA,
        teamB,
        status: "pending",
        roundOrder: 1,
        bracketPosition: matches.length + 1,
      });
    }

    const created = await TournamentMatch.insertMany(matches);
    return res.status(201).json({ matches: created, generatedCount: created.length });
  } catch (error) {
    console.error("generate bracket error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateTournamentMatch(req, res) {
  try {
    const match = await TournamentMatch.findOne({
      _id: req.params.matchId,
      tournamentId: req.params.id,
    });

    if (!match) return res.status(404).json({ message: "Partido no encontrado" });

    for (const field of ["scheduledDate", "scheduledTime", "phase"]) {
      if (req.body[field] !== undefined) match[field] = cleanString(req.body[field]);
    }

    if (req.body.court !== undefined) {
      match.court = req.body.court === "" || req.body.court === null ? null : Number(req.body.court);
    }

    if (req.body.status !== undefined) {
      match.status = req.body.status;
    } else if (match.scheduledDate || match.scheduledTime) {
      match.status = match.status === "finished" ? "finished" : "scheduled";
    }

    if (req.body.score !== undefined) {
      match.score = normalizeScore(req.body.score);
    }

    if (req.body.winner !== undefined && req.body.winner) {
      match.winner = req.body.winner;
      match.status = "finished";
    }

    if (match.status === "finished" && !match.winner && match.teamA && match.teamB) {
      if ((match.score?.teamASets || 0) > (match.score?.teamBSets || 0)) {
        match.winner = match.teamA;
      } else if ((match.score?.teamBSets || 0) > (match.score?.teamASets || 0)) {
        match.winner = match.teamB;
      }
    }

    await match.save();

    if (match.phase === "group" && match.groupId) {
      await recalculateGroupStandings(match.groupId);
    }

    if (match.phase === "final" && match.status === "finished" && match.winner) {
      const winnerTeam = await TournamentTeam.findById(match.winner).lean();
      await Tournament.findByIdAndUpdate(req.params.id, {
        champion: {
          teamId: match.winner,
          text: getTeamLabel(winnerTeam),
        },
        status: "finished",
      });
    }

    const updated = await TournamentMatch.findById(match._id)
      .populate("teamA")
      .populate("teamB")
      .populate("winner")
      .lean();

    return res.json({ match: updated });
  } catch (error) {
    console.error("update match error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function setTournamentChampion(req, res) {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: "Torneo no encontrado" });

    let championText = cleanString(req.body.text);
    let teamId = null;

    if (req.body.teamId && isValidId(req.body.teamId)) {
      const team = await TournamentTeam.findOne({
        _id: req.body.teamId,
        tournamentId: tournament._id,
      }).lean();

      if (!team) return res.status(404).json({ message: "Pareja no encontrada" });
      teamId = team._id;
      championText = championText || getTeamLabel(team);
    }

    tournament.champion = { teamId, text: championText };
    tournament.status = "finished";
    await tournament.save();

    return res.json({ tournament });
  } catch (error) {
    console.error("set champion error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
