// Global playback speed for the onboarding walkthrough.
// Drives both speech rate (via google-tts) and workflow step pacing.

export type PlaybackSpeed = 0.5 | 1 | 1.25 | 1.5 | 1.75 | 2;

export const PLAYBACK_SPEED_OPTIONS: PlaybackSpeed[] = [0.5, 1, 1.25, 1.5, 1.75, 2];

let playbackSpeed: PlaybackSpeed = 1;

export function getPlaybackSpeed(): PlaybackSpeed {
    return playbackSpeed;
}

export function setPlaybackSpeed(s: PlaybackSpeed): void {
    playbackSpeed = s;
}

// Workflow delays scale inversely with speed: slower speed => longer pauses.
export function getDelayScale(): number {
    return 1 / playbackSpeed;
}

export function formatPlaybackSpeed(s: PlaybackSpeed): string {
    return s === 1 ? "Normal (1x)" : `${s}x`;
}
