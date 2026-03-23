export default function AdminActions({ onOpenFixedBooking }) {
  return (
    <div className="px-4 pb-4">
      <button
        type="button"
        onClick={onOpenFixedBooking}
        className="w-full rounded-xl bg-primary font-bold px-4 py-3"
      >
        Crear turno fijo
      </button>
    </div>
  );
}