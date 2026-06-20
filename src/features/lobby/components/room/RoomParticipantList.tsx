import type { LobbyParticipant } from "../../constants/mockParticipants";
import { ParticipantCard } from "../participant/ParticipantCard";

type Props = {
  participants: readonly LobbyParticipant[];
};

export function RoomParticipantList({ participants }: Props) {
  return (
    <section className="space-y-3">
      {participants.map((participant) => (
        <ParticipantCard key={participant.id} {...participant} />
      ))}
    </section>
  );
}
