import Booking from "../models/Booking.js";
import { generateStartTimes, addMinutes } from "../utils/slots.js";
import { SLOT_MINUTES, OPEN_TIME, CLOSE_TIME } from "../config/schedule.js";
import { ACTIVE_BOOKING_STATUSES, expirePendingBookings, isWeekendDate } from "../utils/bookings.js";
import { isValidDateString } from "../utils/validation.js";

function isPastTimeForDate(date, startTime) {
  const dt = new Date(`${date}T${startTime}:00`);
  return dt.getTime() < Date.now();
}

export async function getAvailability(req, res) {
  try {
    const { date } = req.query;
    if (!date || !isValidDateString(date)) return res.status(400).json({ message: "date required" });

    await expirePendingBookings({ date });

    if (isWeekendDate(date)) {
      return res.json({
        date,
        slotMinutes: SLOT_MINUTES,
        openTime: OPEN_TIME,
        closeTime: CLOSE_TIME,
        closed: true,
        message: "Los sabados y domingos no estan disponibles para reserva online.",
        slots: [],
      });
    }

    const startTimes = generateStartTimes({
      openTime: OPEN_TIME,
      closeTime: CLOSE_TIME,
      slotMinutes: SLOT_MINUTES,
    });

    const booked = await Booking.find(
      { date, status: { $in: ACTIVE_BOOKING_STATUSES } },
      { startTime: 1, court: 1, status: 1, expiresAt: 1 }
    ).lean();

    const taken = new Set(booked.map((b) => `${b.startTime}-${b.court}`));

    const slots = startTimes.map((time) => ({
      startTime: time,
      endTime: addMinutes(time, SLOT_MINUTES),
      courts: [1, 2].map((courtNumber) => {
        const isTaken = taken.has(`${time}-${courtNumber}`);
        const isPast = isPastTimeForDate(date, time);

        return {
          court: courtNumber,
          status: isTaken ? "booked" : isPast ? "past" : "available",
        };
      }),
    }));

    return res.json({
      date,
      slotMinutes: SLOT_MINUTES,
      openTime: OPEN_TIME,
      closeTime: CLOSE_TIME,
      slots,
    });
  } catch (err) {
    console.error("availability error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
