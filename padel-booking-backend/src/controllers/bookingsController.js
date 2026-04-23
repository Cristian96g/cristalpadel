import Booking from "../models/Booking.js";
import { generateStartTimes } from "../utils/slots.js";
import { SLOT_MINUTES, OPEN_TIME, CLOSE_TIME } from "../config/schedule.js";
import { BOOKING_PENDING_MINUTES, getBookingPaymentInfo } from "../config/bookingPayment.js";
import { ACTIVE_BOOKING_STATUSES, expirePendingBookings, isWeekendDate } from "../utils/bookings.js";
import { getIO } from "../socket.js";
import {
  isValidDateString,
  isValidObjectId,
  isValidPhone,
  normalizePhone,
  normalizeText,
} from "../utils/validation.js";

function isPastSlot(date, startTime) {
  const slotDate = new Date(`${date}T${startTime}:00`);
  return slotDate.getTime() < Date.now();
}

function publicBookingPayload(booking) {
  if (!booking) return null;

  return {
    _id: booking._id,
    date: booking.date,
    startTime: booking.startTime,
    court: booking.court,
    name: booking.name,
    lastName: booking.lastName || "",
    status: booking.status,
    expiresAt: booking.expiresAt,
    confirmedAt: booking.confirmedAt,
    cancelledAt: booking.cancelledAt,
  };
}

export async function createBooking(req, res) {
  try {
    const { date, startTime, court, name, lastName, phone } = req.body;

    if (!date || !startTime || !court || !name || !lastName || !phone) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (!isValidDateString(date)) {
      return res.status(400).json({ message: "Invalid date format (YYYY-MM-DD)" });
    }

    if (isWeekendDate(date)) {
      return res.status(400).json({
        message: "Los sabados y domingos no estan disponibles para reserva online.",
      });
    }

    const courtNum = Number(court);
    if (![1, 2].includes(courtNum)) {
      return res.status(400).json({ message: "Invalid court (1 or 2)" });
    }

    const cleanName = normalizeText(name, 30);
    const cleanLastName = normalizeText(lastName, 30);
    const cleanPhone = normalizePhone(phone);

    if (cleanName.length < 3) {
      return res.status(400).json({ message: "Invalid name" });
    }

    if (cleanLastName.length < 3) {
      return res.status(400).json({ message: "Invalid last name" });
    }

    if (!isValidPhone(cleanPhone)) {
      return res.status(400).json({ message: "Invalid phone" });
    }

    const allowed = generateStartTimes({
      openTime: OPEN_TIME,
      closeTime: CLOSE_TIME,
      slotMinutes: SLOT_MINUTES,
    });

    if (!allowed.includes(startTime)) {
      return res.status(400).json({ message: "Invalid startTime slot" });
    }

    if (isPastSlot(date, startTime)) {
      return res.status(400).json({ message: "No se puede reservar un turno pasado" });
    }

    await expirePendingBookings({ date });

    const existing = await Booking.findOne({
      date,
      startTime,
      court: courtNum,
      status: { $in: ACTIVE_BOOKING_STATUSES },
    }).lean();

    if (existing) {
      return res.status(409).json({ message: "Slot already booked" });
    }

    const requestedStatus = "pending_payment";
    const expiresAt = new Date(Date.now() + BOOKING_PENDING_MINUTES * 60 * 1000);

    const booking = await Booking.create({
      date,
      startTime,
      court: courtNum,
      name: cleanName,
      lastName: cleanLastName,
      phone: cleanPhone,
      status: requestedStatus,
      expiresAt,
      confirmedAt: requestedStatus === "confirmed" ? new Date() : null,
      isBlock: false,
    });

    const io = getIO();
    io.emit("booking:created", {
      bookingId: booking._id,
      date: booking.date,
      startTime: booking.startTime,
      court: booking.court,
      name: booking.name,
      lastName: booking.lastName || "",
      phone: booking.phone,
      status: booking.status,
      expiresAt: booking.expiresAt,
      createdAt: booking.createdAt,
    });

    return res.status(201).json({
      booking: publicBookingPayload(booking),
      payment: getBookingPaymentInfo(booking.expiresAt),
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Slot already booked" });
    }

    console.error("create booking error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function cancelBooking(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Reserva invalida" });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    if (booking.status !== "pending_payment") {
      return res.status(400).json({ message: "Solo se pueden cancelar reservas pendientes desde la web" });
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancelReason = reason ? normalizeText(reason, 120) : "Cancelada por el cliente";

    await booking.save();

    return res.json({
      message: "Reserva cancelada correctamente",
      booking: publicBookingPayload(booking),
    });
  } catch (error) {
    console.error("cancel booking error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getBookingById(req, res) {
  try {
    await expirePendingBookings();

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Reserva invalida" });
    }

    const booking = await Booking.findById(req.params.id).lean();

    if (!booking) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    return res.json({
      booking: publicBookingPayload(booking),
      payment: getBookingPaymentInfo(booking.expiresAt),
    });
  } catch (error) {
    console.error("get booking by id error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getBookingsByDate(req, res) {
  try {
    const { date } = req.query;

    if (!date || !isValidDateString(date)) {
      return res.status(400).json({ message: "date required" });
    }

    await expirePendingBookings({ date });

    const bookings = await Booking.find({ date })
      .sort({ startTime: 1, court: 1 })
      .lean();

    return res.json({ bookings: bookings.map(publicBookingPayload) });
  } catch (error) {
    console.error("get bookings by date error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
