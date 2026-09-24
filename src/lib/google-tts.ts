/**
 * Google Text-to-Speech API Utility
 * 
 * This utility provides a function to convert text to speech using the Google TTS API.
 * It uses the API key stored in the NEXT_PUBLIC_GOOGLE_TTS_API_KEY environment variable.
 */

// Hard-wired defaults so deploy works even if env is missing
const DEFAULT_ELEVENLABS_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel - default ElevenLabs voice
const DEFAULT_ELEVENLABS_MODEL = 'eleven_multilingual_v2';

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY;
const ENV_ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const ENV_ELEVENLABS_VOICE_ID = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || DEFAULT_ELEVENLABS_VOICE_ID;
const ENV_ELEVENLABS_MODEL = process.env.NEXT_PUBLIC_ELEVENLABS_MODEL || DEFAULT_ELEVENLABS_MODEL;

// Helpers to read user-provided ElevenLabs config from localStorage (client-side)
export function getUserElevenLabsKey(): string | null {
    if (typeof window === "undefined") return null;
    try {
        const v = localStorage.getItem("tts_elevenlabs_api_key");
        return v && v.trim() ? v.trim() : null;
    } catch { return null; }
}
export function getEffectiveElevenLabsKey(): string | null {
    return getUserElevenLabsKey() || ENV_ELEVENLABS_API_KEY || null;
}
export function getEffectiveElevenLabsVoiceId(): string {
    if (typeof window === "undefined") return ENV_ELEVENLABS_VOICE_ID;
    try {
        const v = localStorage.getItem("tts_elevenlabs_voice_id");
        return v && v.trim() ? v.trim() : ENV_ELEVENLABS_VOICE_ID;
    } catch { return ENV_ELEVENLABS_VOICE_ID; }
}
export function getEffectiveElevenLabsModel(): string {
    if (typeof window === "undefined") return ENV_ELEVENLABS_MODEL;
    try {
        const v = localStorage.getItem("tts_elevenlabs_model");
        return v && v.trim() ? v.trim() : ENV_ELEVENLABS_MODEL;
    } catch { return ENV_ELEVENLABS_MODEL; }
}
export function hasUserElevenLabsKey(): boolean {
    return !!getUserElevenLabsKey();
}
export function getActiveTTSProvider(): "elevenlabs" | "google" {
    return hasUserElevenLabsKey() ? "elevenlabs" : "google";
}
// Detect if a voice name looks like a Google voice (e.g. en-US-Standard-C) vs ElevenLabs ID
function isGoogleVoiceName(name: string): boolean {
    return name.includes("en-") || name.includes("Standard") || name.includes("Wavenet") || name.includes("Neural");
}
function resolveElevenLabsVoiceId(optionsName?: string): string {
    const effective = getEffectiveElevenLabsVoiceId();
    if (!optionsName) return effective;
    if (isGoogleVoiceName(optionsName)) return effective; // Don't pass Google voice to ElevenLabs
    return optionsName;
}

// Chatterbox (Resemble AI) Fallback
const RESEMBLE_API_KEY = process.env.NEXT_PUBLIC_RESEMBLE_API_KEY;
const RESEMBLE_PROJECT_UUID = process.env.NEXT_PUBLIC_RESEMBLE_PROJECT_UUID;
const RESEMBLE_VOICE_UUID = process.env.NEXT_PUBLIC_RESEMBLE_VOICE_UUID;

export interface TTSOptions {
    languageCode?: string;
    name?: string; // Voice name, e.g., 'en-US-Standard-C'
    ssmlGender?: 'MALE' | 'FEMALE' | 'NEUTRAL' | 'SSML_VOICE_GENDER_UNSPECIFIED';
    audioEncoding?: 'LINEAR16' | 'MP3' | 'OGG_OPUS';
    speakingRate?: number;
    pitch?: number;
}

/**
 * Utility to strip markdown characters before sending to TTS
 */
