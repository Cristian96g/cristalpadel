import FixedBooking from "../models/FixedBooking.js";
import Booking from "../models/Booking.js";
import { generateRecurringDates } from "../utils/fixedBookings.js";

export async function createFixedBooking(req, res) {
  try {
    const {
      name,
      lastName,
      phone,
      court,
      weekday,
      startTime,
      startDate,
      endDate,
    } = req.body;

    if (!name || !phone || !court || weekday === undefined || !startTime || !startDate) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const fixedBooking = await FixedBooking.create({
      name: String(name).trim(),
      lastName: lastName ? String(lastName).trim() : "",
      phone: String(phone).trim(),
      court: Number(court),
      weekday: Number(weekday),
      startTime,
      startDate,
      endDate: endDate || null,
      active: true,
    });

    const dates = generateRecurringDates({
      weekday: Number(weekday),
      startDate,
      endDate,
    });

    const bookingsToInsert = [];

    for (const date of dates) {
      const existing = await Booking.findOne({
        date,
        startTime,
        court: Number(court),
        status: "confirmed",
      });

      if (existing) {
        return res.status(409).json({
          message: `Conflicto con una reserva existente en ${date} a las ${startTime}, cancha ${court}`,
        });
      }

      bookingsToInsert.push({
        date,
        startTime,
        court: Number(court),
        name: String(name).trim(),
        lastName: lastName ? String(lastName).trim() : "",
        phone: String(phone).trim(),
        status: "confirmed",
        fixedBookingId: fixedBooking._id,
      });
    }

    if (bookingsToInsert.length) {
      await Booking.insertMany(bookingsToInsert);
    }

    return res.status(201).json({
      message: "Turno fijo creado correctamente",
      fixedBooking,
      generatedCount: bookingsToInsert.length,
    });
  } catch (error) {
    console.error("create fixed booking error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getFixedBookings(req, res) {
  try {
    const fixedBookings = await FixedBooking.find().sort({ createdAt: -1 }).lean();
    return res.json({ fixedBookings });
  } catch (error) {
    console.error("get fixed bookings error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}