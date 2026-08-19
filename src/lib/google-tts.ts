/**
 * Google Text-to-Speech API Utility
 * 
 * This utility provides a function to convert text to speech using the Google TTS API.
 * It uses the API key stored in the NEXT_PUBLIC_GOOGLE_TTS_API_KEY environment variable.
 */

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY;
const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || 'AXdMgz6evoL7OPd7eU12';
const ELEVENLABS_MODEL = process.env.NEXT_PUBLIC_ELEVENLABS_MODEL || 'eleven_multilingual_v2';

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

    // 1. Try Google TTS first if API key is available
    if (GOOGLE_API_KEY) {
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
                return { audioContent: data.audioContent, isElevenLabs: false }; // Base64 string
            }
            console.warn('Google TTS failed, trying ElevenLabs fallback...');
        } catch (error) {
            console.error('Google TTS error:', error);
        }
    }

    // 2. Try ElevenLabs if Google is unavailable or failed
    if (ELEVENLABS_API_KEY) {
        try {
            const voiceId = options.name || ELEVENLABS_VOICE_ID;
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY,
                },
                body: JSON.stringify({
                    text: cleanedText,
                    model_id: ELEVENLABS_MODEL,
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
