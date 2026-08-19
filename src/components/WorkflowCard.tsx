"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Check, Pause, Play, Square, ArrowRight } from "lucide-react";
import clsx from "clsx";

export interface WorkflowStepItem {
    t: string; // Title / Action text (HTML or string)
    e: string; // Explanation / detail (Fallback if no dialog)
    dialog?: string; // What the agent is speaking
    action?: string; // The tag to display
    x?: string; // Example value
    alt?: string; // Alternate explanation
    fast?: string; // Fast summary
}

export interface WorkflowData {
    id?: string;
    title: string;
    steps: WorkflowStepItem[];
    totalSteps?: number;
}

interface WorkflowCardProps {
    workflow: WorkflowData;
    currentStepIndex?: number;
    isCompleted?: boolean;
    isPaused?: boolean;
    onTogglePause?: () => void;
    onTerminate?: () => void;
    onNextStep?: () => void;
    showControls?: boolean;
    autoAdvance?: boolean;
}

function ActionBadge({ action }: { action?: string }) {
    if (!action) return null;
    const label = action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
    return (
        <span className={clsx(
            "text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border shrink-0",
            action === "Click" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
            action === "Type" ? "bg-purple-50 text-purple-600 border-purple-200" :
            action === "Select" ? "bg-blue-50 text-blue-600 border-blue-200" :
            action === "Navigate" ? "bg-orange-50 text-orange-600 border-orange-200" :
            "bg-slate-50 text-slate-600 border-slate-200"
        )}>
            {label}
        </span>
    );
}

