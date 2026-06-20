"use client";

import { useEffect, useState } from "react";
import { createRoom } from "@/infrastructure/http/roomApi";

type State = {
  roomId: string | null;
  isPending: boolean;
  error: Error | null;
};

export function useCreateRoom(): State {
  const [state, setState] = useState<State>({
    roomId: null,
    isPending: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    createRoom()
      .then(({ roomID, hostPlayerID, token }) => {
        if (!cancelled) {
          sessionStorage.setItem(
            `room_host_${roomID}`,
            JSON.stringify({ hostPlayerID, token })
          );
          setState({ roomId: roomID, isPending: false, error: null });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setState({ roomId: null, isPending: false, error: err instanceof Error ? err : new Error(String(err)) });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
