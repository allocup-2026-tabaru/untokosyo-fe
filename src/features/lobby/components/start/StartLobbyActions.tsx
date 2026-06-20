import Link from "next/link";

export function StartLobbyActions() {
  return (
    <div className="ml-40 mt-50 flex justify-start sm:ml-40 sm:mt-80">
      <Link
        href="/lobby"
        className="inline-flex min-w-[15rem] items-center justify-center rounded-full border border-[#86a35a] bg-[#f4f1dc] px-8 py-5 text-lg font-semibold tracking-[-0.01em] text-[#35531f] shadow-[0_16px_30px_rgba(44,67,27,0.26)] transition hover:bg-[#fff9e8] sm:min-w-[16rem] sm:px-10"
      >
        ルーム作成
      </Link>
    </div>
  );
}
