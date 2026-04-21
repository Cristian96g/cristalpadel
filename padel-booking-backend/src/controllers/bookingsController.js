import Booking from "../models/Booking.js";
import { generateStartTimes } from "../utils/slots.js";
import { SLOT_MINUTES, OPEN_TIME, CLOSE_TIME } from "../config/schedule.js";
import { getIO } from "../socket.js";

const isValidDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

function isPastSlot(date, startTime) {
  const slotDate = new Date(`${date}T${startTime}:00`);
  return slotDate.getTime() < Date.now();
}

export async function createBooking(req, res) {
  try {
    const { date, startTime, court, name, lastName, phone } = req.body;

    if (!date || !startTime || !court || !name || !lastName || !phone) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (!isValidDate(date)) {
      return res.status(400).json({ message: "Invalid date format (YYYY-MM-DD)" });
    }

    const courtNum = Number(court);
    if (![1, 2].includes(courtNum)) {
      return res.status(400).json({ message: "Invalid court (1 or 2)" });
    }

    if (String(name).trim().length < 3) {
      return res.status(400).json({ message: "Invalid name" });
    }

    if (String(lastName).trim().length < 3) {
      return res.status(400).json({ message: "Invalid last name" });
    }

    if (String(phone).trim().length < 6) {
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

    const booking = await Booking.create({
      date,
      startTime,
      court: courtNum,
      name: String(name).trim(),
      lastName: lastName ? String(lastName).trim() : "",
      phone: String(phone).trim(),
      status: "confirmed",
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
      createdAt: booking.createdAt,
    });

    return res.status(201).json({ booking });
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
    const { reason } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "La reserva ya está cancelada" });
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancelReason = reason ? String(reason).trim() : null;

    await booking.save();

    return res.json({
      message: "Reserva cancelada correctamente",
      booking,
    });
  } catch (error) {
    console.error("cancel booking error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getBookingsByDate(req, res) {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "date required" });
    }

    const bookings = await Booking.find({ date })
      .sort({ startTime: 1, court: 1 })
      .lean();

    return res.json({ bookings });
  } catch (error) {
    console.error("get bookings by date error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}