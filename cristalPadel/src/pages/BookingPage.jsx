import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookingHeader from "../components/BookingHeader.jsx";
import BookingHome from "../components/BookingHome.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import useAvailability from "../hooks/useAvailability.js";
import { createBooking, getBooking } from "../api/bookings.js";
import {
  clearPendingBooking,
  getPendingBooking,
  savePendingBooking,
} from "../utils/pendingBookingStorage.js";
import { formatDisplayDate } from "../utils/dates.js";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

export default function BookingPage({ activeTournament }) {
  const navigate = useNavigate();
  const [date, setDate] = useState(todayISO());
  const { data, loading, error, refresh } = useAvailability(date);
  const [selected, setSelected] = useState(null);
  const [pendingBooking, setPendingBooking] = useState(() => {
    const pending = getPendingBooking();
    if (!pending?.expiresAt) return pending;
    return new Date(pending.expiresAt).getTime() > Date.now() ? pending : null;
  });

  useEffect(() => {
    async function syncPendingBooking() {
      const pending = getPendingBooking();
      if (!pending?.bookingId) return;

      if (pending.expiresAt && new Date(pending.expiresAt).getTime() <= Date.now()) {
        clearPendingBooking();
        setPendingBooking(null);
        return;
      }

      try {
        const data = await getBooking(pending.bookingId);

        if (data.booking?.status !== "pending_payment") {
          clearPendingBooking();
          setPendingBooking(null);
          return;
        }

        const updated = {
          bookingId: data.booking._id,
          date: data.booking.date,
          startTime: data.booking.startTime,
          court: data.booking.court,
          name: data.booking.name,
          expiresAt: data.booking.expiresAt,
        };

        savePendingBooking(updated);
        setPendingBooking(updated);
      } catch (err) {
        console.error("sync pending booking error:", err);
        clearPendingBooking();
        setPendingBooking(null);
      }
    }

    syncPendingBooking();
  }, []);

 async function handleConfirm({ name, lastName, phone }) {
  try {
    const response = await createBooking({
      date,
      startTime: selected.startTime,
      court: selected.court,
      name,
      lastName,
      phone,
    });

    const booking = response.booking;
    savePendingBooking({
      bookingId: booking._id,
      date: booking.date,
      startTime: booking.startTime,
      court: booking.court,
      name,
      expiresAt: booking.expiresAt,
    });
    setPendingBooking({
      bookingId: booking._id,
      date: booking.date,
      startTime: booking.startTime,
      court: booking.court,
      name,
      expiresAt: booking.expiresAt,
    });

    setSelected(null);
    await refresh();
    navigate(`/reserva/${booking._id}/pendiente`);
    return { ok: true };
  } catch (e) {
    if (e.code === 409) {
      await refresh();
      return { ok: false, message: "Ese turno se reservó recién. Elegí otro 🙌" };
    }

    return { ok: false, message: e.message || "Error creando la reserva" };
  }
}

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 pb-32">
      <BookingHeader
        date={date}
        onChangeDate={setDate}
        activeTournament={activeTournament}
      />
      {pendingBooking?.bookingId ? (
        <div className="px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(`/reserva/${pendingBooking.bookingId}/pendiente`)}
            className="w-full rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-left"
          >
            <p className="text-sm font-extrabold text-amber-500">
              Tenes una reserva pendiente de confirmacion
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {formatDisplayDate(pendingBooking.date)} · {pendingBooking.startTime} · Cancha {pendingBooking.court}
            </p>
            <p className="mt-2 text-xs font-bold text-amber-500">
              Toca aca para ver los pasos a seguir
            </p>
          </button>
        </div>
      ) : null}
      <BookingHome
        loading={loading}
        error={error}
        data={data}
        onPick={setSelected}
      />
      <ConfirmModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onConfirm={handleConfirm}
        subtitle={
          selected
            ? `Cancha ${selected.court} • ${formatDisplayDate(date)} • ${selected.startTime}`
            : ""
        }
      />
    </div>
  );
}
