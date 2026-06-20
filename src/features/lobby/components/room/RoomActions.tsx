import Link from "next/link";

type Props = {
  onConfirm: () => void;
  disabled: boolean;
};

export function RoomActions({ onConfirm, disabled }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-full border border-[#b7c39d] px-5 py-3 text-sm font-medium text-[#4f5d37] transition hover:bg-white/65"
      >
        スタートに戻る
      </Link>
      <button
        onClick={onConfirm}
        disabled={disabled}
        className="inline-flex items-center justify-center rounded-full bg-[#d57b2f] px-6 py-4 text-base font-semibold text-white shadow-[0_12px_30px_rgba(182,94,28,0.28)] transition hover:bg-[#c96e20] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        作成
      </button>
    </div>
  );
}
