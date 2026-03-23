function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatISO(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function generateRecurringDates({ weekday, startDate, endDate }) {
  const result = [];

  const [sy, sm, sd] = startDate.split("-").map(Number);
  const start = new Date(sy, sm - 1, sd);

  let end;
  if (endDate) {
    const [ey, em, ed] = endDate.split("-").map(Number);
    end = new Date(ey, em - 1, ed);
  } else {
    end = new Date(start);
    end.setDate(end.getDate() + 56); // 8 semanas por defecto
  }

  const current = new Date(start);

  while (current <= end) {
    if (current.getDay() === weekday) {
      result.push(formatISO(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return result;
}