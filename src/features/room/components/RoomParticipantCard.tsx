import type { RoomParticipant } from "../constants/mockRoomParticipants";
import { RoomParticipantStatusPill } from "./RoomParticipantStatusPill";

type Props = {
  participant: RoomParticipant;
};

export function RoomParticipantCard({ participant }: Props) {
  return (
    <article className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-br ${participant.accentClassName} text-[0.65rem] font-semibold tracking-[0.2em] text-white uppercase shadow-[0_10px_24px_rgba(0,0,0,0.25)]`}
        >
          model
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold tracking-[-0.02em] text-white">
              {participant.name}
            </h3>
            <RoomParticipantStatusPill status={participant.status} />
          </div>
          <p className="mt-1 text-sm text-white/68">
            キャラクターモデル: {participant.characterModel}
          </p>
        </div>
      </div>
    </article>
  );
}
