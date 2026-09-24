"use client";

import MaxGreeting from "@/components/MaxGreeting";
import { Sidebar } from "../corporate-customers/[id]/_components/Sidebar";
import {
    User,
    Bell,
    Lock,
    Eye,
    EyeOff,
    ShieldCheck,
    Database,
    Cloud,
    ChevronRight,
    Volume2,
    Mic,
    KeyRound,
    Check,
    Trash2,
    Play,
    Save,
    AlertCircle,
    Sparkles,
    Info,
    ExternalLink,
    Settings as SettingsIcon,
    Bot,
} from "lucide-react";
import { useState, useEffect } from "react";
import { speakText } from "@/lib/google-tts";
import { useAgenQEnabled } from "@/hooks/useAgenQToggle";

const SETTINGS_GROUPS = [
    {
        title: "Agent",
        items: [
            { id: "agent", label: "Agent Mode", description: "Switch between Nina & AgenQ SDK", icon: Bot },
        ]
    },
    {
        title: "Account",
        items: [
            { id: "profile", label: "Profile Information", description: "Personal details and display name", icon: User },
            { id: "security", label: "Security & Password", description: "Authentication and access control", icon: Lock },
            { id: "notifications", label: "Notifications", description: "Email and push alert preferences", icon: Bell },
        ]
    },
    {
        title: "System",
        items: [
            { id: "appearance", label: "Appearance", description: "Dark mode and UI density", icon: Eye },
            { id: "data", label: "Data Management", description: "Export and archival settings", icon: Database },
            { id: "voice", label: "Voice & TTS", description: "ElevenLabs API key & voice", icon: Volume2 },
            { id: "api", label: "API Keys", description: "Developer access and keys", icon: Cloud },
        ]
    }
];

// Helper to read/write directly to localStorage so we stay in sync with google-tts.ts
function getStored(key: string): string | null {
    if (typeof window === "undefined") return null;
    try { return localStorage.getItem(key); } catch { return null; }
}

