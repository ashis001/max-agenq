"use client";

import { useCorporateEngine } from "./useCorporateEngine";
import { useState } from "react";
import clsx from "clsx";
import { Mail } from "lucide-react";

// Mock admins based on contacts or generic list
const MOCK_ADMINS = [
    { id: "a1", name: "John Doe", email: "john@corp.com" },
    { id: "a2", name: "Jane Smith", email: "jane@corp.com" },
];

export function AdminInviteModal({ engine }: { engine: ReturnType<typeof useCorporateEngine> }) {
    const { attemptAdvance, updateCorporateInfo } = engine;
    const [selected, setSelected] = useState<string[]>([]);

    const toggleAdmin = (id: string) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleConfirm = () => {
        // Logic: Update state then advance
        updateCorporateInfo({ admins: selected });
        setTimeout(() => attemptAdvance(), 100);
    };

    return (
        <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                <Mail className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">Invite Group Admins</h2>
            <p className="mb-6 text-slate-500">Select admins to send the invite link</p>

            <div className="mb-8 grid grid-cols-1 w-full max-w-md gap-3">
                {MOCK_ADMINS.map(admin => {
                    const checked = selected.includes(admin.id);
                    return (
                        <label
                            key={admin.id}
                            className={clsx(
                                "flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all",
                                checked ? "border-violet-600 bg-violet-50 ring-1 ring-violet-600" : "border-slate-200 hover:bg-slate-50"
                            )}
                        >
                            <div className="text-left">
                                <p className="font-medium text-slate-900">{admin.name}</p>
                                <p className="text-xs text-slate-500">{admin.email}</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleAdmin(admin.id)}
                                className="h-5 w-5 rounded text-violet-600"
                            />
                        </label>
                    );
                })}
            </div>

            <button
                onClick={handleConfirm}
                disabled={selected.length === 0}
                className="w-full max-w-md rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
                Send Invites & Finish
            </button>
        </div>
    );
}
