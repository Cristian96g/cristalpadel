import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBooking } from "../api/bookings.js";
import { clearPendingBooking, savePendingBooking } from "../utils/pendingBookingStorage.js";
import { formatDisplayDate, formatLongDate } from "../utils/dates.js";

function formatMoney(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatLimit(expiresAt) {
  if (!expiresAt) return "-";
  return new Date(expiresAt).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function minutesLeft(expiresAt) {
  if (!expiresAt) return null;
  return Math.max(Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 60000), 0);
}

function timeLeftLabel(expiresAt, now) {
  if (!expiresAt) return "";
  const diff = Math.max(new Date(expiresAt).getTime() - now, 0);
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function PendingBookingPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await getBooking(id);
        setData(result);
        if (result.booking?.status === "pending_payment") {
          savePendingBooking({
            bookingId: result.booking._id,
            date: result.booking.date,
            startTime: result.booking.startTime,
            court: result.booking.court,
            name: result.booking.name,
            expiresAt: result.booking.expiresAt,
          });
        } else {
          clearPendingBooking();
        }
      } catch (err) {
        setError(err?.data?.message || err.message || "No se pudo cargar la reserva");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const booking = data?.booking;
  const payment = data?.payment;
  const fullName = [booking?.name, booking?.lastName].filter(Boolean).join(" ");
  const left = minutesLeft(booking?.expiresAt);
  const dynamicLeft = timeLeftLabel(booking?.expiresAt, now);
  const statusText = booking?.status === "confirmed"
    ? "Reserva confirmada"
    : booking?.status === "expired"
      ? "Reserva vencida"
      : booking?.status === "cancelled"
        ? "Reserva cancelada"
        : "Reserva pendiente de confirmacion";

  const whatsappUrl = useMemo(() => {
    if (!booking || !payment?.whatsappNumber) return "";
    const message = `Hola, envie la seña de la reserva para el dia ${formatDisplayDate(booking.date)} a las ${booking.startTime}, cancha ${booking.court}. Mi nombre es ${fullName}. Adjunto comprobante.`;
    return `https://wa.me/${String(payment.whatsappNumber).replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
  }, [booking, payment, fullName]);

  async function copyAlias() {
    if (!payment?.transferAlias) return;
    await navigator.clipboard.writeText(payment.transferAlias);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function scrollToAlias() {
    document.getElementById("alias-section")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="w-full min-h-screen bg-background-light pb-10 font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-background-light/90 px-4 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-background-dark/90">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <span className="material-symbols-outlined text-primary notranslate" translate="no">
              arrow_back
            </span>
            Reservas
          </Link>
          <span className="text-sm font-bold text-primary">Cristal Padel</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        {loading ? (
          <div className="rounded-[28px] border border-slate-800 bg-slate-900 p-5">
            Cargando reserva...
          </div>
        ) : error ? (
          <div className="rounded-[28px] border border-red-500/20 bg-red-500/10 p-5 text-red-400">
            {error}
          </div>
        ) : booking ? (
          <>
            {booking.status === "pending_payment" ? (
              <section className="rounded-[28px] border border-primary/30 bg-primary/10 p-5">
                <p className="text-xl font-extrabold text-white">
                  Paga la seña para confirmar tu turno
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  El alias esta mas abajo junto con el monto y el boton para enviar el comprobante.
                </p>
                {dynamicLeft ? (
                  <p className="mt-3 rounded-2xl bg-slate-950/50 px-4 py-3 text-sm font-extrabold text-amber-300">
                    Vence en: {dynamicLeft}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={scrollToAlias}
                  className="mt-4 w-full rounded-2xl bg-primary px-4 py-3.5 font-bold text-white shadow-lg shadow-primary/20"
                >
                  Ver alias para pagar ↓
                </button>
              </section>
            ) : null}

            <section className="rounded-[28px] border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400">
                  <span className="material-symbols-outlined notranslate" translate="no">
                    hourglass_top
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-amber-400">
                    {statusText}
                  </p>
                  <h1 className="mt-1 text-2xl font-extrabold text-white">
                    {booking.status === "confirmed"
                      ? "Tu turno ya esta confirmado"
                      : booking.status === "pending_payment"
                        ? "Tu turno todavia no esta confirmado"
                        : "Esta reserva ya no esta activa"}
                  </h1>
                  {booking.status === "pending_payment" ? (
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Se confirma cuando envias el comprobante por WhatsApp.
                      {left !== null ? ` Tenes ${left} minutos para enviar la seña.` : ""}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            <section id="alias-section" className="scroll-mt-24 rounded-[28px] border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-xl font-extrabold text-white">Datos del turno</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Info label="Fecha" value={formatLongDate(booking.date)} wide />
                <Info label="Hora" value={booking.startTime} />
                <Info label="Cancha" value={`Cancha ${booking.court}`} />
                <Info label="Nombre" value={fullName} wide />
                <Info label="Codigo" value={booking._id} wide />
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-xl font-extrabold text-white">Seña por transferencia</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Info label="Total" value={formatMoney(payment?.totalPrice)} />
                <Info label="Seña" value={formatMoney(payment?.depositAmount)} />
                <Info label="Vence" value={formatLimit(booking.expiresAt)} wide />
              </div>

              <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/10 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Alias</p>
                <p className="mt-1 text-xl font-extrabold text-white">{payment?.transferAlias}</p>
              </div>

              <button
                type="button"
                onClick={copyAlias}
                className="mt-3 w-full rounded-2xl bg-primary px-4 py-3.5 font-bold text-white"
              >
                {copied ? "Alias copiado" : "Copiar alias"}
              </button>
            </section>

            <section className="rounded-[28px] border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-xl font-extrabold text-white">Enviar comprobante</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                WhatsApp del club: <span className="font-bold text-white">{payment?.whatsappNumber}</span>
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Si no envias la seña antes del vencimiento, la reserva se cancela automaticamente.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3.5 font-bold text-white"
              >
                <span className="material-symbols-outlined notranslate" translate="no">
                  chat
                </span>
                Enviar comprobante por WhatsApp
              </a>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

function Info({ label, value, wide = false }) {
  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-950/60 p-3 ${wide ? "col-span-2" : ""}`}>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-extrabold text-white">{value || "-"}</p>
    </div>
  );
}