export default function WorkflowCard({
    workflow,
    currentStepIndex = 0,
    isCompleted = false,
    isPaused = false,
    onTogglePause,
    onTerminate,
    onNextStep,
    showControls = true
}: WorkflowCardProps) {
    const [isCardOpen, setIsCardOpen] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({
        [currentStepIndex]: true
    });

    if (!workflow || !workflow.steps || workflow.steps.length === 0) {
        return null;
    }

    const totalSteps = workflow.totalSteps ?? workflow.steps.length;

    // Keep active step expanded automatically, and collapse others
    useEffect(() => {
        setExpandedRows({
            [currentStepIndex]: true
        });

        // Auto-scroll to active step
        setTimeout(() => {
            const el = document.getElementById(`workflow-step-${currentStepIndex}`);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        }, 150);
    }, [currentStepIndex]);

    const toggleRow = (idx: number) => {
        setExpandedRows((prev) => ({
            ...prev,
            [idx]: !prev[idx]
        }));
    };

    // Render HTML in title safely (supports <b> tags)
    const renderHtml = (content: string) => {
        // We ensure `**` or `<b>` tags render nicely
        let htmlContent = content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        return <span dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    };

    return (
        <div className="w-full my-3 flex flex-col font-sans">
            {/* Card Container - Styled like lovable preview */}
            <div
                className={clsx(
                    "border rounded-2xl bg-white overflow-hidden shadow-sm transition-all duration-300",
                    "border-slate-200"
                )}
            >
                {/* Header */}
                <div className="px-4 pt-3.5 pb-3 border-b border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        {/* Live Walkthrough Badge */}
                        <div className="flex items-center gap-1.5">
                            <span
                                className={clsx(
                                    "w-1.5 h-1.5 rounded-full",
                                    isCompleted
                                        ? "bg-emerald-500"
                                        : "bg-[#8b5cf6]"
                                )}
                            />
                            <span className={clsx(
                                "text-[11px] font-semibold",
                                isCompleted ? "text-emerald-600" : "text-[#8b5cf6]"
                            )}>
                                {isCompleted ? "Completed Walkthrough" : "Live Walkthrough"}
                            </span>
                        </div>

                        {/* Step Pill */}
                        <span className="bg-slate-100/80 text-slate-600 font-bold text-[10px] rounded-full px-2.5 py-0.5">
                            Step {Math.min(currentStepIndex + 1, totalSteps)} of {totalSteps}
                        </span>
                    </div>

                    {/* Workflow Title */}
                    <div className="text-[13.5px] font-bold text-slate-800 tracking-tight leading-snug">
                        {workflow.title}
                    </div>
                </div>

                {/* Steps List */}
                {isCardOpen && (
                    <div className="max-h-[340px] overflow-y-auto overflow-x-hidden custom-scrollbar px-4 py-1">
                        {workflow.steps.map((step, idx) => {
                            const isPast = idx < currentStepIndex || isCompleted;
                            const isCurrent = idx === currentStepIndex && !isCompleted;
                            
                            // To match the preview exactly, we show the steps.
                            // If you only want to show past/current, you can filter here.
                            // The screenshot shows previous steps and current step.
                            if (idx > currentStepIndex && !isCompleted) return null;

                            const isExpanded = !!expandedRows[idx];

                            return (
                                <div
                                    key={idx}
                                    id={`workflow-step-${idx}`}
                                    className="border-b border-slate-100 last:border-0"
                                >
                                    {/* Step Header Row */}
                                    <div
                                        onClick={() => toggleRow(idx)}
                                        className="flex items-start gap-3 py-3 cursor-pointer select-none group"
                                    >
                                        {/* Step Number */}
                                        <div className="w-[20px] h-[20px] rounded-full flex items-center justify-center bg-slate-100 text-slate-600 text-[10px] font-bold shrink-0 mt-0.5">
                                            {idx + 1}
                                        </div>

                                        {/* Step Title */}
                                        <div className="flex-1 text-[13px] text-slate-700 leading-snug">
                                            {renderHtml(step.t)}
                                        </div>

                                        {/* Action badge (always visible, incl. collapsed) */}
                                        <ActionBadge action={step.action} />

                                        {/* Right Icons (Check + Chevron) */}
                                        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                                            {isPast ? (
                                                <div className="w-3 h-3 rounded-full bg-emerald-200 flex items-center justify-center">
                                                    <Check size={7} strokeWidth={3.5} className="text-emerald-600" />
                                                </div>
                                            ) : null}

                                            {isExpanded ? (
                                                <ChevronUp size={14} className="text-slate-300" />
                                            ) : (
                                                <ChevronDown size={14} className="text-slate-300" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Step Body */}
                                    {isExpanded && (
                                        <div className="pl-[32px] pr-2 pb-3.5 pt-1 text-[12.5px] leading-relaxed text-[#64748b] animate-fade-in flex flex-col gap-2.5">
                                            {/* Dialog or Explanation */}
                                            <div className="text-[12.5px] leading-relaxed">
                                                {step.dialog ? (
                                                    <span className="italic text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 block relative before:content-['“'] before:absolute before:text-3xl before:text-slate-200 before:-top-2 before:-left-1.5 before:font-serif">
                                                        <span className="relative z-10">{step.dialog}</span>
                                                    </span>
                                                ) : (
                                                    step.e
                                                )}
                                            </div>

                                            {/* Example Value */}
                                            {step.x && (
                                                <div className="flex items-center flex-wrap gap-1.5 mt-0.5 bg-purple-50/50 p-2 rounded-lg border border-purple-100/50">
                                                    <span className="text-[10px] font-semibold text-slate-500 tracking-wider">Example value:</span>
                                                    <span className="text-[#8b5cf6] font-bold text-[10px]">{step.x}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Global CSS for the custom scrollbar inside this component */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                    margin: 4px 0;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 10px;
                }
                `
            }} />

            {/* Bottom Controls Dock */}
            {showControls && !isCompleted && (
                <div className="mt-2.5 flex flex-col gap-2">
                    {onNextStep && (
                        <button
                            type="button"
                            onClick={onNextStep}
                            className="w-full py-2 px-4 bg-[#6d28ff] hover:bg-[#591ede] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 group hover:shadow-md active:scale-[0.99]"
                        >
                            <span>Next step</span>
                            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    )}

                    <div className="flex gap-2 w-full">
                        {onTogglePause && (
                            <button
                                type="button"
                                onClick={onTogglePause}
                                className="flex-1 py-1.5 px-3 bg-white border border-slate-200 hover:bg-purple-50 hover:border-purple-200 text-slate-700 hover:text-[#6d28ff] rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                            >
                                {isPaused ? (
                                    <>
                                        <Play size={12} className="fill-current" />
                                        <span>Resume Workflow</span>
                                    </>
                                ) : (
                                    <>
                                        <Pause size={12} className="fill-current" />
                                        <span>Pause Workflow</span>
                                    </>
                                )}
                            </button>
                        )}

                        {onTerminate && (
                            <button
                                type="button"
                                onClick={onTerminate}
                                className="flex-1 py-1.5 px-3 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                            >
                                <Square size={10} className="fill-current" />
                                <span>Terminate Workflow</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
