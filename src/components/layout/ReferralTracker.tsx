"use client";

import { useEffect } from "react";

export function ReferralTracker() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) {
        localStorage.setItem("referral_code", ref.toLowerCase());
      }
    }
  }, []);

  return null;
}
