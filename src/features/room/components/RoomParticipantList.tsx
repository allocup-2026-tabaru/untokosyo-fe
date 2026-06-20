import type { Participant } from "@/shared/types/participant";
import { ParticipantCard } from "@/components/ui/ParticipantCard";

type Props = {
  participants: readonly Participant[];
};

export function RoomParticipantList({ participants }: Props) {
  return (
    <section className="grid gap-3 overflow-y-auto pr-1 lg:max-h-full">
      {participants.map((participant) => (
        <ParticipantCard key={participant.id} participant={participant} variant="dark" />
      ))}
    </section>
  );
}
