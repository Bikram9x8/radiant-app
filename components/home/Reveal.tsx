"use client";

import { useRef } from "react";
import s from "./home.module.css";
import { useEnterOnScroll } from "./useEnterOnScroll";

// A <section> that fades up gently the first time it scrolls into view.
// Never used for the hero, so the h1 and main text are never delayed.
export default function Reveal({
  className = "",
  children,
  ...rest
}: React.ComponentPropsWithoutRef<"section">) {
  const ref = useRef<HTMLElement>(null);
  useEnterOnScroll(ref, "reveal", "hidden", "shown");

  return (
    <section ref={ref} className={`${s.reveal} ${className}`} {...rest}>
      {children}
    </section>
  );
}
