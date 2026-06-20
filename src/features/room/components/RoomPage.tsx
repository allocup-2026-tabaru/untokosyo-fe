"use client";

import { useState } from "react";
import { RoomScene } from "@/features/room/scene/RoomScene";
import { useHostWebSocket } from "../hooks/useHostWebSocket";
import { startGame } from "@/infrastructure/http/roomApi";
import { RoomModal } from "./RoomModal";

type Props = {
  roomId: string;
};

export function RoomPage({ roomId }: Props) {
  const [isRoomModalVisible, setIsRoomModalVisible] = useState(true);
  const { players, hostPlayerID } = useHostWebSocket(roomId);

  const playerNames = players.map((p) => p.name);

  const handleStart = async () => {
    if (hostPlayerID) {
      await startGame(roomId, hostPlayerID);
    }
    setIsRoomModalVisible(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <RoomScene
        playerCount={playerNames.length}
        playerNames={playerNames}
        isWaiting={isRoomModalVisible}
      />
      <RoomModal
        roomId={roomId}
        isVisible={isRoomModalVisible}
        onStart={handleStart}
      />
    </main>
  );
}
