import Link from "next/link";

export function StartLobbyActions() {
  return (
    <div className="flex justify-start">
      <Link
        href="/lobby"
        className="inline-flex min-w-[15rem] items-center justify-center rounded-full bg-[#6e9a36] px-8 py-5 text-lg font-semibold tracking-[-0.01em] text-white shadow-[0_14px_34px_rgba(69,112,33,0.36)] transition hover:bg-[#61892f] sm:min-w-[16rem] sm:px-10"
      >
        ルーム作成
      </Link>
    </div>
  );
}
