import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // HH:mm
    court: { type: Number, required: true, enum: [1, 2] },

    name: { type: String, required: true, trim: true, maxlength: 30 },
    lastName: { type: String, required: true, trim: true, maxlength: 30 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },

    status: {
      type: String,
      enum: ["pending_payment", "confirmed", "cancelled", "expired"],
      default: "confirmed",
      required: true,
    },

    expiresAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },

    isBlock: { type: Boolean, default: false },

    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: null },

     // 👇 ACA VA (importante)
    fixedBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FixedBooking",
      default: null,
    },
  },
  { timestamps: true }
);

// Mantiene compatibilidad con el indice existente. Las pendientes vigentes se
// bloquean en la logica de create/availability para evitar migraciones de indice.
BookingSchema.index(
  { date: 1, startTime: 1, court: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "confirmed" },
  }
);

export default mongoose.model("Booking", BookingSchema);
