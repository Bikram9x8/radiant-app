"use client";

import { useEffect } from "react";

export default function ViewTracker({
  courseNodeId,
  opportunityId,
}: {
  courseNodeId?: string;
  opportunityId?: string;
}) {
  useEffect(() => {
    const key = `pv:${courseNodeId ?? ""}:${opportunityId ?? ""}`;
    try {
      // Count the same page only once every 30 minutes per browser tab
      const last = Number(sessionStorage.getItem(key) || 0);
      if (Date.now() - last < 30 * 60 * 1000) return;
      sessionStorage.setItem(key, String(Date.now()));
    } catch {
      // storage blocked: just count it
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: window.location.pathname,
        courseNodeId,
        opportunityId,
      }),
    }).catch(() => {});
  }, [courseNodeId, opportunityId]);

  return null;
}