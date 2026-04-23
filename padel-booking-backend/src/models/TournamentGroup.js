import mongoose from "mongoose";

const StandingSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TournamentTeam",
      required: true,
    },
    played: { type: Number, default: 0 },
    won: { type: Number, default: 0 },
    lost: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    setsWon: { type: Number, default: 0 },
    setsLost: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    gamesLost: { type: Number, default: 0 },
  },
  { _id: false }
);

const TournamentGroupSchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TournamentTeam",
      },
    ],
    standings: [StandingSchema],
  },
  { timestamps: true }
);

TournamentGroupSchema.index({ tournamentId: 1, name: 1 }, { unique: true });

export default mongoose.model("TournamentGroup", TournamentGroupSchema);
