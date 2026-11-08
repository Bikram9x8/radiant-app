"use client";

import { useEffect, type RefObject } from "react";

// Plays a CSS "enter" effect the first time an element scrolls into view.
//
// The server HTML always shows the element in its final state, so it is visible
// with JavaScript off, and the first paint never hides anything. After hydration,
// if the element is still below the fold, this sets data-<attr>="<from>" (hidden),
// then data-<attr>="<to>" once it scrolls in. CSS handles the transition.
// With prefers-reduced-motion it does nothing, so the final state just stays.
export function useEnterOnScroll(
  ref: RefObject<Element | null>,
  attr: string,
  from: string,
  to: string,
) {
  useEffect(() => {
    const el = ref.current as HTMLElement | SVGElement | null;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    // Already on screen (or scrolled past): leave it alone, no flash.
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset[attr] = from;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.dataset[attr] = to;
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, attr, from, to]);
}
