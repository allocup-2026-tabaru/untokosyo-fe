import { post } from "./client";

type CreateRoomResponse = {
  roomID: string;
  hostPlayerID: string;
  token: string;
};

export async function createRoom(): Promise<CreateRoomResponse> {
  return post<CreateRoomResponse>("/rooms");
}
