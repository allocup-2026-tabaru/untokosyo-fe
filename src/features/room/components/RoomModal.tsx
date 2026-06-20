import { ModalOverlay } from "@/components/ui/ModalOverlay";
import { RoomQrCard } from "./RoomQrCard";
import { StartGameButton } from "./StartGameButton";

type Props = {
  roomId: string;
  isVisible: boolean;
  onStart: () => void;
};

export function RoomModal({ roomId, isVisible, onStart }: Props) {
  return (
    <ModalOverlay isVisible={isVisible}>
      <div className="relative flex h-full w-full flex-col gap-4 p-4 sm:p-6 lg:p-8">
        <RoomQrCard
          roomId={roomId}
          className="pointer-events-auto w-fit max-w-full rounded-[1rem] border border-white/10 bg-black/[0.28] text-white shadow-[0_24px_64px_rgba(0,0,0,0.22)] backdrop-blur-lg lg:absolute lg:left-6 lg:top-6"
        />

        <section
          className="pointer-events-auto ml-auto w-fit max-w-[18rem] rounded-[1rem] border border-white/10 bg-black/[0.36] p-4 text-white shadow-[0_24px_64px_rgba(0,0,0,0.22)] backdrop-blur-lg lg:absolute lg:bottom-6 lg:right-6"
        >
          <p className="text-sm font-medium tracking-[0.24em] text-white/60 uppercase">
            Start
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
            ゲーム開始
          </h2>
          <div className="mt-5">
            <StartGameButton onClick={onStart} />
          </div>
        </section>
      </div>
    </ModalOverlay>
  );
}
