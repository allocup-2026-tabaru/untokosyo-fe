import Image from "next/image";

export function StartLobbyHero() {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium tracking-[0.24em] text-[#617f3a] uppercase">
        Start Screen
      </p>
      <Image
        src="/title.png"
        alt="Untokosyo"
        width={640}
        height={320}
        priority
        className="h-auto w-full"
      />
      <p className="max-w-md text-sm leading-7 text-[#54614a] sm:text-base">
        かぶを引き抜く準備ができたら、ルームを作成して参加者を集めます。
      </p>
    </div>
  );
}
