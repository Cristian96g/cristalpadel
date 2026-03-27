import { useEffect, useState } from "react";
import { createBooking } from "../api/bookings.js";
import { createFixedBooking } from "../api/fixedBookings.js";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { getAdminGrid, cancelAdminBooking } from "../api/adminBookings.js";
import AdminHeader from "../components/AdminHeader.jsx";
import AdminDateSelector from "../components/AdminDateSelector.jsx";
import AdminGrid from "../components/AdminGrid.jsx";
import AdminBottomNav from "../components/AdminBottomNav.jsx";
import AdminActions from "../components/AdminActions.jsx";
import FixedBookingModal from "../components/FixedBookingModal.jsx";
import BookingActionsModal from "../components/BookingActionsModal.jsx";
import { socket } from "../lib/socket.js";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

function formatDateNice(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d); // ✅ LOCAL

  const dias = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ];

  const diaSemana = dias[date.getDay()];
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");

  return `${diaSemana} ${dia}/${mes}`;
}

export default function AdminPage() {
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [grid, setGrid] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fixedModalOpen, setFixedModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [highlightedBookingId, setHighlightedBookingId] = useState(null);

  async function loadGrid() {
    setLoading(true);
    try {
      const data = await getAdminGrid(date);
      setGrid(data.grid || []);
    } catch (error) {
      console.error("admin load error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGrid();
  }, [date]);

  useEffect(() => {
    function handleBookingCreated(payload) {
      setNotifications((prev) => [
        {
          id: `created-${payload.bookingId}-${Date.now()}`,
          type: "created",
          message: `Nueva reserva para el ${formatDateNice(payload.date)} a las ${payload.startTime} · Cancha ${payload.court}`,
          payload,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setUnreadCount((prev) => prev + 1);

      if (payload.date === date) {
        loadGrid();
      }
    }

    function handleBookingCancelled(payload) {
      setNotifications((prev) => [
        {
          id: `cancelled-${payload.bookingId}-${Date.now()}`,
          type: "cancelled",
          message: `Reserva cancelada para el ${formatDateNice(payload.date)} a las ${payload.startTime} · Cancha ${payload.court}`,
          payload,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setUnreadCount((prev) => prev + 1);

      if (payload.date === date) {
        loadGrid();
      }
    }

    socket.on("booking:created", handleBookingCreated);
    socket.on("booking:cancelled", handleBookingCancelled);

    return () => {
      socket.off("booking:created", handleBookingCreated);
      socket.off("booking:cancelled", handleBookingCancelled);
    };
  }, [date]);

async function handleCancel(id) {
  try {
    await cancelAdminBooking(id, "Cancelado por admin");
    await loadGrid();
  } catch (error) {
    console.error("cancel error:", error);
    alert("No se pudo cancelar la reserva");
  }
}

  async function handleCreateBooking({ name, lastName, phone }) {
    try {
      await createBooking({
        date,
        startTime: selected.startTime,
        court: selected.court,
        name,
        lastName,
        phone,
      });

      setSelected(null);
      await loadGrid();
      return { ok: true };
    } catch (e) {
      if (e.code === 409) {
        await loadGrid();
        return { ok: false, message: "Ese turno ya fue reservado." };
      }

      return { ok: false, message: e.message || "Error creando la reserva" };
    }
  }

  async function handleCreateFixedBooking(payload) {
    try {
      await createFixedBooking(payload);
      await loadGrid();
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error?.data?.message || error.message || "No se pudo crear el turno fijo",
      };
    }
  }

  function handleNotificationClick(notification) {
    if (!notification?.payload) return;

    const { date: notificationDate, bookingId } = notification.payload;

    if (notificationDate) {
      setDate(notificationDate);
    }

    if (bookingId) {
      setHighlightedBookingId(bookingId);

      setTimeout(() => {
        setHighlightedBookingId(null);
      }, 4000);
    }
  }

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 pb-32">
      <AdminHeader
        unreadCount={unreadCount}
        notifications={notifications}
        onOpenNotifications={() => setUnreadCount(0)}
        onNotificationClick={handleNotificationClick}
      />

      <AdminDateSelector date={date} onChangeDate={setDate} />

      <AdminActions onOpenFixedBooking={() => setFixedModalOpen(true)} />

      <AdminGrid
        grid={grid}
        loading={loading}
        onPick={setSelected}
        onOpenBooking={setSelectedBooking}
        highlightedBookingId={highlightedBookingId}
      />

      <ConfirmModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onConfirm={handleCreateBooking}
        subtitle={
          selected
            ? `Cancha ${selected.court} • ${date} • ${selected.startTime}`
            : ""
        }
      />

      <FixedBookingModal
        open={fixedModalOpen}
        onClose={() => setFixedModalOpen(false)}
        onSubmit={handleCreateFixedBooking}
      />

      <AdminBottomNav current="reservas" />
      <BookingActionsModal
        open={Boolean(selectedBooking)}
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onCancel={handleCancel}
      />
    </div>
  );
}