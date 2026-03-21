import { useEffect, useState } from "react";
import { createBooking } from "../api/bookings.js";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { getAdminGrid, cancelAdminBooking } from "../api/adminBookings.js";
import AdminHeader from "../components/AdminHeader.jsx";
import AdminDateSelector from "../components/AdminDateSelector.jsx";
import AdminGrid from "../components/AdminGrid.jsx";
import AdminBottomNav from "../components/AdminBottomNav.jsx";
import { socket } from "../lib/socket.js";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

export default function AdminPage() {
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [grid, setGrid] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
          message: `Nueva reserva: Cancha ${payload.court} · ${payload.date} · ${payload.startTime}`,
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
          message: `Reserva cancelada: Cancha ${payload.court} · ${payload.date} · ${payload.startTime}`,
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
    const ok = window.confirm("¿Seguro que querés cancelar esta reserva?");
    if (!ok) return;

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

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 pb-32">
      <AdminHeader
        unreadCount={unreadCount}
        notifications={notifications}
        onOpenNotifications={() => setUnreadCount(0)}
      />

      <AdminDateSelector date={date} onChangeDate={setDate} />

      <AdminGrid
        grid={grid}
        loading={loading}
        onCancel={handleCancel}
        onPick={setSelected}
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

      <AdminBottomNav />
    </div>
  );
}