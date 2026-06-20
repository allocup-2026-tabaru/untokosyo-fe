type Props = {
  roomId: string;
  participantCount: number;
};

export function RoomSummary({ roomId, participantCount }: Props) {
  return (
    <section className="space-y-5 rounded-[1.75rem] border border-[#dbcdb0] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(249,242,231,0.92))] p-5 shadow-[0_16px_40px_rgba(75,53,20,0.08)]">
      <div className="space-y-2">
        <p className="text-sm font-medium tracking-[0.24em] text-[#7a5a25] uppercase">
          Room
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#2e2719] sm:text-4xl">
          ルーム画面
        </h1>
        <p className="max-w-lg text-sm leading-6 text-[#665a43]">
          参加者の準備状況を確認して、開始ボタンでモーダルを閉じる構成にして
          あります。実際の入力や同期は後で差し替えやすい粒度です。
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.25rem] bg-[#efe4cc] px-4 py-4">
          <p className="text-xs font-medium tracking-[0.18em] text-[#8b6b28] uppercase">
            Room ID
          </p>
          <p className="mt-2 break-all text-lg font-semibold text-[#2d2618]">
            {roomId}
          </p>
        </div>
        <div className="rounded-[1.25rem] bg-[#efe4cc] px-4 py-4">
          <p className="text-xs font-medium tracking-[0.18em] text-[#8b6b28] uppercase">
            Current Players
          </p>
          <p className="mt-2 text-lg font-semibold text-[#2d2618]">
            {participantCount}人参加中
          </p>
        </div>
      </div>
    </section>
  );
}
