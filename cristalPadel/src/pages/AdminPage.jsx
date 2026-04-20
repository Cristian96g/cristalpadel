import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { createBooking } from "../api/bookings.js";
import { createFixedBooking } from "../api/fixedBookings.js";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { getAdminGrid, cancelAdminBooking } from "../api/adminBookings.js";
import AdminDateSelector from "../components/AdminDateSelector.jsx";
import AdminGrid from "../components/AdminGrid.jsx";
import AdminActions from "../components/AdminActions.jsx";
import FixedBookingModal from "../components/FixedBookingModal.jsx";
import BookingActionsModal from "../components/BookingActionsModal.jsx";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

export default function AdminPage() {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [grid, setGrid] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fixedModalOpen, setFixedModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [highlightedBookingId, setHighlightedBookingId] = useState(null);

  async function loadGrid(targetDate = date) {
    setLoading(true);
    try {
      const data = await getAdminGrid(targetDate);
      setGrid(data.grid || []);
    } catch (error) {
      console.error("admin load error:", error);

      if (error.status === 401 || error.status === 403) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGrid();
  }, [date]);

  useEffect(() => {
    const notificationDate = location.state?.notificationDate;
    const bookingId = location.state?.bookingId;

    if (notificationDate) {
      setDate(notificationDate);
    }

    if (bookingId) {
      setHighlightedBookingId(bookingId);

      setTimeout(() => {
        setHighlightedBookingId(null);
      }, 4000);
    }
  }, [location.state]);

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
        message:
          error?.data?.message || error.message || "No se pudo crear el turno fijo",
      };
    }
  }

  return (
    <div>
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

      <BookingActionsModal
        open={Boolean(selectedBooking)}
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onCancel={handleCancel}
      />
    </div>
  );
}