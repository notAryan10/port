import Experience from "@/components/three/Experience";
import Hud from "@/components/hud/Hud";
import ScrollDriver from "@/components/ScrollDriver";

export default function Home() {
  return (
    <main>
      {/* Fixed WebGL world (-z-10) */}
      <Experience />
      {/* DOM HUD overlay (z-10) */}
      <Hud />
      {/* Tall invisible track that produces scroll height + drives progress */}
      <ScrollDriver />
    </main>
  );
}
