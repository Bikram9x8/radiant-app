"use client";

import { useSyncExternalStore } from "react";

// Which header menu item a page belongs to, when the URL alone can't tell
// (e.g. /opportunities/<id> can be a School note, a Higher Education internship or a plain test).
// The page sets it once it knows; the Navbar reads it. null = not set.
let current: string | null = null;
const listeners = new Set<() => void>();

export function setNavSection(href: string | null) {
  if (current === href) return;
  current = href;
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function useNavSection() {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}
