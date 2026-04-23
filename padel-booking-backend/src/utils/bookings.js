import Booking from "../models/Booking.js";

export const ACTIVE_BOOKING_STATUSES = ["confirmed", "pending_payment"];

export function isWeekendDate(dateStr) {
  const [y, m, d] = String(dateStr).split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isExpiredPending(booking, now = new Date()) {
  return (
    booking?.status === "pending_payment" &&
    booking.expiresAt &&
    new Date(booking.expiresAt).getTime() <= now.getTime()
  );
}

export async function expirePendingBookings(filter = {}) {
  const now = new Date();
  await Booking.updateMany(
    {
      ...filter,
      status: "pending_payment",
      expiresAt: { $lte: now },
    },
    {
      $set: {
        status: "expired",
        cancelledAt: now,
        cancelReason: "Vencio el plazo para enviar la seña",
      },
    }
  );
}
