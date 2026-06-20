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
      className={`inline-flex w-fit flex-col rounded-[1rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.14)] sm:p-5 ${className}`}
    >
      <div className="grid place-items-center">
        <div className="grid h-44 w-44 place-items-center rounded-[1rem] bg-black/[0.14] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:h-48 sm:w-48">
          <div className="grid h-full w-full grid-cols-7 gap-[2px] bg-white/[0.03] p-2">
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
