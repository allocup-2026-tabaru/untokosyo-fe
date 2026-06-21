"use client";

import QRCode from "react-qr-code";
import { useEffect, useState } from "react";

type Props = {
  roomId: string;
  className?: string;
};

export function RoomQrCard({ roomId, className = "" }: Props) {
  const [controllerUrl, setControllerUrl] = useState("");

  useEffect(() => {
    setControllerUrl(`${window.location.origin}/${roomId}/controller`);
  }, [roomId]);

  return (
    <section
      className={`inline-flex w-fit flex-col items-center rounded-[1rem] border border-white/10 bg-black/[0.36] p-2 text-white shadow-[0_24px_64px_rgba(0,0,0,0.22)] backdrop-blur-lg sm:p-3 ${className}`}
    >
      <p className="mb-3 w-[28rem] whitespace-nowrap text-center text-[1.35rem] font-semibold tracking-[-0.03em] text-white sm:w-[34rem] sm:text-[1.75rem]">
        QRコードをスマホで読んでゲームに参加
      </p>
      <div className="grid place-items-center">
        <div className="grid h-[28rem] w-[28rem] place-items-center rounded-[1rem] bg-white p-5 sm:h-[34rem] sm:w-[34rem]">
          {controllerUrl && (
            <QRCode
              value={controllerUrl}
              size={256}
              bgColor="#ffffff"
              fgColor="#000000"
              style={{ width: "100%", height: "100%" }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
