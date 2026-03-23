import { useState } from "react";
import BookingHeader from "../components/BookingHeader.jsx";
import BookingHome from "../components/BookingHome.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import useAvailability from "../hooks/useAvailability.js";
import { createBooking } from "../api/bookings.js";
import SuccessCard from "../components/SuccessCard.jsx";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

export default function BookingPage() {
  const [date, setDate] = useState(todayISO());
  const { data, loading, error, refresh } = useAvailability(date);
  const [selected, setSelected] = useState(null);
  const [successBooking, setSuccessBooking] = useState(null);

 async function handleConfirm({ name, lastName, phone }) {
  try {
    await createBooking({
      date,
      startTime: selected.startTime,
      court: selected.court,
      name,
      lastName,
      phone,
    });

    setSuccessBooking({
      date,
      startTime: selected.startTime,
      court: selected.court,
      name,
      lastName,
      phone,
    });

    setSelected(null);
    await refresh();
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
      <BookingHeader date={date} onChangeDate={setDate} />
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
            ? `Cancha ${selected.court} • ${date} • ${selected.startTime}`
            : ""
        }
      />
      <SuccessCard
        open={Boolean(successBooking)}
        booking={successBooking}
        onClose={() => setSuccessBooking(null)}
      />
      
    </div>
  );
}