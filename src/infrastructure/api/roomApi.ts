import type {
  CreateRoomResponse,
  JoinRoomResponse,
  RoomState,
  StartGameResponse,
} from "@/features/game/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${path}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const roomApi = {
  createRoom(): Promise<CreateRoomResponse> {
    return request<CreateRoomResponse>("/rooms", { method: "POST" });
  },

  getRoom(roomID: string): Promise<RoomState> {
    return request<RoomState>(`/rooms/${roomID}`);
  },

  joinRoom(roomID: string, name: string): Promise<JoinRoomResponse> {
    return request<JoinRoomResponse>(`/rooms/${roomID}/players`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  startGame(roomID: string, playerID: string): Promise<StartGameResponse> {
    return request<StartGameResponse>(`/rooms/${roomID}/start`, {
      method: "POST",
      body: JSON.stringify({ playerID }),
    });
  },

  deleteRoom(roomID: string): Promise<void> {
    return request<void>(`/rooms/${roomID}`, { method: "DELETE" });
  },
};
