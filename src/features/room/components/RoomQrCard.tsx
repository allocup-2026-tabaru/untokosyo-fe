type Props = {
  className?: string;
};

const qrPattern = [
  "1111111",
  "1000001",
  "1011101",
  "1011101",
  "1011101",
  "1000001",
  "1111111",
];

export function RoomQrCard({ className = "" }: Props) {
  return (
    <section
      className={`inline-flex w-fit flex-col items-center rounded-[1rem] border border-white/10 bg-black/[0.36] p-2 text-white shadow-[0_24px_64px_rgba(0,0,0,0.22)] backdrop-blur-lg sm:p-3 ${className}`}
    >
      <p className="mb-3 w-[28rem] whitespace-nowrap text-center text-[1.35rem] font-semibold tracking-[-0.03em] text-white sm:w-[34rem] sm:text-[1.75rem]">
        QRコードをスマホで読んでゲームに参加
      </p>
      <div className="grid place-items-center">
        <div className="grid h-[28rem] w-[28rem] place-items-center rounded-[1rem] bg-black/[0.18] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:h-[34rem] sm:w-[34rem]">
          <div className="grid h-full w-full grid-cols-7 gap-[4px] bg-white/[0.03] p-4">
            {qrPattern.flatMap((row, rowIndex) =>
              row.split("").map((cell, cellIndex) => (
                <span
                  key={`${rowIndex}-${cellIndex}`}
                  className={`rounded-[2px] ${cell === "1" ? "bg-white" : "bg-transparent"}`}
                />
              )),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
