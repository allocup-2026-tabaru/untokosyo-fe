"use client";

import { useEffect, useRef, useState } from "react";
import { RoomScene } from "@/features/room/scene/RoomScene";
import { useHostWebSocket } from "../hooks/useHostWebSocket";
import { startGame } from "@/infrastructure/http/roomApi";
import { RoomModal } from "./RoomModal";
import { RoomResultModal } from "./RoomResultModal";

type Props = {
  roomId: string;
};

export function RoomPage({ roomId }: Props) {
  const [isRoomModalVisible, setIsRoomModalVisible] = useState(true);
  const { players, hostPlayerID } = useHostWebSocket(roomId);

  const participantPlayers = players.filter((p) => p.playerID !== hostPlayerID);
  const playerNames = participantPlayers.map((p) => p.name);
  const playerAvatars = participantPlayers
    .filter((p) => p.avatarModel && p.materialColors)
    .map((p) => ({ avatarModel: p.avatarModel!, materialColors: p.materialColors! }));

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
        playerAvatars={playerAvatars.length > 0 ? playerAvatars : undefined}
        isWaiting={isRoomModalVisible}
      />
      <RoomModal
        roomId={roomId}
        isVisible={isRoomModalVisible}
        onStart={handleStart}
      />
      {/* <RoomResultModal
        participants={mockRoomParticipants}
        isVisible={isResultModalVisible}
      /> */}
    </main>
  );
}
