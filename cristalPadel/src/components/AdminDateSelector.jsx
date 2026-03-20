function pad2(n) {
  return String(n).padStart(2, "0");
}

function parseISODate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatISODate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function addDays(dateStr, amount) {
  const date = parseISODate(dateStr);
  date.setDate(date.getDate() + amount);
  return formatISODate(date);
}

function getMonthLabel(dateStr) {
  return parseISODate(dateStr).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
}

function getDayLabel(dateStr) {
  return parseISODate(dateStr)
    .toLocaleDateString("es-AR", { weekday: "short" })
    .replace(".", "")
    .toUpperCase();
}

function getTodayText(dateStr) {
  return parseISODate(dateStr).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
  });
}

function getVisibleDates(centerDate, total = 7) {
  const middle = Math.floor(total / 2);
  return Array.from({ length: total }, (_, i) => addDays(centerDate, i - middle));
}

function DayButton({ item, active, onClick }) {
  const day = item.split("-")[2];

  return (
    <button
      onClick={() => onClick(item)}
      className={[
        "flex flex-col items-center justify-center min-w-[72px] h-24 rounded-2xl px-3 border transition-all",
        active
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200",
      ].join(" ")}
    >
      <span
        className={[
          "text-[10px] font-semibold uppercase tracking-wider",
                active ? "text-white/80" : "text-slate-400",
              ].join(" ")}
      >
        {getDayLabel(item)}
      </span>

      <span className="text-2xl font-bold leading-none mt-1">{Number(day)}</span>
    </button>
  );
}

export default function AdminDateSelector({ date, onChangeDate }) {
  const dates = getVisibleDates(date);
  const monthLabel = getMonthLabel(date);
  const todayText = getTodayText(date);

  function moveDay(amount) {
    onChangeDate(addDays(date, amount));
  }

  return (
    <div className="px-4 pb-6">
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-primary/10 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => moveDay(-1)}
            className="p-2 rounded-lg hover:bg-primary/10 text-slate-600 dark:text-slate-400"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <div className="text-center">
            <p className="text-slate-900 dark:text-slate-100 font-bold capitalize">
              {monthLabel}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {todayText}
            </p>
          </div>

          <button
            onClick={() => moveDay(1)}
            className="p-2 rounded-lg hover:bg-primary/10 text-slate-600 dark:text-slate-400"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        <div className="flex justify-between gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {dates.map((item) => (
            <DayButton
              key={item}
              item={item}
              active={item === date}
              onClick={onChangeDate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}