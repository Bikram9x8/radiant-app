"use client";

import { useEffect, useRef, useState } from "react";
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from "@tabler/icons-react";
import s from "./landing.module.css";
import { usePrefersReducedMotion } from "@/components/brand/usePrefersReducedMotion";

// Wraps the campus scene: starts the paper plane's flight (SVG animateMotion with
// begin="indefinite") once motion is allowed, and gives the long loops (clouds, plane) a pause
// button, since they run longer than 5 seconds. With reduced motion nothing starts and the
// button is hidden (landing.module.css).
export default function ScenePlayer({ children }: { children: React.ReactNode }) {
  const reduceMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    const motion = ref.current?.querySelector("animateMotion") as SVGAnimationElement | null;
    try {
      motion?.beginElement();
    } catch {
      // Old browsers without SMIL: the plane just rests
    }
  }, [reduceMotion]);

  useEffect(() => {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    if (paused) svg.pauseAnimations();
    else svg.unpauseAnimations();
  }, [paused]);

  return (
    <div ref={ref} className={`${s.sceneWrap} ${s.scenePlayer} ${paused ? s.scenePaused : ""}`}>
      {children}
      <button type="button" className={s.scenePause} aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
        {paused ? (
          <IconPlayerPlayFilled size={13} aria-hidden="true" />
        ) : (
          <IconPlayerPauseFilled size={13} aria-hidden="true" />
        )}
        Pause animation
      </button>
    </div>
  );
}
