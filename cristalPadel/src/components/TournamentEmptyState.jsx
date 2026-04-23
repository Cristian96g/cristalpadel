export default function TournamentEmptyState({ icon = "info", title, children }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
      <span className="material-symbols-outlined text-primary text-4xl notranslate" translate="no">
        {icon}
      </span>
      <h2 className="mt-3 text-xl font-extrabold">{title}</h2>
      {children ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{children}</p> : null}
    </div>
  );
}
