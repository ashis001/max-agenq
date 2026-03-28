"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MousePointer2 } from "lucide-react";

interface MaxGuidePointerProps {
  text: string;
  targetUrl: string;
}

export default function MaxGuidePointer({ text, targetUrl }: MaxGuidePointerProps) {
  const router = useRouter();

  useEffect(() => {
    // Auto-navigate after 6 seconds (allowing Cloey to finish speaking the final instruction)
    const timer = setTimeout(() => {
      router.push(targetUrl);
    }, 6000);

    return () => clearTimeout(timer);
  }, [targetUrl, router]);

  const handleManualClick = () => {
    router.push(targetUrl);
  };

  return (
    <div
      onClick={handleManualClick}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-[99999] cursor-pointer flex flex-col items-center group select-none"
    >
      {/* Refined Arrow Pointer Indicator */}
      <div className="relative z-[100000] flex flex-col items-center animate-max-guide-bounce-gentle">
        {/* Rotated to point UP towards the button since it sits below it */}
        <div className="text-red-500 filter drop-shadow-[0_4px_12px_rgba(239,68,68,0.4)] transform rotate-[45deg] group-hover:scale-110 transition-all duration-300">
          <MousePointer2 className="w-7 h-7 fill-red-500" />
        </div>

        {/* Smooth Pulse Animation (Halo) */}
        <div className="absolute inset-0 -m-1 rounded-full bg-red-500 animate-ping opacity-20 scale-[1.5]" />
      </div>

      <style jsx>{`
                @keyframes max-guide-bounce-gentle {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-4px); }
                }
                .animate-max-guide-bounce-gentle {
                  animation: max-guide-bounce-gentle 1.5s ease-in-out infinite;
                }
            `}</style>
    </div>
  );
}
