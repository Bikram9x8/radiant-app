"use client";

import { useEffect } from "react";
import s from "./landing.module.css";
import { usePrefersReducedMotion } from "@/components/brand/usePrefersReducedMotion";

// Sections fade up once as they scroll into view. Only elements that start below the fold are
// hidden (and only after hydration), so nothing on screen blinks, and without JavaScript or with
// reduced motion everything is simply visible. The career block's highlight also starts on reveal.
const TARGETS = [
  `.${s.section} > .${s.h2}`,
  `.${s.section} > .${s.headRow}`,
  `.${s.section} > .${s.lead}`,
  `.${s.paths} > li`,
  `.${s.chips} > li`,
  `.${s.cgrid} > li`,
  `.${s.band} .${s.h2}`,
  `.${s.band} .${s.lead}`,
  `.${s.exams} > li`,
  `.${s.recentGrid}`,
  `.${s.career}`,
  `.${s.guides} > li`,
  `.${s.join}`,
].join(",");

export default function RevealOnScroll() {
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(TARGETS)).filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight,
    );
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.classList.add(s.in);
          io.unobserve(el);
          // When the fade-up is done, give the element its own transitions back (card hovers);
          // .in stays, because the career highlight is keyed on it
          window.setTimeout(() => {
            el.classList.remove(s.rv);
            el.style.transitionDelay = "";
          }, 1300);
        }
      },
      { threshold: 0.12 },
    );
    for (const el of els) {
      const index = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : 0;
      el.style.transitionDelay = `${Math.min(index, 6) * 70}ms`;
      el.classList.add(s.rv);
      io.observe(el);
    }
    return () => {
      io.disconnect();
      // Leave everything visible if the page is left mid-reveal
      for (const el of els) el.classList.add(s.in);
    };
  }, [reduceMotion]);

  return null;
}
