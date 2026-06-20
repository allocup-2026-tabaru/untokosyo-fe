type Props = {
  participantCount: number;
  roomId: string;
};

export function RoomSummaryCard({ participantCount, roomId }: Props) {
  return (
    <section className="rounded-[1.5rem] border border-white/70 bg-white/72 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#6d775f]">参加人数</p>
          <p className="text-3xl font-semibold tracking-[-0.04em] text-[#243018]">
            {participantCount}
          </p>
        </div>
        <p className="rounded-full bg-[#edf3e6] px-4 py-2 text-sm font-medium text-[#4f6d25]">
          Room ID: {roomId}
        </p>
      </div>
    </section>
  );
}