function stripMarkdown(text: string): string {
    return text
        .replace(/\*\*/g, '')    // Remove bold
        .replace(/\*/g, '')     // Remove italic/bullets
        .replace(/__/g, '')     // Remove bold underscores
        .replace(/_/g, '')      // Remove italic underscores
        .replace(/#/g, '')      // Remove headers
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove link syntax but keep label
        .trim();
}

/**
 * Safe conversion from ArrayBuffer to Base64 in the browser
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Synthesizes text to speech and returns the audio content as a base64 string.
 * @param text The text to synthesize
 * @param options Voice options
 */
export async function synthesizeSpeech(text: string, options: TTSOptions = {}): Promise<{ audioContent: string, isElevenLabs: boolean }> {
    const cleanedText = stripMarkdown(text);

    const effectiveElevenLabsKey = getEffectiveElevenLabsKey();
    const effectiveVoiceId = getEffectiveElevenLabsVoiceId();
    const effectiveModel = getEffectiveElevenLabsModel();
    const userHasKey = hasUserElevenLabsKey();

    // Helper: try Google TTS
    const tryGoogle = async (): Promise<{ audioContent: string, isElevenLabs: boolean } | null> => {
        if (!GOOGLE_API_KEY) return null;
        const GOOGLE_API_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`;
        const payload = {
            input: { text: cleanedText },
            voice: {
                languageCode: options.languageCode || 'en-US',
                name: options.name || 'en-US-Standard-C',
                ssmlGender: options.ssmlGender || 'FEMALE',
            },
            audioConfig: {
                audioEncoding: options.audioEncoding || 'MP3',
                speakingRate: options.speakingRate || 1.10,
                pitch: options.pitch || 0,
            },
        };
        try {
            const response = await fetch(GOOGLE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                const data = await response.json();
                return { audioContent: data.audioContent, isElevenLabs: false };
            }
            console.warn('Google TTS failed, trying fallback...');
        } catch (error) {
            console.error('Google TTS error:', error);
        }
        return null;
    };

    // Helper: try ElevenLabs with given effective key
    const tryElevenLabs = async (): Promise<{ audioContent: string, isElevenLabs: boolean } | null> => {
        if (!effectiveElevenLabsKey) return null;
        try {
            const voiceId = resolveElevenLabsVoiceId(options.name) || effectiveVoiceId;
            // Debug log to verify which provider is being attempted
            if (typeof window !== "undefined") {
                console.log(`[TTS] Attempting ElevenLabs | hasUserKey=${userHasKey} | voiceId=${voiceId} | key=${effectiveElevenLabsKey.slice(0, 8)}...`);
            }
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': effectiveElevenLabsKey,
                },
                body: JSON.stringify({
                    text: cleanedText,
                    model_id: effectiveModel,
                    voice_settings: {
                        stability: 0.75,
                        similarity_boost: 0.75,
                        style: 0.06,
                        use_speaker_boost: true
                    },
                }),
            });
            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const base64 = arrayBufferToBase64(arrayBuffer);
                return { audioContent: base64, isElevenLabs: true };
            }
            const errorText = await response.text();
            console.error('ElevenLabs API Error:', errorText);
        } catch (error) {
            console.error('ElevenLabs failed:', error);
        }
        return null;
    };

    // NEW LOGIC: If user provided ElevenLabs key via Settings -> prioritize ElevenLabs
    //            If no user key -> prioritize Google (default behavior)
    if (typeof window !== "undefined") {
        console.log(`[TTS] synthesizeSpeech | userHasKey=${userHasKey} | effectiveKey=${effectiveElevenLabsKey ? effectiveElevenLabsKey.slice(0, 8) + "..." : "none"} | providerOrder=${userHasKey ? "ElevenLabs->Google" : "Google->ElevenLabs"}`);
    }
    if (userHasKey) {
        const el = await tryElevenLabs();
        if (el) {
            if (typeof window !== "undefined") console.log("[TTS] ✓ Using ElevenLabs (user key)");
            return el;
        }
        console.warn('[TTS] User ElevenLabs key failed (check key/voiceId/quota), falling back to Google...');
        const g = await tryGoogle();
        if (g) {
            if (typeof window !== "undefined") console.warn("[TTS] Fallback: Using Google voice instead");
            return g;
        }
    } else {
        if (typeof window !== "undefined") console.log("[TTS] No user key — trying Google first");
        const g = await tryGoogle();
        if (g) {
            if (typeof window !== "undefined") console.log("[TTS] ✓ Using Google voice (default)");
            return g;
        }
        const el = await tryElevenLabs();
        if (el) {
            if (typeof window !== "undefined") console.log("[TTS] Fallback: Using ElevenLabs (env key)");
            return el;
        }
    }

    // 3. Try Chatterbox (Resemble AI Cluster) if others failed
    const RESEMBLE_KEY = RESEMBLE_API_KEY || '2ZFf9S5xEJJoX5iJaZMiGQtt';
    const VOICE_ID = RESEMBLE_VOICE_UUID || '4e972f71';

    if (RESEMBLE_KEY) {
        try {
            const response = await fetch(`https://f.cluster.resemble.ai/synthesize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEMBLE_KEY}`,
                    'x-api-key': RESEMBLE_KEY,
                    'Accept': 'audio/wav, audio/mpeg, audio/*'
                },
                body: JSON.stringify({
                    voice_uuid: VOICE_ID,
                    data: cleanedText,
                }),
            });

            if (response.ok) {
                const contentType = response.headers.get('Content-Type');

                if (contentType?.includes('application/json')) {
                    const data = await response.json();
                    // The cluster returns { audio_content: "base64..." }
                    const base64Data = data.audio_content || data.audio || data.data;

                    if (base64Data) {
                        const finalAudio = base64Data.startsWith('data:')
                            ? base64Data
                            : `data:audio/wav;base64,${base64Data}`;
                        return { audioContent: finalAudio, isElevenLabs: false };
                    }
                }

                // Fallback for raw binary
                const arrayBuffer = await response.arrayBuffer();
                const base64 = arrayBufferToBase64(arrayBuffer);
                const head = new Uint8Array(arrayBuffer.slice(0, 4));
                const isWav = head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46;
                const prefix = isWav ? 'data:audio/wav;base64,' : 'data:audio/mp3;base64,';

                return { audioContent: prefix + base64, isElevenLabs: false };
            }
            const errorText = await response.text();
            console.error('Chatterbox/Resemble Cluster Error:', errorText);
        } catch (error) {
            console.error('Chatterbox/Resemble Cluster failed:', error);
        }
    }

    throw new Error('No TTS provider available. Please check your .env.local file (Google, ElevenLabs, or Resemble).');
}

