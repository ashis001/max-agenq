import React, { useState } from "react";

interface MeetingReasonFormProps {
    onSubmit: (reason: string) => void;
    onSkip: () => void;
}

export const MeetingReasonForm: React.FC<MeetingReasonFormProps> = ({ onSubmit, onSkip }) => {
    const [reason, setReason] = useState("");
    return (
        <div className="mt-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col gap-2 max-w-[280px] shadow-sm">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Reason (optional)
            </label>
            <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter your reason..."
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#1e3a5f] text-slate-800 font-medium"
            />
            <div className="flex gap-2 justify-end">
                <button
                    type="button"
                    onClick={onSkip}
                    className="px-3 py-1 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
                >
                    Skip
                </button>
                <button
                    type="button"
                    onClick={() => onSubmit(reason)}
                    className="px-3 py-1 text-[11px] font-bold rounded-lg bg-[#1e3a5f] hover:bg-[#152943] text-white transition-colors"
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

interface CustomTimeInputProps {
    onConfirm: (time: string) => void;
}

export const CustomTimeInput: React.FC<CustomTimeInputProps> = ({ onConfirm }) => {
    const [time, setTime] = useState("");
    return (
        <div className="mt-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col gap-2 max-w-[280px] shadow-sm">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Type your preferred time
            </label>
            <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. Tomorrow at 3:00 PM"
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#1e3a5f] text-slate-800 font-medium"
            />
            <button
                type="button"
                disabled={!time.trim()}
                onClick={() => onConfirm(time.trim())}
                className="w-full py-1.5 text-[11px] font-bold rounded-lg bg-[#1e3a5f] hover:bg-[#152943] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Confirm Time
            </button>
        </div>
    );
};
