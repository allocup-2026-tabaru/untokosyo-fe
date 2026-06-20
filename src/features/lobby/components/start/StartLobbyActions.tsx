import Link from "next/link";

export function StartLobbyActions() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link
        href="/lobby"
        className="inline-flex items-center justify-center rounded-full bg-[#6e9a36] px-6 py-4 text-base font-semibold text-white shadow-[0_12px_30px_rgba(69,112,33,0.34)] transition hover:bg-[#61892f]"
      >
        ルーム作成
      </Link>
    </div>
  );
}
