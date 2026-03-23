export default function CopyBookingButton({ booking }) {
  async function handleCopy() {
    const text = [
      "Cristal Pádel",
      `Cancha ${booking.court}`,
      `Fecha: ${booking.date}`,
      `Hora: ${booking.startTime}`,
      `Nombre: ${booking.name} ${booking.lastName || ""}`.trim(),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      alert("Reserva copiada");
    } catch (error) {
      console.error("copy booking error:", error);
      alert("No se pudo copiar la reserva");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 font-semibold"
    >
      Copiar reserva
    </button>
  );
}