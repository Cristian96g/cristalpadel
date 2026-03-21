import Booking from "../models/Booking.js";
import { generateStartTimes } from "../utils/slots.js";
import { SLOT_MINUTES, OPEN_TIME, CLOSE_TIME } from "../config/schedule.js";
import { getIO } from "../socket.js";

function isPastSlot(date, startTime) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = startTime.split(":").map(Number);
  const slotDate = new Date(y, m - 1, d, hh, mm, 0, 0);
  return slotDate.getTime() < Date.now();
}

export async function getAdminGrid(req, res) {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "date required" });
    }

    const startTimes = generateStartTimes({
      openTime: OPEN_TIME,
      closeTime: CLOSE_TIME,
      slotMinutes: SLOT_MINUTES,
    });

    const bookings = await Booking.find({
      date,
      status: "confirmed",
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
                  name: court1.name,
                  phone: court1.phone,
                  status: court1.status,
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
                  name: court2.name,
                  phone: court2.phone,
                  status: court2.status,
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
          cancelReason: reason ? String(reason).trim() : "Cancelado por admin",
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