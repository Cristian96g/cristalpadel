import { downloadICS } from "../utils/calendar.js";

export default function AddToCalendarButton({
  date,
  startTime,
  court,
  durationMinutes = 90,
}) {
  function handleAddToCalendar() {
    downloadICS({
      title: `Reserva Cristal Pádel - Cancha ${court}`,
      description: `Tu reserva en Cristal Pádel quedó confirmada.\nCancha: ${court}\nFecha: ${date}\nHora: ${startTime}`,
      location: "Cristal Pádel",
      date,
      startTime,
      durationMinutes,
      filename: `reserva-cancha-${court}-${date}-${startTime}.ics`,
    });
  }

  return (
    <button
      type="button"
      onClick={handleAddToCalendar}
      className="w-full rounded-xl bg-primary  font-bold px-4 py-3"
    >
      Agregar al calendario
    </button>
  );
}