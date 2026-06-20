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
      <GroundDigModel isWaiting={isRoomModalVisible} />
      <RoomModal
        roomId={roomId}
        isVisible={isRoomModalVisible}
        onStart={() => setIsRoomModalVisible(false)}
      />
    </main>
  );
}
