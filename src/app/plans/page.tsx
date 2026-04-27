"use client";

import { Sidebar } from "../corporate-customers/[id]/_components/Sidebar";
import {
    Shield, Check, X, Star, ArrowRight, ChevronRight,
    Heart, Eye, Activity, Ambulance, Building2, Users
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import { useRouter } from "next/navigation";

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

const PLANS = [
    {
        id: "bronze",
        name: "Bronze Plan",
        tier: "Basic",
        monthly: 29,
        annual: 348,
        color: "from-slate-500 to-slate-700",
        borderColor: "border-slate-300",
        badge: "Basic",
        rating: "★★★☆☆",
        features: {
            hospitalization: { included: true, limit: "$15,000", copay: "$500" },
            outpatient: { included: true, limit: "$5,000", copay: "$200" },
            dental: { included: false },
            vision: { included: false },
            maternity: { included: false },
            preExisting: { included: true, waiting: "48 months" },
            ambulance: { included: true, limit: "$2,000" },
            taxBenefit: { included: true, limit: "$25,000" }
        },
        benefits: [
            "24/7 Teleconsultation",
            "Health wallet $200",
            "Discounts on wellness"
        ],
        suitableFor: "Young individuals, singles, budget-conscious"
    },
    {
        id: "silver",
        name: "Silver Plan",
        tier: "Standard",
        monthly: 59,
        annual: 708,
        color: "from-blue-500 to-blue-700",
        borderColor: "border-blue-400",
        badge: "Best Value",
        rating: "★★★★☆",
        popular: true,
        features: {
            hospitalization: { included: true, limit: "$30,000", copay: "$300" },
            outpatient: { included: true, limit: "$10,000", copay: "$150" },
            dental: { included: true, limit: "$5,000", copay: "$200" },
            vision: { included: true, limit: "$3,000", copay: "$150" },
            maternity: { included: false },
            preExisting: { included: true, waiting: "36 months" },
            ambulance: { included: true, limit: "$5,000" },
            taxBenefit: { included: true, limit: "$50,000" }
        },
        benefits: [
            "24/7 Specialist Teleconsultation",
            "Health wallet $500",
            "Free annual health checkup",
            "20% discount on partner labs",
            "Mental health support"
        ],
        suitableFor: "Young families, professionals, couples"
    },
    {
        id: "gold",
        name: "Gold Plan",
        tier: "Premium",
        monthly: 69,
        annual: 828,
        color: "from-amber-400 to-amber-600",
        borderColor: "border-amber-400",
        badge: "Recommended",
        rating: "★★★★★",
        features: {
            hospitalization: { included: true, limit: "$75,000", copay: "$100" },
            outpatient: { included: true, limit: "$25,000", copay: "$50" },
            dental: { included: true, limit: "$15,000", copay: "$100" },
            vision: { included: true, limit: "$10,000", copay: "$50" },
            maternity: { included: true, limit: "$50,000", copay: "$500" },
            preExisting: { included: true, waiting: "24 months" },
            ambulance: { included: true, limit: "$15,000", air: true },
            taxBenefit: { included: true, limit: "$75,000" }
        },
        benefits: [
            "24/7 Priority specialist teleconsultation",
            "Health wallet $1,500",
            "Quarterly health checkup",
            "Unlimited diagnostics at partner labs",
            "Dedicated relationship manager",
            "International coverage (emergency)",
            "Home healthcare services",
            "Alternative medicine (Ayurveda, Homeopathy)"
        ],
        suitableFor: "Families with children, high-income individuals, seniors"
    },
    {
        id: "platinum",
        name: "Platinum Plan",
        tier: "Ultimate",
        monthly: 129,
        annual: 1548,
        color: "from-indigo-600 to-violet-800",
        borderColor: "border-indigo-500",
        badge: "Ultimate",
        rating: "★★★★★+",
        features: {
            hospitalization: { included: true, limit: "Unlimited", copay: "$0" },
            outpatient: { included: true, limit: "Unlimited", copay: "$0" },
            dental: { included: true, limit: "$50,000", copay: "$0" },
            vision: { included: true, limit: "$25,000", copay: "$0" },
            maternity: { included: true, limit: "$150,000", copay: "$0" },
            preExisting: { included: true, waiting: "Instant" },
            ambulance: { included: true, limit: "Global Air" },
            taxBenefit: { included: true, limit: "$100,000" }
        },
        benefits: [
            "Concierge medicine service",
            "Global second opinion specialists",
            "Zero co-pay on all claims",
            "Private jet medical evacuation",
            "Luxury wellness retreat access",
            "Family office dedicated advisor"
        ],
        suitableFor: "HNW Individuals, expats, global luxury seekers"
    }
];

const COMPARISON_DATA = [
    { feature: "Monthly Premium", bronze: "$29", silver: "$59", gold: "$69", platinum: "$129" },
    { feature: "Annual Premium", bronze: "$348", silver: "$708", gold: "$828", platinum: "$1,548" },
    { feature: "Deductible", bronze: "$2,500", silver: "$1,500", gold: "$500", platinum: "$0" },
    { feature: "Max Coverage", bronze: "$50,000", silver: "$100,000", gold: "$250,000", platinum: "Unlimited" },
    { feature: "Coverage %", bronze: "60%", silver: "75%", gold: "90%", platinum: "100%" },
    { feature: "Hospitalization", bronze: "$15,000", silver: "$30,000", gold: "$75,000", platinum: "Unlimited" },
    { feature: "Outpatient", bronze: "$5,000", silver: "$10,000", gold: "$25,000", platinum: "Unlimited" },
    { feature: "Dental", bronze: "Not Included", silver: "$5,000", gold: "$15,000", platinum: "$50,000" },
    { feature: "Vision", bronze: "Not Included", silver: "$3,000", gold: "$10,000", platinum: "$25,000" },
    { feature: "Maternity", bronze: "Not Included", silver: "Not Included", gold: "$50,000", platinum: "$150,000" },
    { feature: "Pre-existing (Wait)", bronze: "48 months", silver: "36 months", gold: "24 months", platinum: "Instant" },
    { feature: "Ambulance", bronze: "$2,000", silver: "$5,000", gold: "$15,000 + Air", platinum: "Global Air" },
    { feature: "Tax Benefit (80D)", bronze: "$25,000", silver: "$50,000", gold: "$75,000", platinum: "$100,000" },
    { feature: "Health Wallet", bronze: "$200", silver: "$500", gold: "$1,500", platinum: "$5,000" },
    { feature: "Annual Checkup", bronze: "Not Included", silver: "Included", gold: "Quarterly", platinum: "Monthly" },
    { feature: "Dedicated Manager", bronze: "Not Included", silver: "Not Included", gold: "Included", platinum: "Full Concierge" },
    { feature: "International", bronze: "Not Included", silver: "Not Included", gold: "Included", platinum: "Full Global" },
    { feature: "Home Healthcare", bronze: "Not Included", silver: "Not Included", gold: "Included", platinum: "Unlimited" }
];

export default function PlansPage() {
    const router = useRouter();
    const { openChat } = useChat();
    const [activeTab, setActiveTab] = useState<"cards" | "compare">("cards");
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setSelectedPlan(null);
            }
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, []);

    const handleCompare = () => {
        openChat("Compare all insurance plans");
    };

    const handleGetQuote = (planId: string) => {
        openChat(`I want to get a quote for ${planId} plan`);
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-tr from-slate-200 via-indigo-50 to-blue-100 font-sans selection:bg-blue-600/10">
            <Sidebar />
            <main className="flex-1 md:ml-64 relative overflow-hidden flex flex-col">
                <AnimatedGrid />
                
                <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

                <header className="relative z-20 flex min-h-[5rem] md:h-20 flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 border-b border-slate-200/60 bg-white/70 backdrop-blur-md px-4 md:px-8 pt-24 md:pt-0 pb-4 md:pb-0">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Insurance Plans
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">
                            Compare our Bronze, Silver, Gold, and Platinum plans to find the perfect coverage for you
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleCompare}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#0a1e3b] text-white rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all hover:-translate-y-0.5 font-black text-[11px] uppercase tracking-wider"
                            >
                                <Shield className="w-4 h-4 text-blue-400" />
                                Compare Plans in Chat
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="relative z-10 flex-1 p-8 overflow-y-auto">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab("cards")}
                            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
                                activeTab === "cards" 
                                    ? "bg-[#1e3a5f] text-white shadow-lg" 
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Shield size={16} />
                                Plan Cards
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab("compare")}
                            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
                                activeTab === "compare" 
                                    ? "bg-[#1e3a5f] text-white shadow-lg" 
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Activity size={16} />
                                Full Comparison
                            </div>
                        </button>
                    </div>

                    {activeTab === "cards" && (
                        <div className="grid grid-cols-4 gap-4 mt-8">
                            {PLANS.map((plan) => (
                                <div 
                                    key={plan.id}
                                    className={`relative bg-white rounded-2xl border-2 ${plan.borderColor} overflow-hidden hover:shadow-2xl transition-all duration-300 group ${plan.popular ? 'ring-4 ring-blue-500/20' : ''}`}
                                >
                                    {plan.popular && (
                                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#1e3a5f] to-[#2a4a7a] text-white text-center py-2 text-xs font-bold tracking-wider">
                                            ★ MOST POPULAR ★
                                        </div>
                                    )}
                                    
                                    <div className={`p-6 ${plan.popular ? 'pt-10' : ''}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-2 ${plan.popular ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {plan.badge}
                                                </span>
                                                <h3 className="text-xl font-black text-[#1e3a5f]">{plan.name}</h3>
                                                <p className="text-slate-400 text-sm font-medium">{plan.tier}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-black text-[#1e3a5f]">${plan.monthly}</p>
                                                <p className="text-slate-400 text-xs font-medium">/month</p>
                                            </div>
                                        </div>

                                        <div className="mb-6 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-slate-500 text-xs font-semibold">Annual</p>
                                                    <p className="text-lg font-black text-[#1e3a5f]">${plan.annual.toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-slate-500 text-xs font-semibold">Rating</p>
                                                    <p className="text-sm font-bold text-amber-500">{plan.rating}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-600 font-medium">Hospitalization</span>
                                                <span className="font-bold text-[#1e3a5f]">{plan.features.hospitalization.limit}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-600 font-medium">Outpatient</span>
                                                <span className="font-bold text-[#1e3a5f]">{plan.features.outpatient.limit}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-600 font-medium">Dental</span>
                                                <span className={`font-bold ${plan.features.dental.included ? 'text-green-600' : 'text-red-400'}`}>
                                                    {plan.features.dental.included ? 'Included' : 'Not Included'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-600 font-medium">Vision</span>
                                                <span className={`font-bold ${plan.features.vision.included ? 'text-green-600' : 'text-red-400'}`}>
                                                    {plan.features.vision.included ? 'Included' : 'Not Included'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-600 font-medium">Maternity</span>
                                                <span className={`font-bold ${plan.features.maternity.included ? 'text-green-600' : 'text-red-400'}`}>
                                                    {plan.features.maternity.included ? 'Included' : 'Not Included'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Key Benefits</p>
                                            <ul className="space-y-1">
                                                {plan.benefits.slice(0, 3).map((benefit, idx) => (
                                                    <li key={idx} className="text-sm text-slate-600 font-medium flex items-center gap-2">
                                                        <Check size={14} className="text-[#1e3a5f]" />
                                                        {benefit}
                                                    </li>
                                                ))}
                                                {plan.benefits.length > 3 && (
                                                    <li className="text-sm text-blue-600 font-bold">
                                                        +{plan.benefits.length - 3} more benefits
                                                    </li>
                                                )}
                                            </ul>
                                        </div>

                                        <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                                            <p className="text-xs font-bold text-[#1e3a5f] mb-1">Best For</p>
                                            <p className="text-sm text-slate-700 font-medium">{plan.suitableFor}</p>
                                        </div>

                                        <button
                                            onClick={() => handleGetQuote(plan.id)}
                                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                                                plan.popular
                                                    ? "bg-[#1e3a5f] text-white hover:bg-[#2a4a7a]"
                                                    : "bg-slate-100 text-[#1e3a5f] hover:bg-slate-200"
                                            }`}
                                        >
                                            Get Quote
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "compare" && (
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl mt-8">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                                            <th className="p-4 text-left text-sm font-black text-slate-600">Feature</th>
                                            <th className="p-4 text-center text-sm font-black text-slate-600">Bronze</th>
                                            <th className="p-4 text-center text-sm font-black text-blue-600">Silver</th>
                                            <th className="p-4 text-center text-sm font-black text-amber-600">Gold</th>
                                            <th className="p-4 text-center text-sm font-black text-indigo-600">Platinum</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {COMPARISON_DATA.map((row, idx) => (
                                            <tr 
                                                key={idx} 
                                                className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}
                                            >
                                                <td className="p-4 text-sm font-semibold text-slate-700">{row.feature}</td>
                                                <td className="p-4 text-center text-sm text-slate-600 font-medium">{row.bronze}</td>
                                                <td className="p-4 text-center text-sm text-slate-600 font-medium">{row.silver}</td>
                                                <td className={`p-4 text-center text-sm ${row.gold.includes('$') || row.gold.includes('%') ? 'font-bold text-[#1e3a5f]' : 'text-slate-600 font-medium'}`}>{row.gold}</td>
                                                <td className="p-4 text-center text-sm font-bold text-indigo-700">{row.platinum}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-black text-[#1e3a5f] mb-1">Need Help Choosing?</h4>
                                        <p className="text-slate-500 text-sm font-medium">Chat with Nina to find the perfect plan for your needs</p>
                                    </div>
                                    <button
                                        onClick={() => openChat("Which plan is best for me?")}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a5f] text-white rounded-xl font-bold text-sm hover:bg-[#2a4a7a] transition-all"
                                    >
                                        <Shield size={18} />
                                        Get Recommendation
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}