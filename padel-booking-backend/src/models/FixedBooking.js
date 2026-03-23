import mongoose from "mongoose";

const FixedBookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    lastName: { type: String, default: "", trim: true },
    phone: { type: String, required: true, trim: true },

    court: { type: Number, required: true, enum: [1, 2] },

    weekday: {
      type: Number,
      required: true,
      min: 0,
      max: 6, // 0 domingo, 1 lunes, 2 martes...
    },

    startTime: { type: String, required: true }, // "16:00"
    durationMinutes: { type: Number, default: 90 },

    startDate: { type: String, required: true }, // YYYY-MM-DD
    endDate: { type: String, default: null },

    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("FixedBooking", FixedBookingSchema);