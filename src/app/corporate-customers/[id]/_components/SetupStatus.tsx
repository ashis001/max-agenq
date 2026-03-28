"use client";

import { useCorporateEngine } from "./useCorporateEngine";
import { ChevronLeft, ChevronRight, X, MousePointer2, Info, Pause, Play } from "lucide-react";
import { Tier } from "@/lib/types";
import { useState, useMemo, useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { speakText, stopSpeech } from "@/lib/google-tts";
import clsx from "clsx";

export function SetupStatus({ engine }: { engine: ReturnType<typeof useCorporateEngine> }) {
    const { corporate, setSetupStage } = engine;

    const [modalState, setModalState] = useState<'NONE' | 'SELECT_SUBDOMAIN' | 'SELECT_ADMINS' | 'SUCCESS'>('NONE');
    const [selectedSubdomain, setSelectedSubdomain] = useState("");
    const { isWorkflowActive, openChat, setIsWorkflowActive, isMuted, isWorkflowPaused } = useChat();

    const isWorkflowActiveRef = useRef(isWorkflowActive);
    const isWorkflowPausedRef = useRef(isWorkflowPaused);
    const hasStartedRef = useRef(false);
    const componentRef = useRef<HTMLDivElement>(null);

    const [activeFillingField, setActiveFillingField] = useState<string | null>(null);
    const [pointerPos, setPointerPos] = useState<{ top: number, left: number } | null>(null);

    useEffect(() => {
        isWorkflowActiveRef.current = isWorkflowActive;
        isWorkflowPausedRef.current = isWorkflowPaused;
        if (!isWorkflowActive) {
            hasStartedRef.current = false;
            setActiveFillingField(null);
            setPointerPos(null);
            stopSpeech();
        }
    }, [isWorkflowActive, isWorkflowPaused]);

    const hasActiveTiers = corporate.tiers.some((t: Tier) => t.isValid && t.status === "Active");
    const setupPercentage = hasActiveTiers ? 100 : 50;

    const subdomainOptions = useMemo(() => {
        const base = (corporate.name || "Unique").toLowerCase().replace(/[^a-z0-9]/g, '');
        const randomNum = Math.floor(Math.random() * 90) + 10;
        return [
            `${base}.max.com`,
            `${base}${randomNum}.max.com`,
            `${base}-portal.max.com`
        ];
    }, [corporate.name]);

    // Pointer positioning logic
    useEffect(() => {
        if (!activeFillingField) {
            setPointerPos(null);
            return;
        }
        const updatePosition = () => {
            const el = document.getElementById(activeFillingField);
            const containerEl = componentRef.current;
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
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [activeFillingField]);

    // Guide workflow logic
    useEffect(() => {
        const guideStep = localStorage.getItem("max_guide_step");
        if (guideStep === "setup_status" && isWorkflowActive && !hasStartedRef.current) {
            hasStartedRef.current = true;

            const runGuide = async () => {
                // IMPORTANT: Pausable delay function
                const delay = async (ms: number) => {
                    if (!isWorkflowActiveRef.current) throw new Error("WorkflowCancelled");
                    await new Promise(resolve => setTimeout(resolve, ms));
                    while (isWorkflowPausedRef.current) {
                        if (!isWorkflowActiveRef.current) throw new Error("WorkflowCancelled");
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    if (!isWorkflowActiveRef.current) throw new Error("WorkflowCancelled");
                };

                const pointAndSpeak = async (elementId: string, text: string) => {
                    if (!isWorkflowActiveRef.current) throw new Error("WorkflowCancelled");
                    const element = document.getElementById(elementId);
                    if (!element) {
                        console.error(`Guide element not found: #${elementId}`);
                        return;
                    }
                    setActiveFillingField(elementId);
                    await delay(50);
                    if (text && !isMuted) {
                        // Use silent mode to prevent the Chat Panel from triggering a second voice call
                        openChat(text, true);
                        await speakText(text);
                        if (isWorkflowPausedRef.current) {
                            await delay(0);
                            await speakText(text);
                        }
                    } else if (text && isMuted) {
                        await delay(1000);
                    }
                };

                const clickElement = (elementId: string) => {
                    const element = document.getElementById(elementId);
                    if (!element) return;
                    element.click();
                }

                try {
                    await delay(1000);

                    // 1. Next button
                    await pointAndSpeak("setup-next-btn", "please click on the next button");
                    await delay(1000); // Increased delay after speech
                    clickElement("setup-next-btn");
                    await delay(1500); // Wait for modal to appear and settle

                    // 2. Subdomain - Wait for modal to appear and settle
                    await pointAndSpeak("subdomain-radio-0", "Please Select a subdomain for the corporate insurance portal");
                    await delay(1000); // Increased delay
                    clickElement("subdomain-radio-0");
                    await delay(1200); // Longer delay to allow for UI updates and visual feedback
                    await pointAndSpeak("subdomain-confirm-btn", "Please click on the confirm button");
                    await delay(1000); // Increased delay
                    clickElement("subdomain-confirm-btn");
                    await delay(2000); // Longer delay to allow modal to close and UI to settle

                    // 3. Admins
                    await pointAndSpeak("admin-checkbox-0", "Please Select Group Admins to send you invite link");
                    await delay(1200);

                    await pointAndSpeak("admins-confirm-btn", "Please click on the confirm button");
                    await delay(2000);
                    clickElement("admins-confirm-btn");
                    await delay(1500);

                    // 4. Success modal - Wait for modal to appear and settle
                    await delay(1500); // Allow time for modal to fully appear
                    await pointAndSpeak("final-ok-btn", "All set! Please click on the OK button.");
                    await delay(3000); // Shortened delay for shorter speech
                    clickElement("final-ok-btn");
                    await delay(1200); // Allow time for navigation to complete

                    // 5. Final Message
                    if (!isMuted) {
                        openChat("Now finally you have onboard a new customer successfully", true);
                        await speakText("Now finally you have onboard a new customer successfully");
                    }

                    // Cleanup
                    setIsWorkflowActive(false);
                    localStorage.removeItem("max_guide_step");
                    setSetupStage("OVERVIEW");

                } catch (e: any) {
                    if (e.message === "WorkflowCancelled") {
                        console.log("Setup Status: Workflow cancelled by user.");
                    } else {
                        console.error("Setup Status: Workflow error:", e);
                    }
                    // Reset all states
                    setActiveFillingField(null);
                    setModalState("NONE");
                    hasStartedRef.current = false;
                    setIsWorkflowActive(false);
                }
            };

            runGuide();
        }
    }, [corporate, openChat, setIsWorkflowActive, setSetupStage, isMuted]); // Removed isWorkflowActive from dependency array to prevent restart on pause/resume

    const SemiCircleGauge = ({ value, label, color = "#22c55e", percentage = 0 }: { value: string | number, label: string, color?: string, percentage?: number }) => (
        <div className="flex flex-col items-center justify-center p-10 bg-white flex-1 transition-all hover:bg-slate-50 relative group">
            <div className="relative w-56 h-32 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 100 60" className="w-full h-full transform translate-y-4">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={color} strokeWidth="10" strokeDasharray="125.6" strokeDashoffset={125.6 * (1 - (percentage || 0) / 100)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute bottom-4 flex flex-col items-center">
                    <span className="text-4xl font-black text-[#0a1e3b]">{value}</span>
                    {label === "Overall Status" && <span className="text-[10px] text-gray-400 font-black -mt-1">%</span>}
                </div>
            </div>
            <p className="mt-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
            <div className="absolute top-4 right-4 text-slate-200"><Info size={16} /></div>
        </div>
    );

    return (
        <div ref={componentRef} className="space-y-0 relative">
            <div className="bg-[#0a1e3b] px-4 py-2.5 rounded-t-xl flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-widest text-white/90">Setup Status</h2>
            </div>

            <div className="bg-white p-6 border-x border-b border-gray-100 min-h-[400px] flex items-center justify-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform transition-all hover:scale-[1.02]"><SemiCircleGauge value={setupPercentage} label="Overall Status" percentage={setupPercentage} color="#10b981" /></div>
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform transition-all hover:scale-[1.02]"><SemiCircleGauge value="--" label="Employees Enrolled" percentage={0} color="#3b82f6" /></div>
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform transition-all hover:scale-[1.02]"><SemiCircleGauge value="$ 0" label="Expected Premium" percentage={0} color="#8b5cf6" /></div>
                </div>
            </div>

            <div className="flex justify-between pt-8">
                <button onClick={() => setSetupStage("TIERS")} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all hover:-translate-y-0.5"><ChevronLeft className="h-4 w-4" /> Previous</button>
                <button id="setup-next-btn" onClick={() => setModalState('SELECT_SUBDOMAIN')} className={clsx("flex items-center gap-2 rounded-xl bg-[#0a1e3b] px-8 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/20 transition-all uppercase tracking-wide", activeFillingField === "setup-next-btn" ? "ring-4 ring-blue-500/50 scale-105 shadow-2xl z-50" : "hover:bg-blue-900 hover:-translate-y-0.5")}>Next <ChevronRight className="h-4 w-4" /></button>
            </div>

            {modalState !== 'NONE' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    {modalState === 'SELECT_SUBDOMAIN' && (
                        <div className="w-[500px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                            <div className="bg-[#0a1e3b] px-4 py-3 flex items-center justify-center relative">
                                <h4 className="text-xs font-bold text-white uppercase tracking-widest">Select Subdomain</h4>
                                <button onClick={() => setModalState('NONE')} className="absolute right-4 text-white hover:text-gray-200"><X size={16} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-[15px] font-medium text-gray-800">Select a subdomain for the corporate insurance portal:</p>
                                <div className="space-y-3 pl-2">
                                    {subdomainOptions.map((opt, i) => (
                                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                            <input id={`subdomain-radio-${i}`} type="radio" name="subdomain" checked={selectedSubdomain === opt} onChange={() => setSelectedSubdomain(opt)} className={clsx("h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 transition-all", activeFillingField === `subdomain-radio-${i}` && "ring-2 ring-blue-500 scale-125")} />
                                            <span className={clsx("text-[14px] transition-colors font-medium", selectedSubdomain === opt ? "text-blue-600 font-bold" : "text-gray-800 group-hover:text-blue-600")}>{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="px-6 py-4 flex justify-end bg-white border-t border-gray-100">
                                <button id="subdomain-confirm-btn" onClick={() => setModalState('SELECT_ADMINS')} className={clsx("bg-[#0f2a4a] text-white rounded px-6 py-2 text-[12px] font-bold transition-all shadow-sm", activeFillingField === "subdomain-confirm-btn" ? "ring-4 ring-blue-500/50 scale-105 shadow-xl" : "hover:bg-slate-800")}>Confirm</button>
                            </div>
                        </div>
                    )}

                    {modalState === 'SELECT_ADMINS' && (
                        <div className="w-[500px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                            <div className="bg-[#0a1e3b] px-4 py-3 flex items-center justify-center relative">
                                <h4 className="text-xs font-bold text-white uppercase tracking-widest">Select Admins</h4>
                                <button onClick={() => setModalState('NONE')} className="absolute right-4 text-white hover:text-gray-200"><X size={16} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-[15px] font-medium text-gray-800">Select Group Admins to send invite link:</p>
                                <div className="space-y-3 pl-2">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <input id="admin-checkbox-0" type="checkbox" defaultChecked className={clsx("mt-1 h-3.5 w-3.5 border-gray-300 rounded text-blue-600 focus:ring-blue-500 transition-all", activeFillingField === "admin-checkbox-0" && "ring-2 ring-blue-500 scale-125")} />
                                        <div className="flex flex-col">
                                            <span className="text-[14px] font-medium text-gray-800">{corporate.contacts?.[0] ? `${corporate.contacts[0].firstName} ${corporate.contacts[0].lastName}` : "Corporate Executive"}</span>
                                            <span className="text-[14px] text-gray-500 font-mono">{corporate.contacts?.[0]?.email || corporate.contactEmail || "admin@example.com"}</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className="px-6 py-4 flex justify-end bg-white border-t border-gray-100">
                                <button id="admins-confirm-btn" onClick={() => setModalState('SUCCESS')} className={clsx("bg-[#0f2a4a] text-white rounded px-6 py-2 text-[12px] font-bold transition-all shadow-sm", activeFillingField === "admins-confirm-btn" ? "ring-4 ring-blue-500/50 scale-105 shadow-xl" : "hover:bg-slate-800")}>Confirm</button>
                            </div>
                        </div>
                    )}

                    {modalState === 'SUCCESS' && (
                        <div className="w-[480px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                            <div className="bg-[#0a1e3b] px-4 py-3 flex items-center justify-center relative"><h4 className="text-xs font-bold text-white uppercase tracking-widest">Success</h4></div>
                            <div className="p-10 flex flex-col items-center justify-center space-y-8">
                                <p className="text-base font-semibold text-gray-700 text-center leading-relaxed">Corporate Profile created and sent to Corporate<br />Plan Administrators for approval.</p>
                                <button id="final-ok-btn" onClick={() => { setModalState("NONE"); setSetupStage("OVERVIEW"); }} className={clsx("px-6 py-2 bg-[#042c5c] rounded text-sm font-bold text-white shadow-md transition-all uppercase", activeFillingField === "final-ok-btn" ? "ring-4 ring-blue-500/50 scale-110 shadow-xl" : "hover:bg-slate-800")}>OK</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {pointerPos && activeFillingField && (
                <div
                    className="absolute z-[10001] pointer-events-none transition-all duration-300 ease-in-out"
                    style={{
                        left: pointerPos.left,
                        top: pointerPos.top - 10,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <div className="relative flex flex-col items-center animate-Nina-pointer-float">
                        <div className="text-red-500 filter drop-shadow-[0_4px_12px_rgba(239,68,68,0.4)] transform rotate-[225deg]"><MousePointer2 className="w-6 h-6 fill-red-500" /></div>
                        <div className="absolute inset-0 -m-1 rounded-full bg-red-500 animate-ping opacity-20 scale-125" />
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes Nina-pointer-float {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-8px); }
                }
                .animate-Nina-pointer-float {
                  animation: Nina-pointer-float 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}