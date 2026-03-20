export default function AdminHeader() {
  return (
    <>
      <header className="sticky top-0 z-20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex justify-between px-2 py-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl" translate="no">
            sports_tennis
          </span>
          <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">
            Club Padel Pro
          </h2>
        </div>

        <div className="flex items-center gap-4 justify-end">
          <button className="flex items-center justify-center rounded-full size-10 bg-primary/10 text-primary">
            <span className="material-symbols-outlined" translate="no">notifications</span>
          </button>

          <div className="size-10 rounded-full bg-primary flex items-center justify-center text-background-dark font-bold">
            <span className="material-symbols-outlined" translate="no">person</span>
          </div>
        </div>
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