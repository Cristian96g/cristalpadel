import Booking from "../models/Booking.js";
import { generateStartTimes } from "../utils/slots.js";
import { SLOT_MINUTES, OPEN_TIME, CLOSE_TIME } from "../config/schedule.js";
import { getIO } from "../socket.js";
import { ACTIVE_BOOKING_STATUSES, expirePendingBookings } from "../utils/bookings.js";
import {
  isValidDateString,
  isValidObjectId,
  isValidPhone,
  normalizePhone,
  normalizeText,
} from "../utils/validation.js";

function isPastSlot(date, startTime) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = startTime.split(":").map(Number);
  const slotDate = new Date(y, m - 1, d, hh, mm, 0, 0);
  return slotDate.getTime() < Date.now();
}

export async function getAdminGrid(req, res) {
  try {
    const { date } = req.query;

    if (!date || !isValidDateString(date)) {
      return res.status(400).json({ message: "date required" });
    }

    await expirePendingBookings({ date });

    const startTimes = generateStartTimes({
      openTime: OPEN_TIME,
      closeTime: CLOSE_TIME,
      slotMinutes: SLOT_MINUTES,
    });

    const bookings = await Booking.find({
      date,
      status: { $in: ACTIVE_BOOKING_STATUSES },
    })
      .sort({ startTime: 1, court: 1 })
      .lean();

    const bookingMap = new Map();
    for (const booking of bookings) {
      bookingMap.set(`${booking.startTime}-${booking.court}`, booking);
    }

    const grid = startTimes.map((time) => {
      const court1 = bookingMap.get(`${time}-1`);
      const court2 = bookingMap.get(`${time}-2`);

      return {
        time,
        past: isPastSlot(date, time),
        courts: [
          court1
            ? {
                court: 1,
                status: "booked",
                booking: {
                  _id: court1._id,
                  name: court1.name || "",
                  lastName: court1.lastName || "",
                  phone: court1.phone || "",
                  status: court1.status,
                  expiresAt: court1.expiresAt,
                  date: court1.date,
                  startTime: court1.startTime,
                  court: court1.court,
                },
              }
            : {
                court: 1,
                status: "available",
                booking: null,
              },

          court2
            ? {
                court: 2,
                status: "booked",
                booking: {
                  _id: court2._id,
                  name: court2.name || "",
                  lastName: court2.lastName || "",
                  phone: court2.phone || "",
                  status: court2.status,
                  expiresAt: court2.expiresAt,
                  date: court2.date,
                  startTime: court2.startTime,
                  court: court2.court,
                },
              }
            : {
                court: 2,
                status: "available",
                booking: null,
              },
        ],
      };
    });

    return res.json({
      date,
      grid,
    });
  } catch (error) {
    console.error("admin grid error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function cancelAdminBooking(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Reserva invalida" });
    }

    const booking = await Booking.findById(id).lean();

    if (!booking) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "La reserva ya está cancelada" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "cancelled",
          cancelledAt: new Date(),
          cancelReason: reason ? normalizeText(reason, 120) : "Cancelado por admin",
        },
      },
      {
        new: true,
        runValidators: false,
      }
    );

    const io = getIO();

    io.emit("booking:cancelled", {
      bookingId: updatedBooking._id,
      date: updatedBooking.date,
      startTime: updatedBooking.startTime,
      court: updatedBooking.court,
      cancelledAt: updatedBooking.cancelledAt,
    });

    return res.json({
      message: "Reserva cancelada correctamente",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("cancel booking error FULL:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function createAdminBooking(req, res) {
  try {
    const { date, startTime, court, name, lastName, phone } = req.body || {};

    if (!date || !startTime || !court || !name || !lastName || !phone) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    if (!isValidDateString(date)) {
      return res.status(400).json({ message: "Fecha invalida" });
    }

    const courtNum = Number(court);
    if (![1, 2].includes(courtNum)) {
      return res.status(400).json({ message: "Cancha invalida" });
    }

    const cleanName = normalizeText(name, 30);
    const cleanLastName = normalizeText(lastName, 30);
    const cleanPhone = normalizePhone(phone);

    if (cleanName.length < 3 || cleanLastName.length < 3 || !isValidPhone(cleanPhone)) {
      return res.status(400).json({ message: "Datos invalidos" });
    }

    const allowed = generateStartTimes({
      openTime: OPEN_TIME,
      closeTime: CLOSE_TIME,
      slotMinutes: SLOT_MINUTES,
    });

    if (!allowed.includes(startTime)) {
      return res.status(400).json({ message: "Horario invalido" });
    }

    await expirePendingBookings({ date });

    const existing = await Booking.findOne({
      date,
      startTime,
      court: courtNum,
      status: { $in: ACTIVE_BOOKING_STATUSES },
    }).lean();

    if (existing) {
      return res.status(409).json({ message: "Ese horario ya esta ocupado" });
    }

    const booking = await Booking.create({
      date,
      startTime,
      court: courtNum,
      name: cleanName,
      lastName: cleanLastName,
      phone: cleanPhone,
      status: "confirmed",
      confirmedAt: new Date(),
      expiresAt: null,
      isBlock: false,
    });

    getIO().emit("booking:created", {
      bookingId: booking._id,
      date: booking.date,
      startTime: booking.startTime,
      court: booking.court,
      name: booking.name,
      lastName: booking.lastName || "",
      phone: booking.phone,
      status: booking.status,
      createdAt: booking.createdAt,
    });

    return res.status(201).json({ booking });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Ese horario ya esta ocupado" });
    }

    console.error("admin create booking error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function confirmAdminBooking(req, res) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Reserva invalida" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    if (!["pending_payment", "expired"].includes(booking.status)) {
      return res.status(400).json({ message: "Solo se pueden confirmar reservas pendientes o vencidas" });
    }

    const conflictingBooking = await Booking.findOne({
      _id: { $ne: booking._id },
      date: booking.date,
      startTime: booking.startTime,
      court: booking.court,
      status: "confirmed",
    }).lean();

    if (conflictingBooking) {
      return res.status(409).json({
        message: "No se puede confirmar: ese horario ya fue tomado por otra reserva confirmada.",
      });
    }

    booking.status = "confirmed";
    booking.expiresAt = null;
    booking.confirmedAt = new Date();

    await booking.save();

    const io = getIO();
    io.emit("booking:confirmed", {
      bookingId: booking._id,
      date: booking.date,
      startTime: booking.startTime,
      court: booking.court,
    });

    return res.json({
      message: "Reserva confirmada correctamente",
      booking,
    });
  } catch (error) {
    console.error("confirm booking error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getAdminBookingsByDate(req, res) {
  try {
    const { date } = req.query;

    if (!date || !isValidDateString(date)) {
      return res.status(400).json({ message: "date required" });
    }

    await expirePendingBookings({ date });

    const bookings = await Booking.find({ date })
      .sort({ startTime: 1, court: 1, createdAt: 1 })
      .lean();

    return res.json({ bookings });
  } catch (error) {
    console.error("admin bookings by date error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
