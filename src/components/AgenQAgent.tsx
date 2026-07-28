"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

export function AgenQAgent() {
  const mounted = useRef(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!window.AGENQ?.render || mounted.current) return;
      mounted.current = true;
      window.AGENQ.render({
        agentId: "30453a9e-9ca6-483b-ae48-a6634a99f808",
        projectId: "ae9fede9-fb4b-4fe4-907a-05fd1e8e5b95",
        customerCode: "AGENQ-3",
        backendProtocol: "backend-v2",
        apiBaseUrl: "https://general-backend.aws.agenq.com",
        authEndpoint: "/api/agenq/token",
      } as any);
    }, 150);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <div id="agenq-root" />
      <Script
        src="https://cdn.agenqglobal.com/agenq-client-sdk.js"
        strategy="afterInteractive"
      />
    </>
  );
}