// Global variables to keep track of the current audio and its resolve function
let currentAudio: HTMLAudioElement | null = null;
let resolveCurrentAudio: (() => void) | null = null;
let globalAudioMuted = false;

// Global speaking rate (driven by the playback-speed control in the chat UI).
let currentSpeakingRate = 1.10;

/**
 * Set the global speaking rate used by speakText when no explicit rate is given.
 * @param rate 0.92 ≈ "Normal (1x)"; higher = faster, lower = slower.
 */
export function setSpeakingRate(rate: number): void {
    currentSpeakingRate = rate;
}

export function getSpeakingRate(): number {
    return currentSpeakingRate;
}

// Hooks so the UI can reflect speaking state (e.g. a "Speaking" indicator
// that should light up while the workflow narrates, not just normal chat).
let onSpeakStart: (() => void) | null = null;
let onSpeakEnd: (() => void) | null = null;

export function setSpeakStateHooks(
    start: (() => void) | null,
    end: (() => void) | null
): void {
    onSpeakStart = start;
    onSpeakEnd = end;
}

/**
 * Update the global mute state for the TTS utility.
 * When muted, all currently playing audio will stop and no new audio will start.
 */
export function setGlobalMuteState(muted: boolean): void {
    globalAudioMuted = muted;
    if (muted) {
        stopSpeech();
    }
}

