import mongoose from "mongoose";

const SetScoreSchema = new mongoose.Schema(
  {
    teamAGames: { type: Number, default: 0 },
    teamBGames: { type: Number, default: 0 },
  },
  { _id: false }
);

const TournamentMatchSchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    phase: {
      type: String,
      enum: ["group", "octavos", "cuartos", "semifinal", "final", "third_place"],
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TournamentGroup",
      default: null,
    },
    teamA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TournamentTeam",
      default: null,
    },
    teamB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TournamentTeam",
      default: null,
    },
    scheduledDate: { type: String, default: "" },
    scheduledTime: { type: String, default: "" },
    court: { type: Number, default: null },
    score: {
      sets: [SetScoreSchema],
      teamASets: { type: Number, default: 0 },
      teamBSets: { type: Number, default: 0 },
      summary: { type: String, default: "", trim: true },
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TournamentTeam",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "scheduled", "finished"],
      default: "pending",
    },
    roundOrder: { type: Number, default: 1 },
    bracketPosition: { type: Number, default: 0 },
  },
  { timestamps: true }
);

TournamentMatchSchema.index({ tournamentId: 1, phase: 1, roundOrder: 1 });
TournamentMatchSchema.index({ tournamentId: 1, groupId: 1 });

export default mongoose.model("TournamentMatch", TournamentMatchSchema);
