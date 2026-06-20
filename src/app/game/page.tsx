import Link from "next/link";

export default function GamePage() {
  return (
    <main className="min-h-screen bg-[#f3eee4] px-6 py-10 text-[#2a261d]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-between rounded-[2rem] border border-[#d5c8ab] bg-white/70 p-8 shadow-[0_30px_80px_rgba(62,45,20,0.12)] backdrop-blur">
        <div className="space-y-4">
          <p className="text-sm font-medium tracking-[0.24em] text-[#8c6f36] uppercase">
            Game Screen
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.03em]">
            ゲーム画面のプレースホルダー
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[#5c5548]">
            開始ボタンの遷移先だけ先に用意しています。ここに実際のゲーム UI
            を載せれば接続できます。
          </p>
        </div>
        <div>
          <Link
            href="/room"
            className="inline-flex items-center rounded-full border border-[#bfa979] px-5 py-3 text-sm font-medium text-[#5e4722] transition hover:bg-[#f7f0e1]"
          >
            ルーム画面に戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
