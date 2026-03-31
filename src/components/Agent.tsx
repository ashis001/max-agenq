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
    function tryMount() {
      if (!window.AGENQ?.render) return;
      if (!slotRef.current) return;
      if (mounted.current) return;

      mounted.current = true;

      const key = Object.keys(localStorage).find((k) =>
        k.startsWith("agent-mount-state"),
      );

      if (key) {
        localStorage.setItem(key, "OPEN");
      }
      console.log("🎉 AgenQ SDK detected → mounting");

      window.AGENQ.render({
        agentId: "eb35f9fc-6f2d-48aa-925d-a133d7030876",
        projectId: "d33341f4-f727-417f-a62b-fb7a1e617f2c",
        customerCode: "SUPER-USER",
      });

      setLoading(false);
    }

    tryMount();
    const interval = setInterval(tryMount, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {loading && (
        <div className='fixed inset-0 flex items-center justify-center bg-white z-50'>
          <div className='h-12 w-12 border-4 border-gray-300 border-t-black rounded-full animate-spin' />
        </div>
      )}

      <div id='agenq-root' ref={slotRef} />
      <Script
        src={
          "https://cdn.aws.agenq.com/agenq-client-sdk.js"
        }
        strategy='afterInteractive'
      />
    </>
  );
}
