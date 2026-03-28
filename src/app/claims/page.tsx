"use client";

import { Sidebar } from "../corporate-customers/[id]/_components/Sidebar";
import {
    FileText, CheckCircle, Clock, Shield, DollarSign, Calendar,
    Heart, Stethoscope, Eye, Activity, UploadCloud, ChevronRight, ChevronLeft, ArrowRight, Sparkles, Plus, Search, Filter, Info, X, Car, Plane
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { speakText } from "@/lib/google-tts";
import { MousePointer2 } from "lucide-react";
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

// Claim Types
const INSURANCE_TYPES = [
    {
        id: 'health',
        title: 'Health',
        icon: Heart,
        description: 'Medical expenses, hospital stays, and doctor visits',
        color: 'rose',
        subTypes: [
            { id: 'medical', title: 'Medical Health', description: 'Doctor visits and surgeries', icon: Heart },
            { id: 'dental', title: 'Dental Care', description: 'Cleanings and dental surgery', icon: Activity },
            { id: 'vision', title: 'Vision Coverage', description: 'Exams and contact lenses', icon: Eye },
            { id: 'wellness', title: 'Wellness', description: 'Preventive care programs', icon: Stethoscope },
        ]
    },
    {
        id: 'auto',
        title: 'Auto',
        icon: Car,
        description: 'Vehicle damage, accidents, and theft coverage',
        color: 'blue',
        subTypes: [
            { id: 'accident', title: 'Accidental Damage', description: 'Collisions and repairs', icon: Activity },
            { id: 'theft', title: 'Theft & Glass', description: 'Break-ins and glass damage', icon: Shield },
            { id: 'maintenance', title: 'Regular Maintenance', description: 'Service and oil changes', icon: Clock },
        ]
    },
    {
        id: 'travel',
        title: 'Travel',
        icon: Plane,
        description: 'Trip delays, baggage loss, and medical emergencies',
        color: 'emerald',
        subTypes: [
            { id: 'trip', title: 'Trip Cancellation', description: 'Cancelled or delayed flights', icon: Activity },
            { id: 'medical_travel', title: 'Medical (Travel)', description: 'Injuries while abroad', icon: Stethoscope },
            { id: 'baggage', title: 'Lost Baggage', description: 'Stolen or lost personal items', icon: Shield },
        ]
    },
];



export default function ClaimsPage() {
    const router = useRouter();
    const { toggleChat, openChat, isWorkflowPaused, isWorkflowActive, setIsWorkflowActive, setSubmittedClaimId, submittedClaimId } = useChat();
    const isWorkflowPausedRef = useRef(isWorkflowPaused);
    const isWorkflowActiveRef = useRef(isWorkflowActive);

    useEffect(() => {
        isWorkflowPausedRef.current = isWorkflowPaused;
        isWorkflowActiveRef.current = isWorkflowActive;
    }, [isWorkflowPaused, isWorkflowActive]);

    const [step, setStep] = useState(0);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedSubType, setSelectedSubType] = useState<any>(null);
    const [isFloating, setIsFloating] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Guidance State
    const [activeFillingField, setActiveFillingField] = useState<string | null>(null);
    const [pointerPos, setPointerPos] = useState<{ top: number, left: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Mock Form Data State
    const [formData, setFormData] = useState({
        provider: "",
        date: "",
        amount: "",
        diagnosis: ""
    });

    const hasStartedRef = useRef(false);

    useEffect(() => {
        if (submittedClaimId === "CLM-10234" && step !== 5) {
            setStep(5);
        }
    }, [submittedClaimId, step]);

    useEffect(() => {
        setMounted(true);

        const guideStep = localStorage.getItem("max_guide_step");

        // Handle the actual claims workflow (when already on the claims page)
        if (guideStep === "claim_insurance" && !hasStartedRef.current) {
            hasStartedRef.current = true;
            const runGuide = async () => {
                try {
                    setIsWorkflowActive(true);
                    isWorkflowActiveRef.current = true; // Sync ref immediately

                    const delay = async (ms: number) => {
                        if (!isWorkflowActiveRef.current) throw new Error("WorkflowCancelled");
                        await new Promise(resolve => setTimeout(resolve, ms));
                        while (isWorkflowPausedRef.current) {
                            if (!isWorkflowActiveRef.current) throw new Error("WorkflowCancelled");
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                        if (!isWorkflowActiveRef.current) throw new Error("WorkflowCancelled");
                    };
                    const speak = async (text: string) => {
                        if (!text) return;
                        await speakText(text);
                        if (isWorkflowPausedRef.current) {
                            await delay(0);
                            await speakText(text);
                        }
                    };

                    await delay(1000);

                    // If we're on Step 0 (List View), we need to click "New Claim Request" first
                    const addBtn = document.getElementById("add-claim-btn");
                    if (addBtn && step === 0) {
                        setActiveFillingField("add-claim-btn");
                        await speak("To file a new claim, let's click on New Claim Request.");
                        await delay(2500);
                        addBtn.click();
                        await delay(1500); // Wait for popup animation to complete
                        setActiveFillingField(null);
                    }

                    // Step 1: Select Category (now in popup)
                    const targetId = "category-health";
                    // Loop until element exists (Wait for popup to appear)
                    let el = document.getElementById(targetId);
                    let attempts = 0;
                    while (!el && attempts < 30) {
                        await delay(100);
                        el = document.getElementById(targetId);
                        attempts++;
                    }

                    if (el) {
                        setActiveFillingField(targetId);
                        await speak("Now, select a category. Let's choose Health.");
                        // Wait for speech to complete before proceeding
                        await delay(2500);
                        if (!isWorkflowActiveRef.current) throw new Error("WorkflowCancelled");

                        // Click the element to trigger the selection
                        el.click();

                        // Wait for the UI to update
                        await delay(500);

                        setStep(2);
                        setActiveFillingField(null);
                    }

                    await delay(1000);

                    // Step 2: Fill Form with enhanced guidance
                    const fillField = async (id: string, value: string, text: string) => {
                        if (!isWorkflowActiveRef.current) throw new Error("WorkflowCancelled");

                        // Highlight the field
                        setActiveFillingField(id);

                        const input = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
                        if (input) {
                            // Scroll to field if needed
                            const rect = input.getBoundingClientRect();
                            if (rect.top > window.innerHeight || rect.bottom < 0) {
                                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                await delay(600); // Wait for scroll to complete
                            }

                            // Focus the input
                            input.focus({ preventScroll: true });

                            // Speak the instruction
                            await speak(text);

                            // Wait a bit after speaking
                            await delay(800);

                            // Type the value character by character
                            let current = "";
                            for (const char of value) {
                                if (!isWorkflowActiveRef.current) throw new Error("WorkflowCancelled");
                                current += char;
                                setFormData(prev => ({ ...prev, [id]: current }));

                                // Random typing delay for realism
                                await delay(30 + Math.random() * 20);
                            }

                            // Wait after filling the field
                            await delay(600);
                        }
                    };

                    // Fill each form field with proper delays
                    await fillField("provider", "City General Hospital", "Enter the name of your medical provider.");
                    await delay(500);

                    await fillField("date", "2026-02-01", "Select the date of service from your invoice.");
                    await delay(500);

                    await fillField("amount", "245.50", "Enter the total claim amount.");
                    await delay(500);

                    await fillField("diagnosis", "Regular checkup and flu vaccination.", "Briefly describe the reason for your visit.");
                    await delay(500);

                    // Highlight and speak about the next button
                    const nextBtn = document.getElementById("next-step-btn");
                    if (nextBtn) {
                        setActiveFillingField("next-step-btn");
                        await speak("Great! I've prepared the details. Now click the 'Continue to Uploads' button to proceed.");
                        await delay(1000); // Wait for the speech to complete

                        // Click the button to move to the next step
                        nextBtn.click();
                    }

                    // Wait for the next step to load
                    await delay(1500);

                    // Wait for step to change to 3 (upload) by checking for the presence of upload elements
                    while (!document.getElementById("review-claim-btn") && isWorkflowActiveRef.current) {
                        await delay(100);
                    }

                    // Now handle the upload step if we're on step 3
                    if (document.getElementById("review-claim-btn") && isWorkflowActiveRef.current) {
                        // Highlight the upload area
                        const uploadArea = document.getElementById("upload-area");
                        if (uploadArea) {
                            setActiveFillingField("upload-area");
                            await speak("Now you would upload your receipt or invoice here. For this demo, I'll simulate the upload process.");
                            await delay(3000); // Give user time to see the indicator

                            // Click the next button to move to review step
                            const nextBtn = document.getElementById("review-claim-btn");
                            if (nextBtn) {
                                setActiveFillingField(null); // Clear before click
                                nextBtn.click();
                            }
                        }
                    }

                    // Wait for step to change to 4 (review) by checking for the submit button
                    await delay(1500);
                    while (!document.getElementById("submit-claim-btn") && isWorkflowActiveRef.current) {
                        await delay(100);
                    }

                    // Handle the review step if we're on step 4
                    if (document.getElementById("submit-claim-btn") && isWorkflowActiveRef.current) {
                        const reviewBtn = document.getElementById("submit-claim-btn");
                        if (reviewBtn) {
                            setActiveFillingField("submit-claim-btn");
                            await speak("Everything looks good. Now click the 'Submit Claim Request' button to finalize your claim.");
                            await delay(1000);

                            // Click the submit button
                            reviewBtn.click();
                        }
                    }

                    // Wait for submission
                    await delay(2000);

                    // Final message - only use openChat to avoid duplicate speech
                    openChat("Your claim has been submitted successfully! The claim ID is CLM-89210. You can track the status in the claims dashboard.");
                    setSubmittedClaimId("CLM-89210"); // Set the submitted claim ID in context

                    // Wait a bit before deactivating workflow
                    await delay(2000); // Increased delay to ensure message is processed

                    // Only deactivate if workflow is still active
                    if (isWorkflowActiveRef.current) {
                        setIsWorkflowActive(false);
                    }
                } catch (e: any) {
                    if (e.message === "WorkflowCancelled") {
                        console.log("Claims workflow cancelled");
                        setActiveFillingField(null);
                    } else {
                        console.error("Claims workflow error:", e);
                    }

                    // Cleanup in case of error
                    setActiveFillingField(null);
                    setIsWorkflowActive(false);
                }

                // Clean up the guide step
                localStorage.removeItem("max_guide_step");
            };

            runGuide();
        }
    }, [openChat, setIsWorkflowActive, setSubmittedClaimId]);

    // Pointer Sync
    useEffect(() => {
        if (!activeFillingField) {
            setPointerPos(null);
            return;
        }

        const updatePosition = () => {
            const el = document.getElementById(activeFillingField);
            const container = containerRef.current;
            if (el && container) {
                const rect = el.getBoundingClientRect();
                const contRect = container.getBoundingClientRect();
                setPointerPos({
                    top: rect.top - contRect.top,
                    left: rect.left - contRect.left + rect.width / 2
                });
            }
        };

        updatePosition();
        const rafId = requestAnimationFrame(function tick() {
            updatePosition();
            requestAnimationFrame(tick);
        });
        window.addEventListener('resize', updatePosition);
        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', updatePosition);
        };
    }, [activeFillingField]);

    const handleNext = () => {
        setActiveFillingField(null); // Clear guidance when user clicks
        if (step === 4) {
            handleSubmit();
        } else {
            setStep(s => s + 1);
        }
    };

    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = () => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setStep(5); // Success/Tracking View
            setSubmittedClaimId("CLM-89210"); // Set globally
        }, 2000);
    };

    if (!mounted) return null;

    return (
        <div className="flex min-h-screen bg-gradient-to-tr from-slate-200 via-indigo-50 to-blue-100 font-sans selection:bg-blue-600/10">
            <Sidebar />
            <main className="flex-1 ml-64 relative overflow-hidden flex flex-col" ref={containerRef}>
                <AnimatedGrid />

                {/* Pointer Indicator */}
                {activeFillingField && pointerPos && (
                    <div
                        className="absolute z-[10000] pointer-events-none transition-all duration-500 ease-in-out"
                        style={{
                            left: pointerPos.left,
                            top: pointerPos.top,
                            transform: 'translate(-50%, -100%)'
                        }}
                    >
                        <div className="relative flex flex-col items-center animate-Cloey-pointer-float">
                            <div className="text-red-500 filter drop-shadow-[0_4px_12px_rgba(239,68,68,0.4)] transform rotate-[225deg]">
                                <MousePointer2 className="w-8 h-8 fill-red-500" />
                            </div>
                            <div className="absolute inset-0 -m-2 rounded-full bg-red-500 animate-ping opacity-20 scale-[1.5]" />
                        </div>
                    </div>
                )}

                {/* Dynamic Background Accents */}
                <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

                {/* Premium Header */}
                <header className="relative z-20 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/70 backdrop-blur-md px-8">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {step === 0 ? "Claims Requests" : "New Claim Request"}
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">
                            {step === 0 ? "Manage and track all reimbursement requests" : "Submit and track reimbursement requests"}
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleChat}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#0a1e3b] text-white rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all hover:-translate-y-0.5 font-black text-[11px] uppercase tracking-wider">
                                <Sparkles className="w-4 h-4 text-blue-400" />
                                Ask Cloey
                            </button>
                        </div>
                    </div>
                </header>

                <div className={`relative z-10 p-8 flex-1 flex flex-col items-center ${step === 0 ? 'justify-start' : 'justify-center'} overflow-y-auto animate-fade-in`}>

                    {/* STEP 0: Claims Listing Table */}
                    {step === 0 && (
                        <div className="w-full max-w-7xl space-y-6">
                            <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
                                <div className="bg-[#0a1e3b] px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                                                <FileText className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Submitted Claims</h3>
                                        </div>
                                        <span className="text-[9px] font-black text-blue-200 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full border border-white/5">4 Total</span>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center gap-4">
                                        <div className="relative group w-48 md:w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-200 group-focus-within:text-white transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Search claims..."
                                                className="w-full bg-white/10 rounded-xl border border-white/10 pl-10 pr-4 py-2 text-[11px] font-bold text-white placeholder:text-blue-200/50 focus:bg-white/20 focus:outline-none transition-all"
                                            />
                                        </div>

                                        <button
                                            id="add-claim-btn"
                                            onClick={() => setStep(1)}
                                            className="group flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-[11px] font-black text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wider whitespace-nowrap"
                                        >
                                            <Plus className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform" />
                                            New Claim Request
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Claim Category</th>
                                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Claim ID</th>
                                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Submitted At</th>
                                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 text-center">Amount</th>
                                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 text-center">Status</th>
                                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {[
                                                { id: 'CLM-89210', category: 'Health', date: 'Feb 7, 2026 17:20', amount: '$245.50', status: 'Processing' },
                                                { id: 'CLM-89105', category: 'Auto', date: 'Feb 5, 2026 10:15', amount: '$120.00', status: 'Paid' },
                                                { id: 'CLM-88992', category: 'Health', date: 'Feb 1, 2026 14:30', amount: '$350.00', status: 'Paid' },
                                                { id: 'CLM-88845', category: 'Auto', date: 'Jan 28, 2026 09:45', amount: '$75.00', status: 'Rejected' },
                                                { id: 'CLM-88777', category: 'Travel', date: 'Jan 25, 2026 11:00', amount: '$500.00', status: 'Processing' },
                                            ].map((claim, idx) => (
                                                <tr key={idx} className="group hover:bg-slate-50 transition-colors duration-200">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${claim.category === 'Health' ? 'bg-rose-50 text-rose-600' :
                                                                claim.category === 'Travel' ? 'bg-purple-50 text-purple-600' :
                                                                    'bg-blue-50 text-blue-600'
                                                                }`}>
                                                                {claim.category.charAt(0)}
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-900">{claim.category}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-mono font-black text-blue-600">{claim.id}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-slate-700">{claim.date.split(',')[0]}</span>
                                                            <span className="text-[10px] font-bold text-slate-400">{claim.date.split(' ')[2]} {claim.date.split(' ')[3]}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-xs text-slate-900">{claim.amount}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${claim.status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                            claim.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                                'bg-rose-50 text-rose-700 border-rose-100'
                                                            }`}>
                                                            {claim.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                                <Info size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* STEP 2: Claim Details Form */}

                    {/* STEP 2: Claim Details Form */}
                    {step === 2 && (
                        <div className="w-full max-w-2xl bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-300 shadow-2xl animate-slide-up">
                            <div className="flex items-center gap-4 mb-8">
                                <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-slate-500" /></button>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">Provider & Service Details</h2>
                                    <p className="text-xs text-slate-500 font-medium">Please provide the details from your invoice</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Claim Category</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10">
                                            {selectedSubType?.icon ? React.createElement(selectedSubType.icon, { className: "w-4 h-4" }) :
                                                <span>{INSURANCE_TYPES.find(t => t.id === selectedType)?.icon &&
                                                    React.createElement(INSURANCE_TYPES.find(t => t.id === selectedType)!.icon, { className: "w-4 h-4 opacity-50" })}</span>}
                                        </div>
                                        <select
                                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all appearance-none bg-white cursor-pointer"
                                            value={selectedSubType?.id || ""}
                                            onChange={(e) => {
                                                const type = INSURANCE_TYPES.find(t => t.id === selectedType);
                                                const sub = type?.subTypes.find(s => s.id === e.target.value);
                                                setSelectedSubType(sub);
                                            }}
                                        >
                                            <option value="" disabled>Select {selectedType} type...</option>
                                            {INSURANCE_TYPES.find(t => t.id === selectedType)?.subTypes.map(sub => (
                                                <option key={sub.id} value={sub.id}>{sub.title}</option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Provider Name</label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                id="provider"
                                                type="text"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all"
                                                placeholder="e.g. City General Hospital"
                                                value={formData.provider}
                                                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Date of Service</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                id="date"
                                                type="date"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all text-slate-600"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Total Amount</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            id="amount"
                                            type="number"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all"
                                            placeholder="0.00"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Reason / Diagnosis</label>
                                    <textarea
                                        id="diagnosis"
                                        className="w-full p-4 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all min-h-[100px]"
                                        placeholder="Describe the reason for the visit..."
                                        value={formData.diagnosis}
                                        onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button id="next-step-btn" onClick={handleNext} className="w-full mt-8 bg-[#0a1e3b] text-white py-4 rounded-xl font-bold text-sm shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                                Continue to Uploads <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* STEP 3: Document Upload */}
                    {step === 3 && (
                        <div className="w-full max-w-2xl bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-300 shadow-2xl animate-slide-up">
                            <div className="flex items-center gap-4 mb-8">
                                <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-slate-500" /></button>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">Upload Documents</h2>
                                    <p className="text-xs text-slate-500 font-medium">Attach receipts, invoices, and medical reports</p>
                                </div>
                            </div>

                            <div id="upload-area" className="border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/50 p-12 flex flex-col items-center justify-center text-center group hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 cursor-pointer relative">
                                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <UploadCloud className="w-8 h-8" />
                                </div>
                                <h3 className="text-slate-900 font-bold mb-1">Click to upload or drag and drop</h3>
                                <p className="text-xs text-slate-500 font-medium">SVG, PNG, JPG or PDF (max. 10MB)</p>
                            </div>

                            <div className="mt-8 space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">Hospital_Invoice_001.pdf</p>
                                            <p className="text-[10px] text-slate-400 font-bold">2.4 MB • Just now</p>
                                        </div>
                                    </div>
                                    <button className="text-slate-400 hover:text-red-500 transition-colors"><ChevronRight className="w-4 h-4 rotate-90" /></button>
                                </div>
                            </div>

                            <button id="review-claim-btn" onClick={handleNext} className="w-full mt-8 bg-[#0a1e3b] text-white py-4 rounded-xl font-bold text-sm shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                                Review Claim <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* STEP 4: Review */}
                    {step === 4 && (
                        <div className="w-full max-w-2xl bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-300 shadow-2xl animate-slide-up">
                            <div className="flex items-center gap-4 mb-8">
                                <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-slate-500" /></button>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">Review & Submit</h2>
                                    <p className="text-xs text-slate-500 font-medium">Please review all details before submitting</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-200">
                                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                    <span className="text-sm font-bold text-slate-900 capitalize">
                                        {INSURANCE_TYPES.find(t => t.id === selectedType)?.title}
                                        {selectedSubType && ` - ${selectedSubType.title}`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Provider</span>
                                    <span className="text-sm font-bold text-slate-900">{formData.provider || "City General Hospital"}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Service Date</span>
                                    <span className="text-sm font-bold text-slate-900">{formData.date || "2024-10-24"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Total Claim Amount</span>
                                    <span className="text-lg font-black text-blue-600">${formData.amount || "245.00"}</span>
                                </div>
                            </div>

                            <button
                                id="submit-claim-btn"
                                onClick={handleNext}
                                disabled={isSubmitting}
                                className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-bold text-sm shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:bg-blue-500 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>Processing <Activity className="w-4 h-4 animate-spin" /></>
                                ) : (
                                    <>Submit Claim Request <CheckCircle className="w-4 h-4" /></>
                                )}
                            </button>
                        </div>
                    )}

                    {/* STEP 5: Success & Tracking Overview (The original UI) */}
                    {step === 5 && (
                        <div className="w-full max-w-5xl animate-fade-in">
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-card-entrance">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900">Claim Submitted Successfully!</h2>
                                <p className="text-slate-500 font-medium mt-2">Your claim ID is <span className="text-blue-600 font-mono font-bold">#{submittedClaimId || "CLM-89210"}</span>. Track the status below.</p>
                            </div>

                            {/* Process Visualizer Card (Reused from previous code) */}
                            <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
                                <div className="bg-[#0a1e3b] px-8 py-6 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                                            <Activity className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white tracking-wide">Live Adjudication Status</h3>
                                            <p className="text-xs text-blue-200 font-medium mt-1">Real-time automated processing</p>
                                        </div>
                                    </div>
                                    <span className="px-4 py-1.5 bg-blue-500/20 text-blue-200 border border-blue-500/30 rounded-lg text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                        Processing
                                    </span>
                                </div>

                                <div className="p-12">
                                    <div className="relative">
                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />
                                        {/* Animation starting... increased width for status visibility */}
                                        <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 -translate-y-1/2 rounded-full transition-all duration-[3000ms] shadow-[0_0_20px_rgba(79,70,229,0.5)] animate-grow-bar" />

                                        <div className="relative flex justify-between w-full">
                                            {[
                                                { title: "Submitted", status: "completed", date: "Just now", icon: FileText },
                                                { title: "Verification", status: "processing", date: "In Progress", icon: CheckCircle },
                                                { title: "Adjudication", status: "pending", date: "Est. 10m", icon: Activity },
                                                { title: "Approval", status: "pending", date: "Est. 1h", icon: Shield },
                                                { title: "Payment", status: "pending", date: "Est. 24h", icon: DollarSign },
                                            ].map((s, i) => (
                                                <div key={i} className="flex flex-col items-center relative z-10">
                                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${i === 0 ? 'bg-white border-blue-600 text-blue-600' :
                                                        i === 1 ? 'bg-white border-indigo-500 text-indigo-600 animate-pulse' :
                                                            'bg-white border-slate-200 text-slate-300'
                                                        }`}>
                                                        <s.icon className="w-6 h-6" />
                                                    </div>
                                                    <div className="mt-4 text-center">
                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">{s.title}</h4>
                                                        <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{s.date}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Claims Table for Demo */}
                            <div className="mt-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden animate-slide-up" style={{ animationDelay: '0.4s' }}>
                                <div className="px-8 py-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Recent Claim History</h3>
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-200/50 px-2 py-1 rounded-md">Showing latest 3 requests</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50/80">
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Claim ID</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Submitted At</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {[
                                                { id: submittedClaimId || 'CLM-89210', category: 'Health', date: 'Feb 7, 2026 17:20', status: 'Processing', color: 'blue' },
                                                { id: 'CLM-89105', category: 'Auto', date: 'Feb 5, 2026 10:15', status: 'Paid', color: 'green' },
                                                { id: 'CLM-88992', category: 'Health', date: 'Feb 1, 2026 14:30', status: 'Paid', color: 'green' },
                                            ].map((claim, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-8 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${claim.category === 'Health' ? 'bg-rose-50 text-rose-600' :
                                                                'bg-blue-50 text-blue-600'
                                                                }`}>
                                                                {claim.category.charAt(0)}
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-900">{claim.category}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4 font-mono text-xs font-black text-blue-600">{claim.id}</td>
                                                    <td className="px-8 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-slate-700">{claim.date.split(' ')[0]} {claim.date.split(' ')[1]}</span>
                                                            <span className="text-[10px] font-bold text-slate-400">{claim.date.split(' ')[2]}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${claim.status === 'Processing'
                                                            ? 'bg-blue-100 text-blue-700 border border-blue-200/50'
                                                            : 'bg-green-100 text-green-700 border border-green-200/50'
                                                            }`}>
                                                            {claim.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-4 text-right">
                                                        <button className="text-xs font-black text-slate-400 group-hover:text-blue-600 transition-colors uppercase tracking-widest">View Details</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <button onClick={() => setStep(1)} className="mt-12 mx-auto block text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-wider transition-colors hover:scale-110 active:scale-95 duration-200">
                                Start Another Claim
                            </button>
                        </div>
                    )}

                </div>
            </main>

            {/* STEP 1: Select Insurance Type popup - Rendered outside main for full viewport coverage */}
            {step === 1 && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur animate-Cloey-fade-in px-8">
                    <div className="bg-white rounded-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.4)] border border-slate-200 w-full max-w-5xl relative animate-Cloey-scale-in overflow-hidden">

                        {/* Professional Theme Header */}
                        <div className="bg-[#0a1e3b] px-8 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                                    <Sparkles className="w-4 h-4 text-blue-400" />
                                </div>
                                <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">New Claim Category</h2>
                            </div>
                            <button
                                onClick={() => setStep(0)}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-white/50 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-12 animate-Cloey-fade-in-up">
                            <div className="text-center mb-12">
                                <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">What are you claiming for?</h3>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Select your service category</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                                {INSURANCE_TYPES.map((type) => (
                                    <div
                                        key={type.id}
                                        id={`category-${type.id}`}
                                        onClick={() => {
                                            setSelectedType(type.id);
                                            setStep(2);
                                        }}
                                        className="group bg-white p-8 rounded-[32px] border border-slate-300 hover:border-blue-500 shadow-md hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer relative"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500
                                            ${type.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                                                'bg-blue-50 text-blue-600'}`}
                                        >
                                            <type.icon className="w-7 h-7" />
                                        </div>

                                        <h4 className="text-lg font-black text-slate-900 mb-1 tracking-tight">{type.title}</h4>
                                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{type.description}</p>

                                        <div className="mt-8 flex items-center text-blue-600 font-black text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                                            Start Claim <ArrowRight className="w-3 h-3 ml-2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Decorative Pattern */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes Cloey-fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes Cloey-scale-in {
                    from { transform: translateY(30px) scale(0.9); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes Cloey-fade-in-up {
                    from { transform: translateY(15px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .animate-Cloey-fade-in { animation: Cloey-fade-in 0.6s ease-out forwards; }
                .animate-Cloey-scale-in { animation: Cloey-scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-Cloey-fade-in-up { 
                    animation: Cloey-fade-in-up 0.8s ease-out 0.2s forwards; 
                    opacity: 0;
                }

                @keyframes Cloey-pointer-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-Cloey-pointer-float { animation: Cloey-pointer-float 1.5s ease-in-out infinite; }
                @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes card-entrance { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                .animate-card-entrance { animation: card-entrance 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes grow-bar { from { width: 0%; } to { width: 25%; } }
                .animate-grow-bar { animation: grow-bar 2.5s cubic-bezier(0.1, 0, 0.1, 1) forwards; }
            `}</style>
        </div>
    );
}
