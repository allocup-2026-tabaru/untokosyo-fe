import type { RoomParticipantStatus } from "../constants/mockRoomParticipants";

type Props = {
  status: RoomParticipantStatus;
};

export function RoomParticipantStatusPill({ status }: Props) {
  const isReady = status === "準備完了";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isReady ? "bg-[#dff1d5] text-[#296621]" : "bg-[#f4e7cb] text-[#8c6b22]"
      }`}
    >
      {status}
    </span>
  );
}
