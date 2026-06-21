const steps = [
  {
    title: "ルームを作成",
    body: "部屋を立てたら、ここで実際の roomId を受け取る想定です。",
  },
  {
    title: "参加者を集める",
    body: "この先の room 画面で QR や参加者情報を表示します。",
  },
  {
    title: "準備ができたら開始",
    body: "全員の準備が整ったら、ゲーム画面へ進みます。",
  },
] as const;

export function RoomHowToPlay() {
  return (
    <section className="rounded-[1.5rem] border border-white/70 bg-white/72 p-5">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium tracking-[0.2em] text-[#617f3a] uppercase">
            How to Play
          </p>
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#233018]">
            遊び方
          </h2>
        </div>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-[1.1rem] bg-[#f8f5eb] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6e9a36] text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-[#243018]">{step.title}</h3>
                  <p className="text-sm leading-6 text-[#5f6754]">{step.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
