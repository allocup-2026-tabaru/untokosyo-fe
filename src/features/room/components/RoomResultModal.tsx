import type { Participant } from "@/shared/types/participant";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

type Props = {
  participants: readonly Participant[];
  isVisible: boolean;
};

const rankLabel = (index: number) => `${index + 1}位`;
const formatPullPower = (pullPower?: number) =>
  `${pullPower ?? 0} Pull Power`;

export function RoomResultModal({ participants, isVisible }: Props) {
  return (
    <ModalOverlay isVisible={isVisible}>
      <div className="relative flex h-full w-full items-center justify-center p-4 sm:p-6 lg:p-8">
        <section className="pointer-events-auto w-full max-w-3xl rounded-[1.75rem] border border-white/10 bg-black/[0.36] p-6 text-white shadow-[0_24px_64px_rgba(0,0,0,0.28)] backdrop-blur-lg sm:p-8">
          <div className="space-y-5 rounded-[1.5rem] border border-white/10 bg-white/4 p-6">
            <p className="text-sm font-medium tracking-[0.24em] text-white/60 uppercase">
              Result
            </p>
            <h2 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              リザルト
            </h2>
            <p className="text-base leading-7 text-white/70">
              ゲーム終了
            </p>
            <div className="space-y-3 pt-2">
              {participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className={`grid grid-cols-[4rem_1fr_auto] items-center gap-4 rounded-[1.1rem] px-4 py-3 ring-1 ${participant.eliminated ? "bg-black/8 opacity-60 ring-white/4" : "bg-black/16 ring-white/8"}`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/12 text-sm font-semibold text-white">
                    {rankLabel(index)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-white">
                      {participant.name}
                    </p>
                    {participant.eliminated && (
                      <p className="text-xs text-red-400">脱落</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-base font-semibold text-white">
                      {formatPullPower(participant.pullPower)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </ModalOverlay>
  );
}