/**
 * Plays the synthesized speech using the browser's Audio object.
 * @param audioContent Base64 encoded audio content
 * @param playbackRate Optional playback rate (default 1.0)
 */
export function playAudio(audioContent: string, playbackRate: number = 1.0): Promise<void> {
    // If we are currently muted, don't play anything
    if (globalAudioMuted) {
        return Promise.resolve();
    }

    // If there is already audio playing, stop it first
    stopSpeech();

    return new Promise((resolve, reject) => {
        try {
            // Check again right before creating the audio object
            if (globalAudioMuted) return resolve();

            // If audioContent already has a data prefix (like from Chatterbox), use it as is.
            // Otherwise, default to mp3 (for Google/ElevenLabs).
            const audioSrc = audioContent.startsWith('data:')
                ? audioContent
                : `data:audio/mp3;base64,${audioContent}`;

            const audio = new Audio(audioSrc);
            audio.playbackRate = playbackRate; // Apply speed control

            currentAudio = audio;
            resolveCurrentAudio = resolve;

            audio.onended = () => {
                currentAudio = null;
                resolveCurrentAudio = null;
                resolve();
            };
            audio.onerror = (e) => {
                currentAudio = null;
                resolveCurrentAudio = null;
                reject(e);
            };

            // Final check right before play
            if (globalAudioMuted) {
                currentAudio = null;
                resolve();
                return;
            }

            audio.play();
        } catch (error) {
            currentAudio = null;
            resolveCurrentAudio = null;
            reject(error);
        }
    });
}

/**
 * Stops any currently playing audio.
 */
export function stopSpeech(): void {
    const wasSpeaking = !!currentAudio;
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    if (resolveCurrentAudio) {
        resolveCurrentAudio();
        resolveCurrentAudio = null;
    }
    if (wasSpeaking && onSpeakEnd) onSpeakEnd();
}

/**
 * Convenience function to speak text immediately.
 */
// Dedupe guard: prevent the exact same text from being spoken twice in quick
// succession (fixes a "Tier Tier ..." stutter where a message is triggered
// twice — e.g. an effect re-running or the pause re-speak path).
let lastSpokenText = "";
let lastSpokenTs = 0;

// Reset dedupe when provider changes so same greeting can be respoken with new voice
if (typeof window !== "undefined") {
    window.addEventListener("tts-settings-changed", () => {
        lastSpokenText = "";
        lastSpokenTs = 0;
        // Also stop any current speech that used old voice
        try { stopSpeech(); } catch {}
    });
    window.addEventListener("storage", (e) => {
        if (e.key === "tts_elevenlabs_api_key") {
            lastSpokenText = "";
            lastSpokenTs = 0;
        }
    });
}

export function clearSpeechCache(): void {
    lastSpokenText = "";
    lastSpokenTs = 0;
}

export async function speakText(text: string, options: TTSOptions = {}): Promise<void> {
    if (globalAudioMuted) return;

    // Skip an immediate duplicate of the same sentence.
    const now = Date.now();
    if (text && text === lastSpokenText && now - lastSpokenTs < 1000) {
        return;
    }
    lastSpokenText = text ?? "";
    lastSpokenTs = now;

    // Use the global playback speed rate unless an explicit rate is provided.
    const desiredRate = options.speakingRate ?? currentSpeakingRate;

    try {
        const { audioContent, isElevenLabs } = await synthesizeSpeech(text, { ...options, speakingRate: desiredRate });

        // Critical check after synthesis delay
        if (globalAudioMuted) return;

        // ElevenLabs: apply rate via playbackRate (baked into audio for Google).
        const rate = isElevenLabs ? desiredRate : 1.0;

        if (onSpeakStart) onSpeakStart();
        try {
            await playAudio(audioContent, rate);
        } finally {
            if (onSpeakEnd) onSpeakEnd();
        }
    } catch (error) {
        console.error('Failed to speak text:', error);
    }
}
