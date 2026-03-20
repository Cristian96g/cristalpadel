import DaySelector from "./DaySelector";

export default function BookingHeader({ date, onChangeDate }) {
  return (
    <header className="sticky top-0 z-20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
      
          <>
      <header className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b border-primary/10">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">
            sports_tennis
          </span>
          <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">
            Club Padel Pro
          </h2>
        </div>

      </header>

      <div className="px-4 py-6 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex flex-col gap-1">
          <p className="text-primary text-sm font-semibold tracking-wider uppercase">
            Cristal padel
          </p>
          <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-extrabold tracking-tight">
            Realiza tu reserva
          </h1>
        </div>
      </div>
    </>

      <DaySelector selectedDate={date} onSelectDate={onChangeDate} />
      
    </header>
  );
}