"use client"

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Only match exact panel routes and their subroutes
  const isPanelRoute = /^\/(admin|student|company|mentor)(\/|$)/.test(pathname || "");

  // Don't render footer for panel routes
  if (isPanelRoute) {
    return null;
  }

  return <Footer />;
} 