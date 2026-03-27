import { useEffect, useState } from "react";
import AdminHeader from "../components/AdminHeader.jsx";
import TurnsTabs from "../components/TurnsTabs.jsx";
import BookingsList from "../components/BookingsList.jsx";
import FixedBookingsList from "../components/FixedBookingsList.jsx";
import AdminBottomNav from "../components/AdminBottomNav.jsx";
import { getBookingsByDate } from "../api/adminBookings.js";
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

export default function TurnsPage({
  notifications = [],
  unreadCount = 0,
  onOpenNotifications,
  onNotificationClick,
  onChangeSection,
}) {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [fixedBookings, setFixedBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingFixed, setLoadingFixed] = useState(true);
  const [date, setDate] = useState(todayISO());

  useEffect(() => {
    async function loadBookings() {
      setLoadingBookings(true);
      try {
        const data = await getBookingsByDate(date);
        setBookings(data.bookings || []);
      } catch (error) {
        console.error("bookings list error:", error);
      } finally {
        setLoadingBookings(false);
      }
    }

    loadBookings();
  }, [date]);

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
    <div className="w-full min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 pb-32">
      <AdminHeader
        unreadCount={unreadCount}
        notifications={notifications}
        onOpenNotifications={onOpenNotifications}
        onNotificationClick={onNotificationClick}
      />

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
                className="w-full rounded-xl border text-white border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3"
              />
            </div>
          )}
        </div>
      </div>

      <TurnsTabs activeTab={activeTab} onChangeTab={setActiveTab} />

      {activeTab === "bookings" ? (
        <BookingsList bookings={bookings} loading={loadingBookings} />
      ) : (
        <FixedBookingsList fixedBookings={fixedBookings} loading={loadingFixed} />
      )}

      <AdminBottomNav current="turnos" onChange={onChangeSection} />
    </div>
  );
}