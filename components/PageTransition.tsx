"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Login and signup usually open as a modal over the current page, which
// shouldn't fade the page behind it
const AUTH_PATHS = ["/login", "/signup", "/signup/company"];

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const previous = useRef(pathname);

  useEffect(() => {
    const from = previous.current;
    previous.current = pathname;
    if (from !== pathname && (AUTH_PATHS.includes(from) || AUTH_PATHS.includes(pathname))) return;
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.25s ease",
      }}
    >
      {children}
    </div>
  );
} 
