"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { speakText } from "@/lib/google-tts";

export default function MaxGreeting() {
    const { openChat, isOpen, hasGreeted, setHasGreeted, isMuted, isWorkflowActive } = useChat();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only run this logic if we are NOT currently open and haven't shown yet in this session
        // Also skip if a workflow (like autofill guide) is active
        if (isOpen || hasGreeted || isWorkflowActive) {
            return;
        }

        const triggerSpeech = () => {
            speakText("Hi, I’m Nina. Your Assistant. Ask me anything");
            window.removeEventListener('click', triggerSpeech);
            window.removeEventListener('keydown', triggerSpeech);
        };

        const timer = setTimeout(() => {
            if (!isOpen && !hasGreeted) {
                setIsVisible(true);
                setHasGreeted(true);
                // Removed session storage setting

                // If the user has already interacted, speak immediately
                if (navigator.userActivation?.isActive) {
                    speakText("Hi, I’m Nina. Your Assistant. Ask me anything");
                } else {
                    // Otherwise, wait for the first click or keypress
                    window.addEventListener('click', triggerSpeech);
                    window.addEventListener('keydown', triggerSpeech);
                }
            }
        }, 1500);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('click', triggerSpeech);
            window.removeEventListener('keydown', triggerSpeech);
        };
    }, [isOpen, hasGreeted, setHasGreeted, isWorkflowActive]);

    // If chat is opened while we are visible, hide immediately
    useEffect(() => {
        if (isOpen && isVisible) {
            setIsVisible(false);
        }
    }, [isOpen, isVisible]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-Nina-fade-in">
            <div className="bg-white rounded-[32px] shadow-[0_32px_80px_rgba(0,0,0,0.4)] max-w-[380px] w-full relative overflow-hidden animate-Nina-scale-in">

                {/* Full-Bleed Hero Image */}
                <div className="relative h-80 w-full">
                    <img
                        alt="Nina AI"
                        // src="https://cdnstaticfiles.blob.core.windows.net/img/1770617819808_cloye-agent-face.jpg"
                        src="https://cdnstaticfiles.blob.core.windows.net/cdnstaticfiles/agent_images/nina.jpeg"
                        className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/0 to-transparent" />

                    {/* Subtle Background Wave Ripples */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div className="w-48 h-48 rounded-full border-2 border-blue-400/50 animate-Nina-wave" />
                        <div className="absolute w-48 h-48 rounded-full border-2 border-blue-400/30 animate-Nina-wave" style={{ animationDelay: '1.5s' }} />
                        <div className="absolute w-48 h-48 rounded-full border-2 border-blue-500/20 animate-Nina-wave" style={{ animationDelay: '3s' }} />
                    </div>

                    <div className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 shadow-lg animate-Nina-float">
                        <div className="relative flex h-2 w-2">
                            <div className="absolute inset-0 rounded-full bg-emerald-500 animate-Nina-ping opacity-75" />
                            <div className="absolute inset-[-4px] rounded-full bg-emerald-400 animate-Nina-ping opacity-30" style={{ animationDelay: '0.5s' }} />
                            <div className="absolute inset-[-8px] rounded-full bg-emerald-300 animate-Nina-ping opacity-15" style={{ animationDelay: '1s' }} />
                            <div className="relative rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                        </div>
                        <span className="text-white text-[10px] font-bold uppercase tracking-[0.15em] drop-shadow-sm">Active Now</span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 pb-8 flex flex-col items-center animate-Nina-fade-in-up">
                    <div className="text-center space-y-2 mb-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600/80">
                            AI Assistant
                        </p>
                        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            Hi, I’m <span className="text-blue-600">Nina</span>.
                        </h3>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={() => {
                            openChat("What would you like to do today? I can help you to onboard a new company, file a claim, or onboard a new policy provider.");
                            setIsVisible(false);
                        }}
                        className="group relative w-full overflow-hidden rounded-2xl bg-[#0a1e3b] px-6 py-4 transition-all duration-300 hover:bg-blue-900 hover:shadow-xl hover:shadow-blue-900/20 active:scale-[0.98] animate-Nina-pulse-gentle"
                    >
                        <div className="relative z-10 flex items-center justify-center gap-2 text-white font-bold tracking-wide">
                            <Sparkles size={18} className="text-blue-400 group-hover:animate-spin-slow" />
                            <span>Ask Nina</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes Nina-fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes Nina-scale-in {
                    from { transform: translateY(30px) scale(0.9); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes Nina-ping {
                    75%, 100% { transform: scale(2.5); opacity: 0; }
                }
                @keyframes Nina-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                @keyframes Nina-wave {
                    0% { transform: scale(0.8); opacity: 0; }
                    20% { opacity: 0.6; }
                    100% { transform: scale(2.5); opacity: 0; }
                }
                @keyframes Nina-fade-in-up {
                    from { transform: translateY(10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes Nina-pulse-gentle {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-Nina-fade-in {
                    animation: Nina-fade-in 0.6s ease-out forwards;
                }
                .animate-Nina-scale-in {
                    animation: Nina-scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-Nina-ping {
                    animation: Nina-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
                .animate-Nina-float {
                    animation: Nina-float 3s ease-in-out infinite;
                }
                .animate-Nina-wave {
                    animation: Nina-wave 4.5s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
                }
                .animate-Nina-fade-in-up {
                    animation: Nina-fade-in-up 0.8s ease-out 0.2s forwards;
                    opacity: 0;
                }
                .animate-Nina-pulse-gentle {
                    animation: Nina-pulse-gentle 2s ease-in-out infinite;
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
                .group-hover\:animate-spin-slow:hover {
                    animation: spin-slow 3s linear infinite;
                }
            `}</style>
        </div>
    );
}