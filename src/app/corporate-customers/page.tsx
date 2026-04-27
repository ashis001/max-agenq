"use client";

import { Sidebar } from "./[id]/_components/Sidebar";
import { Plus, Info, Trash2, Edit2, AlertTriangle, Search, Filter, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import { fetchAllCorporates, deleteCorporate } from "@/lib/db";
import { Corporate } from "@/lib/types";
import { speakText } from "@/lib/google-tts";
import MaxGuidePointer from "@/components/MaxGuidePointer";

// Animated Grid Component
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

export default function CorporateListingPage() {
    const { toggleChat, openChat } = useChat();
    const [searchTerm, setSearchTerm] = useState("");
    const [corporates, setCorporates] = useState<Corporate[]>([]);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [activeGuide, setActiveGuide] = useState<string | null>(null);

    const loadCorporatesList = async () => {
        const localData = await fetchAllCorporates();
        setCorporates(localData);
    };

    useEffect(() => {
        loadCorporatesList();
        setMounted(true);

        // Check for Max's Guide trigger
        const guideStep = localStorage.getItem("max_guide_step");
        if (guideStep === "add_customer") {
            const timer = setTimeout(() => {
                setActiveGuide("add_customer");
                // Final instruction on listing page
                openChat("Now, please click on the 'Add New Customer' button in the top right corner.");
            }, 800);
            return () => clearTimeout(timer);
        }

        const handleFocus = () => {
            loadCorporatesList();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            setIsDeleting(true);
            await deleteCorporate(deleteId);
            await loadCorporatesList();
            setDeleteId(null);
        } catch (err) {
            alert("Failed to delete corporate.");
        } finally {
            setIsDeleting(false);
        }
    };

    const filtered = corporates.filter(c =>
        (c.name || "New Customer Draft").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.contactEmail || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const newId = `corp-${Math.random().toString(36).substr(2, 9)}`;

    if (!mounted) return null;

    return (
        <div className="flex min-h-screen bg-gradient-to-tr from-slate-200 via-indigo-50 to-blue-100 font-sans selection:bg-blue-600/10">
            <Sidebar />
            <main className="flex-1 md:ml-64 relative overflow-hidden flex flex-col">
                <AnimatedGrid />

                {/* Dynamic Background Accents */}
                <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

                {/* Premium Header */}
                <header className="relative z-20 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/70 backdrop-blur-md px-4 md:px-8 pt-14 md:pt-0">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Corporate Customers</h1>
                        <p className="text-xs text-slate-500 font-medium">Manage enterprise contracts & profiles</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => openChat("Hi, I’m Nina. Your Assistant. Ask me anything")}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#0a1e3b] text-white rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all hover:-translate-y-0.5 font-black text-[11px] uppercase tracking-wider">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            Ask Nina
                        </button>
                    </div>
                </header>

                <div className="relative z-10 p-8 space-y-6 animate-fade-in">
                    {/* Main Table Card with Integrated Controls */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
                        <div className="bg-[#0a1e3b] px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                                        <Info className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Corporations</h3>
                                </div>
                                <span className="text-[9px] font-black text-blue-200 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full border border-white/5">{filtered.length} Total</span>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <div className="relative group w-48 md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-200 group-focus-within:text-white transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search corporations..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-white/10 rounded-xl border border-white/10 pl-10 pr-4 py-2 text-[11px] font-bold text-white placeholder:text-blue-200/50 focus:bg-white/20 focus:outline-none transition-all"
                                    />
                                </div>

                                <div className="relative">
                                    <Link
                                        href={`/corporate-customers/${newId}`}
                                        onClick={() => setActiveGuide(null)}
                                        className="group flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-[11px] font-black text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wider"
                                    >
                                        <Plus className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform" />
                                        Add New Customer
                                    </Link>

                                    {activeGuide === "add_customer" && (
                                        <MaxGuidePointer
                                            text="Click here to start your onboarding guide"
                                            targetUrl={`/corporate-customers/${newId}`}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-x-auto">
                            <table className="w-full text-left text-sm min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 w-12">Status</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Name</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Advisor</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 text-center">Profiles</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 text-center">Headcount</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Admin Email</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 text-center">Approval</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Info className="w-8 h-8 mb-3 opacity-50" />
                                                    <p className="text-sm font-medium">No records found</p>
                                                    <p className="text-[10px] mt-1">Click "Add New Customer" to create your first corporate customer</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filtered.map((corp) => (
                                        <tr key={corp.id} className="group hover:bg-slate-50 transition-colors duration-200">
                                            <td className="px-6 py-4">
                                                <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-opacity-20 ${corp.corporateInfoCompleted ? 'bg-emerald-500 ring-emerald-500' : 'bg-slate-300 ring-slate-300'}`}></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link href={`/corporate-customers/${corp.id}?view=overview`} className="font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                                    {corp.name || "New Customer Draft"}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-bold text-[10px] uppercase">{corp.broker || "-"}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-blue-50 text-blue-700 font-bold text-xs">{0}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-slate-100 text-slate-700 font-bold text-xs">
                                                    {corp.tiers?.reduce((acc, t) => acc + (t.status === "Active" ? 1 : 0), 0) || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs font-medium">{corp.contactEmail || "-"}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button className="bg-[#0a1e3b] text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase shadow-lg shadow-blue-900/10 hover:bg-blue-900 hover:scale-105 transition-all">
                                                    Approve
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link href={`/corporate-customers/${corp.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                        <Edit2 size={14} />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteId(corp.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Pagination */}
                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs font-medium text-slate-500">
                                <span>Showing 1 to {filtered.length} of {filtered.length} entries</span>
                                <div className="flex gap-1">
                                    <button className="px-3 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50">Previous</button>
                                    <button className="px-3 py-1 rounded-md bg-blue-600 text-white font-bold">1</button>
                                    <button className="px-3 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50">Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main >

            {/* Modern Delete Confirmation Modal */}
            {
                deleteId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/60 backdrop-blur-sm animate-fade-in">
                        <div className="w-full max-w-md scale-100 transform rounded-3xl bg-white p-8 shadow-2xl transition-all border border-slate-200">
                            <div className="mb-6 flex items-center justify-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border-4 border-red-50">
                                    <AlertTriangle className="h-8 w-8 text-red-500" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Confirm Deletion</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    Are you sure you want to delete this corporate customer? This action is irreversible and will remove all associated data.
                                </p>
                            </div>
                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Deleting...
                                        </>
                                    ) : (
                                        "Delete Customer"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            <style jsx global>{`
                @keyframes fade-in {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div >
    );
}
