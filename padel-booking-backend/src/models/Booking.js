import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // HH:mm
    court: { type: Number, required: true, enum: [1, 2] },

    name: { type: String, required: true, trim: true, maxlength: 12 },
    lastName: {type: String, required: true, trim: true, maxlength:12},
    phone: { type: String, required: true, trim: true, maxlength: 14 },

    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
      required: true,
    },

    isBlock: { type: Boolean, default: false },

    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: null },
  },
  { timestamps: true }
);

// Solo evita duplicados entre reservas confirmadas
BookingSchema.index(
  { date: 1, startTime: 1, court: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "confirmed" },
  }
);

export default mongoose.model("Booking", BookingSchema);