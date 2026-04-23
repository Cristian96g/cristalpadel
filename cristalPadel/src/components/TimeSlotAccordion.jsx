import DownloadReceiptPdfButton from "./DownloadReceiptPdfButton.jsx";
import CopyBookingButton from "./CopyBookingButton.jsx";
import { formatDisplayDate } from "../utils/dates.js";

export default function SuccessCard({ open, booking, onClose }) {
  if (!open || !booking) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5">
        <div className="text-center space-y-2">
          <div className="mx-auto size-12 rounded-full bg-primary/15 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-primary notranslate"
              translate="no"
            >
              check_circle
            </span>
          </div>

          <h3 className="text-xl font-bold">¡Reserva confirmada!</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Guardá estos datos para tenerlos a mano.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-sm">
          <p><strong>Cancha:</strong> {booking.court}</p>
          <p><strong>Fecha:</strong> {formatDisplayDate(booking.date)}</p>
          <p><strong>Hora:</strong> {booking.startTime}</p>
          <p><strong>Nombre:</strong> {booking.name} {booking.lastName}</p>
        </div>

        <div className="space-y-3">
          <DownloadReceiptPdfButton booking={booking} />
          <CopyBookingButton booking={booking} />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 font-semibold"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
