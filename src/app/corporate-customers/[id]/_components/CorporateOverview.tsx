"use client";

import { useCorporateEngine } from "./useCorporateEngine";
import { Edit2, Copy, FileText, Info, ChevronLeft } from "lucide-react";

export function CorporateOverview({ engine }: { engine: ReturnType<typeof useCorporateEngine> }) {
    const { corporate, setSetupStage } = engine;

    const Card = ({ title, onEdit, children, hasImage, imageUrl }: any) => (
        <div className="flex flex-col rounded border border-gray-300 bg-white overflow-hidden shadow-sm h-full">
            <div className="bg-[#0a1e3b] px-3 py-1.5 flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">{title}</h3>
                {onEdit && (
                    <button onClick={onEdit} className="bg-white/10 p-0.5 rounded hover:bg-white/20 transition-colors">
                        <Edit2 className="h-3 w-3 text-white" />
                    </button>
                )}
            </div>
            <div className="flex-1 p-4 relative min-h-[160px]">
                {hasImage && imageUrl && (
                    <div className="absolute inset-0 z-0 opacity-40">
                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="relative z-10 h-full flex flex-col">
                    {children}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-0 relative">
            {/* Main Header */}
            <div className="bg-[#0a1e3b] px-4 py-2.5 rounded-t-xl flex items-center justify-between shadow-md">
                <h2 className="text-xs font-black uppercase tracking-widest text-white/90">Customer Corporate Overview</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSetupStage("SETUP_STATUS")}
                        className="flex items-center gap-1.5 bg-white/10 text-white px-3 py-1.5 rounded-md text-[10px] font-bold hover:bg-white/20 transition-all uppercase border border-white/20"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" /> Previous
                    </button>
                    <button onClick={() => setSetupStage("CORPORATE_INFO")} className="bg-white text-[#0a1e3b] px-4 py-1.5 rounded-md text-[10px] font-black uppercase hover:bg-gray-100 transition-all shadow-sm">
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Content Area - White background with padding to match other pages */}
            <div className="bg-white p-6 border-x border-b border-gray-100 min-h-[500px]">
                {/* Grid Layout - 4 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* 1. Corporate Information */}
                    <Card title="Corporate Information" onEdit={() => setSetupStage("CORPORATE_INFO")} hasImage imageUrl="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <a href="#" className="text-blue-600 underline text-[10px] font-bold">Plan Administrator Portal</a>
                                <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
                            </div>
                            <div className="space-y-2 mt-2">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <div className="p-1.5 rounded bg-blue-50 text-blue-600"><FileText size={14} /></div>
                                    <span className="text-[10px] font-bold text-slate-700 uppercase">General Info</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* 2. Invoices */}
                    <Card title="Invoices" hasImage imageUrl="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400">
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center space-y-2">
                                <div className="mx-auto w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center border border-dashed border-slate-300">
                                    <FileText className="h-4 w-4 text-slate-300" />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">No Invoices Available</p>
                            </div>
                        </div>
                    </Card>

                    {/* 3. Plans */}
                    <Card title="Plans" onEdit={() => setSetupStage("TIERS")} hasImage imageUrl="https://images.unsplash.com/photo-1576091160550-217359f41f48?auto=format&fit=crop&q=80&w=400">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <a href="#" className="text-blue-600 underline text-[10px] font-bold">Enrollment Link</a>
                                <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
                            </div>
                            <div className="mt-2">
                                <div className="flex items-center gap-2 px-2 py-1 bg-green-50 text-green-700 rounded w-fit border border-green-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase">Active Plans Configured</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* 4. Employees */}
                    <Card title="Employees">
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <span className="text-2xl font-black text-slate-200">0</span>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Enrolled</p>
                        </div>
                    </Card>

                    {/* 5. Corporate Tier Plans */}
                    <Card title="Corporate Tier Plans">
                        <div className="space-y-3">
                            {corporate.tiers && corporate.tiers.length > 0 ? (
                                corporate.tiers.map((t, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-1 border-b border-dotted border-slate-100 last:border-0">
                                        <span className="text-[10px] font-bold text-slate-700">{t.name}</span>
                                        <span className="text-[9px] font-black uppercase text-green-600">Active</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight italic">No Tiers Defined</p>
                            )}
                        </div>
                    </Card>

                    {/* 6. Wallet Information */}
                    <Card title="Wallet Information">
                        <div className="h-full flex flex-col items-center justify-center space-y-2">
                            <div className="text-xl font-black text-slate-300 tracking-tighter">$ 0.00</div>
                            <div className="text-[9px] font-black text-slate-400 uppercase">Available Credits</div>
                        </div>
                    </Card>

                    {/* 7. Settings */}
                    <Card title="Settings" onEdit={() => setSetupStage("CORPORATE_INFO")} hasImage imageUrl="https://images.unsplash.com/photo-1506784919140-505436d9f161?auto=format&fit=crop&q=80&w=400">
                        <div className="space-y-1.5 mt-auto bg-white/70 backdrop-blur-sm p-3 rounded-lg border border-white/50 shadow-sm">
                            <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                                <span>Wait time</span>
                                <span className="text-slate-900">{corporate.waitingPeriodNewHires || "3 Months"}</span>
                            </div>
                            <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                                <span>Initial Enrollment</span>
                                <span className="text-slate-900">{corporate.waitingPeriodInitial ? "Yes" : "No"}</span>
                            </div>
                            <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                                <span>Payment Method</span>
                                <span className="text-slate-900">{corporate.paymentMethod || "Automatic"}</span>
                            </div>
                        </div>
                    </Card>

                    {/* 8. Advisor Information */}
                    <Card title="Advisor Information" hasImage imageUrl="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400">
                        <div className="h-full flex items-end">
                            <div className="w-full bg-[#0a1e3b] text-white p-3 rounded-md flex items-center justify-between group cursor-pointer hover:bg-slate-900 transition-all">
                                <div className="space-y-0.5">
                                    <div className="text-[9px] font-black uppercase tracking-wider text-blue-300">Download</div>
                                    <div className="text-[10px] font-bold italic">Corporate Benefits Brochure</div>
                                </div>
                                <Info size={14} className="text-blue-300 group-hover:scale-110 transition-transform" />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
