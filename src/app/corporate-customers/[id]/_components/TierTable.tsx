"use client";

import { useCorporateEngine } from "./useCorporateEngine";
import { Tier } from "@/lib/types";
import { Trash2, Edit2, Info, Plus, ChevronLeft, ChevronRight, X, Check, MousePointer2, AlertCircle, Copy, CheckCircle2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { TierEditorPanel } from "./TierEditorPanel";
import clsx from "clsx";
import { useChat } from "@/context/ChatContext";
import { speakText } from "@/lib/google-tts";
import { TIER_VOICE_MESSAGES } from "./tier-speech";

export function TierTable({ engine }: { engine: ReturnType<typeof useCorporateEngine> }) {
    const { corporate, attemptAdvance, setSetupStage } = engine;
    const [editingTierId, setEditingTierId] = useState<string | null>(null);
    const [guideActive, setGuideActive] = useState(false);
    const hasStartedRef = useRef(false);
    const finalStepStartedRef = useRef(false);
    const [activeFillingField, setActiveFillingField] = useState<string | null>(null);
    const [pointerPos, setPointerPos] = useState<{ top: number, left: number } | null>(null);
    const tableRef = useRef<HTMLDivElement>(null);

    // Helper for guide
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    // Continuous Pointer Re-sync Effect
    useEffect(() => {
        if (!activeFillingField) {
            setPointerPos(null);
            return;
        }

        const updatePosition = () => {
            const el = document.getElementById(activeFillingField);
            const containerEl = tableRef.current;
            if (el && containerEl) {
                const rect = el.getBoundingClientRect();
                const containerRect = containerEl.getBoundingClientRect();
                setPointerPos({
                    top: rect.top - containerRect.top,
                    left: rect.left - containerRect.left + rect.width / 2
                });
            }
        };

        updatePosition();
        let rafId: number;
        const tick = () => {
            updatePosition();
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);

        window.addEventListener('resize', updatePosition);
        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', updatePosition);
        };
    }, [activeFillingField]);

    // Automation & Cancellation Logic
    const { openChat, isWorkflowPaused, isWorkflowActive, setIsWorkflowActive } = useChat();
    const isWorkflowPausedRef = useRef(isWorkflowPaused);
    const isWorkflowActiveRef = useRef(isWorkflowActive);

    useEffect(() => {
        isWorkflowPausedRef.current = isWorkflowPaused;
        isWorkflowActiveRef.current = isWorkflowActive;
    }, [isWorkflowPaused, isWorkflowActive]);

    // Check for guide hand-off and persistence
    useEffect(() => {
        const guideStep = localStorage.getItem("max_guide_step");

        // Bridge: If workflow was active on previous page, ensure it continues here
        if (!guideStep && isWorkflowActive && corporate.stage === "TIERS" && !hasStartedRef.current) {
            localStorage.setItem("max_guide_step", "tier_config");
            return;
        }

        if (guideStep === "tier_config" && !hasStartedRef.current) {
            const runGuide = async () => {
                try {
                    hasStartedRef.current = true;
                    // Ensure Cloey is ready
                    setIsWorkflowActive(true);
                    isWorkflowActiveRef.current = true;

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

                    await delay(1200);
                    setActiveFillingField("add-tier-btn");

                    // Display text in Chat UI and trigger manual speech (to prevent repetition)
                    openChat(TIER_VOICE_MESSAGES.WELCOME_AND_ADD, true);
                    await speak(TIER_VOICE_MESSAGES.WELCOME_AND_ADD);

                    // Professional pause after speech completes - increased to ensure full sentence inclusion
                    await delay(6000);

                    const addBtn = document.getElementById("add-tier-btn");
                    if (addBtn) {
                        setGuideActive(true);
                        handleAddTier();
                        setActiveFillingField(null);
                        localStorage.removeItem("max_guide_step");
                    }

                } catch (e: any) {
                    if (e.message === "WorkflowCancelled") {
                        console.log("TierTable workflow cancelled");
                        setGuideActive(false);
                        setIsWorkflowActive(false);
                    }
                }
            };
            runGuide();
        } else if (corporate.stage === "TIERS" && isWorkflowActive && !hasStartedRef.current) {
            // Additional check: if we're in TIERS stage with workflow active but no guide step set,
            // it might mean we're continuing from previous workflow
            const runContinuedGuide = async () => {
                try {
                    hasStartedRef.current = true;
                    setIsWorkflowActive(true);
                    isWorkflowActiveRef.current = true;

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

                    // Welcome message for continued workflow
                    await delay(1200);
                    setActiveFillingField("add-tier-btn");

                    // Display text in Chat UI and trigger manual speech (to prevent repetition)
                    openChat(TIER_VOICE_MESSAGES.WELCOME_AND_ADD, true);
                    await speak(TIER_VOICE_MESSAGES.WELCOME_AND_ADD);

                    // Professional pause after speech completes - increased to ensure full sentence inclusion
                    await delay(6000);

                    const addBtn = document.getElementById("add-tier-btn");
                    if (addBtn) {
                        setGuideActive(true);
                        handleAddTier();
                        setActiveFillingField(null);
                        localStorage.removeItem("max_guide_step");
                    }

                } catch (e: any) {
                    if (e.message === "WorkflowCancelled") {
                        console.log("TierTable continued workflow cancelled");
                        setGuideActive(false);
                        setIsWorkflowActive(false);
                    }
                }
            };

            // Only run if we're in TIERS stage and workflow is active but no specific guide step is set
            if (isWorkflowActive && !localStorage.getItem("max_guide_step")) {
                runContinuedGuide();
            }
        }

        // Handle the final "Next" button click after tier configuration is complete
        if (guideStep === "tier_complete_next" && isWorkflowActive && !finalStepStartedRef.current) {
            finalStepStartedRef.current = true;
            const runFinalStep = async () => {
                try {
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

                    // Highlight the "Next" button FIRST to show where we are going
                    setActiveFillingField("tier-next-btn");

                    // Update pointer position manually
                    const nextBtn = document.getElementById("tier-next-btn");
                    if (nextBtn) {
                        const rect = nextBtn.getBoundingClientRect();
                        const containerRect = tableRef.current?.getBoundingClientRect();
                        if (containerRect) {
                            setPointerPos({
                                top: rect.top - containerRect.top + rect.height / 2,
                                left: rect.left - containerRect.left + rect.width / 2
                            });
                        }
                    }

                    // Display text in Chat UI and trigger manual speech (to prevent repetition)
                    const msg = TIER_VOICE_MESSAGES.COMPLETE;
                    openChat(msg, true);
                    await speak(msg);

                    // Professional pause after speech finishes so it doesn't feel rushed
                    await delay(6000);

                    if (isWorkflowActive) {
                        // Set the next step for SetupStatus and advance
                        localStorage.setItem("max_guide_step", "setup_status");
                        attemptAdvance();
                        setActiveFillingField(null);
                        setPointerPos(null);
                    }
                } catch (e: any) {
                    console.error("Final tier step error:", e);
                }
            };
            runFinalStep();
        }

        // Reset final step ref if we're not on that step anymore
        if (guideStep !== "tier_complete_next" && finalStepStartedRef.current) {
            finalStepStartedRef.current = false;
        }
    }, [corporate.stage, isWorkflowActive, corporate.tiers]);

    const hasValidTier = corporate.tiers.some(t => t.isValid && t.status === "Active");
    const editingTier = editingTierId ? corporate.tiers.find(t => t.id === editingTierId) : null;

    const handleAddTier = () => {
        const newId = engine.addTier();
        setEditingTierId(newId);
    };

    if (editingTier) {
        return (
            <TierEditorPanel
                tier={editingTier}
                isGuideActive={guideActive}
                onSave={(updates: Partial<Tier>) => {
                    engine.updateTier(editingTier.id, updates);
                    setEditingTierId(null);

                    // If this was part of a guide workflow, continue to next step
                    if (guideActive) {
                        localStorage.setItem("max_guide_step", "tier_complete_next");
                    }
                    setGuideActive(false); // Reset guide state on close
                }}
                onCancel={() => {
                    // If it's a new empty tier, we might want to remove it if cancelled,
                    // but for now let's just close as per standard behavior.
                    setEditingTierId(null);
                    setGuideActive(false);
                }}
            />
        );
    }

    return (
        <div ref={tableRef} className="space-y-0 relative">
            {activeFillingField && pointerPos && (
                <div
                    style={{
                        position: 'absolute',
                        top: pointerPos.top - 10,
                        left: pointerPos.left,
                        transform: 'translate(-50%, -100%)',
                        pointerEvents: 'none',
                        zIndex: 10000
                    }}
                    className="transition-all duration-500 ease-in-out"
                >
                    <div className="relative flex flex-col items-center animate-Cloey-pointer-float">
                        <div className="text-red-500 filter drop-shadow-[0_4px_12px_rgba(239,68,68,0.4)] transform rotate-[225deg]">
                            <MousePointer2 className="w-6 h-6 fill-red-500" />
                        </div>
                        <div className="absolute inset-0 -m-1 rounded-full bg-red-500 animate-ping opacity-20 scale-125" />
                    </div>
                </div>
            )}
            {/* Header Navy Bar */}
            <div className="bg-[#0a1e3b] px-4 py-2.5 rounded-t-xl flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-widest text-white/90">Manage Tiers</h2>
                <button
                    id="add-tier-btn"
                    onClick={handleAddTier}
                    className={clsx(
                        "flex items-center gap-1 bg-white text-[#0a1e3b] px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all shadow-sm relative",
                        activeFillingField === "add-tier-btn" ? "scale-105 z-50 shadow-md" : "hover:bg-gray-100"
                    )}
                >
                    <Plus className="h-3 w-3" /> Add Tier
                </button>
            </div>

            <div className="bg-white p-4">
                {!hasValidTier && (
                    <div className="flex items-center gap-2 rounded bg-red-50 p-3 text-red-600 mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-xs font-medium">Please configure at least one active tier with plans to proceed.</p>
                    </div>
                )}

                <div className="border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-xs bg-white">
                        <thead className="bg-[#1e3a5f] text-white">
                            <tr>
                                <th className="px-3 py-2 border-r border-gray-600 font-medium whitespace-nowrap text-[10px] uppercase tracking-wider">S.no</th>
                                <th className="px-3 py-2 border-r border-gray-600 font-medium text-[10px] uppercase tracking-wider">Tier Name</th>
                                <th className="px-3 py-2 border-r border-gray-600 font-medium whitespace-nowrap text-[10px] uppercase tracking-wider">Time of Service</th>
                                <th className="px-3 py-2 border-r border-gray-600 font-medium whitespace-nowrap text-[10px] uppercase tracking-wider text-center">Member Count</th>
                                <th className="px-3 py-2 border-r border-gray-600 font-medium whitespace-nowrap text-[10px] uppercase tracking-wider text-center">Plans</th>
                                <th className="px-3 py-2 border-r border-gray-600 font-medium whitespace-nowrap text-[10px] uppercase tracking-wider text-center">Link</th>
                                <th className="px-3 py-2 border-r border-gray-600 font-medium whitespace-nowrap text-[10px] uppercase tracking-wider text-center">Wallet</th>
                                <th className="px-3 py-2 border-r border-gray-600 font-medium whitespace-nowrap text-[10px] uppercase tracking-wider text-center">Status</th>
                                <th className="px-3 py-2 font-medium text-[10px] uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-700">
                            {corporate.tiers.map((tier, index) => {
                                const allPlans = [
                                    ...tier.plans.corporate,
                                    ...tier.plans.core,
                                    ...tier.plans.upgrade,
                                    ...tier.plans.voluntary
                                ];

                                return (
                                    <tr key={tier.id} className={clsx(
                                        "hover:bg-slate-50 border-b border-gray-200 align-top transition-colors",
                                        tier.isValid ? "bg-emerald-50/20" : "bg-white"
                                    )}>
                                        <td className="px-3 py-3 border-r border-gray-200 text-center font-medium">{index + 1}</td>
                                        <td className="px-3 py-3 border-r border-gray-200 font-bold text-gray-800">
                                            <div className="flex items-center gap-2">
                                                {tier.name || `Tier${index + 1}`}
                                                {tier.isValid && (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-50" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 border-r border-gray-200">
                                            {tier.lengthOfService === "0 Months" || tier.lengthOfService === "No" ? "None" : tier.lengthOfService}
                                        </td>
                                        <td className="px-3 py-3 border-r border-gray-200 text-center">
                                            <span className="text-blue-600 underline cursor-pointer font-bold">0</span>
                                        </td>
                                        <td className="px-3 py-3 border-r border-gray-200 max-w-[300px]">
                                            {allPlans.length === 0 ? (
                                                <div className="text-center font-medium uppercase text-gray-500">NA</div>
                                            ) : (
                                                <div className="space-y-0.5 text-[11px] leading-tight flex flex-col items-center">
                                                    {allPlans.map((p, idx) => (
                                                        <div key={idx} className="font-medium text-gray-600">
                                                            {p.name} {p.variant && `- ${p.variant}`}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 border-r border-gray-200 text-center">
                                            {allPlans.length > 0 ? (
                                                <div className="flex items-center justify-center gap-1.5 group">
                                                    <span className="text-blue-600 underline text-[10px] font-medium cursor-pointer">Enrollment Link</span>
                                                    <div className="h-4 w-4 border border-gray-200 rounded flex items-center justify-center bg-gray-100 shadow-sm cursor-pointer hover:bg-gray-200">
                                                        <Copy size={10} className="text-gray-600" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="font-medium uppercase text-gray-500">NA</div>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 border-r border-gray-200 text-center">
                                            <span className="text-blue-600 underline cursor-pointer font-bold">No</span>
                                        </td>
                                        <td className="px-3 py-3 border-r border-gray-200 text-center">
                                            <span className={clsx(
                                                "font-bold",
                                                tier.status === "Active" ? "text-gray-800" : "text-gray-400"
                                            )}>
                                                {tier.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-3 justify-center">
                                                <button
                                                    onClick={() => engine.deleteTier(tier.id)}
                                                    className="text-red-500 hover:text-red-700 transition-colors" title="Delete"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingTierId(tier.id)}
                                                    className="text-green-600 hover:text-green-800 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button className="text-[#a855f7] hover:text-[#9333ea] transition-colors" title="Info">
                                                    <Info className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between pt-6">
                <button
                    onClick={() => setSetupStage("CORPORATE_INFO")}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all hover:-translate-y-0.5"
                >
                    <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <button
                    id="tier-next-btn"
                    onClick={() => attemptAdvance()}
                    className={clsx(
                        "flex items-center gap-1.5 rounded-xl bg-[#0a1e3b] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/20 transition-all tracking-wide uppercase",
                        activeFillingField === "tier-next-btn" ? "ring-4 ring-blue-500/50 scale-105 shadow-2xl z-50" : "hover:bg-blue-900 hover:-translate-y-0.5"
                    )}
                >
                    Next <ChevronRight className="h-4 w-4" />
                </button>
            </div>
            <style jsx global>{`
                @keyframes Cloey-pointer-float {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-8px); }
                }
                .animate-Cloey-pointer-float {
                  animation: Cloey-pointer-float 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
