"use client";

import { MessageCircle } from "lucide-react";
import { useChatPanel } from "./ChatContext";

export default function ChatButton() {
    const { openChat, isChatOpen } = useChatPanel();

    // Hide button when chat is open
    if (isChatOpen) return null;

    return (
        <button
            onClick={openChat}
            className="fixed bottom-6 right-6 z-30 group"
            aria-label="Open AI Assistant"
        >
            {/* Button with gradient and glow effect */}
            <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />

                {/* Main button */}
                <div className="relative w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200">
                    <MessageCircle className="w-6 h-6 text-white" />
                </div>

                {/* Notification badge (optional - can be controlled via props) */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                    1
                </div>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Chat with AI Assistant
                <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900" />
            </div>
        </button>
    );
}
