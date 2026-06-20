type Props = { params: Promise<{ roomId: string }> };

export default async function HostPage({ params }: Props) {
  const { roomId } = await params;
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">ホスト画面 {roomId}</h1>
    </main>
  );
}
