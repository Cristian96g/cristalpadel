import { useCallback, useEffect, useState } from "react";
import TurnsTabs from "../components/TurnsTabs.jsx";
import BookingsList from "../components/BookingsList.jsx";
import FixedBookingsList from "../components/FixedBookingsList.jsx";
import { confirmAdminBooking, getBookingsByDate } from "../api/adminBookings.js";
import { getFixedBookings } from "../api/fixedBookings.js";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

const WEEKDAY_LABELS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export default function TurnsPage() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [fixedBookings, setFixedBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingFixed, setLoadingFixed] = useState(true);
  const [date, setDate] = useState(todayISO());
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const data = await getBookingsByDate(date);
      setBookings(data.bookings || []);
    } catch (err) {
      console.error("bookings list error:", err);
      setError(err?.data?.message || err.message || "No se pudieron cargar los turnos");
    } finally {
      setLoadingBookings(false);
    }
  }, [date]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function handleConfirmExpired(booking) {
    const ok = window.confirm(
      "¿Confirmar manualmente esta reserva vencida? Solo se permitira si el horario no fue tomado por otra reserva confirmada."
    );
    if (!ok) return;

    setMessage("");
    setError("");
    try {
      await confirmAdminBooking(booking._id);
      setMessage("Reserva confirmada manualmente.");
      await loadBookings();
    } catch (err) {
      setError(err?.data?.message || err.message || "No se pudo confirmar la reserva vencida");
    }
  }

  useEffect(() => {
    async function loadFixedBookings() {
      setLoadingFixed(true);
      try {
        const data = await getFixedBookings();
        const parsed = (data.fixedBookings || []).map((item) => ({
          ...item,
          weekdayLabel: WEEKDAY_LABELS[item.weekday] || "-",
        }));
        setFixedBookings(parsed);
      } catch (error) {
        console.error("fixed bookings list error:", error);
      } finally {
        setLoadingFixed(false);
      }
    }

    loadFixedBookings();
  }, []);

  return (
    <div>
      <div className="px-4 py-6 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex flex-col gap-2">
          <p className="text-primary text-sm font-semibold tracking-wider uppercase">
            Gestión
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">Turnos</h1>

          {activeTab === "bookings" && (
            <div className="pt-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 [color-scheme:dark]"
              />
            </div>
          )}
        </div>
      </div>

      <TurnsTabs activeTab={activeTab} onChangeTab={setActiveTab} />

      {activeTab === "bookings" ? (
        <>
          <div className="px-4 space-y-2">
            {message ? (
              <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
                {error}
              </p>
            ) : null}
          </div>
          <BookingsList
            bookings={bookings}
            loading={loadingBookings}
            statusFilter={statusFilter}
            onChangeStatusFilter={setStatusFilter}
            onConfirmExpired={handleConfirmExpired}
          />
        </>
      ) : (
        <FixedBookingsList
          fixedBookings={fixedBookings}
          loading={loadingFixed}
        />
      )}
    </div>
  );
}
