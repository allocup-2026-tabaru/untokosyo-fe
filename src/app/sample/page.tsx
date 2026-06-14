import { CounterDisplay } from "@/features/counter/components/CounterDisplay";

export default function SamplePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">WebSocket カウンターサンプル</h1>
      <CounterDisplay />
    </main>
  );
}
