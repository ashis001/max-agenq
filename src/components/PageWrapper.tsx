"use client";

import React from "react";
import { useChat } from "@/context/ChatContext";
import clsx from "clsx";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
    const { isOpen, width, isFloating } = useChat();

    return (
        <div
            className={clsx(
                "transition-[padding] duration-300 ease-in-out min-h-screen",
            )}
            style={{
                paddingRight: (isOpen && !isFloating) ? `${width}px` : "0px",
            }}
        >
            {children}
        </div>
    );
}
