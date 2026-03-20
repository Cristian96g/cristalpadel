export default function SlotCard({
  status,
  booking = null,
  onPick,
  onCancel,
  clickable = false,
  showCancel = false,
}) {
  if (status === "booked" && booking) {
    return (
      <div className="flex-1 bg-slate-900/60 border border-slate-800 p-3 rounded-lg relative group">
        {showCancel && (
          <button
            onClick={() => onCancel?.(booking._id)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full size-6 flex items-center justify-center shadow-lg"
          >
            <span className="material-symbols-outlined text-sm" translate="no">close</span>
          </button>
        )}

        <p className="text-sm font-bold text-slate-100">{booking.name}</p>
        <p className="text-[10px] text-slate-400">{booking.phone}</p>

        <div className="mt-2 flex items-center gap-1">
          <span className="size-2 rounded-full bg-primary" translate="no"></span>
          <span className="text-[10px] uppercase font-bold text-primary" translate="no">
            Confirmado
          </span>
        </div>
      </div>
    );
  }

 if (status === "available") {
  const Tag = clickable ? "button" : "div";

  return (
    <Tag
      type={clickable ? "button" : undefined}
      onClick={clickable ? onPick : undefined}
      className="flex-1 appearance-none bg-primary/10 border-2 border-dashed border-primary/30 rounded-lg flex flex-col items-center justify-center p-3 cursor-pointer hover:bg-primary/20 transition-colors outline-none"
    >
      <span className="material-symbols-outlined text-primary mb-1" translate="no">
        add_circle
      </span>
      <span className="text-[10px] font-black text-primary uppercase" translate="no">
        Disponible
      </span>
    </Tag>
  );
}

  return (
    <div className="flex-1 bg-primary/5 border border-primary/10 p-3 rounded-lg flex flex-col items-center justify-center opacity-70">
      <span className="material-symbols-outlined text-primary/60 mb-1" translate="no">
        lock
      </span>
      <span className="text-[10px] font-black text-primary/60 uppercase" translate="no">
        Ocupado
      </span>
    </div>
  );
}