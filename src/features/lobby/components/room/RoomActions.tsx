import Link from "next/link";

export function RoomActions() {
  return (
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
  );
}
