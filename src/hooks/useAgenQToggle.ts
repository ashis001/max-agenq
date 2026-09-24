"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "agenq_sdk_enabled";
const EVENT_NAME = "agenq-toggle-changed";

function readEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function useAgenQEnabled() {
  const [enabled, setEnabledState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEnabledState(readEnabled());
    setMounted(true);

    const handler = () => setEnabledState(readEnabled());
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {}
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
    setEnabledState(value);
  }, []);

  return { enabled, setEnabled, mounted };
}

export function getAgenQEnabled(): boolean {
  return readEnabled();
}
