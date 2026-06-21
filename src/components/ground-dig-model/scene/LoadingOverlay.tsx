"use client";

type Props = {
  visible: boolean;
};

export function LoadingOverlay({ visible }: Props) {
  return (
    <div
      className={`fixed inset-0 z-[3] grid place-items-center bg-[radial-gradient(circle_at_50%_42%,rgba(191,217,234,0.7),rgba(91,139,107,0.94))] text-[rgba(255,255,255,0.92)] tracking-[0.08em] transition-[opacity,visibility] duration-[350ms] ${
        visible ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      読み込み中
    </div>
  );
}
