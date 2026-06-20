import Link from "next/link";
import { mockParticipants } from "../constants/mockParticipants";
import { ParticipantCard } from "./ParticipantCard";

function QrPlaceholder() {
  return (
    <div className="rounded-[1.5rem] border border-[#d8ddcf] bg-[#fbfaf5] p-4">
      <div className="mx-auto grid aspect-square w-full max-w-[180px] grid-cols-5 gap-1 rounded-xl bg-white p-3 shadow-inner">
        {Array.from({ length: 25 }).map((_, index) => {
          const filled = [0, 1, 3, 5, 6, 8, 10, 14, 15, 16, 18, 20, 22, 23, 24].includes(
            index,
          );

          return (
            <div
              key={index}
              className={filled ? "rounded-[0.2rem] bg-[#283317]" : "rounded-[0.2rem] bg-[#e6eadf]"}
            />
          );
        })}
      </div>
    </div>
  );
}

export function RoomLobbyView() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-end px-6 py-10 sm:px-10 lg:px-16">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/60 bg-[rgba(255,250,242,0.82)] p-6 shadow-[0_30px_80px_rgba(40,56,28,0.18)] backdrop-blur-md sm:p-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium tracking-[0.24em] text-[#617f3a] uppercase">
                Room
              </p>
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#233018] sm:text-4xl">
                ルーム作成
              </h1>
              <p className="text-sm leading-7 text-[#56624d] sm:text-base">
                プレイヤー名やキャラクター入力は後で載せられるように、表示枠だけ用意しています。
              </p>
            </div>
            <div className="min-w-[180px]">
              <QrPlaceholder />
            </div>
          </div>

          <section className="rounded-[1.5rem] border border-white/70 bg-white/72 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6d775f]">参加人数</p>
                <p className="text-3xl font-semibold tracking-[-0.04em] text-[#243018]">
                  {mockParticipants.length}
                </p>
              </div>
              <p className="rounded-full bg-[#edf3e6] px-4 py-2 text-sm font-medium text-[#4f6d25]">
                Room ID: 0001
              </p>
            </div>
          </section>

          <section className="space-y-3">
            {mockParticipants.map((participant) => (
              <ParticipantCard key={participant.id} {...participant} />
            ))}
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-[#b7c39d] px-5 py-3 text-sm font-medium text-[#4f5d37] transition hover:bg-white/65"
            >
              スタートに戻る
            </Link>
            <Link
              href="/game"
              className="inline-flex items-center justify-center rounded-full bg-[#d57b2f] px-6 py-4 text-base font-semibold text-white shadow-[0_12px_30px_rgba(182,94,28,0.28)] transition hover:bg-[#c96e20]"
            >
              開始
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
