"use client";

import { useCorporateEngine } from "./_components/useCorporateEngine";
import { Sidebar } from "./_components/Sidebar";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import { Globe, Shield, Layout, Settings, Sparkles } from "lucide-react";

// Components for stages
import { CorporateInfoForm } from "./_components/CorporateInfoForm";
import { TierTable } from "./_components/TierTable";
import { SetupStatus } from "./_components/SetupStatus";
import { SubdomainModal } from "./_components/SubdomainModal";
import { AdminInviteModal } from "./_components/AdminInviteModal";
import { CorporateOverview } from "./_components/CorporateOverview";

const AnimatedGrid = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div
            className="absolute inset-0"
            style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(10, 30, 59, 0.15) 1px, transparent 0)`,
                backgroundSize: '40px 40px',
            }}
        />
    </div>
);

export default function CorporatePage({ params }: { params: { id: string } }) {
    const { toggleChat } = useChat();
    const engine = useCorporateEngine(params.id);
    const { corporate } = engine;
    const searchParams = useSearchParams();
    const isForcedOverview = searchParams.get("view") === "overview";
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const activeStage = isForcedOverview ? "OVERVIEW" : corporate.stage;

    if (!mounted) return null;

    return (
        <div className="flex min-h-screen bg-gradient-to-tr from-slate-200 via-indigo-50 to-blue-100 font-sans selection:bg-blue-600/10">
            <Sidebar />

            <main className="flex-1 md:ml-64 relative flex flex-col">
                <AnimatedGrid />

                {/* Dynamic Background Accents */}
                <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

                {/* Premium Header - Relative flow */}
                <header className="relative z-50 flex min-h-[5rem] md:h-20 flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl px-4 md:px-8 pt-24 md:pt-0 pb-4 md:pb-0 shadow-sm">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Corporate Management</h1>
                            <span className="text-slate-400 text-lg">/</span>
                            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">{corporate.name || "New Corporation"}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium tracking-tight">Configure enterprise settings & tiers</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleChat}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#0a1e3b] text-white rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-indigo-900/40 transition-all hover:-translate-y-0.5 font-black text-[11px] uppercase tracking-wider group">
                            <Sparkles className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
                            Ask Nina
                        </button>
                    </div>
                </header>

                {/* Tabs Bar - Relative flow */}
                <div className="relative z-40 px-4 md:px-8 pt-24 md:pt-0 pb-4 md:pb-0 py-4 transition-all duration-300">
                    <div className="flex p-1 bg-white/50 backdrop-blur-md border border-slate-200/60 rounded-xl w-fit shadow-sm pointer-events-auto">
                        <button className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-black uppercase tracking-wide transition-all duration-300 ${activeStage === "CORPORATE_INFO" ? "bg-[#0a1e3b] text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}>
                            <Globe className="w-5 h-5" />
                            Corporate Info
                        </button>
                        <button className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-black uppercase tracking-wide transition-all duration-300 ${activeStage === "TIERS" ? "bg-[#0a1e3b] text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}>
                            <Shield className="w-5 h-5" />
                            Tiers Config
                        </button>
                        <button className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-black uppercase tracking-wide transition-all duration-300 ${activeStage === "SETUP_STATUS" ? "bg-[#0a1e3b] text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}>
                            <Settings className="w-5 h-5" />
                            Setup Status
                        </button>
                        <button className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-black uppercase tracking-wide transition-all duration-300 ${activeStage === "OVERVIEW" ? "bg-[#0a1e3b] text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}>
                            <Layout className="w-5 h-5" />
                            Overview
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="relative z-10 px-4 md:px-8 pt-24 md:pt-0 pb-4 md:pb-0 pt-4 pb-12">
                    <div className="max-w-[1600px] mx-auto animate-scale-in">
                        {activeStage === "CORPORATE_INFO" && (
                            <CorporateInfoForm engine={engine} />
                        )}
                        {activeStage === "TIERS" && (
                            <TierTable engine={engine} />
                        )}
                        {activeStage === "SETUP_STATUS" && (
                            <SetupStatus engine={engine} />
                        )}
                        {activeStage === "SUBDOMAIN" && (
                            <SubdomainModal engine={engine} />
                        )}
                        {activeStage === "ADMINS" && (
                            <AdminInviteModal engine={engine} />
                        )}
                        {activeStage === "OVERVIEW" && (
                            <CorporateOverview engine={engine} />
                        )}
                    </div>
                </div>
            </main>
            <style jsx global>{`
                @keyframes scale-in {
                  from { opacity: 0; transform: scale(0.98); }
                  to { opacity: 1; transform: scale(1); }
                }
                .animate-scale-in { animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
}
