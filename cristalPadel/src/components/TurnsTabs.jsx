export default function TurnsTabs({ activeTab, onChangeTab }) {
  const tabs = [
    { key: "bookings", label: "Turnos" },
    { key: "fixed", label: "Turnos fijos" },
  ];

  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-2 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChangeTab(tab.key)}
              className={[
                "rounded-xl px-4 py-3 text-sm font-bold transition-all",
                active
                  ? "bg-primary text-background-dark shadow"
                  : "text-slate-500 dark:text-slate-300",
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