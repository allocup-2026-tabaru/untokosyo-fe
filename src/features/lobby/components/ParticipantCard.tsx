type Props = {
  name: string;
  character: string;
  status: string;
  accentClassName: string;
};

export function ParticipantCard({
  name,
  character,
  status,
  accentClassName,
}: Props) {
  const isReady = status === "準備完了";

  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/88 p-4 shadow-[0_18px_48px_rgba(54,63,38,0.12)] backdrop-blur">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-br ${accentClassName} text-xs font-semibold tracking-[0.16em] text-white uppercase`}
        >
          model
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-[-0.02em] text-[#25301b]">
              {name}
            </h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isReady
                  ? "bg-[#e2f3db] text-[#2d6b21]"
                  : "bg-[#efe7d5] text-[#8d6e2f]"
              }`}
            >
              {status}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#647059]">{character}</p>
        </div>
      </div>
    </div>
  );
}
