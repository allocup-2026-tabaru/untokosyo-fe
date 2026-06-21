"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RoomScene } from "@/features/room/scene/RoomScene";
import { useHostWebSocket } from "../hooks/useHostWebSocket";
import { startGame } from "@/infrastructure/http/roomApi";
import { RoomModal } from "./RoomModal";
import { RoomResultModal } from "./RoomResultModal";
import type { Participant } from "@/shared/types/participant";

const RESULT_SHOW_DELAY_MS = 2500;

type Props = {
  roomId: string;
};

export function RoomPage({ roomId }: Props) {
  const [isRoomModalVisible, setIsRoomModalVisible] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const { players, hostPlayerID, gameStatus, eliminatedPlayerIDs, gameResult } = useHostWebSocket(roomId);
  const pullSoundRef = useRef<HTMLAudioElement | null>(null);
  const previousEliminatedCountRef = useRef(0);

  useEffect(() => {
    const audio = new Audio("/pull_sound.mp3");
    audio.preload = "auto";
    audio.volume = 1;
    pullSoundRef.current = audio;

    return () => {
      audio.pause();
      pullSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!gameResult) return;
    const timer = setTimeout(() => setShowResult(true), RESULT_SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [gameResult]);

  useEffect(() => {
    const previousCount = previousEliminatedCountRef.current;
    const currentCount = eliminatedPlayerIDs.length;

    if (currentCount > previousCount) {
      const audio = pullSoundRef.current;
      if (audio) {
        audio.currentTime = 0;
        void audio.play().catch(() => {});
      }
    }

    previousEliminatedCountRef.current = currentCount;
  }, [eliminatedPlayerIDs]);

  const participantPlayers = useMemo(
    () => players.filter((p) => p.playerID !== hostPlayerID),
    [players, hostPlayerID]
  );
  const playerNames = useMemo(() => participantPlayers.map((p) => p.name), [participantPlayers]);
  const avatarPlayers = useMemo(
    () => participantPlayers.filter((p) => p.avatarModel && p.materialColors),
    [participantPlayers]
  );
  const playerAvatars = useMemo(
    () => avatarPlayers.map((p) => ({ avatarModel: p.avatarModel!, materialColors: p.materialColors! })),
    [avatarPlayers]
  );
  const playerSlipFlags = useMemo(
    () => avatarPlayers.map((p) => eliminatedPlayerIDs.includes(p.playerID)),
    [avatarPlayers, eliminatedPlayerIDs]
  );

  const resultParticipants: Participant[] = (() => {
    if (!gameResult) return [];

    const standingIDs = new Set(gameResult.standings.map((s) => s.playerID));

    const fromStandings = gameResult.standings
      .filter((s) => s.playerID !== hostPlayerID)
      .sort((a, b) => a.rank - b.rank)
      .map((standing) => ({
        id: standing.playerID,
        name: standing.name,
        characterModel: players.find((p) => p.playerID === standing.playerID)?.avatarModel ?? "",
        status: "準備完了" as const,
        accentClassName: "",
        pullPower: standing.pullAccumulation,
        eliminated: eliminatedPlayerIDs.includes(standing.playerID),
      }));

    const notInStandings = eliminatedPlayerIDs
      .filter((id) => id !== hostPlayerID && !standingIDs.has(id))
      .map((id) => {
        const player = players.find((p) => p.playerID === id);
        return {
          id,
          name: player?.name ?? "Unknown",
          characterModel: player?.avatarModel ?? "",
          status: "準備完了" as const,
          accentClassName: "",
          pullPower: 0,
          eliminated: true,
        };
      });

    return [...fromStandings, ...notInStandings];
  })();

  const survivorParticipants = resultParticipants.filter((p) => !p.eliminated);
  const allSortedByPull = [...resultParticipants].sort(
    (a, b) => (b.pullPower ?? 0) - (a.pullPower ?? 0)
  );

  const unlockPullSound = async () => {
    const audio = pullSoundRef.current;
    if (!audio) return;

    try {
      audio.muted = true;
      audio.currentTime = 0;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
    } catch {
      // Ignore unlock failures and keep a normal playback attempt for the actual event.
    } finally {
      audio.muted = false;
      audio.volume = 1;
    }
  };

  const handleStart = async () => {
    await unlockPullSound();

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
        survivors={survivorParticipants}
        allParticipants={allSortedByPull}
        isVisible={showResult}
      />
    </main>
  );
}
