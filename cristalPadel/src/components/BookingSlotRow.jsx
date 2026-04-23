import SlotCard from "./SlotCard.jsx";
import { isPastSlot } from "../utils/dates.js";

export default function BookingSlotRow({ slot, onPick, date }) {
  const court1 = slot.courts.find((c) => c.court === 1);
  const court2 = slot.courts.find((c) => c.court === 2);
  const past = isPastSlot(date, slot.startTime);
  const court1Status = past ? "past" : court1?.status;
  const court2Status = past ? "past" : court2?.status;

  return (
    <div className="flex gap-4">
      <div className="w-16 flex items-start justify-center pt-2">
        <span className="text-sm font-bold text-slate-500">
          {slot.startTime}
        </span>
      </div>

      <SlotCard
        status={court1Status}
        booking={court1?.booking}
        clickable={court1Status === "available"}
        onPick={
          court1Status === "available"
            ? () =>
                onPick({
                  court: 1,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                })
            : undefined
        }
      />

      <SlotCard
        status={court2Status}
        booking={court2?.booking}
        clickable={court2Status === "available"}
        onPick={
          court2Status === "available"
            ? () =>
                onPick({
                  court: 2,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                })
            : undefined
        }
      />
    </div>
  );
}
