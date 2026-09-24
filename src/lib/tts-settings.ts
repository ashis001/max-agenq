"use client";

/**
 * TTS Settings — Manages user-provided ElevenLabs configuration via localStorage
 *
 * Logic:
 * - If user has saved an API key in Settings UI -> use ElevenLabs with that key (priority)
 * - If no user key -> fallback to default Google TTS (env key)
 * - Env ELEVENLABS key is kept as tertiary fallback if Google fails and no user key
 */

const STORAGE_KEYS = {
    ELEVENLABS_API_KEY: "tts_elevenlabs_api_key",
    ELEVENLABS_VOICE_ID: "tts_elevenlabs_voice_id",
    ELEVENLABS_MODEL: "tts_elevenlabs_model",
} as const;

// Hard-wired defaults so deploy works even if env is missing — user only needs to paste API key
const DEFAULT_ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel - default ElevenLabs voice
const DEFAULT_ELEVENLABS_MODEL = "eleven_multilingual_v2";

const ENV_ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "";
const ENV_ELEVENLABS_VOICE_ID = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || DEFAULT_ELEVENLABS_VOICE_ID;
const ENV_ELEVENLABS_MODEL = process.env.NEXT_PUBLIC_ELEVENLABS_MODEL || DEFAULT_ELEVENLABS_MODEL;

/* ---------- Low-level storage helpers ---------- */
function safeGet(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}
function safeSet(key: string, value: string) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(key, value);
        // Dispatch event so other tabs/components can react
        window.dispatchEvent(new CustomEvent("tts-settings-changed", { detail: { key, value } }));
    } catch {}
}
function safeRemove(key: string) {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(key);
        window.dispatchEvent(new CustomEvent("tts-settings-changed", { detail: { key, value: null } }));
    } catch {}
}

/* ---------- Public API ---------- */

/** Returns user-saved key or null if not set */
export function getUserElevenLabsKey(): string | null {
    const v = safeGet(STORAGE_KEYS.ELEVENLABS_API_KEY);
    return v && v.trim().length > 0 ? v.trim() : null;
}

export function setUserElevenLabsKey(key: string): void {
    const trimmed = key.trim();
    if (!trimmed) {
        safeRemove(STORAGE_KEYS.ELEVENLABS_API_KEY);
        return;
    }
    safeSet(STORAGE_KEYS.ELEVENLABS_API_KEY, trimmed);
}

export function clearUserElevenLabsKey(): void {
    safeRemove(STORAGE_KEYS.ELEVENLABS_API_KEY);
}

/** True if user has provided a key via Settings UI */
export function hasUserElevenLabsKey(): boolean {
    return !!getUserElevenLabsKey();
}

/** Effective key: user key > env key (used for fallback chain) */
export function getEffectiveElevenLabsKey(): string | null {
    return getUserElevenLabsKey() || (ENV_ELEVENLABS_API_KEY || null);
}

/** Effective voice id: user override > env fallback */
export function getEffectiveElevenLabsVoiceId(): string {
    return safeGet(STORAGE_KEYS.ELEVENLABS_VOICE_ID)?.trim() || ENV_ELEVENLABS_VOICE_ID;
}

export function getEffectiveElevenLabsModel(): string {
    return safeGet(STORAGE_KEYS.ELEVENLABS_MODEL)?.trim() || ENV_ELEVENLABS_MODEL;
}

/** Save optional voice/model overrides */
export function setUserElevenLabsVoiceId(voiceId: string): void {
    const t = voiceId.trim();
    if (!t) safeRemove(STORAGE_KEYS.ELEVENLABS_VOICE_ID);
    else safeSet(STORAGE_KEYS.ELEVENLABS_VOICE_ID, t);
}
export function setUserElevenLabsModel(model: string): void {
    const t = model.trim();
    if (!t) safeRemove(STORAGE_KEYS.ELEVENLABS_MODEL);
    else safeSet(STORAGE_KEYS.ELEVENLABS_MODEL, t);
}

/** Convenience: what provider will be used right now */
export function getActiveTTSProvider(): "elevenlabs" | "google" {
    return hasUserElevenLabsKey() ? "elevenlabs" : "google";
}

/** Subscribe to changes (for React) */
export function subscribeTTSSettings(callback: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    const handler = () => callback();
    window.addEventListener("tts-settings-changed", handler);
    window.addEventListener("storage", handler);
    return () => {
        window.removeEventListener("tts-settings-changed", handler);
        window.removeEventListener("storage", handler);
    };
}
