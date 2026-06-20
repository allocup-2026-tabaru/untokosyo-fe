type Props = {
  roomId: string;
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

export function RoomQrCard({ roomId }: Props) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium tracking-[0.24em] text-white/60 uppercase">
            QR
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white">
            参加用QRコード
          </h2>
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
          room / {roomId}
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="grid h-36 w-36 place-items-center rounded-[1.5rem] bg-black/30 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          <div className="grid h-full w-full grid-cols-7 gap-[2px] bg-white/5 p-2">
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
        <div className="space-y-3 text-sm leading-6 text-white/70">
          <p>
            ここにスマホで読み取る想定のQRコードが入ります。現状は画面仕様の
            枠だけ先に置いてあります。
          </p>
          <div className="rounded-[1.25rem] border border-dashed border-white/12 bg-black/25 p-4">
            <p className="font-semibold text-white">ルーム共有先</p>
            <p className="mt-1 break-all text-xs text-white/55">
              /{roomId}?join=qr
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