function VoiceSettingsPanel() {
    const [apiKey, setApiKey] = useState("");
    const [voiceId, setVoiceId] = useState("");
    const [model, setModel] = useState("");
    const [showKey, setShowKey] = useState(false);
    const [saved, setSaved] = useState(false);
    const [hasKey, setHasKey] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");
    const [testMsg, setTestMsg] = useState("");

    // Load on mount
    useEffect(() => {
        const k = getStored("tts_elevenlabs_api_key") || "";
        const v = getStored("tts_elevenlabs_voice_id") || "";
        const m = getStored("tts_elevenlabs_model") || "";
        setApiKey(k);
        setVoiceId(v);
        setModel(m);
        setHasKey(!!k.trim());
        // Sync with external changes
        const handler = () => {
            const nk = getStored("tts_elevenlabs_api_key") || "";
            setHasKey(!!nk.trim());
            setApiKey(nk);
        };
        window.addEventListener("tts-settings-changed", handler);
        window.addEventListener("storage", handler);
        return () => {
            window.removeEventListener("tts-settings-changed", handler);
            window.removeEventListener("storage", handler);
        };
    }, []);

    const handleSave = () => {
        const trimmed = apiKey.trim();
        if (!trimmed) {
            setTestStatus("error");
            setTestMsg("Please enter a valid ElevenLabs API key (starts with sk_...)");
            setTimeout(() => setTestStatus("idle"), 3000);
            return;
        }
        localStorage.setItem("tts_elevenlabs_api_key", trimmed);
        if (voiceId.trim()) localStorage.setItem("tts_elevenlabs_voice_id", voiceId.trim());
        else localStorage.removeItem("tts_elevenlabs_voice_id");
        if (model.trim()) localStorage.setItem("tts_elevenlabs_model", model.trim());
        else localStorage.removeItem("tts_elevenlabs_model");
        window.dispatchEvent(new CustomEvent("tts-settings-changed", { detail: { key: "tts_elevenlabs_api_key", value: trimmed } }));
        setHasKey(true);
        setSaved(true);
        setTestStatus("success");
        setTestMsg("ElevenLabs key saved! Voice will now use ElevenLabs.");
        setTimeout(() => { setSaved(false); setTestStatus("idle"); }, 3000);
    };

    const handleClear = () => {
        localStorage.removeItem("tts_elevenlabs_api_key");
        localStorage.removeItem("tts_elevenlabs_voice_id");
        localStorage.removeItem("tts_elevenlabs_model");
        window.dispatchEvent(new CustomEvent("tts-settings-changed", { detail: { key: "tts_elevenlabs_api_key", value: null } }));
        setApiKey("");
        setVoiceId("");
        setModel("");
        setHasKey(false);
        setSaved(false);
        setTestStatus("success");
        setTestMsg("Cleared — will now use default Google voice.");
        setTimeout(() => setTestStatus("idle"), 3000);
    };

    const handleTest = async () => {
        if (!hasKey && !apiKey.trim()) {
            setTestStatus("error");
            setTestMsg("Save an ElevenLabs API key first to test ElevenLabs voice. Currently using Google voice.");
            setTimeout(() => setTestStatus("idle"), 4000);
            return;
        }
        // If user typed but hasn't saved yet, save implicitly for test
        if (apiKey.trim() && apiKey.trim() !== getStored("tts_elevenlabs_api_key")) {
            localStorage.setItem("tts_elevenlabs_api_key", apiKey.trim());
            window.dispatchEvent(new CustomEvent("tts-settings-changed", { detail: { key: "tts_elevenlabs_api_key", value: apiKey.trim() } }));
            setHasKey(true);
        }
        setIsTesting(true);
        setTestStatus("idle");
        try {
            await speakText("Hello! This is a test of your ElevenLabs voice configuration. If you hear this in a premium voice, your key is working correctly.");
            setTestStatus("success");
            setTestMsg("Test voice played successfully via ElevenLabs!");
        } catch (e: any) {
            setTestStatus("error");
            setTestMsg(e?.message || "Failed to generate voice. Check your API key.");
        } finally {
            setIsTesting(false);
            setTimeout(() => setTestStatus("idle"), 4000);
        }
    };

    const maskedKey = hasKey && apiKey ? `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}` : "";

    return (
        <div className="p-8 space-y-6 animate-slide-up">
            {/* Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="p-3 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl shadow-lg shadow-violet-600/20">
                    <Volume2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        Voice & TTS Settings
                        {hasKey ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-black tracking-widest text-emerald-700 uppercase">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> ElevenLabs Active
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-black tracking-widest text-slate-600 uppercase">
                                <Mic className="w-3 h-3" /> Google Voice (Default)
                            </span>
                        )}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">Configure how Max speaks — bring your own ElevenLabs key for premium voices</p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
                <div className="p-2 bg-blue-600 rounded-xl h-fit">
                    <Info className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900">How it works</p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        <span className="font-bold text-slate-900">No key →</span> Max uses default Google TTS (free, same as before).
                        <br />
                        <span className="font-bold text-violet-700">With key →</span> Max uses your ElevenLabs API key for premium, natural voices. Key is stored locally in your browser.
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-5">
                {/* API Key */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                        <KeyRound className="w-3.5 h-3.5" /> ElevenLabs API Key <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showKey ? "text" : "password"}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk_... paste your ElevenLabs API key here"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-20 text-sm font-mono font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-violet-600/10 focus:border-violet-600 transition-all"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                                title={showKey ? "Hide" : "Show"}
                            >
                                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    {hasKey && maskedKey && (
                        <p className="text-[11px] text-emerald-600 font-medium px-1 flex items-center gap-1.5">
                            <Check className="w-3 h-3" /> Saved key: <span className="font-mono font-bold">{maskedKey}</span> — voice routed via ElevenLabs
                        </p>
                    )}
                    {!hasKey && (
                        <p className="text-[11px] text-slate-500 font-medium px-1">
                            No key saved — Max will use Google voice. Get a key at{" "}
                            <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener noreferrer" className="text-violet-600 font-bold hover:underline inline-flex items-center gap-1">
                                elevenlabs.io <ExternalLink className="w-3 h-3" />
                            </a>
                        </p>
                    )}
                </div>

                {/* Voice ID & Model (optional) */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" /> Voice ID <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={voiceId}
                            onChange={(e) => setVoiceId(e.target.value)}
                            placeholder="21m00Tcm4TlvDq8ikWAM (Rachel)"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-violet-600/10 focus:border-violet-600 transition-all"
                        />
                        <p className="text-[10px] text-slate-400 px-1">Default: Rachel (21m00...). Find IDs at ElevenLabs Voice Library.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Model <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span></label>
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600/10 focus:border-violet-600 transition-all"
                        >
                            <option value="">eleven_multilingual_v2 (default)</option>
                            <option value="eleven_multilingual_v2">eleven_multilingual_v2</option>
                            <option value="eleven_turbo_v2_5">eleven_turbo_v2_5</option>
                            <option value="eleven_monolingual_v1">eleven_monolingual_v1</option>
                        </select>
                    </div>
                </div>

                {/* Status toast */}
                {testStatus !== "idle" && (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold ${testStatus === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                        {testStatus === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {testMsg}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-2">
                    <button
                        onClick={handleSave}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0a1e3b] text-white text-xs font-bold shadow-lg shadow-blue-900/20 hover:scale-[1.02] hover:bg-[#122a52] transition-all"
                    >
                        <Save className="w-4 h-4" /> {saved ? "Saved!" : "Save Key"}
                    </button>
                    <button
                        onClick={handleTest}
                        disabled={isTesting}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-violet-600/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Play className="w-4 h-4" /> {isTesting ? "Testing..." : "Test Voice"}
                    </button>
                    {hasKey && (
                        <button
                            onClick={handleClear}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all"
                        >
                            <Trash2 className="w-4 h-4" /> Remove & Use Google
                        </button>
                    )}
                </div>

                <p className="text-[11px] text-slate-400 font-medium leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <span className="font-bold text-slate-600">Privacy:</span> Your key is stored only in <span className="font-mono font-bold">localStorage</span> on this browser — never sent to our servers. To use on another device, add it again there. Clearing browser data will remove it.
                </p>
            </div>
        </div>
    );
}

function AgentModePanel() {
    const { enabled, setEnabled } = useAgenQEnabled();

    return (
        <div className="p-8 space-y-6 animate-slide-up">
            {/* Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-600/20">
                    <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        Agent Mode
                        {enabled ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-black tracking-widest text-blue-700 uppercase">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" /> AgenQ SDK Active
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-black tracking-widest text-slate-600 uppercase">
                                <Sparkles className="w-3 h-3" /> Default Nina
                            </span>
                        )}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">Choose which assistant experience to use across the app</p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
                <div className="p-2 bg-blue-600 rounded-xl h-fit">
                    <Info className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900">How it works</p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        <span className="font-bold text-slate-900">Toggle OFF →</span> Shows the built-in <span className="font-bold">Ask Nina</span> button (top bar & greeting popup) which opens the default hardcoded right-side panel.
                        <br />
                        <span className="font-bold text-blue-700">Toggle ON →</span> Hides Ask Nina buttons and displays the real <span className="font-bold">AgenQ SDK floating agent</span> (bottom-right bubble on Dashboard / Home after login).
                    </p>
                </div>
            </div>

            {/* Toggle Row */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl border ${enabled ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-500"}`}>
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Use AgenQ SDK Agent</p>
                        <p className="text-xs text-slate-500 font-medium">
                            {enabled ? "AgenQ SDK is visible • Ask Nina is hidden" : "Default Nina is visible • AgenQ SDK is hidden"}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() => setEnabled(!enabled)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:ring-offset-2 ${enabled ? "bg-blue-600" : "bg-slate-300"}`}
                >
                    <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${enabled ? "translate-x-6" : "translate-x-1"}`}
                    />
                </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium">
                <span className={`px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${!enabled ? "bg-[#0a1e3b] text-white border-[#0a1e3b]" : "bg-white text-slate-500 border-slate-200"}`}>
                    Default Nina
                </span>
                <span className="text-slate-400">—</span>
                <span className={`px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${enabled ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-200"}`}>
                    AgenQ SDK
                </span>
                <span className="ml-auto text-[11px] text-slate-400 font-medium">
                    Go to <span className="font-bold text-slate-700">Dashboard</span> after toggling to see the change
                </span>
            </div>

            <p className="text-[11px] text-slate-400 font-medium leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-3">
                <span className="font-bold text-slate-600">Note:</span> This toggle is stored in <span className="font-mono font-bold">localStorage</span> on this browser only. It takes effect instantly without page reload. No layout or sizes are changed — Ask Nina buttons are just hidden (invisible) when AgenQ is on.
            </p>
        </div>
    );
}

function PlaceholderPanel({ id }: { id: string }) {
    const titles: Record<string, { title: string; desc: string }> = {
        security: { title: "Security & Password", desc: "Authentication and access control — coming soon" },
        notifications: { title: "Notifications", desc: "Email and push alert preferences — coming soon" },
        appearance: { title: "Appearance", desc: "Dark mode and UI density — coming soon" },
        data: { title: "Data Management", desc: "Export and archival settings — coming soon" },
        api: { title: "API Keys (Legacy)", desc: "This tab has moved to Voice & TTS. Use Voice & TTS to manage ElevenLabs." },
    };
    const t = titles[id] || { title: id, desc: "This section is under construction." };
    return (
        <div className="p-8 space-y-6 animate-slide-up">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="p-3 bg-slate-100 rounded-2xl">
                    <SettingsIcon className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{t.title}</h2>
                    <p className="text-sm text-slate-500 font-medium">{t.desc}</p>
                </div>
            </div>
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
                <p className="text-sm font-bold text-slate-500">No settings yet for this section.</p>
                <p className="text-xs text-slate-400 mt-1">Switch to <span className="font-bold text-violet-600">Voice & TTS</span> to configure ElevenLabs.</p>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("voice");

    // Handle hash like #voice
    useEffect(() => {
        if (typeof window !== "undefined" && window.location.hash) {
            const h = window.location.hash.replace("#", "");
            if (h) setActiveTab(h);
        }
    }, []);

    const renderContent = () => {
        if (activeTab === "profile") {
            return (
                <div className="p-8 space-y-8 animate-slide-up">
                    <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
                            <p className="text-sm text-slate-500 font-medium">Manage how you appear on the platform</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                            <input
                                type="text"
                                defaultValue="John Smith"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                            <input
                                type="email"
                                defaultValue="john.smith@maxinsurance.com"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Job Title</label>
                            <input
                                type="text"
                                defaultValue="Lead Administrator"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Brief Biography</label>
                            <textarea
                                rows={4}
                                defaultValue="Lead administrator for the Group Benefitz enterprise portal. Managing 120+ corporate accounts."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                        <button className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all">
                            Cancel
                        </button>
                        <button className="px-6 py-2.5 rounded-xl bg-[#0a1e3b] text-white text-xs font-bold shadow-lg shadow-blue-900/20 hover:scale-105 transition-all">
                            Save Changes
                        </button>
                    </div>
                </div>
            );
        }
        if (activeTab === "voice") return <VoiceSettingsPanel />;
        if (activeTab === "agent") return <AgentModePanel />;
        return <PlaceholderPanel id={activeTab} />;
    };

    return (
        <div className='flex min-h-screen bg-gradient-to-tr from-slate-200 via-indigo-50 to-blue-100 font-sans selection:bg-blue-600/10'>
            <MaxGreeting />
            <Sidebar />

            <main className='flex-1 md:ml-64 relative overflow-hidden flex flex-col'>
                {/* Dynamic Background Accents */}
                <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />

                {/* Header */}
                <header className='relative z-20 flex min-h-[5rem] md:h-20 flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 border-b border-slate-200/60 bg-white/70 backdrop-blur-md px-4 md:px-8 pt-24 md:pt-0 pb-4 md:pb-0'>
                    <div className='flex flex-col'>
                        <h1 className='text-2xl font-bold text-slate-900 tracking-tight'>Settings</h1>
                        <p className="text-xs text-slate-500 font-medium">Configure your platform experience</p>
                    </div>
                    {activeTab === "voice" && (
                        <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50">
                            <Sparkles className="w-3.5 h-3.5 text-violet-600" /> Get ElevenLabs Key <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                </header>

                <div className='relative z-10 p-8 flex flex-col lg:flex-row gap-8 animate-fade-in'>
                    {/* Settings Navigation */}
                    <div className="w-full lg:w-80 space-y-8 shrink-0">
                        {SETTINGS_GROUPS.map((group) => (
                            <div key={group.title} className="space-y-3">
                                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group.title}</p>
                                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                    {group.items.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id)}
                                            className={`w-full flex items-center gap-4 px-4 py-4 transition-all hover:bg-slate-50 border-b border-slate-100 last:border-0 ${activeTab === item.id ? "bg-blue-50/50" : ""}`}
                                        >
                                            <div className={`p-2 rounded-lg ${activeTab === item.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <div className="text-left flex-1 min-w-0">
                                                <p className={`text-xs font-bold ${activeTab === item.id ? "text-blue-600" : "text-slate-900"}`}>{item.label}</p>
                                                <p className="text-[10px] text-slate-400 font-medium truncate">{item.description}</p>
                                            </div>
                                            {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto text-blue-600 shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Active Content */}
                    <div className="flex-1 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-300 shadow-xl overflow-hidden min-w-0">
                        {renderContent()}
                    </div>
                </div>
            </main>

            <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
        </div>
    );
}
