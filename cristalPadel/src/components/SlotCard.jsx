export default function SlotCard({
  status,
  booking = null,
  onPick,
  onOpenBooking,
  clickable = false,
  highlighted = false,
}) {
  function handleCardClick() {
    if (status === "available" && clickable && onPick) {
      onPick();
      return;
    }

    if (status === "booked" && booking && onOpenBooking) {
      onOpenBooking(booking);
    }
  }

  if (status === "booked" && booking) {
    return (
      <button
        type="button"
        onClick={handleCardClick}
        className={[
          "flex-1 min-h-[88px] bg-slate-900/60 border p-3 rounded-xl text-left transition-all",
          highlighted
            ? "border-primary shadow-[0_0_0_2px_rgba(23,84,207,0.35)] ring-2 ring-primary/40"
            : "border-slate-800 hover:bg-slate-900/80",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold text-slate-100">
            {booking.name} {booking.lastName || ""}
          </p>

          {booking.fixedBookingId && (
            <span className="shrink-0 rounded-full bg-primary/15 border border-primary/30 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
              Turno fijo
            </span>
          )}
        </div>

        <p className="text-[10px] text-slate-400 mt-1 break-all">
          {booking.phone}
        </p>

        <div className="mt-2 flex items-center gap-1">
          <span className={`size-2 rounded-full ${booking.status === "pending_payment" ? "bg-amber-400" : "bg-primary"}`}></span>
          <span className={`text-[10px] uppercase font-bold ${booking.status === "pending_payment" ? "text-amber-400" : "text-primary"}`}>
            {booking.status === "pending_payment" ? "Pendiente" : "Confirmado"}
          </span>
        </div>
      </button>
    );
  }

  if (status === "available") {
    return (
      <button
        type="button"
        onClick={handleCardClick}
        className="flex-1 min-h-[88px] bg-primary/10 border-2 border-dashed border-primary/30 rounded-xl flex flex-col items-center justify-center gap-1 p-3 cursor-pointer hover:bg-primary/20 transition-colors outline-none"
      >
        <span
          className="material-symbols-outlined text-primary text-[28px] leading-none notranslate"
          translate="no"
        >
          add_circle
        </span>

        <span className="text-[10px] font-black text-primary uppercase leading-none">
          Disponible
        </span>
      </button>
    );
  }

  if (status === "past") {
    return (
      <div className="flex-1 min-h-[88px] bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center opacity-80">
        <span
          className="material-symbols-outlined text-slate-500 mb-1 notranslate"
          translate="no"
        >
          schedule
        </span>
        <span className="text-[10px] font-black text-slate-500 uppercase text-center leading-none">
          Horario pasado
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-[88px] bg-primary/5 border border-primary/10 p-3 rounded-xl flex flex-col items-center justify-center opacity-70">
      <span
        className="material-symbols-outlined text-primary/60 mb-1 notranslate"
        translate="no"
      >
        lock
      </span>
      <span className="text-[10px] font-black text-primary/60 uppercase">
        Ocupado
      </span>
    </div>
  );
}
