import { get, post, del } from "./client";

export type CreateRoomResponse = {
  roomID: string;
  hostPlayerID: string;
  token: string;
};

export type RoomStatus = "waiting" | "playing" | "finished";

export type RoomPlayer = {
  playerID: string;
  name: string;
  status: string;
  isPulling: boolean;
  pullAccumulation: number;
};

export type RoomDetail = {
  ID: string;
  HostPlayerID: string;
  Status: RoomStatus;
  Players: RoomPlayer[];
  Winner: string | null;
  CreatedAt: string;
  StartedAt: string | null;
  FinishedAt: string | null;
};

export type JoinRoomResponse = {
  playerID: string;
  name: string;
  token: string;
};

export type StartGameResponse = { ok: true };

export function createRoom(): Promise<CreateRoomResponse> {
  return post<CreateRoomResponse>("/rooms");
}

export function getRoom(roomID: string): Promise<RoomDetail> {
  return get<RoomDetail>(`/rooms/${roomID}`);
}

export function joinRoom(roomID: string, name: string): Promise<JoinRoomResponse> {
  return post<JoinRoomResponse>(`/rooms/${roomID}/players`, { name });
}

export function startGame(roomID: string, playerID: string): Promise<StartGameResponse> {
  return post<StartGameResponse>(`/rooms/${roomID}/start`, { playerID });
}

export function deleteRoom(roomID: string): Promise<void> {
  return del(`/rooms/${roomID}`);
}
