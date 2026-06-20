type Props = {
  onClick: () => void;
};

export function StartGameButton({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full min-w-[14rem] items-center justify-center rounded-full bg-[#d57b2f] px-8 py-4 text-base font-semibold text-white shadow-[0_14px_34px_rgba(0,0,0,0.32)] transition hover:bg-[#c86e20] focus:outline-none focus:ring-2 focus:ring-[#d57b2f]/40 focus:ring-offset-2 focus:ring-offset-transparent sm:min-w-[15.5rem]"
    >
      ゲーム開始
    </button>
  );
}
