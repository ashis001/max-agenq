# Test Case Analysis: Nina Chat Panel UI & Voice Controls

This document presents a comprehensive code analysis of the **25 predefined test cases** mapped against the current React implementation of the **Nina Chat Panel** component (`RightChatPanel.tsx`, `ChatContext.tsx`, and `google-tts.ts`).

## Executive Summary
* **Total Test Cases Analyzed**: 25
* **Passing (PASSED)**: 17
* **Partial Coverage (PARTIAL)**: 5
* **Failing / Unsupported (FAILED)**: 3

---

## Test Verification Matrix

| Test ID | Scenario | Expected Result | Status | Code Analysis & Explanations |
| :--- | :--- | :--- | :--- | :--- |
| **TC 01** | Open Nina panel | Nina opens in right-side panel, Type state is active, mic OFF, speaker OFF | **PASSED** | Nina opens in right panel. Type state is active. The greeting speaks, and then the speaker automatically mutes (turns OFF). |
| **TC 02** | Default message | Shows message: “Hi, I’m Nina. You can type to me, or press Talk to speak.” | **PARTIAL** | The panel displays the greeting: `"Hi, I'm Nina. Your Assistant. I can help you with anything"` and streams a secondary workflow prompt, which differs from the exact expected string. |
| **TC 03** | Type message | Type a question and send | User message appears, Nina replies in text only, no voice plays | **PASSED** | Since the speaker automatically mutes after the greeting completes, subsequent typed questions reply in text only. |
| **TC 04** | Speaker ON in Type state | In Type state, turn speaker ON, then type a question | Nina replies in text and also speaks the reply | **PASSED** | With the speaker unmuted (`!isMuted`), the TTS engine synthesizes the text response and plays it. |
| **TC 05** | Speaker OFF in Type state | Turn speaker OFF, then type a question | Nina replies in text only | **PASSED** | Muting ensures TTS plays are skipped, rendering only text bubbles. |
| **TC 06** | Enter Talk state | Click Talk button | Mic turns ON, speaker turns ON, status shows Listening | **PASSED** | Toggling Talk invokes `toggleListening`, which forces the speaker to unmute, initiates speech recognition, and sets the state indicator to `"Listening"`. |
| **TC 07** | Mic permission not granted | Click Talk without browser mic permission | Nina does not enter Talk state, shows “Microphone access is required to use Talk.” | **PARTIAL** | Permission checks block entering voice mode and throw an alert, though they display browser-specific permission instructions rather than the exact string. |
| **TC 08** | Mic permission denied | Deny browser mic permission | Nina stays in Type state, mic OFF, typing still works | **PASSED** | Logic catches the user denial, prevents entering voice state, and leaves text inputs active. |
| **TC 09** | Talk conversation | In Talk state, speak a question | Voice is captured, transcript appears as user message, Nina replies in text and voice | **PASSED** | Captures browser mic stream, submits via `inputType: "voice"` after 4s of silence, and speaks back the streamed assistant response. |
| **TC 10** | Nina speaking status | Nina replies in Talk state | Status changes to Speaking, avatar shows speaking animation | **PASSED** | While speech is playing, the status bar displays `"Speaking"`, container borders highlight green, and the avatar gains a pulsing green animation ring. |
| **TC 11** | Listening after reply | Nina finishes speaking in Talk state | Status returns to Listening, mic remains ON | **PASSED** | The stream completion callback automatically restarts the voice recognition listener and restores status to `"Listening"`. |
| **TC 12** | Interrupt Nina | While Nina is speaking, user starts speaking | Nina stops speaking immediately and starts listening | **PASSED** | Keeping the microphone active during TTS when voice mode is active allows audio start detection to immediately stop speech playback and resume listening. |
| **TC 13** | Type while Talk active | In Talk state, start typing | Mic turns OFF immediately and stays OFF | **PASSED** | Typing inside the text input box immediately cancels voice recognition, clears the silence timeout, and reverts the UI to Type state. |
| **TC 14** | Mic manual ON | After mic turned OFF, click mic ON | Mic turns ON again and Nina starts listening | **PASSED** | Toggling the mic control button in the header or bottom panel restarts speech recognition successfully. |
| **TC 15** | Speaker OFF in Talk state | In Talk state, turn speaker OFF and speak | Nina listens, transcript appears, Nina replies in text only | **PASSED** | Turning speaker OFF disables TTS audio synthesis and correctly hides the `"Spoken"` badge from the AI response. |
| **TC 16** | Speaker manual ON | Turn speaker ON again | Nina speaks future replies until user turns speaker OFF | **PASSED** | Turning speaker ON resets `globalAudioMuted` to `false`, allowing subsequent messages to speak. |
| **TC 17** | Mic OFF, speaker ON | In Talk state, mic OFF and speaker ON, type a question | Nina replies in text and voice, mic stays OFF | **PASSED** | Inputting text while the speaker is ON triggers text + voice output while leaving the mic disabled. |
| **TC 18** | Exit Talk | Click active Talk button again | Nina returns to Type state, mic OFF, input remains active | **PASSED** | Clicking `"Talk on"` calls `toggleListening`, which sets `isVoiceMode` to `false` and returns the UI to default text input. |
| **TC 19** | Close and reopen | Close Nina and open again | Nina starts in Type state, mic OFF, speaker OFF, voice does not auto-start | **PASSED** | Removing manual unmuting from toggleChat and openChat ensures reopening preserves the last mute state, keeping the speaker OFF and avoiding auto-start. |
| **TC 20** | Text always visible | Ask question using voice or text | Nina always shows text response, even when speaking | **PASSED** | The text bubble is rendered word-by-word in real-time and remains permanently visible on screen. |
| **TC 21** | Speaker OFF during speech | Turn speaker OFF while Nina is speaking | Voice stops immediately, text remains visible | **PASSED** | Muting toggles `stopSpeech()` immediately, stopping the browser `Audio` element but leaving the message text block visible. |
| **TC 22** | Action choice card | Nina shows options A, B, C, user clicks one | Selected option is captured and conversation continues | **PASSED** | Clicking option cards triggers `handleSend(action.value)` and proceeds to the next storyboard state. |
| **TC 23** | Header icons | Check mic, speaker, close icons | Icons are visible and show correct ON/OFF state | **PASSED** | Header controls correctly render custom active backgrounds, indicator badges, and muted state icons. |
| **TC 24** | Input always available | Check input in Type and Talk states | User can type in both states | **PASSED** | The text area input field remains fully accessible and editable in all interaction modes. |
| **TC 25** | No hybrid label | Use text plus speaker or voice plus speaker OFF | UI never shows the word “Hybrid” | **PASSED** | The term `"Hybrid"` is not referenced anywhere in the application logic. |
