import { useState } from "react";

export default function AdminHeader({
  unreadCount = 0,
  notifications = [],
  onOpenNotifications,
}) {
  const [open, setOpen] = useState(false);

  function handleToggleNotifications() {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
      onOpenNotifications?.();
    }
  }

  return (
    <>
      <header className="sticky top-0 z-20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex justify-between px-2 py-4 relative">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-primary text-3xl notranslate"
            translate="no"
          >
            sports_tennis
          </span>

          <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">
            Club Padel Pro
          </h2>
        </div>

        <div className="flex items-center gap-4 justify-end">
          <button
            type="button"
            onClick={handleToggleNotifications}
            className="relative flex items-center justify-center rounded-full size-10 bg-primary/10 text-primary"
          >
            <span
              className="material-symbols-outlined notranslate"
              translate="no"
            >
              notifications
            </span>

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <div className="size-10 rounded-full bg-primary flex items-center justify-center text-background-dark font-bold">
            <span
              className="material-symbols-outlined notranslate"
              translate="no"
            >
              person
            </span>
          </div>
        </div>

        {open && (
          <div className="absolute right-2 top-[72px] w-[320px] max-h-[360px] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">Notificaciones</h3>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400"
              >
                <span
                  className="material-symbols-outlined notranslate"
                  translate="no"
                >
                  close
                </span>
              </button>
            </div>

            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay notificaciones.
              </p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-sm"
                  >
                    <p className="font-semibold">{notification.message}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(notification.createdAt).toLocaleTimeString(
                        "es-AR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      <div className="px-4 py-6 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex flex-col gap-1">
          <p className="text-primary text-sm font-semibold tracking-wider uppercase">
            Panel de Control
          </p>
          <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-extrabold tracking-tight">
            Admin - Reservas
          </h1>
        </div>
      </div>
    </>
  );
}