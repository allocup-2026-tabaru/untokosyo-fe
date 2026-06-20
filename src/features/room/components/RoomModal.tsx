import { RoomQrCard } from "./RoomQrCard";
import { StartGameButton } from "./StartGameButton";

type Props = {
  roomId: string;
  isVisible: boolean;
  onStart: () => void;
};

export function RoomModal({ roomId, isVisible, onStart }: Props) {
  return (
    <div
      className={`absolute inset-0 z-10 transition-opacity duration-300 ${
        isVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!isVisible}
    >
      <div className="relative flex h-full w-full flex-col gap-4 p-4 sm:p-6 lg:p-8">
        <RoomQrCard
          className="pointer-events-auto w-fit max-w-full rounded-[1rem] border border-white/10 bg-black/[0.28] text-white shadow-[0_24px_64px_rgba(0,0,0,0.22)] backdrop-blur-lg lg:absolute lg:left-8 lg:top-8"
        />

        <section
          className="pointer-events-auto ml-auto w-fit max-w-[14rem] rounded-[1rem] border border-white/10 bg-black/[0.36] p-4 text-white shadow-[0_24px_64px_rgba(0,0,0,0.22)] backdrop-blur-lg lg:absolute lg:bottom-8 lg:right-8"
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
    </div>
  );
}
