"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    AGENQ?: {
      render: (options?: {
        agentId?: string;
        projectId?: string;
        customerCode?: string;
        customerId?: string;
        apiKey?: string;
      }) => void;
    };
  }
}

export default function Agent() {
  const slotRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true); // ✅ loader state

  const mounted = useRef(false);

  useEffect(() => {
    // Timeout fallback: if the SDK doesn't load within 5 seconds, unblock the UI anyway
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("⚠️ AgenQ SDK load timed out - unblocking UI");
        setLoading(false);
      }
    }, 5000);

    function tryMount() {
      if (!window.AGENQ?.render) return;
      if (!slotRef.current) return;
      if (mounted.current) return;

      mounted.current = true;
      clearTimeout(timeout);

      const key = Object.keys(localStorage).find((k) =>
        k.startsWith("agent-mount-state"),
      );

      if (key) {
        localStorage.setItem(key, "OPEN");
      }
      console.log("🎉 AgenQ SDK detected → mounting");

      window.AGENQ.render({
        // agentId: "65206eb7-e156-42fc-b42c-2ee88902b1ef",
        // projectId: "9c21ed2d-8109-4c59-aa6d-6001ff2e5159",
        // customerCode: "SUPER-USER",
      });

      setLoading(false);
    }

    tryMount();
    const interval = setInterval(tryMount, 150);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [loading]);

  return (
    <>
      {loading && (
        <div className='fixed inset-0 flex items-center justify-center bg-white z-50'>
          <div className='h-12 w-12 border-4 border-gray-300 border-t-black rounded-full animate-spin' />
        </div>
      )}

      <div id='agenq-root' ref={slotRef} />
      <Script
        src={"https://cdn.agenqglobal.com/agenq-client-sdk.js"}
        strategy='afterInteractive'
        onError={() => {
          console.error("❌ Failed to load AgenQ SDK (SSL or Network error)");
          setLoading(false);
        }}
      />
    </>
  );
}
