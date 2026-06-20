import type { RoomParticipantStatus } from "../constants/mockRoomParticipants";

type Props = {
  status: RoomParticipantStatus;
};

export function RoomParticipantStatusPill({ status }: Props) {
  const isReady = status === "準備完了";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isReady
          ? "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/20"
          : "bg-amber-400/15 text-amber-100 ring-1 ring-amber-300/20"
      }`}
    >
      {status}
    </span>
  );
}
