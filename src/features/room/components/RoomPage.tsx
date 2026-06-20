"use client";

import { useState } from "react";
import { RoomScene } from "@/features/room/scene/RoomScene";
import { mockRoomParticipants } from "../constants/mockRoomParticipants";
import { RoomModal } from "./RoomModal";

type Props = {
  roomId: string;
};

export function RoomPage({ roomId }: Props) {
  const [isRoomModalVisible, setIsRoomModalVisible] = useState(true);

  // TODO: WebSocket 接続後はリアルタイムの参加者データに差し替え
  const playerNames = mockRoomParticipants.map((p) => p.name);
  const playerSlipFlags = mockRoomParticipants.map((p) => p.slipOnKabuEscape ?? false);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <RoomScene
        playerCount={playerNames.length}
        playerNames={playerNames}
        playerSlipFlags={playerSlipFlags}
        isWaiting={isRoomModalVisible}
      />
      <RoomModal
        roomId={roomId}
        isVisible={isRoomModalVisible}
        onStart={() => setIsRoomModalVisible(false)}
      />
    </main>
  );
}
