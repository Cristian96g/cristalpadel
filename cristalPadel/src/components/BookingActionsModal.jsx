export default function BookingActionsModal({
  open,
  booking,
  onClose,
  onCancel,
}) {
  if (!open || !booking) return null;

  function handleCall() {
    if (!booking.phone) return;

    const cleanPhone = String(booking.phone).replace(/\D/g, "");
    window.open(`tel:${cleanPhone}`, "_self");
  }

  function handleWhatsApp() {
    if (!booking.phone) return;

    const cleanPhone = String(booking.phone).replace(/\D/g, "");
    const fullName = `${booking.name || ""} ${booking.lastName || ""}`.trim();

    const message = `Hola ${fullName || "cliente"}, te escribo de Cristal Pádel por tu reserva del ${booking.date} a las ${booking.startTime} en la cancha ${booking.court}.`;

    const url = `https://wa.me/549${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  }

  async function handleCancel() {
    const ok = window.confirm("¿Seguro que querés cancelar esta reserva?");
    if (!ok) return;

    await onCancel?.(booking._id);
    onClose?.();
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5">
        <div className="text-center space-y-2">
          <div className="mx-auto size-12 rounded-full bg-primary/15 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-primary notranslate"
              translate="no"
            >
              event
            </span>
          </div>

          <h3 className="text-xl font-bold">Acciones de la reserva</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gestioná el turno desde este panel.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-sm">
          <p>
            <strong>Nombre:</strong> {booking.name} {booking.lastName || ""}
          </p>

          <p>
            <strong>Teléfono:</strong> {booking.phone}
          </p>

          <p>
            <strong>Cancha:</strong> {booking.court}
          </p>

          <p>
            <strong>Fecha:</strong> {booking.date}
          </p>

          <p>
            <strong>Hora:</strong> {booking.startTime}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <span className="size-2 rounded-full bg-primary"></span>
            <span className="text-[11px] uppercase font-bold text-primary">
              Confirmado
            </span>

            {booking.fixedBookingId && (
              <span className="ml-auto shrink-0 rounded-full bg-primary/15 border border-primary/30 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                Turno fijo
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleCall}
            className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 font-semibold flex items-center justify-center gap-2"
          >
            <span
              className="material-symbols-outlined notranslate"
              translate="no"
            >
              call
            </span>
            Llamar
          </button>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="rounded-xl bg-green-600 text-white px-4 py-3 font-semibold flex items-center justify-center gap-2"
          >
            <span
              className="material-symbols-outlined notranslate"
              translate="no"
            >
              chat
            </span>
            WhatsApp
          </button>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full rounded-xl bg-red-500 text-white px-4 py-3 font-bold"
          >
            Cancelar turno
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}