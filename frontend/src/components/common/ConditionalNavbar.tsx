"use client"

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

export function ConditionalNavbar() {
  const pathname = usePathname();

  // Only match exact panel routes and their subroutes
  const isPanelRoute = /^\/(admin|student|company|mentor)(\/|$)/.test(pathname || "");

  if (isPanelRoute) {
    return null;
  }

  return <Navbar />;
} 