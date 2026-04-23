import mongoose from "mongoose";

const TournamentTeamSchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    player1Name: { type: String, required: true, trim: true },
    player2Name: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true },
    seed: { type: Number, default: null },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TournamentGroup",
      default: null,
    },
    isApproved: { type: Boolean, default: true },
    isConfirmed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TournamentTeamSchema.index({ tournamentId: 1, groupId: 1 });
TournamentTeamSchema.index({ tournamentId: 1, seed: 1 });

export default mongoose.model("TournamentTeam", TournamentTeamSchema);
