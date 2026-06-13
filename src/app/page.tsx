import Experience from "@/components/three/Experience";
import Hud from "@/components/hud/Hud";
import IntroOverlay from "@/components/IntroOverlay";
import ScrollDriver from "@/components/ScrollDriver";

export default function Home() {
  return (
    <main>
      {/* Fixed WebGL world (-z-10) */}
      <Experience />
      {/* Intro terminal/title overlay (z-20, intro phase only) */}
      <IntroOverlay />
      {/* DOM HUD overlay (z-10, world phase only) */}
      <Hud />
      {/* Tall invisible track that produces scroll height + drives progress */}
      <ScrollDriver />
      {/* Beacon-dive white-out — animated imperatively via GSAP */}
      <div
        id="intro-flash"
        className="pointer-events-none fixed inset-0 z-50 bg-white"
        style={{ opacity: 0 }}
        aria-hidden
      />
    </main>
  );
}
