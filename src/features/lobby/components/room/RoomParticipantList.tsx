import type { Participant } from "@/shared/types/participant";
import { ParticipantCard } from "@/components/ui/ParticipantCard";

type Props = {
  participants: readonly Participant[];
};

export function RoomParticipantList({ participants }: Props) {
  return (
    <section className="space-y-3">
      {participants.map((participant) => (
        <ParticipantCard key={participant.id} participant={participant} variant="light" />
      ))}
    </section>
  );
}
