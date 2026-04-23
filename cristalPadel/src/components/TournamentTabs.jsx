export default function TournamentTabs({ tabs, activeTab, onChange, variant = "public" }) {
  const isAdmin = variant === "admin";

  return (
    <div
      className={[
        "sticky z-30 -mx-4 border-b px-4 py-3 backdrop-blur-xl",
        isAdmin
          ? "top-[72px] border-slate-800 bg-background-dark/95"
          : "top-[65px] border-slate-200 bg-background-light/95 dark:border-slate-800 dark:bg-background-dark/95",
      ].join(" ")}
    >
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={[
                "shrink-0 rounded-2xl px-4 py-2.5 text-sm font-extrabold transition-colors",
                active
                  ? "bg-primary text-white"
                  : isAdmin
                    ? "bg-slate-900 text-slate-300 ring-1 ring-slate-800"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
