const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const toHHMM = (mins) => {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
};

export const generateStartTimes = ({ openTime, closeTime, slotMinutes }) => {
  const open = toMinutes(openTime);
  const close = toMinutes(closeTime);

  const lastStart = close - slotMinutes;
  const times = [];

  for (let t = open; t <= lastStart; t += slotMinutes) {
    times.push(toHHMM(t));
  }
  return times;
};

export const addMinutes = (hhmm, minutesToAdd) => {
  return toHHMM(toMinutes(hhmm) + minutesToAdd);
};