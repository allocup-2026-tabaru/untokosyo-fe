export function RoomQrCodePreview() {
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
