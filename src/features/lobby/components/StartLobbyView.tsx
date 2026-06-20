import Image from "next/image";
import Link from "next/link";

export function StartLobbyView() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-10 sm:px-10 lg:px-16">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/55 bg-[rgba(255,251,240,0.78)] p-6 shadow-[0_30px_80px_rgba(40,56,28,0.18)] backdrop-blur-md sm:p-8 lg:p-10">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm font-medium tracking-[0.24em] text-[#617f3a] uppercase">
              Start Screen
            </p>
            <Image
              src="/title.png"
              alt="Untokosyo"
              width={640}
              height={320}
              priority
              className="h-auto w-full"
            />
            <p className="max-w-md text-sm leading-7 text-[#54614a] sm:text-base">
              かぶを引き抜く準備ができたら、ルームを作成して参加者を集めます。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/room"
              className="inline-flex items-center justify-center rounded-full bg-[#6e9a36] px-6 py-4 text-base font-semibold text-white shadow-[0_12px_30px_rgba(69,112,33,0.34)] transition hover:bg-[#61892f]"
            >
              ルーム作成
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
