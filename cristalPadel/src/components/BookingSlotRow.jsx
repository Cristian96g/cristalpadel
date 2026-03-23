import SlotCard from "./SlotCard.jsx";

export default function BookingSlotRow({ slot, onPick }) {
  const court1 = slot.courts.find((c) => c.court === 1);
  const court2 = slot.courts.find((c) => c.court === 2);

  return (
    <div className="flex gap-4">
      <div className="w-16 flex items-start justify-center pt-2">
        <span className="text-sm font-bold text-slate-500">
          {slot.startTime}
        </span>
      </div>

      <SlotCard
        status={court1?.status}
        booking={court1?.booking}
        clickable={court1?.status === "available"}
        onPick={
          court1?.status === "available"
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
        status={court2?.status}
        booking={court2?.booking}
        clickable={court2?.status === "available"}
        onPick={
          court2?.status === "available"
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