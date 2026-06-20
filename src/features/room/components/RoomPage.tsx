"use client";

import { useEffect, useRef, useState } from "react";
import { RoomScene } from "@/features/room/scene/RoomScene";
import { mockRoomParticipants } from "../constants/mockRoomParticipants";
import { RoomModal } from "./RoomModal";
import { RoomResultModal } from "./RoomResultModal";

type Props = {
  roomId: string;
};

export function RoomPage({ roomId }: Props) {
  const [isRoomModalVisible, setIsRoomModalVisible] = useState(true);
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const resultTimeoutRef = useRef<number | undefined>(undefined);
  const hasQueuedResultRef = useRef(false);

  // TODO: WebSocket 接続後はリアルタイムの参加者データに差し替え
  const playerNames = mockRoomParticipants.map((p) => p.name);
  const playerSlipFlags = mockRoomParticipants.map((p) => p.slipOnKabuEscape ?? false);

  useEffect(() => {
    return () => {
      if (resultTimeoutRef.current !== undefined) {
        window.clearTimeout(resultTimeoutRef.current);
      }
    };
  }, []);

  const handleKabuEscapeStart = () => {
    if (hasQueuedResultRef.current) {
      return;
    }

    hasQueuedResultRef.current = true;
    resultTimeoutRef.current = window.setTimeout(() => {
      setIsResultModalVisible(true);
      resultTimeoutRef.current = undefined;
    }, 2000);
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <RoomScene
        playerCount={playerNames.length}
        playerNames={playerNames}
        playerSlipFlags={playerSlipFlags}
        onKabuEscapeStart={handleKabuEscapeStart}
      />
      <RoomModal
        roomId={roomId}
        isVisible={isRoomModalVisible}
        onStart={() => setIsRoomModalVisible(false)}
      />
      <RoomResultModal
        participants={mockRoomParticipants}
        isVisible={isResultModalVisible}
      />
    </main>
  );
}
