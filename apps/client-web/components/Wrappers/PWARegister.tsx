"use client";

import { useEffect } from "react";

const PWARegister = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch {
        // Ignore service worker registration failures to avoid breaking the app.
      }
    };

    register();
  }, []);

  return null;
};

export default PWARegister;
