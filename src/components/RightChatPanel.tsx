"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    X,
    Send,
    MessageSquare,

    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Pause,
    Play,
    Minimize2,
    Maximize2,
    MousePointer2,
    Paperclip,
    Plus,
    Clock,
    History,
    Sidebar as SidebarIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useChat } from "@/context/ChatContext";
import { fetchAllCorporates } from "@/lib/db";
import { Corporate } from "@/lib/types";
import { speakText, stopSpeech } from "@/lib/google-tts";
import clsx from "clsx";

interface Message {
    id: string;
    text: string;
    sender: "user" | "assistant";
    timestamp: string;
    actions?: { label: string; value: string }[];
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    timestamp: string;
}

export default function RightChatPanel() {
    const router = useRouter();
    const {
        isOpen,
        closeChat,
        width,
        updateWidth,
        externalMessage,
        clearExternalMessage,
        isMuted,
        setIsMuted,
        isWorkflowPaused,
        setIsWorkflowPaused,
        isWorkflowActive,
        isFloating,
        setIsFloating,
        isExpanded,
        setIsExpanded,
        setSubmittedClaimId,
        submittedClaimId
    } = useChat();
    const [history, setHistory] = useState<ChatSession[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isVoiceMode, setIsVoiceMode] = useState(false); // Persistent voice mode
    const [pendingContext, setPendingContext] = useState<string | null>(null); // NEW: Track conversational state
    const [CloeyStep, setCloeyStep] = useState<number>(0); // NEW: Track Cloey Storyboard progress

    // Dragging State
    const [position, setPosition] = useState({ x: 0, y: 0 }); // Controlled by layout effect
    const [hasInitializedPosition, setHasInitializedPosition] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const dragOffsetRef = useRef({ x: 0, y: 0 });

    // Initialize position to bottom right once on mount or first float
    useEffect(() => {
        if (typeof window !== "undefined" && !hasInitializedPosition) {
            setPosition({
                x: window.innerWidth - 350,
                y: window.innerHeight - 520
            });
            setHasInitializedPosition(true);
        }
    }, [hasInitializedPosition]);

    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const transcriptRef = useRef("");
    const isVoiceModeRef = useRef(false); // Using ref for immediate sync in callbacks
    const isSpeakingRef = useRef(false);
    const isListeningRef = useRef(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const isResizingRef = useRef(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isInterruptedRef = useRef(false);
    const activeMessageTextRef = useRef<string | null>(null);
    const [guideTargetRect, setGuideTargetRect] = useState<{ top: number, left: number, width: number, height: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync refs for async callbacks
    useEffect(() => {
        isSpeakingRef.current = isSpeaking;
    }, [isSpeaking]);

    useEffect(() => {
        isListeningRef.current = isListening;
    }, [isListening]);

    // Helper to check and request microphone permissions
    const checkMicrophonePermission = async (): Promise<boolean> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error: any) {
            console.error("Microphone permission error:", error);
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                alert("🎤 Microphone access denied. Please enable microphone permissions in your browser settings.");
            } else if (error.name === 'NotFoundError') {
                alert("🎤 No microphone found. Please connect a microphone.");
            } else {
                alert("🎤 Could not access microphone. Please check your browser settings.");
            }
            return false;
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;

                recognitionRef.current.onresult = (event: any) => {
                    let fullTranscript = "";
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        fullTranscript += event.results[i][0].transcript;
                    }

                    // For continuous mode, we want to accumulate the entire session's text
                    // or just the current segment. Let's use the full results array for accuracy.
                    const currentFullTranscript = Array.from(event.results)
                        .map((result: any) => result[0].transcript)
                        .join("");

                    transcriptRef.current = currentFullTranscript;
                    setInputValue(currentFullTranscript);

                    // --- SILENCE DETECTION DEBOUNCE ---
                    if (silenceTimerRef.current) {
                        clearTimeout(silenceTimerRef.current);
                    }

                    if (currentFullTranscript.trim()) {
                        silenceTimerRef.current = setTimeout(() => {
                            if (transcriptRef.current.trim()) {
                                handleSend(transcriptRef.current);
                                transcriptRef.current = "";
                                recognitionRef.current?.stop();
                            }
                        }, 4000); // 4 seconds gap
                    }
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                    isListeningRef.current = false;
                    // If silenceTimerRef.current is still set, it means we stopped before the 2.5s timer fired
                    // (e.g. manual stop or system timeout). In this case, we should send the transcript.
                    if (silenceTimerRef.current) {
                        clearTimeout(silenceTimerRef.current);
                        silenceTimerRef.current = null;
                        if (transcriptRef.current.trim()) {
                            handleSend(transcriptRef.current);
                            transcriptRef.current = "";
                        }
                    }
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error("Speech recognition error:", event.error);

                    // Provide user feedback based on error type
                    let shouldStopVoiceMode = false;
                    switch (event.error) {
                        case 'not-allowed':
                        case 'service-not-allowed':
                            alert("🎤 Microphone access denied. Please enable permissions.");
                            shouldStopVoiceMode = true;
                            break;
                        case 'no-speech':
                            // Silently handle no speech, just stop listening state but keep voice mode active
                            console.log("No speech detected.");
                            break;
                        case 'audio-capture':
                            alert("🎤 Microphone not available. Please check your device.");
                            shouldStopVoiceMode = true;
                            break;
                        case 'network':
                            console.log("🌐 Network error in recognition.");
                            break;
                        case 'aborted':
                            console.log("Recognition aborted (likely manual stop or state switch).");
                            break;
                        default:
                            console.log("Recognition stopped due to error:", event.error);
                    }

                    if (silenceTimerRef.current) {
                        clearTimeout(silenceTimerRef.current);
                        silenceTimerRef.current = null;
                    }

                    setIsListening(false);
                    isListeningRef.current = false;
                    if (shouldStopVoiceMode) {
                        setIsVoiceMode(false);
                        isVoiceModeRef.current = false;
                    }
                };
            }
        }
    }, []);

    const toggleListening = async () => {
        if (isListening || isVoiceMode) {
            recognitionRef.current?.stop();
            setIsListening(false);
            isListeningRef.current = false;
            setIsVoiceMode(false);
            isVoiceModeRef.current = false;
            stopSpeech();
        } else {
            // Check permission first
            const hasPermission = await checkMicrophonePermission();
            if (!hasPermission) return;

            try {
                // Ensure we're not already running by stopping first
                try {
                    recognitionRef.current?.stop();
                } catch (e) {
                    // Ignore stop errors
                }

                // Small delay to ensure cleanup
                setTimeout(() => {
                    try {
                        transcriptRef.current = "";
                        setInputValue("");
                        recognitionRef.current?.start();
                        setIsListening(true);
                        isListeningRef.current = true;
                        setIsVoiceMode(true);
                        isVoiceModeRef.current = true;
                    } catch (err: any) {
                        console.error("Failed to start speech recognition:", err);
                        if (!err.message?.includes('already started')) {
                            alert("Failed to start voice input. Please try again.");
                        } else {
                            // If already started, just update UI
                            setIsListening(true);
                            isListeningRef.current = true;
                            setIsVoiceMode(true);
                            isVoiceModeRef.current = true;
                        }
                    }
                }, 100);
            } catch (err) {
                console.error("Setup failed:", err);
            }
        }
    };

    const [messages, setMessages] = useState<Message[]>([]);

    const speakWithIndicator = async (text: string) => {
        try {
            // Stop listening before speaking to prevent state conflicts
            if (isListeningRef.current) {
                recognitionRef.current?.stop();
                setIsListening(false);
                isListeningRef.current = false;
            }

            setIsSpeaking(true);
            isSpeakingRef.current = true;
            await speakText(text);
        } finally {
            setIsSpeaking(false);
            isSpeakingRef.current = false;
        }
    };

    // Effect to handle unmuting while a message is being typed
    useEffect(() => {
        if (!isMuted && activeMessageTextRef.current && isTyping && !isSpeaking) {
            speakWithIndicator(activeMessageTextRef.current);
        }
    }, [isMuted, isTyping, isSpeaking]);



    const streamMessage = async (text: string, sender: "assistant" | "user", actions?: { label: string; value: string }[]) => {
        isInterruptedRef.current = false;
        const id = Date.now().toString();
        const baseMsg: Message = {
            id,
            text: "",
            sender,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, baseMsg]);

        const words = text.split(" ");
        let currentText = "";
        activeMessageTextRef.current = text;
        const speechPromise = speakWithIndicator(text);

        for (let i = 0; i < words.length; i++) {
            if (isInterruptedRef.current) return;

            currentText += (i === 0 ? "" : " ") + words[i];
            setMessages(prev => prev.map(m => m.id === id ? { ...m, text: currentText } : m));
            await new Promise(resolve => setTimeout(resolve, 150));
        }

        if (actions && !isInterruptedRef.current) {
            setMessages(prev => prev.map(m => m.id === id ? { ...m, actions } : m));
        }

        await speechPromise;
        activeMessageTextRef.current = null;

        // Auto-reactivate mic if voice mode is active and not interrupted
        // Removed !isMuted check so voice input works even if assistant is quiet
        if (isVoiceModeRef.current && !isInterruptedRef.current) {
            setTimeout(() => {
                try {
                    // Prevent multiple starts - using refs to avoid stale state
                    if (isListeningRef.current || isSpeakingRef.current) return;

                    transcriptRef.current = "";
                    setInputValue("");
                    recognitionRef.current?.start();
                    setIsListening(true);
                    isListeningRef.current = true;
                } catch (err: any) {
                    console.error("Auto-mic start failed:", err);
                    // Only retry if it's not a permission issue and was previously active
                    const isPermissionError = err.message?.includes('not-allowed') || err.name === 'NotAllowedError';
                    if (isVoiceModeRef.current && !isPermissionError) {
                        setTimeout(() => {
                            try {
                                if (!isListeningRef.current && !isSpeakingRef.current) {
                                    recognitionRef.current?.start();
                                    setIsListening(true);
                                    isListeningRef.current = true;
                                }
                            } catch (e) {
                                console.log("Retry also failed, keeping voice mode but mic inactive");
                                // We don't force disable voice mode here to keep the UI state
                            }
                        }, 1500);
                    }
                }
            }, 1000); // Increased delay to 1000ms to allow audio device to fully release
        }
    };

    const triggerGreeting = async () => {
        isInterruptedRef.current = false;
        const secondMsg = "What would you like to do today? I can help you to onboard a new company or file a claim or onboard a new policy provider.";
        const thirdMsg = "You can talk to or you can type text here.";

        const timer = setTimeout(async () => {
            if (!isInterruptedRef.current) {
                await streamMessage(secondMsg, "assistant");
            }
            if (!isInterruptedRef.current) {
                await streamMessage(thirdMsg, "assistant");
            }
        }, 1000);
        return () => clearTimeout(timer);
    };

    // Handle Entry Logic (Popup vs Top Bar)
    useEffect(() => {
        if (isOpen) {
            isInterruptedRef.current = false;

            const secondMsg = "What would you like to do today? I can help you to onboard a new company or file a claim or onboard a new policy provider.";
            const thirdMsg = "You can talk to or you can type text here.";

            // CASE A: Opened via Top Bar (or any direct external trigger)
            if (externalMessage) {
                const timer = setTimeout(async () => {
                    const isStandardGreeting = externalMessage.toLowerCase().includes("hi, i’m Cloey") ||
                        externalMessage.toLowerCase().includes("hi, i'm Cloey") ||
                        externalMessage.toLowerCase().includes("hi, i’m max") ||
                        externalMessage.toLowerCase().includes("hi, i'm max");
                    const isIntroQuestion = externalMessage.includes("What would you like to do today?");

                    // ONLY clear if it's a new session/greeting from the header
                    if (isStandardGreeting || isIntroQuestion) {
                        setMessages([]); // Reset chat for fresh start
                    }

                    // If opened via Popup (Question), insert the implied first greeting
                    if (isIntroQuestion) {
                        const hiddenGreeting: Message = {
                            id: "0",
                            text: "Hi, I'm **Cloey**. Your Assistant. Ask me anything",
                            sender: "assistant",
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                        setMessages([hiddenGreeting]);
                        // Small delay to ensure order
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }

                    // 1st Visible Streamed Message (or silent insertion)
                    const isSilent = externalMessage.startsWith("SILENT:");
                    const actualMessage = isSilent ? externalMessage.slice(7) : externalMessage;

                    if (isSilent) {
                        const id = Date.now().toString();
                        setMessages(prev => [...prev, {
                            id,
                            text: "",
                            sender: "assistant",
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }]);
                        const words = actualMessage.split(" ");
                        let currentText = "";
                        for (let i = 0; i < words.length; i++) {
                            currentText += (i === 0 ? "" : " ") + words[i];
                            setMessages(prev => prev.map(m => m.id === id ? { ...m, text: currentText } : m));
                            await new Promise(resolve => setTimeout(resolve, 80));
                        }
                    } else {
                        await streamMessage(actualMessage, "assistant");
                    }

                    if (isStandardGreeting) {
                        if (!isInterruptedRef.current) await streamMessage(secondMsg, "assistant");
                        if (!isInterruptedRef.current) await streamMessage(thirdMsg, "assistant");
                    } else if (isIntroQuestion) {
                        if (!isInterruptedRef.current) await streamMessage(thirdMsg, "assistant");
                    }

                    clearExternalMessage();
                }, 500);
                return () => clearTimeout(timer);
            }
            // CASE B: Opened Fresh (no external message)
            else if (messages.length === 0) {
                const initialGreeting: Message = {
                    id: "1",
                    text: "Hi, I'm **Cloey**. Your Assistant. Ask me anything",
                    sender: "assistant",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages([initialGreeting]);
                triggerGreeting();
            }
        }
    }, [externalMessage, isOpen, clearExternalMessage]);


    // Fix Hydration mismatch for time
    useEffect(() => {
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === "1" && !msg.timestamp
                    ? {
                        ...msg,
                        timestamp: new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                    }
                    : msg,
            ),
        );
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const resetChat = () => {
        isInterruptedRef.current = true;
        stopSpeech();
        setMessages([
            {
                id: "1",
                text: "Hi, I'm **Cloey**. Your Assistant. Ask me anything",
                sender: "assistant",
                timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            },
        ]);
        setCloeyStep(0);
        setPendingContext(null);
        setInputValue("");
        setIsTyping(false);

        // Trigger the vocal greeting sequence
        triggerGreeting();
    };

    const createNewSession = () => {
        // Only save if user has sent messages
        const userMsgs = messages.filter(m => m.sender === "user");
        if (userMsgs.length > 0) {
            const firstMsgText = userMsgs[0].text;
            const title = firstMsgText.length > 30 ? firstMsgText.substring(0, 30) + "..." : firstMsgText;

            // Capture the current messages in a local variable to be safe
            const currentMessages = [...messages];

            setHistory(prev => [{
                id: Date.now().toString(),
                title: title,
                messages: currentMessages,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }, ...prev]);
        }
        resetChat();
    };

    const clearAllHistory = () => {
        setHistory([]);
        resetChat();
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizingRef.current) return;
            const newWidth = window.innerWidth - e.clientX;
            updateWidth(newWidth);
        },
        [updateWidth],
    );

    const stopResizing = useCallback(() => {
        isResizingRef.current = false;
        setIsResizing(false);
        document.body.style.cursor = "default";
        document.body.style.userSelect = "auto";
    }, []);

    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizingRef.current = true;
        setIsResizing(true);
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    }, []);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", stopResizing);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", stopResizing);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing, handleMouseMove, stopResizing]);

    // Dragging Logic for Floating Mode
    const handleDragStart = (e: React.MouseEvent) => {
        if (!isFloating) return;
        setIsDragging(true);
        dragOffsetRef.current = {
            x: e.clientX - (window.innerWidth - position.x - (isFloating ? 350 : width)),
            y: e.clientY - position.y
        };
        // We actually want simpler logic for position from top-right
        const rect = e.currentTarget.getBoundingClientRect();
        dragOffsetRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    useEffect(() => {
        const handleDragMove = (e: MouseEvent) => {
            if (!isDragging || !isFloating) return;

            const newX = window.innerWidth - (e.clientX - dragOffsetRef.current.x) - (isFloating ? 380 : width);
            const newY = e.clientY - dragOffsetRef.current.y;

            // Simpler: Just track from left/top and convert to styles
            setPosition({
                x: e.clientX - dragOffsetRef.current.x,
                y: e.clientY - dragOffsetRef.current.y
            });
        };

        const handleDragEnd = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener("mousemove", handleDragMove);
            window.addEventListener("mouseup", handleDragEnd);
        }
        return () => {
            window.removeEventListener("mousemove", handleDragMove);
            window.removeEventListener("mouseup", handleDragEnd);
        };
    }, [isDragging, isFloating, width]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Visual confirmation of file upload in chat
        const userMsg: Message = {
            id: Date.now().toString(),
            text: `[ATTACH] Attached file: **${file.name}**`,
            sender: "user",
            timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
        setMessages((prev) => [...prev, userMsg]);

        // If we are in the Cloey storyboard flow waiting for a bill (Scene 4)
        if (CloeyStep === 3) {
            handleSend("Uploaded bill"); // Trigger next step in Cloey flow via send logic
        } else {
            setIsTyping(true);
            setTimeout(async () => {
                setIsTyping(false);
                await streamMessage(`I've received your document: **${file.name}**. How would you like me to process this?`, "assistant");
            }, 1000);
        }

        // Reset input so the same file can be selected again
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSend = async (overrideValue?: string) => {
        // Stop current listening for processing
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
        try {
            recognitionRef.current?.stop();
        } catch (e) {
            // Ignore stop errors
        }
        setIsListening(false);
        isListeningRef.current = false;

        stopSpeech();
        isInterruptedRef.current = true; // Stop any ongoing stream

        const textToSend = overrideValue || inputValue;
        if (!textToSend.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: textToSend,
            sender: "user",
            timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        // Simulate AI Thinking & Data Fetching
        setTimeout(async () => {
            isInterruptedRef.current = false; // Reset to allow the new response to stream
            const corporates = await fetchAllCorporates();
            const query = textToSend.toLowerCase().trim();

            // --- STORYBOARD: Cloey CLAIM FLOW ---
            const claimTriggers = [
                "i want to file a claim",
                "i want to report a claim",
                "i want to submit a claim",
                "i want to file a new claim, can you help me wiht that..",
                "i want to claim a file",
                "i want to claim",
                "claim"
            ];
            if (query.includes("claim") || query.includes("can you help me wiht that")) {
                setCloeyStep(1);
                setIsTyping(false);
                await streamMessage("Of course \u2014 I can help with that. I found your account under **Jon Mercer**, ID **2026AB**. Should I use this account to continue?", "assistant");
                return;
            }

            if (CloeyStep === 1) { // Scene 2 -> Scene 3
                if (query.includes("yes") || query.includes("yep") || query.includes("sure")) {
                    setCloeyStep(2);
                    setIsTyping(false);
                    setIsTyping(true);
                    await new Promise(r => setTimeout(r, 1000));
                    setIsTyping(false);
                    await streamMessage("Got it. I can see you have 3 active policies: **Health**, **Travel** and **Auto**. Which policy is this for?", "assistant");
                    return;
                }
            }

            if (CloeyStep === 2) { // Scene 3 -> Scene 4
                if (query.includes("health")) {
                    setCloeyStep(3);
                    setIsTyping(false);
                    await streamMessage("Please Upload your bill \u2014 I\u2019ll handle the rest.", "assistant");
                    return;
                }
            }

            if (CloeyStep === 3) { // Scene 4 -> Scene 5
                setCloeyStep(4);
                setIsTyping(true);
                await new Promise(r => setTimeout(r, 1500));
                setIsTyping(false);
                await streamMessage("I can see your uploaded bill. Here\u2019s what I found from your bill: \n\n**Expense type**: Dental treatment. \n**Clinic Name**: Bright Clove \n**Date of Expense**: March 10, 2026 \n**Total Expense amount**: $190 total. \n\nIs this correct information?", "assistant");
                return;
            }

            if (CloeyStep === 4) { // Scene 5 -> Scene 6/7/8
                if (query.includes("yes") || query.includes("yep") || query.includes("correct") || query.includes("it is")) {
                    setCloeyStep(5);
                    setIsTyping(true);
                    await new Promise(r => setTimeout(r, 800));
                    setIsTyping(false);
                    await streamMessage("I matched your policy. You\u2019re covered under **Silver Plan**. Your dental limit is **$200**. This claim is **fully eligible**.", "assistant");
                    await new Promise(r => setTimeout(r, 800));
                    await streamMessage("Can I submit this expense now?", "assistant");
                    return;
                }
            }

            if (CloeyStep === 5) { // Scene 8 -> Scene 9/10
                if (query.includes("yes") || query.includes("yep") || query.includes("do it") || query.includes("submit")) {
                    setCloeyStep(0);
                    setIsTyping(true);
                    await new Promise(r => setTimeout(r, 500));
                    setIsTyping(false);
                    setSubmittedClaimId("CLM-10234");
                    router.push("/claims");
                    
                    // Clear any typing state before starting the final sequence
                    setIsTyping(false);
                    
                    // 1. Submit Confirmation
                    await streamMessage("Claim Submitted. Your **Claim ID: CLM-10234**. I\u2019ll track it for you and send you notification as there is any update.", "assistant");
                    
                    // 2. Small Pause
                    await new Promise(r => setTimeout(r, 1500));
                    
                    // 3. Email Update
                    await streamMessage("I\u2019ve sent a confirmation to **john.m@gmail.com**.", "assistant");
                    return;
                }
            }

            // --- CONTEXTUAL INTENT RESOLUTION ---
            if (pendingContext === "onboarding_sample_prompt") {
                const positiveResponses = ["yes", "sure", "ok", "yep", "do it", "use sample", "sample data"];
                const negativeResponses = ["no", "never mind", "skip", "real", "real customer"];

                if (positiveResponses.some(r => query.includes(r))) {
                    setPendingContext(null);
                    localStorage.setItem("max_guide_step", "add_customer");
                    router.push("/corporate-customers");
                    return;
                } else if (negativeResponses.some(r => query.includes(r))) {
                    setPendingContext(null);
                    if (query.includes("real")) {
                        await streamMessage("Alright, let's set up a real customer. Navigate to the Corporate Customers page and click 'Add New Customer'.", "assistant");
                        return;
                    }
                }
            } else if (pendingContext === "claim_sample_prompt") {
                const positiveResponses = ["yes", "sure", "ok", "yep", "do it", "use sample", "sample data", "sample_claim"];
                const negativeResponses = ["no", "never mind", "skip", "real", "real customer", "real_claim"];

                if (positiveResponses.some(r => query.includes(r))) {
                    setPendingContext(null);
                    localStorage.setItem("max_guide_step", "claim_insurance");
                    router.push("/claims");
                    return;
                } else if (negativeResponses.some(r => query.includes(r))) {
                    setPendingContext(null);
                    if (query.includes("real")) {
                        router.push("/claims");
                        return;
                    }
                }
            }
            // Clear context if user says something unrelated
            setPendingContext(null);

            let responseText = "";

            if (query === "hi" || query === "hello") {
                setIsTyping(false);
                await streamMessage("Hi I am Cloey, I am here to assist you.", "assistant");
                return;
            }

            if (query.includes("thanks") || query.includes("thank you")) {
                setIsTyping(false);
                await streamMessage("You are welcome. Please Let me know if you need anything else !", "assistant");
                return;
            }

            // --- KNOWLEDGE BASE LOGIC (Analyzing Project Workflows) ---
            const isOnboardingQuery =
                query.includes("onboard") ||
                ((query.includes("add") || query.includes("create") || query.includes("how to") || query.includes("new")) && (query.includes("customer") || query.includes("corporate") || query.includes("organization")));

            const isClaimQuery =
                query.includes("claim") &&
                (query.includes("how to") || query.includes("insurance") || query.includes("policy") || query.includes("medical"));

            if (isClaimQuery) {
                if (isInterruptedRef.current) return;
                setIsTyping(false);
                const introText = "Got it. You want to know how to claim insurance.";
                await streamMessage(introText, "assistant");

                setIsTyping(true);
                await new Promise((resolve) => setTimeout(resolve, 1000));
                setIsTyping(false);

                const followUpText = "Would you like to do a sample claim first?";
                setPendingContext("claim_sample_prompt"); // Set context for claim
                await streamMessage(followUpText, "assistant", [
                    { label: "Use Sample Data", value: "sample_claim" },
                    { label: "Use Real Customer", value: "real_claim" },
                ]);
                return;
            }

            if (isOnboardingQuery) {
                if (isInterruptedRef.current) return;
                setIsTyping(false);
                const introText = "Got it. You want to know how to create a new customer or organization.";
                await streamMessage(introText, "assistant");

                // Visual pause before follow-up typing animation
                setIsTyping(true);
                await new Promise((resolve) => setTimeout(resolve, 1000));
                setIsTyping(false);

                const followUpText = "Would you like to do a sample onboarding first?";
                setPendingContext("onboarding_sample_prompt"); // Set the context for the next turn
                await streamMessage(followUpText, "assistant", [
                    { label: "Use Sample Data", value: "sample" },
                    { label: "Use Real Customer", value: "real" },
                ]);
                return;
            }

            if (
                query.includes("how to") ||
                query.includes("steps") ||
                query.includes("guide") ||
                query.includes("add")
            ) {
                if (query.includes("member")) {
                    responseText =
                        "To add a **New Member**, follow these steps:\n\n" +
                        "1. Go to the **Corporate Customers** section from the sidebar.\n" +
                        "2. Select the specific company you want to add members to.\n" +
                        "3. Navigate to the **Tiers/Plans** section of that corporate profile.\n" +
                        "4. Click on **Manage Members** or **Upload Roster** (CSV) within the specific plan tier.";
                } else if (query.includes("corporate") || query.includes("customer")) {
                    responseText =
                        "To add a **New Corporate Customer**:\n\n" +
                        "1. Navigate to the **Corporate Customers** page.\n" +
                        "2. Click the white **'Add New Customer'** button in the top right header (navy background).\n" +
                        "3. Fill in the organization name and advisor details to get started.";
                } else if (query.includes("advisor") || query.includes("broker")) {
                    responseText =
                        "To manage **Advisors**, use the **Advisors** link in the sidebar to view your registered brokers and their associated corporate clients.";
                } else {
                    responseText =
                        "I can help with that! Are you looking to add a member, a corporate customer, or manage settings? Just ask 'How do I add a member?' for a full guide.";
                }
            }
            // --- DATA RETRIEVAL LOGIC ---
            else if (
                query.includes("corporates") ||
                query.includes("customers") ||
                query.includes("list")
            ) {
                if (corporates.length > 0) {
                    responseText =
                        `I found **${corporates.length}** corporate customers in the system: \n\n` +
                        corporates
                            .slice(0, 5)
                            .map((c) => `• **${c.name}** (${c.broker || "No Advisor"})`)
                            .join("\n") +
                        (corporates.length > 5
                            ? `\n...and ${corporates.length - 5} more.`
                            : "");
                } else {
                    responseText =
                        "I couldn't find any corporate customers in the database right now.";
                }
            } else if (query.includes("count") || query.includes("how many")) {
                responseText = `There are currently **${corporates.length}** corporate customers registered in your dashboard.`;
            } else {
                // Try searching for a specific corporate name
                const found = corporates.find((c) =>
                    c.name && query.includes(c.name.toLowerCase()),
                );
                if (found) {
                    responseText =
                        `Here is the info for **${found.name}**:\n\n` +
                        `• **Advisor**: ${found.broker || "Not assigned"}\n` +
                        `• **Email**: ${found.contactEmail || "N/A"}\n` +
                        `• **Status**: ${found.corporateInfoCompleted ? "Profile Completed" : "In Progress"}`;
                } else {
                    responseText =
                        "I'm here to assist! I can help you find corporate data (for example, 'List customers') or guide you through workflows (like, 'How to add a new member').";
                }
            }

            if (responseText) {
                setIsTyping(false);
                await streamMessage(responseText, "assistant");
            } else if (!query.includes("onboard") && !query.includes("onboarding")) {
                // Fallback if no responseText set and not handled by special blocks
                setIsTyping(false);
            }
        }, 2000);
    };

    return (
        <div
            className={clsx(
                "fixed bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 z-[9999] flex flex-col border-2 transition-all duration-300 ease-in-out",
                // Dynamic Border Colors
                isSpeaking ? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]" :
                    isListening ? "border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]" :
                        "border-gray-200 shadow-[-4px_0_20px_rgba(0,0,0,0.1)]",

                isFloating ? "rounded-2xl overflow-hidden h-[480px] max-h-[85vh]" : (isExpanded ? "top-0 left-0 w-full h-full border-l border-slate-200" : "top-0 right-0 h-full border-l border-y-0 border-r-0"),
                isOpen ? (isExpanded ? "translate-x-0" : (isFloating ? "opacity-100 scale-100" : "translate-x-0")) : (isFloating ? "opacity-0 scale-95 pointer-events-none" : "translate-x-full overflow-hidden w-0"),
                isExpanded && "z-[100000]",
                isDragging && "transition-none"
            )}
            style={{
                width: isOpen ? (isExpanded ? "calc(100vw - 260px)" : (isFloating ? "350px" : `${width}px`)) : "0px",
                right: isFloating ? "auto" : "0",
                left: isFloating ? (isExpanded ? "260px" : `${position.x}px`) : (isExpanded ? "260px" : "auto"),
                top: isFloating ? (isExpanded ? "0" : `${position.y}px`) : "0",
                transition: (isResizing || isDragging)
                    ? "none"
                    : "width 300ms cubic-bezier(0.16, 1, 0.3, 1), transform 300ms ease-in-out, left 300ms ease-in-out, top 300ms ease-in-out, border-color 300ms, box-shadow 300ms",
            }}>

            {/* Resize Handle - Only in Sidebar Mode */}
            {!isFloating && (
                <div
                    onMouseDown={startResizing}
                    className={clsx(
                        "absolute left-0 top-0 h-full w-1 cursor-col-resize z-[10000] transition-colors",
                        isResizing ? "bg-[#1e3a5f]" : "hover:bg-[#1e3a5f]/30",
                    )}
                    title='Drag to resize'>
                    <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-6 bg-gray-200 rounded-full' />
                </div>
            )}

            {/* Header */}
            <div
                onMouseDown={handleDragStart}
                className={clsx(
                    'flex items-center justify-between h-20 px-8 bg-white/70 backdrop-blur-md border-b border-slate-200/60',
                    isFloating ? 'cursor-move select-none' : ''
                )}>
                <div className='flex items-center gap-3'>
                    <div className='relative'>
                        <div className={clsx(
                            'w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white shadow-md relative z-10 transition-all duration-500 border-2 border-green-500',
                            isSpeaking ? 'ring-2 ring-green-500 ring-offset-2' :
                                isListening ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
                        )}>
                            <img
                                alt='Voice Assistant'
                                src='https://cdnstaticfiles.blob.core.windows.net/img/1770617819808_cloye-agent-face.jpg'
                                className='w-full h-full rounded-full object-cover object-top'
                            />
                        </div>
                        {isSpeaking && (
                            <>
                                <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30" />
                                <div className="absolute inset-[-4px] rounded-full bg-green-400 animate-ping opacity-20" style={{ animationDelay: '0.4s' }} />
                                <div className="absolute inset-[-8px] rounded-full border-2 border-green-300 animate-pulse opacity-10" />
                            </>
                        )}
                        {isListening && (
                            <>
                                <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-30" />
                                <div className="absolute inset-[-4px] rounded-full bg-yellow-300 animate-ping opacity-20" style={{ animationDelay: '0.4s' }} />
                                <div className="absolute inset-[-8px] rounded-full border-2 border-yellow-200 animate-pulse opacity-10" />
                            </>
                        )}
                    </div>
                    <div>
                        <h3 className='text-[#1e3a5f] font-bold text-sm tracking-tight'>
                            Cloey
                        </h3>

                        {(isSpeaking || isListening) && (
                            <p className='text-gray-500 text-[10px] flex items-center gap-2 font-semibold'>
                                <span className='relative flex h-2 w-2'>
                                    {isSpeaking && (
                                        <>
                                            <span className='absolute inset-[-2px] inline-flex h-full w-full rounded-full bg-green-400 animate-ping opacity-75' />
                                            <span className='absolute inset-[-4px] inline-flex h-full w-full rounded-full bg-green-300 animate-pulse opacity-40' />
                                        </>
                                    )}
                                    {isListening && (
                                        <>
                                            <span className='absolute inset-[-2px] inline-flex h-full w-full rounded-full bg-yellow-400 animate-ping opacity-75' />
                                            <span className='absolute inset-[-4px] inline-flex h-full w-full rounded-full bg-yellow-300 animate-pulse opacity-40' />
                                        </>
                                    )}
                                    <span className={clsx(
                                        'relative inline-flex rounded-full h-2 w-2 transition-colors duration-300',
                                        isListening ? 'bg-yellow-400' : 'bg-green-500'
                                    )} />
                                </span>
                                {isSpeaking ? "Speaking..." : "Listening..."}
                            </p>
                        )}
                    </div>
                </div>
                <div className='flex items-center gap-1'>
                    {isWorkflowActive && (
                        <button
                            onClick={() => {
                                const nextPausedState = !isWorkflowPaused;
                                setIsWorkflowPaused(nextPausedState);
                                if (nextPausedState) {
                                    stopSpeech();
                                }
                            }}
                            className='p-2 rounded-full transition-all text-gray-400 hover:bg-gray-50'
                            title={isWorkflowPaused ? "Resume Workflow" : "Stop Workflow"}
                        >
                            {isWorkflowPaused ? <Play size={20} /> : <Pause size={20} />}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setIsMuted(!isMuted);
                        }}
                        className={clsx(
                            'p-2 rounded-full transition-all',
                            isMuted ? 'text-gray-400 bg-gray-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                        )}
                        title={isMuted ? "Unmute Speaker" : "Mute Speaker"}
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <button
                        onClick={() => {
                            if (isFloating) setIsFloating(false);
                            setIsExpanded(!isExpanded);
                        }}
                        className={clsx(
                            'p-2 rounded-full transition-all text-gray-400 hover:text-[#1e3a5f] hover:bg-gray-100',
                            isExpanded && 'bg-blue-50 text-blue-600'
                        )}
                        title={isExpanded ? "Exit Full Screen" : "Full Screen Mode (History)"}
                    >
                        {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                    <button
                        onClick={() => {
                            isInterruptedRef.current = true;
                            stopSpeech();
                            closeChat();
                        }}
                        className='text-gray-400 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-full'>
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Main Chat Content Area */}
            <div className='flex-1 flex overflow-hidden'>
                {/* ChatGPT Style History Sidebar */}
                {isExpanded && (
                    <div className='w-[260px] bg-slate-900 h-full flex flex-col border-r border-slate-800 animate-slide-in-right'>
                        <div className='p-4'>
                            <button
                                onClick={createNewSession}
                                className='w-full flex items-center justify-between px-3 py-2 border border-slate-700 hover:bg-slate-800 rounded-lg text-slate-300 text-xs font-bold transition-all transition-all duration-300 group'>
                                <span className='flex items-center gap-2'>
                                    <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                                    New Chat session
                                </span>
                                <span className='text-[10px] text-slate-500 border border-slate-700 px-1.5 rounded'>⌘K</span>
                            </button>
                        </div>

                        <div className='flex-1 overflow-y-auto px-2 space-y-4 py-2 custom-scrollbar'>
                            <div>
                                <p className='px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3'>Recent History</p>
                                <div className='space-y-0.5 px-2 overflow-y-auto max-h-[calc(100vh-250px)]'>
                                    {history.length > 0 ? (
                                        history.map((session) => (
                                            <button
                                                key={session.id}
                                                onClick={() => {
                                                    setMessages(session.messages);
                                                }}
                                                className="w-full text-left px-4 py-2.5 rounded-lg text-[11px] font-bold flex flex-col gap-0.5 group transition-all text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent hover:border-slate-700 hover:shadow-lg"
                                            >
                                                <span className="truncate w-full block">{session.title}</span>
                                                <span className="text-[8px] text-slate-600 group-hover:text-slate-500 flex items-center gap-1">
                                                    <Clock size={8} /> {session.timestamp}
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2">
                                            <p className="text-[10px] text-slate-600 italic">No recent conversations</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className='p-4 border-t border-slate-800'>
                            <button
                                onClick={clearAllHistory}
                                className='w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-red-900/40 hover:text-red-300 text-xs font-bold transition-all border border-transparent hover:border-red-900/50'>
                                <History size={16} />
                                Clear Conversations
                            </button>
                        </div>
                    </div>
                )}

                {/* Chat Messages Area */}
                <div className='flex-1 flex flex-col min-w-0 bg-white'>
                    <div className='flex-1 overflow-y-auto p-4 pb-6 space-y-2.5 custom-scrollbar'>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={clsx(
                                    "flex flex-col gap-0.5",
                                    msg.sender === "user"
                                        ? "items-end ml-auto max-w-[85%]"
                                        : "max-w-[85%]",
                                )}>
                                <div
                                    className={clsx(
                                        "py-2 px-3.5 rounded-xl shadow-sm text-[13.5px] leading-snug border whitespace-pre-wrap font-medium",
                                        msg.sender === "user"
                                            ? "bg-[#1e3a5f] text-white border-[#1e3a5f]/10 rounded-tr-none shadow-lg"
                                            : "bg-white text-slate-700 border-slate-200 rounded-tl-none shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
                                    )}>
                                    {msg.text
                                        .split("[ATTACH]")
                                        .map((attachPart, attachIdx) => (
                                            <React.Fragment key={attachIdx}>
                                                {attachIdx > 0 && (
                                                    <Paperclip className={clsx(
                                                        "w-3.5 h-3.5 mr-1.5 inline-block -translate-y-[1px]",
                                                        msg.sender === "user" ? "text-white" : "text-blue-500"
                                                    )} />
                                                )}
                                                {attachPart
                                                    .split("**")
                                                    .map((part, i) =>
                                                        i % 2 === 1 ? (
                                                            <strong
                                                                key={i}
                                                                className={clsx(
                                                                    "font-extrabold",
                                                                    msg.sender === "user" ? "text-white" : "text-[#1e3a5f]"
                                                                )}
                                                            >
                                                                {part}
                                                            </strong>
                                                        ) : (
                                                            part.replace(/Cloey/g, "Cloey")
                                                        )
                                                    )}
                                            </React.Fragment>
                                        ))}

                                    {/* Action Buttons */}
                                    {msg.actions && (
                                        <div className='mt-4 flex flex-col gap-2'>
                                            {msg.actions.map((action, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        // Clear pending context immediately
                                                        setPendingContext(null);

                                                        if (action.value === "real") {
                                                            handleSend("Use Real Customer");
                                                        } else if (action.value === "sample") {
                                                            // Interactive Guide Logic
                                                            const navItem = document.getElementById("nav-item-corporate-customers");
                                                            if (navItem) {
                                                                // 1. Speak & Show Message
                                                                streamMessage("Please select the Corporate Customer tab on the sidebar.", "assistant");

                                                                const rect = navItem.getBoundingClientRect();
                                                                setGuideTargetRect({
                                                                    top: rect.top,
                                                                    left: rect.left,
                                                                    width: rect.width,
                                                                    height: rect.height
                                                                });

                                                                // 2. Wait 4 seconds, Speak next part, then Navigate
                                                                setTimeout(async () => {
                                                                    setGuideTargetRect(null);
                                                                    await streamMessage("Let’s start by creating the company profile.", "assistant");

                                                                    localStorage.setItem("max_guide_step", "add_customer");
                                                                    router.push("/corporate-customers");
                                                                }, 4000);
                                                            } else {
                                                                // Fallback
                                                                localStorage.setItem("max_guide_step", "add_customer");
                                                                router.push("/corporate-customers");
                                                            }
                                                        } else if (action.value === "sample_claim") {
                                                            // Interactive Guide Logic for Claims
                                                            const navItem = document.getElementById("nav-item-claims");
                                                            if (navItem) {
                                                                // 1. Speak & Show Message
                                                                streamMessage("Please select the Claims tab in the sidebar.", "assistant");

                                                                const rect = navItem.getBoundingClientRect();
                                                                setGuideTargetRect({
                                                                    top: rect.top,
                                                                    left: rect.left,
                                                                    width: rect.width,
                                                                    height: rect.height
                                                                });

                                                                // 2. Wait for a moment to show the pointer, then speak next part and navigate
                                                                setTimeout(async () => {
                                                                    setGuideTargetRect(null);
                                                                    await streamMessage("Let's file a sample claim to show you how it works.", "assistant");

                                                                    localStorage.setItem("max_guide_step", "claim_insurance");
                                                                    router.push("/claims");
                                                                }, 4000); // Time to allow for speech and pointer display
                                                            } else {
                                                                // Fallback
                                                                localStorage.setItem("max_guide_step", "claim_insurance");
                                                                router.push("/claims");
                                                            }
                                                        } else if (action.value === "real_claim") {
                                                            router.push("/claims");
                                                        } else if (action.value === "navigate_claims") {
                                                            router.push("/claims");
                                                        } else {
                                                            handleSend(action.label);
                                                        }
                                                    }}
                                                    className='w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11.5px] font-bold text-[#1e3a5f] hover:bg-blue-50 hover:border-blue-300 transition-all text-left flex items-center justify-between group shadow-sm'>
                                                    {action.label}
                                                    <div className='w-5.5 h-5.5 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm'>
                                                        →
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* Metadata removed as per user request */}
                            </div>
                        ))}

                        {isTyping && (
                            <div className='flex flex-col gap-2 max-w-[85%] animate-fade-in'>
                                <div className='bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm inline-flex items-center w-fit'>
                                    <div className='flex space-x-1.5 h-3 items-center'>
                                        <div className='w-2 h-2 bg-[#1e3a5f]/60 rounded-full animate-bounce [animation-delay:-0.3s]' />
                                        <div className='w-2 h-2 bg-[#1e3a5f]/60 rounded-full animate-bounce [animation-delay:-0.15s]' />
                                        <div className='w-2 h-2 bg-[#1e3a5f]/60 rounded-full animate-bounce' />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Section */}
                    <div className='p-4 bg-white/80 backdrop-blur-md border-t border-slate-200/60'>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className='flex items-center gap-2 bg-white rounded-2xl border-2 border-slate-300 p-1.5 focus-within:border-[#1e3a5f] focus-within:ring-2 focus-within:ring-[#1e3a5f]/20 transition-all shadow-sm'>
                            <button
                                type='button'
                                onClick={toggleListening}
                                className={clsx(
                                    "transition-all p-2.5 rounded-xl shadow-sm border",
                                    isVoiceMode
                                        ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100 hover:text-red-600 hover:border-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse hover:animate-none"
                                        : "bg-transparent border-transparent text-gray-500 hover:text-[#1e3a5f] hover:bg-gray-50 hover:border-gray-200"
                                )}
                                title={isVoiceMode ? "Stop voice mode" : "Start voice mode"}>
                                {isVoiceMode ? <X size={20} /> : <Mic size={20} />}
                            </button>
                            <input
                                type='text'
                                placeholder={isListening ? "Listening..." : "Ask Cloey something..."}

                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className='flex-1 min-w-0 bg-transparent text-gray-900 text-[13px] outline-none py-2 px-1 placeholder:text-gray-400 font-medium'
                            />
                            <input
                                type='file'
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                            />
                            <button
                                type='button'
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2.5 rounded-xl transition-all text-gray-500 hover:text-[#1e3a5f] hover:bg-gray-50 hover:border-gray-200"
                                title="Upload bill or document"
                            >
                                <Paperclip size={20} />
                            </button>
                            <button
                                type='submit'
                                disabled={!inputValue.trim() || isTyping}
                                className={clsx(
                                    "p-2.5 rounded-xl transition-all shadow-md",
                                    inputValue.trim() && !isTyping
                                        ? "bg-[#1e3a5f] text-white hover:bg-[#162a45] hover:scale-105 active:scale-100"
                                        : "bg-gray-100 text-gray-300 shadow-none cursor-not-allowed",
                                )}>
                                <Send size={18} />
                            </button>
                        </form>
                    </div></div></div>

            {guideTargetRect && typeof document !== "undefined" && createPortal(
                <div
                    style={{
                        position: "fixed",
                        // Position BELOW the element (top + height)
                        top: guideTargetRect.top + guideTargetRect.height + 10,
                        // Center horizontally
                        left: guideTargetRect.left + guideTargetRect.width / 2,
                        zIndex: 999999,
                        pointerEvents: "none",
                        // Center the div, but minimal vertical offset since we are positioning relative to top
                        transform: "translate(-50%, 0)"
                    }}
                >
                    <div className="relative flex flex-col items-center">
                        {/* Rotate 180 (or appropriate arithmetic) if we want it to point UP?
                            MousePointer2 points Top-Left by default.
                            If we want it to point UP, we need to rotate somewhat.
                            MaxGuidePointer uses rotate-[45deg] to point "inwards/up"?
                            Let's try sticking to the request: "Tip should up".
                            MousePointer2 (10 o'clock) -> Rotate 135deg -> 3 o'clock?
                            Rotate -45 -> 9 o'clock.
                            Rotate -90 -> 7 o'clock.
                            Actually, simpler: Just use rotate-[-45deg] or rotate-[45deg] depending on visual preference.
                            Let's use the explicit request: "tip should up".
                            Default is Top-Left. 
                            rotate(45deg) -> Top.
                            Let's try that.
                         */}
                        <div className="text-red-500 filter drop-shadow-[0_4px_12px_rgba(239,68,68,0.4)] animate-bounce transform rotate-[45deg]">
                            <MousePointer2 className="w-7 h-7 fill-red-500" />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20 scale-125" />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
