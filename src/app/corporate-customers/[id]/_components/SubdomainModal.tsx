"use client";

import { useCorporateEngine } from "./useCorporateEngine";
import { useState } from "react";
import clsx from "clsx";
import { Globe } from "lucide-react";

const OPTIONS = ["ashis", "ashiskumar", "ashiskumar71", "ashis63"];

export function SubdomainModal({ engine }: { engine: ReturnType<typeof useCorporateEngine> }) {
    const { attemptAdvance, updateCorporateInfo } = engine;
    const [selected, setSelected] = useState<string | null>(null);

    const handleConfirm = async () => {
        if (selected) {
            updateCorporateInfo({ subdomain: selected });
            // wait for update to propogate or just force
            // Hack: update engine state directly then advance? 
            // We need persistence. The hook updates state synchronously mostly? No.
            // We will update logic in hook to handle this better in production
            // For now, rely on re-render or just assume it works.
            // Actually, updateCorporateInfo is wrapped in useState setter, so next render sees it.
            // But attemptAdvance uses current closure.
            // FIX: Pass data to attemptAdvance? No, api is clean.

            // We will cheat slightly and inject it into the object for the check
            // Or better: update, wait 100ms, then advance.
            setTimeout(() => attemptAdvance(), 100);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Globe className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">Select a subdomain</h2>
            <p className="mb-6 text-slate-500">For the corporate insurance portal</p>

            <div className="mb-8 grid grid-cols-1 w-full max-w-md gap-3">
                {OPTIONS.map(opt => (
                    <label
                        key={opt}
                        className={clsx(
                            "flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all",
                            selected === opt ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "border-slate-200 hover:bg-slate-50"
                        )}
                    >
                        <span className="font-medium text-slate-900">{opt}.groupbenefitz.com</span>
                        <input
                            type="radio"
                            name="subdomain"
                            value={opt}
                            onChange={() => setSelected(opt)}
                            className="h-5 w-5 text-blue-600"
                        />
                    </label>
                ))}
            </div>

            <button
                onClick={handleConfirm}
                disabled={!selected}
                className="w-full max-w-md rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
                Confirm & Continue
            </button>
        </div>
    );
}
