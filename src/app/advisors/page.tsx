"use client";

import { Sidebar } from "../corporate-customers/[id]/_components/Sidebar";
import { useChat } from "@/context/ChatContext";
import { Mail, Phone, MoreVertical, Plus, Search, Shield, Filter, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const ALL_ADVISORS = [
    { id: 1, name: "Sarah Johnson", company: "Elite Brokers Inc.", email: "sarah.j@elitebrokers.com", phone: "+1 (555) 123-4567", clients: 24, status: "Active" },
    { id: 2, name: "Mike Peters", company: "Direct Financial", email: "mike.p@directfinancial.ca", phone: "+1 (555) 987-6543", clients: 18, status: "Active" },
    { id: 3, name: "Jessica Wong", company: "Wong & Associates", email: "jessica@wongassociates.com", phone: "+1 (555) 456-7890", clients: 32, status: "Active" },
    { id: 4, name: "David Miller", company: "Secure Future", email: "d.miller@securefuture.org", phone: "+1 (555) 222-3333", clients: 7, status: "Pending" },
    { id: 5, name: "Robert Cheney", company: "Cheney Group", email: "rob@cheneygroup.com", phone: "+1 (555) 111-2222", clients: 45, status: "Active" },
    { id: 6, name: "Emily Blunt", company: "Global Insure", email: "emily@globalinsure.com", phone: "+1 (555) 888-9999", clients: 12, status: "Inactive" },
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

export default function AdvisorsPage() {
    const { toggleChat } = useChat();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Dynamic Filtering Logic
    const filteredAdvisors = ALL_ADVISORS.filter(advisor => {
        const matchesSearch = advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            advisor.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || advisor.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Advisors</h1>
                        <p className="text-xs text-slate-500 font-medium">Manage broker relationships & performance</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleChat}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#0a1e3b] text-white rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all hover:-translate-y-0.5 font-black text-[11px] uppercase tracking-wider">
                                <Sparkles className="w-4 h-4 text-blue-400" />
                                Ask Nina
                            </button>
                        </div>
                    </div>
                </header>

                <div className="relative z-10 p-8 space-y-6 animate-fade-in">
                    {/* Advisors Table with Integrated Controls */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
                        <div className="bg-[#0a1e3b] px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                                        <Shield className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Advisors Directory</h3>
                                </div>
                                <span className="text-[9px] font-black text-blue-200 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full border border-white/5">{filteredAdvisors.length} Total</span>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-3">
                                <div className="relative group w-48 md:w-56">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-200 group-focus-within:text-white transition-colors" />
                                    <input
                                        placeholder="Search advisors..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-white/10 rounded-xl border border-white/10 pl-10 pr-4 py-2 text-[11px] font-bold text-white placeholder:text-blue-200/50 focus:bg-white/20 focus:outline-none transition-all"
                                    />
                                </div>

                                <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="bg-white/10 rounded-xl border border-white/10 pl-4 pr-8 py-2 text-[11px] font-black text-white outline-none cursor-pointer appearance-none hover:bg-white/20 transition-all uppercase tracking-wider h-[38px]"
                                    >
                                        <option value="All" className="text-slate-900 font-bold">All Status</option>
                                        <option value="Active" className="text-slate-900 font-bold">Active</option>
                                        <option value="Pending" className="text-slate-900 font-bold">Pending</option>
                                        <option value="Inactive" className="text-slate-900 font-bold">Inactive</option>
                                    </select>
                                </div>

                                <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-[11px] font-black text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wider h-[38px]">
                                    <Plus className="h-3.5 w-3.5" />
                                    Add Advisor
                                </button>
                            </div>
                        </div>
                        <div className="bg-white">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Advisor Name</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Brokerage Info</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Contact</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Clients</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Status</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredAdvisors.length > 0 ? (
                                        filteredAdvisors.map((advisor) => (
                                            <tr key={advisor.id} className="group hover:bg-slate-50 transition-colors duration-200">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-700 font-bold text-xs border border-blue-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                                            {advisor.name.split(" ").map(n => n[0]).join("")}
                                                        </div>
                                                        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{advisor.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 font-medium">{advisor.company}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1.5 text-slate-500 text-xs font-medium">
                                                        <div className="flex items-center gap-2 group-hover:text-slate-700 transition-colors"><Mail className="h-3.5 w-3.5 text-slate-400" /> {advisor.email}</div>
                                                        <div className="flex items-center gap-2 group-hover:text-slate-700 transition-colors"><Phone className="h-3.5 w-3.5 text-slate-400" /> {advisor.phone}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900">{advisor.clients}</span>
                                                        <span className="text-xs text-slate-400 font-medium">accounts</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${advisor.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                        advisor.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                            "bg-slate-50 text-slate-600 border-slate-200"
                                                        }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${advisor.status === "Active" ? "bg-emerald-500 animate-pulse" :
                                                            advisor.status === "Pending" ? "bg-amber-500" :
                                                                "bg-slate-400"
                                                            }`} />
                                                        {advisor.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-slate-400">
                                                    <Search className="w-8 h-8 mb-3 opacity-50" />
                                                    <p className="text-sm font-medium">No advisors found matching your filters.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {filteredAdvisors.length > 0 && (
                                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Showing 1-{filteredAdvisors.length} of {filteredAdvisors.length}</span>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 text-xs font-bold text-slate-500 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 transition-all disabled:opacity-50 shadow-sm" disabled>Previous</button>
                                        <button className="px-4 py-2 text-xs font-bold text-blue-600 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all shadow-sm">Next</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <style jsx global>{`
                @keyframes fade-in {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
            `}</style>
        </div>
    );
}
