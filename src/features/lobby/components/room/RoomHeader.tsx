export function RoomHeader() {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium tracking-[0.24em] text-[#617f3a] uppercase">
        Room
      </p>
      <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#233018] sm:text-4xl">
        ルーム作成
      </h1>
      <p className="text-sm leading-7 text-[#56624d] sm:text-base">
        プレイヤー名やキャラクター入力は後で載せられるように、表示枠だけ用意しています。
      </p>
    </div>
  );
}
