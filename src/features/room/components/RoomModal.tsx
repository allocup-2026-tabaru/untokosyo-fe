import type { RoomParticipant } from "../constants/mockRoomParticipants";
import { RoomParticipantList } from "./RoomParticipantList";
import { RoomQrCard } from "./RoomQrCard";
import { RoomSummary } from "./RoomSummary";
import { StartGameButton } from "./StartGameButton";

type Props = {
  roomId: string;
  participantCount: number;
  participants: readonly RoomParticipant[];
  isVisible: boolean;
  onStart: () => void;
};

export function RoomModal({
  roomId,
  participantCount,
  participants,
  isVisible,
  onStart,
}: Props) {
  return (
    <div
      className={`absolute inset-0 z-10 flex items-start justify-center overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-10 ${
        isVisible ? "pointer-events-auto" : "pointer-events-none opacity-0"
      } transition-opacity duration-300`}
      aria-hidden={!isVisible}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
      <section className="relative mt-4 flex w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-black/70 text-white shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:mt-8 lg:max-h-[calc(100vh-4rem)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d57b2f] via-[#e8c07a] to-[#5b7b3b]" />
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.1fr_1fr] lg:p-8">
          <div className="space-y-6">
            <RoomSummary roomId={roomId} participantCount={participantCount} />
            <RoomQrCard roomId={roomId} />
          </div>
          <div className="flex min-h-0 flex-col gap-5 lg:max-h-[calc(100vh-10rem)]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium tracking-[0.24em] text-white/65 uppercase">
                  Participants
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white">
                  参加者一覧
                </h2>
              </div>
              <p className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/80">
                {participantCount}人参加中
              </p>
            </div>
            <div className="min-h-0 flex-1">
              <RoomParticipantList participants={participants} />
            </div>
            <div className="pt-2">
              <StartGameButton onClick={onStart} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
