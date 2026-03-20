import { useEffect, useState } from "react";
import { createBooking } from "../api/bookings.js";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { getAdminGrid, cancelAdminBooking } from "../api/adminBookings.js";
import AdminHeader from "../components/AdminHeader.jsx";
import AdminDateSelector from "../components/AdminDateSelector.jsx";
import AdminGrid from "../components/AdminGrid.jsx";
import AdminBottomNav from "../components/AdminBottomNav.jsx";

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
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen pb-32">
      <AdminHeader />
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