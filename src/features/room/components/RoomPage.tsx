"use client";

import { useState } from "react";
import GroundDigModel from "@/components/GroundDigModel";
import { RoomModal } from "./RoomModal";

type Props = {
  roomId: string;
};

export function RoomPage({ roomId }: Props) {
  const [isRoomModalVisible, setIsRoomModalVisible] = useState(true);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <GroundDigModel />
      <div
        className={`absolute inset-0 z-[5] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),rgba(0,0,0,0.03)_58%,rgba(0,0,0,0.1))] transition-opacity duration-300 ${
          isRoomModalVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <RoomModal
        roomId={roomId}
        isVisible={isRoomModalVisible}
        onStart={() => setIsRoomModalVisible(false)}
      />
    </main>
  );
}
