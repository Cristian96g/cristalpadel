export default function AdminBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-primary/10 bg-background-light dark:bg-background-dark/95 backdrop-blur-md px-4 pb-6 pt-3 z-50">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <a className="flex flex-col items-center gap-1 text-primary" href="#">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            calendar_month
          </span>
          <p className="text-[10px] font-bold uppercase tracking-widest">
            Reservas
          </p>
        </a>

        <a className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined">grid_view</span>
          <p className="text-[10px] font-bold uppercase tracking-widest">
            Canchas
          </p>
        </a>

        <a className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined">group</span>
          <p className="text-[10px] font-bold uppercase tracking-widest">
            Socios
          </p>
        </a>

        <a className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined">settings</span>
          <p className="text-[10px] font-bold uppercase tracking-widest">
            Ajustes
          </p>
        </a>
      </div>
    </nav>
  );
}