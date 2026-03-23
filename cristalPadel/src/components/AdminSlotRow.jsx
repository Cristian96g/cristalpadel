import SlotCard from "./SlotCard.jsx";

export default function AdminSlotRow({ slot, onPick, onOpenBooking, highlightedBookingId }) {
  const court1 = slot.courts.find((c) => c.court === 1);
  const court2 = slot.courts.find((c) => c.court === 2);

  return (
    <div className="flex gap-4">
      <div className="w-16 flex items-start justify-center pt-2">
        <span className="text-sm font-bold text-slate-500">{slot.time}</span>
      </div>

      <SlotCard
        status={court1.status}
        booking={court1.booking}
        clickable={court1.status === "available"}
        onPick={
          court1.status === "available"
            ? () =>
              onPick({
                court: 1,
                startTime: slot.time,
              })
            : undefined
        }
        onOpenBooking={
          court1.status === "booked" ? onOpenBooking : undefined
        }
        highlighted={court1.booking?._id === highlightedBookingId}
      />

      <SlotCard
        status={court2.status}
        booking={court2.booking}
        clickable={court2.status === "available"}
        onPick={
          court2.status === "available"
            ? () =>
              onPick({
                court: 2,
                startTime: slot.time,
              })
            : undefined
        }
        onOpenBooking={
          court2.status === "booked" ? onOpenBooking : undefined
        }
        highlighted={court2.booking?._id === highlightedBookingId}
      />
    </div>
  );
}