import { ControllerClient } from "@/features/controller/components/ControllerClient";

type Props = {
  params: Promise<{
    roomId: string;
  }>;
};

export default async function ControllerPage({ params }: Props) {
  const { roomId } = await params;

  return <ControllerClient roomId={roomId} />;
}