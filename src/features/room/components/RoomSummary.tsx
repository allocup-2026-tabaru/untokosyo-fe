type Props = {
  roomId: string;
  participantCount: number;
};

export function RoomSummary({ roomId, participantCount }: Props) {
  return (
    <section className="space-y-5 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
      <div className="space-y-2">
        <p className="text-sm font-medium tracking-[0.24em] text-white/60 uppercase">
          Room
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
          ルーム画面
        </h1>
        <p className="max-w-lg text-sm leading-6 text-white/70">
          参加者の準備状況を確認して、開始ボタンでモーダルを閉じる構成にして
          あります。実際の入力や同期は後で差し替えやすい粒度です。
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.25rem] bg-black/25 px-4 py-4 ring-1 ring-white/8">
          <p className="text-xs font-medium tracking-[0.18em] text-white/55 uppercase">
            Room ID
          </p>
          <p className="mt-2 break-all text-lg font-semibold text-white">
            {roomId}
          </p>
        </div>
        <div className="rounded-[1.25rem] bg-black/25 px-4 py-4 ring-1 ring-white/8">
          <p className="text-xs font-medium tracking-[0.18em] text-white/55 uppercase">
            Current Players
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            {participantCount}人参加中
          </p>
        </div>
      </div>
    </section>
  );
}
