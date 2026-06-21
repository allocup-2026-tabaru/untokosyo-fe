type Props = {
  roomId: string;
};

export function RoomHeader({ roomId }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium tracking-[0.24em] text-[#617f3a] uppercase">
          Room
        </p>
        <p className="rounded-full bg-[#edf3e6] px-4 py-1.5 text-sm font-semibold text-[#4f6d25]">
          Room ID: {roomId}
        </p>
      </div>
      <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#233018] sm:text-4xl">
        ルーム作成
      </h1>
    </div>
  );
}
