"use client";

import MaxGreeting from "@/components/MaxGreeting";
import { Sidebar } from "../corporate-customers/[id]/_components/Sidebar";
import {
    Search,
    BookOpen,
    MessageCircle,
    HelpCircle,
    PlayCircle,
    FileText,
    ChevronRight,
    Sparkles,
    LifeBuoy
} from "lucide-react";

const HELP_CATEGORIES = [
    {
        title: "Getting Started",
        icon: PlayCircle,
        color: "blue",
        articles: ["How to set up your first customer", "Understanding the dashboard", "Inviting team members"]
    },
    {
        title: "Onboarding Flow",
        icon: BookOpen,
        color: "indigo",
        articles: ["Setting up Tiers & Plans", "Compliance documentation", "Approval workflows"]
    },
    {
        title: "Claims & Support",
        icon: LifeBuoy,
        color: "emerald",
        articles: ["Processing urgent claims", "Member eligibility checks", "Reporting & Exports"]
    }
];

export default function HelpCenterPage() {
    return (
        <div className='flex min-h-screen bg-gradient-to-tr from-slate-200 via-indigo-50 to-blue-100 font-sans selection:bg-blue-600/10'>
            <MaxGreeting />
            <Sidebar />

            <main className='flex-1 md:ml-64 relative overflow-hidden flex flex-col'>
                {/* Header Hero Section */}
                <div className="relative h-80 bg-[#0a1e3b] overflow-hidden flex flex-col items-center justify-center px-4 md:px-8 pt-24 md:pt-0 pb-4 md:pb-0">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                    <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]" />

                    <div className="relative z-10 text-center space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-blue-200 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                            <Sparkles className="w-3 h-3" />
                            How can we help?
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Max Insurance Help Center</h1>
                        <p className="text-blue-200/70 text-sm font-medium">Search our documentation or contact our 24/7 support team</p>

                        <div className="relative mt-8">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search articles, guides, and tutorials..."
                                className="w-full bg-white rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-slate-900 shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className='relative z-10 p-12 -mt-16 space-y-12 animate-fade-in'>
                    {/* Quick Links */}
                    <div className="grid grid-cols-3 gap-8">
                        {HELP_CATEGORIES.map((cat, i) => (
                            <div key={i} className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200 p-8 shadow-xl hover:scale-105 transition-all duration-300">
                                <div className={`p-4 rounded-2xl bg-${cat.color}-50 border border-${cat.color}-100 w-fit mb-6`}>
                                    <cat.icon className={`w-8 h-8 text-${cat.color}-600`} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4">{cat.title}</h3>
                                <div className="space-y-3">
                                    {cat.articles.map((art, j) => (
                                        <button key={j} className="flex items-center justify-between w-full group text-left">
                                            <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600 transition-colors">{art}</span>
                                            <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact Support */}
                    <div className="bg-[#0a1e3b] rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                                    <MessageCircle className="w-8 h-8 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">Need direct assistance?</h3>
                                    <p className="text-blue-200/60 text-sm font-medium">Our expert support team is ready to help you with any technical issues.</p>
                                </div>
                            </div>
                            <button className="px-6 py-3 bg-white text-[#0a1e3b] rounded-xl text-xs font-bold shadow-lg shadow-black/20 hover:scale-105 transition-all">
                                Contact Technical Support
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
        </div>
    );
}
