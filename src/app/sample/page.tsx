import { CounterDisplay } from "@/features/counter/components/CounterDisplay";
import { R3fSampleScene } from "@/features/r3f-sample/components/R3fSampleScene";

const modelUrl =
  (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "") + "/InterpolationTest.glb";

export default function SamplePage() {
  return (
    <main className="min-h-screen flex items-start justify-center gap-8 p-8">
      <section className="flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold">WebSocket カウンターサンプル</h2>
        <CounterDisplay />
      </section>

      <section className="flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold">R3F glTF サンプル</h2>
        <div style={{ width: "600px", height: "400px" }}>
          <R3fSampleScene modelUrl={modelUrl} />
        </div>
      </section>
    </main>
  );
}
