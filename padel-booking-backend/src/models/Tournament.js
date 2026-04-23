import mongoose from "mongoose";

const TournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    category: { type: String, default: "", trim: true },
    format: { type: String, default: "groups_playoffs", trim: true },
    startDate: { type: String, required: true },
    endDate: { type: String, default: "" },
    registrationOpen: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "registration", "in_progress", "finished"],
      default: "draft",
    },
    champion: {
      teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TournamentTeam",
        default: null,
      },
      text: { type: String, default: "", trim: true },
    },
    rules: { type: String, default: "", trim: true },
    settings: {
      mode: {
        type: String,
        enum: ["singles", "doubles"],
        default: "doubles",
      },
      groupCount: { type: Number, default: 2, min: 1 },
      playoffQualifiersPerGroup: { type: Number, default: 2, min: 1 },
      hasThirdPlaceMatch: { type: Boolean, default: false },
      showSchedulePublicly: { type: Boolean, default: true },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

TournamentSchema.index({ isActive: 1, isPublished: 1 });
TournamentSchema.index({ status: 1 });

export default mongoose.model("Tournament", TournamentSchema);
