import Image from "next/image";

export function StartLobbyHero() {
  return (
    <div className="flex justify-start">
      <Image
        src="/title_cutout.png"
        alt="Untokosyo"
        width={1024}
        height={576}
        priority
        className="h-auto w-full max-w-[min(92vw,42rem)] select-none drop-shadow-[0_22px_34px_rgba(65,82,43,0.18)] sm:max-w-[44rem] md:max-w-[48rem]"
      />
    </div>
  );
}
