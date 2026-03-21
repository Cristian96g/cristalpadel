function formatDateForICS(date, time) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  const localDate = new Date(year, month - 1, day, hours, minutes, 0);

  const yyyy = localDate.getFullYear();
  const mm = String(localDate.getMonth() + 1).padStart(2, "0");
  const dd = String(localDate.getDate()).padStart(2, "0");
  const hh = String(localDate.getHours()).padStart(2, "0");
  const min = String(localDate.getMinutes()).padStart(2, "0");
  const ss = String(localDate.getSeconds()).padStart(2, "0");

  return `${yyyy}${mm}${dd}T${hh}${min}${ss}`;
}

function addMinutesToTime(date, time, minutesToAdd) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  const dt = new Date(year, month - 1, day, hours, minutes, 0);
  dt.setMinutes(dt.getMinutes() + minutesToAdd);

  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  const hh = String(dt.getHours()).padStart(2, "0");
  const min = String(dt.getMinutes()).padStart(2, "0");
  const ss = String(dt.getSeconds()).padStart(2, "0");

  return `${yyyy}${mm}${dd}T${hh}${min}${ss}`;
}

export function downloadICS({
  title,
  description = "",
  location = "",
  date,
  startTime,
  durationMinutes = 90,
  filename = "reserva.ics",
}) {
  const dtStart = formatDateForICS(date, startTime);
  const dtEnd = addMinutesToTime(date, startTime, durationMinutes);
  const dtStamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const uid = `${Date.now()}@cristalpadel`;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CristalPadel//Reserva//ES",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}