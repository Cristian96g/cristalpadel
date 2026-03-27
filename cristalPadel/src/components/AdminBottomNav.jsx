import { useNavigate } from "react-router-dom";

export default function AdminBottomNav({ current = "reservas" }) {
  const navigate = useNavigate();

  const items = [
    { key: "reservas", label: "Reservas", icon: "calendar_month", path: "/admin" },
    { key: "canchas", label: "Canchas", icon: "grid_view", path: "/admin/canchas" }, // opcional
    { key: "turnos", label: "Turnos", icon: "list_alt", path: "/admin/turnos" },
    { key: "ajustes", label: "Ajustes", icon: "settings", path: "/admin/ajustes" }, // opcional
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-primary/10 bg-background-light dark:bg-background-dark/95 backdrop-blur-md px-4 pb-6 pt-3 z-50">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {items.map((item) => {
          const active = current === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => navigate(item.path)}
              className={[
                "flex flex-col items-center gap-1 transition-colors",
                active
                  ? "text-primary"
                  : "text-slate-500 dark:text-slate-400 hover:text-primary",
              ].join(" ")}
            >
              <span
                className="material-symbols-outlined notranslate"
                translate="no"
                style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>

              <p className="text-[10px] font-bold uppercase tracking-widest">
                {item.label}
              </p>
            </button>
          );
        })}
      </div>
    </nav>
  );
}