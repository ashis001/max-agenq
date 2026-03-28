"use client";

import { Sidebar } from "../corporate-customers/[id]/_components/Sidebar";
import { Download, FileText, Calendar, Filter, Share2, Megaphone, Eye, Search, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useChat } from "@/context/ChatContext";

const MATERIALS = [
    { title: "2024 Benefits Guide", category: "Brochure", size: "2.4 MB", date: "Jan 10, 2024", type: "PDF", color: "blue" },
    { title: "Employee Enrollment Kit", category: "Kit", size: "15 MB", date: "Dec 15, 2023", type: "ZIP", color: "indigo" },
    { title: "Health Plan Overview", category: "One-pager", size: "1.1 MB", date: "Jan 05, 2024", type: "PDF", color: "blue" },
    { title: "Mental Wellness Flyer", category: "Flyer", size: "850 KB", date: "Nov 20, 2023", type: "PDF", color: "emerald" },
    { title: "Q1 Campaign Assets", category: "Social Media", size: "45 MB", date: "Jan 12, 2024", type: "ZIP", color: "amber" },
    { title: "Manager Training Deck", category: "Presentation", size: "5.2 MB", date: "Oct 30, 2023", type: "PPTX", color: "rose" },
    { title: "Generic Plan Summary", category: "Brochure", size: "3.2 MB", date: "Oct 15, 2023", type: "PDF", color: "blue" },
    { title: "Instagram Stories Pack", category: "Social Media", size: "12 MB", date: "Jan 02, 2024", type: "ZIP", color: "amber" },
];

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

export default function MarketingPage() {
    const { toggleChat } = useChat();
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const filteredMaterials = categoryFilter === "All Categories"
        ? MATERIALS
        : MATERIALS.filter(m => m.category === categoryFilter);

    if (!mounted) return null;

    return (
        <div className="flex min-h-screen bg-gradient-to-tr from-slate-200 via-indigo-50 to-blue-100 font-sans selection:bg-blue-600/10">
            <Sidebar />
            <main className="flex-1 ml-64 relative overflow-hidden flex flex-col">
                <AnimatedGrid />

                {/* Dynamic Background Accents */}
                <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

                {/* Premium Header */}
                <header className="relative z-20 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/70 backdrop-blur-md px-8">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Marketing Center</h1>
                        <p className="text-xs text-slate-500 font-medium">Download & share campaign assets</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleChat}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#0a1e3b] text-white rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all hover:-translate-y-0.5 font-black text-[11px] uppercase tracking-wider">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            Ask Cloey
                        </button>
                    </div>
                </header>

                <div className="relative z-10 p-8 space-y-6 animate-fade-in">
                    {/* Asset Library with Integrated Controls */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
                        <div className="bg-[#0a1e3b] px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                                        <Megaphone className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Asset Library</h3>
                                </div>
                                <span className="text-[9px] font-black text-blue-200 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full border border-white/5">{filteredMaterials.length} Total</span>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl border border-white/10 shadow-sm relative group focus-within:bg-white/20 transition-all">
                                    <Search className="w-3.5 h-3.5 text-blue-200 group-hover:text-white transition-colors" />
                                    <input
                                        placeholder="Search assets..."
                                        className="bg-transparent text-[11px] font-bold outline-none text-white placeholder:text-blue-200/50 w-32 md:w-40"
                                    />
                                </div>

                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl border border-white/10 shadow-sm focus-within:bg-white/20 transition-all">
                                    <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Category:</span>
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="bg-transparent text-[11px] font-black text-white outline-none cursor-pointer appearance-none"
                                    >
                                        <option className="text-slate-900 font-bold">All Categories</option>
                                        <option className="text-slate-900 font-bold">Brochure</option>
                                        <option className="text-slate-900 font-bold">Kit</option>
                                        <option className="text-slate-900 font-bold">Social Media</option>
                                        <option className="text-slate-900 font-bold">Presentation</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50/50">
                            {filteredMaterials.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {filteredMaterials.map((item, idx) => (
                                        <div key={idx} className="group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                            {/* Preview Area */}
                                            <div className="relative h-40 bg-slate-100/50 flex items-center justify-center border-b border-slate-100 group-hover:bg-blue-50/50 transition-colors">
                                                <div className="absolute top-3 right-3">
                                                    <span className="text-[9px] font-bold font-mono text-slate-400 border border-slate-200 bg-white rounded px-1.5 py-0.5">{item.type}</span>
                                                </div>
                                                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 border border-slate-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                                    <FileText className="h-8 w-8" />
                                                </div>
                                            </div>

                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="mb-3">
                                                    <span className={`inline-flex rounded-lg px-2 py-1 text-[9px] uppercase font-black tracking-wider bg-${item.color || 'blue'}-50 text-${item.color || 'blue'}-600`}>
                                                        {item.category}
                                                    </span>
                                                </div>

                                                <h3 className="font-bold text-slate-900 text-sm mb-1 leading-snug group-hover:text-blue-600 transition-colors">{item.title}</h3>

                                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 mt-auto pt-4">
                                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                                        <Download className="h-3 w-3" /> {item.size}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                                        <Calendar className="h-3 w-3" /> {item.date}
                                                    </div>
                                                </div>

                                                <div className="mt-5 flex gap-2">
                                                    <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all">
                                                        <Eye className="h-3.5 w-3.5" /> Preview
                                                    </button>
                                                    <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#0a1e3b] py-2 text-xs font-bold text-white hover:bg-blue-900 shadow-md shadow-blue-900/10 hover:shadow-lg transition-all">
                                                        <Download className="h-3.5 w-3.5" /> Download
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                    <FileText className="h-12 w-12 text-slate-300 mb-4 opacity-50" />
                                    <p className="text-sm font-bold">No assets found in this category.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main >
            <style jsx global>{`
                @keyframes fade-in {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
            `}</style>
        </div >
    );
}
