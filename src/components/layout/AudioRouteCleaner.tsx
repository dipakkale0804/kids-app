"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { stopKidsSpeech } from "@/lib/speech";

/**
 * Global component that guarantees audio speech synthesis is stopped
 * whenever navigating between routes, switching browser tabs, or exiting pages.
 */
export function AudioRouteCleaner() {
  const pathname = usePathname();

  // Cancel speech whenever the page pathname changes
  useEffect(() => {
    stopKidsSpeech();
  }, [pathname]);

  // Cancel speech on window unload, back navigation, tab switch, or visibility change
  useEffect(() => {
    const handleStop = () => stopKidsSpeech();

    window.addEventListener("beforeunload", handleStop);
    window.addEventListener("pagehide", handleStop);
    window.addEventListener("popstate", handleStop);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopKidsSpeech();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopKidsSpeech();
      window.removeEventListener("beforeunload", handleStop);
      window.removeEventListener("pagehide", handleStop);
      window.removeEventListener("popstate", handleStop);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
