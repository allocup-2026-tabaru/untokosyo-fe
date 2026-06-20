"use client";

import { useState } from "react";
import { RoomScene } from "@/features/room/scene/RoomScene";
import { useHostWebSocket } from "../hooks/useHostWebSocket";
import { startGame } from "@/infrastructure/http/roomApi";
import { RoomModal } from "./RoomModal";
import { RoomResultModal } from "./RoomResultModal";
import type { Participant } from "@/shared/types/participant";

type Props = {
  roomId: string;
};

export function RoomPage({ roomId }: Props) {
  const [isRoomModalVisible, setIsRoomModalVisible] = useState(true);
  const { players, hostPlayerID, gameStatus, eliminatedPlayerIDs, gameResult } = useHostWebSocket(roomId);

  const participantPlayers = players.filter((p) => p.playerID !== hostPlayerID);
  const playerNames = participantPlayers.map((p) => p.name);
  const playerAvatars = participantPlayers
    .filter((p) => p.avatarModel && p.materialColors)
    .map((p) => ({ avatarModel: p.avatarModel!, materialColors: p.materialColors! }));
  const playerSlipFlags = participantPlayers.map((p) => eliminatedPlayerIDs.includes(p.playerID));

  const resultParticipants: Participant[] = gameResult
    ? gameResult.standings
        .filter((s) => s.playerID !== hostPlayerID)
        .sort((a, b) => a.rank - b.rank)
        .map((standing) => ({
          id: standing.playerID,
          name: standing.name,
          characterModel: players.find((p) => p.playerID === standing.playerID)?.avatarModel ?? "",
          status: "準備完了" as const,
          accentClassName: "",
          pullPower: standing.pullAccumulation,
        }))
    : [];

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
        playerSlipFlags={playerSlipFlags}
        kabuEscapeTriggered={eliminatedPlayerIDs.length > 0}
      />
      <RoomModal
        roomId={roomId}
        isVisible={isRoomModalVisible && gameStatus === "waiting"}
        onStart={handleStart}
      />
      <RoomResultModal
        participants={resultParticipants}
        isVisible={gameStatus === "finished"}
      />
    </main>
  );
}
