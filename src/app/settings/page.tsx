"use client";

import MaxGreeting from "@/components/MaxGreeting";
import { Sidebar } from "../corporate-customers/[id]/_components/Sidebar";
import {
    Settings as SettingsIcon,
    User,
    Bell,
    Lock,
    Eye,
    ShieldCheck,
    Globe,
    ChevronRight,
    Database,
    Cloud
} from "lucide-react";
import { useState } from "react";

const SETTINGS_GROUPS = [
    {
        title: "Account",
        items: [
            { id: "profile", label: "Profile Information", description: "Personal details and display name", icon: User },
            { id: "security", label: "Security & Password", description: "Authentication and access control", icon: Lock },
            { id: "notifications", label: "Notifications", description: "Email and push alert preferences", icon: Bell },
        ]
    },
    {
        title: "System",
        items: [
            { id: "appearance", label: "Appearance", description: "Dark mode and UI density", icon: Eye },
            { id: "data", label: "Data Management", description: "Export and archival settings", icon: Database },
            { id: "api", label: "API Keys", description: "Developer access and keys", icon: Cloud },
        ]
    }
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");

    return (
        <div className='flex min-h-screen bg-gradient-to-tr from-slate-200 via-indigo-50 to-blue-100 font-sans selection:bg-blue-600/10'>
            <MaxGreeting />
            <Sidebar />

            <main className='flex-1 ml-64 relative overflow-hidden flex flex-col'>
                {/* Dynamic Background Accents */}
                <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />

                {/* Header */}
                <header className='relative z-20 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/70 backdrop-blur-md px-8'>
                    <div className='flex flex-col'>
                        <h1 className='text-2xl font-bold text-slate-900 tracking-tight'>Settings</h1>
                        <p className="text-xs text-slate-500 font-medium">Configure your platform experience</p>
                    </div>
                </header>

                <div className='relative z-10 p-8 flex gap-8 animate-fade-in'>
                    {/* Settings Navigation */}
                    <div className="w-80 space-y-8">
                        {SETTINGS_GROUPS.map((group) => (
                            <div key={group.title} className="space-y-3">
                                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group.title}</p>
                                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                    {group.items.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id)}
                                            className={`w-full flex items-center gap-4 px-4 py-4 transition-all hover:bg-slate-50 border-b border-slate-100 last:border-0 ${activeTab === item.id ? "bg-blue-50/50" : ""}`}
                                        >
                                            <div className={`p-2 rounded-lg ${activeTab === item.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <div className="text-left">
                                                <p className={`text-xs font-bold ${activeTab === item.id ? "text-blue-600" : "text-slate-900"}`}>{item.label}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{item.description}</p>
                                            </div>
                                            {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto text-blue-600" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Active Content */}
                    <div className="flex-1 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-300 shadow-xl overflow-hidden animate-slide-up">
                        <div className="p-8 space-y-8">
                            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
                                    <p className="text-sm text-slate-500 font-medium">Manage how you appear on the platform</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                    <input
                                        type="text"
                                        defaultValue="John Smith"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                                    <input
                                        type="email"
                                        defaultValue="john.smith@maxinsurance.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Job Title</label>
                                    <input
                                        type="text"
                                        defaultValue="Lead Administrator"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Brief Biography</label>
                                    <textarea
                                        rows={4}
                                        defaultValue="Lead administrator for the Group Benefitz enterprise portal. Managing 120+ corporate accounts."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all resize-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                                <button className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all">
                                    Cancel
                                </button>
                                <button className="px-6 py-2.5 rounded-xl bg-[#0a1e3b] text-white text-xs font-bold shadow-lg shadow-blue-900/20 hover:scale-105 transition-all">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
        </div>
    );
}
