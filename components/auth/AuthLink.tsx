"use client";

import { createContext, useContext } from "react";
import Link from "next/link";

// True when an auth form is rendered inside the login/signup modal
export const InAuthModalContext = createContext(false);

// Link between the login and signup screens. Inside the modal it replaces the
// current history entry so the modal stays open and closing it returns to the
// page underneath. On the full pages it's a plain <a>, so it loads the other
// full page instead of opening the modal over this one.
export default function AuthLink(props: React.ComponentPropsWithoutRef<"a"> & { href: string }) {
  const inModal = useContext(InAuthModalContext);
  if (inModal) return <Link {...props} replace scroll={false} />;
  return <a {...props} />;
}
