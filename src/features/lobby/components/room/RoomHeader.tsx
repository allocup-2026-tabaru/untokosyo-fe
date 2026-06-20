type Props = {
  roomId: string;
};

export function RoomHeader({ roomId }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-[0.24em] text-[#617f3a] uppercase">
            Room
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#233018] sm:text-4xl">
            ルーム作成
          </h1>
        </div>
        <p className="rounded-full bg-[#edf3e6] px-4 py-2 text-sm font-medium text-[#4f6d25]">
          Room ID: {roomId}
        </p>
      </div>
    </div>
  );
}
