import type { Metadata } from "next";
import { RoomPage } from "@/features/room/components/RoomPage";

type Props = {
  params: Promise<{ roomId: string }>;
};

export const metadata: Metadata = {
  title: "ルーム画面",
};

export default async function RoomRoutePage({ params }: Props) {
  const { roomId } = await params;
  return <RoomPage roomId={roomId} />;
}
