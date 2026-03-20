import AdminSlotRow from "./AdminSlotRow.jsx";

export default function AdminGrid({ grid, loading, onCancel, onPick }) {
  if (loading) {
    return <p className="px-4">Cargando reservas...</p>;
  }

  if (!grid?.length) {
    return <p className="px-4">No hay datos para esta fecha.</p>;
  }

  return (
    <main className="flex-1 px-4 pb-24">
      <div className="grid grid-cols-1 gap-6">
        <div className="flex gap-4 mb-2">
          <div className="w-16"></div>
          <div className="flex-1 text-center font-bold text-primary/70 text-sm">
            CANCHA 1
          </div>
          <div className="flex-1 text-center font-bold text-primary/70 text-sm">
            CANCHA 2
          </div>
        </div>

        {grid.map((slot) => (
          <AdminSlotRow
            key={slot.time}
            slot={slot}
            onCancel={onCancel}
            onPick={onPick}
          />
        ))}
      </div>
    </main>
  );
}