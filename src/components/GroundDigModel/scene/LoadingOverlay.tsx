"use client";

type Props = {
  visible: boolean;
};

export function LoadingOverlay({ visible }: Props) {
  return (
    <div
      className={`ground-dig-loading${visible ? "" : " ground-dig-loading--hidden"}`}
    >
      読み込み中
    </div>
  );
}
