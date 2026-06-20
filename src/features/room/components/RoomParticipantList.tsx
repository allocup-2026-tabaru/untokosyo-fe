import type { RoomParticipant } from "../constants/mockRoomParticipants";
import { RoomParticipantCard } from "./RoomParticipantCard";

type Props = {
  participants: readonly RoomParticipant[];
};

export function RoomParticipantList({ participants }: Props) {
  return (
    <section className="grid gap-3 overflow-y-auto pr-1 lg:max-h-full">
      {participants.map((participant) => (
        <RoomParticipantCard key={participant.id} participant={participant} />
      ))}
    </section>
  );
}
