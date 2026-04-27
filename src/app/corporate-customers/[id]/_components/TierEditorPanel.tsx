"use client";

import { Tier, Plan } from "@/lib/types";
import { useState, useEffect, useRef } from "react";
import { X, ChevronDown, Edit2, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import { useChat } from "@/context/ChatContext";
import { speakText } from "@/lib/google-tts";
import { MousePointer2 } from "lucide-react";
import { TIER_VOICE_MESSAGES } from "./tier-speech";

// Type definitions for internal mock data
interface Product {
    id: string;
    name: string;
    category: string;
    hasVariants?: boolean;
    variants?: string[];
}

interface SubCategory {
    id: string;
    name: string;
    products: Product[];
}

interface PlanCategory {
    id: string;
    name: string;
    products: Product[];
    subcategories?: SubCategory[];
}

// Global Products Lists
const MENTAL_HEALTH_PRODUCTS: Product[] = [
    { id: "eap3", name: "Max Insurance EAP 3.0", category: "Mental Health" },
    { id: "cw1", name: "Complete Wellness", category: "Mental Health" },
    { id: "dp_core", name: "Dialogue Primary Care", category: "Health" },
    { id: "db_core", name: "Dialogue Basic EAP", category: "Mental Health" },
    { id: "de_core", name: "Dialogue Extended EAP (Mental Health+)", category: "Mental Health" },
    { id: "dm_core", name: "Dialogue Mind & Body (Primary Care + EAP + Mental Health+)", category: "Combined" },
];

const PRIVATE_HEALTH_PRODUCTS: Product[] = [
    { id: "cx1", name: "Complete Executive Care", category: "Health" },
    { id: "myr1", name: "Medcan Year Round Care", category: "Health" },
    { id: "mdc1", name: "Medcan Dedicated Care", category: "Health" },
    { id: "mm1", name: "Medcan Mcare", category: "Health" },
    { id: "lv1", name: "La Vie - Point One Care", category: "Health" },
    { id: "lv2", name: "La Vie - Point One Care + FIT", category: "Health" }
];

const VARIANTS_S_C_F = ["Single", "Couple", "Family"];

const PLAN_CATEGORIES = {
    CORPORATE: [
        {
            id: "cm1",
            name: "Mental Health & Wellbeing",
            products: [
                { id: "eap2", name: "EAP 2.0", category: "Mental Health" },
                { id: "mb1", name: "Mind & Body", category: "Mental Health" },
                ...MENTAL_HEALTH_PRODUCTS
            ]
        },
        {
            id: "cm2", name: "Emergency Travel Protection", products: [
                { id: "tr1", name: "Max Insurance Travel", category: "Travel", hasVariants: true, variants: VARIANTS_S_C_F }
            ]
        }
    ],
    CORE: [
        { id: "cr1", name: "Private Health", products: PRIVATE_HEALTH_PRODUCTS },
        {
            id: "cr2",
            name: "Health & Dental Insurance",
            products: [],
            subcategories: [
                {
                    id: "sub_gateway", name: "Gateway (Flex)", products: [
                        { id: "gb1", name: "Gateway Bronze", category: "Insurance", hasVariants: true, variants: VARIANTS_S_C_F },
                        { id: "gs1", name: "Gateway Silver", category: "Insurance", hasVariants: true, variants: VARIANTS_S_C_F },
                        { id: "gg1", name: "Gateway Gold", category: "Insurance", hasVariants: true, variants: VARIANTS_S_C_F }
                    ]
                },
                {
                    id: "sub_classic", name: "Classic", products: [
                        { id: "cb1", name: "Classic Bronze", category: "Insurance", hasVariants: true, variants: VARIANTS_S_C_F },
                        { id: "cs1", name: "Classic Silver", category: "Insurance", hasVariants: true, variants: VARIANTS_S_C_F },
                        { id: "cg1", name: "Classic Gold", category: "Insurance", hasVariants: true, variants: VARIANTS_S_C_F }
                    ]
                },
                { id: "sub_teap", name: "Test EAP 4", products: [{ id: "teap4", name: "Test EAP 4", category: "EAP" }] },
                { id: "sub_prov", name: "Provincial Health Replacement Plan", products: [{ id: "phrp", name: "Provincial Health Replacement Plan", category: "Health" }] },
                { id: "sub_cat", name: "Catastrophic Medication", products: [{ id: "hcd_core", name: "High-Cost Drugs", category: "Drugs", hasVariants: true, variants: ["Single", "Family"] }] },
                { id: "sub_trav", name: "Emergency Travel Protection", products: [{ id: "gt_core", name: "Max Insurance Travel", category: "Travel" }] }
            ]
        },
        {
            id: "cr4",
            name: "Life & Disability Protection",
            products: [
                { id: "p100", name: "Protect 100", category: "Life" },
                { id: "p200", name: "Protect 200", category: "Life" }
            ]
        }
    ],
    VOLUNTARY: [
        {
            id: "vl1",
            name: "Private Health",
            products: [],
            subcategories: [
                {
                    id: "vlsub_ph", name: "Private Health", products: PRIVATE_HEALTH_PRODUCTS
                },
                {
                    id: "vlsub_mh", name: "Mental Health & Wellbeing", products: MENTAL_HEALTH_PRODUCTS
                }
            ]
        },
        {
            id: "vl2", name: "Health & Dental Insurance", subcategories: [
                {
                    id: "vsc1", name: "Catastrophic Medication", products: [
                        { id: "vhcd1", name: "High-Cost Drugs", category: "Drugs", hasVariants: true, variants: ["Single", "Family"] }
                    ]
                }
            ], products: []
        }
    ],
    UPGRADE: [
        {
            id: "ug1",
            name: "Private Health",
            products: [],
            subcategories: [
                {
                    id: "ugsub_ph", name: "Private Health", products: [
                        { id: "ug_cx1", name: "Complete Executive Care", category: "Health" },
                        { id: "ug_mdc1", name: "Medcan Dedicated Care", category: "Health" },
                        { id: "ug_mm1", name: "Medcan Mcare", category: "Health" },
                        { id: "ug_lv1", name: "La Vie - Point One Care", category: "Health" },
                        { id: "ug_lv2", name: "La Vie - Point One Care + FIT", category: "Health" }
                    ]
                }
            ]
        },
        {
            id: "ug2",
            name: "Health & Dental Insurance",
            products: [],
            subcategories: [
                {
                    id: "ugsub_gateway", name: "Gateway (Flex)", products: [
                        { id: "ug_gs1", name: "Gateway Silver", category: "Insurance" },
                        { id: "ug_gg1", name: "Gateway Gold", category: "Insurance" }
                    ]
                },
                {
                    id: "ugsub_classic", name: "Classic", products: [
                        { id: "ug_cb1", name: "Classic Bronze", category: "Insurance" },
                        { id: "ug_cs1", name: "Classic Silver", category: "Insurance", hasVariants: true, variants: VARIANTS_S_C_F },
                        { id: "ug_cg1", name: "Classic Gold", category: "Insurance" }
                    ]
                },
                {
                    id: "ugsub_prov", name: "Provincial Health Replacement Plan", products: [
                        { id: "ug_phrp", name: "Provincial Health Replacement Plan", category: "Health" }
                    ]
                }
            ]
        }
    ]
};

export function TierEditorPanel({
    tier,
    onSave,
    onCancel,
    isGuideActive = false
}: {
    tier: Tier;
    onSave: (updates: Partial<Tier>) => void;
    onCancel: () => void;
    isGuideActive?: boolean;
}) {
    // Hooks
    const { openChat, isWorkflowPaused, isWorkflowActive, setIsWorkflowActive } = useChat();
    const isWorkflowPausedRef = useRef(isWorkflowPaused);
    const isWorkflowActiveRef = useRef(isWorkflowActive);

    // Sync refs
    useEffect(() => {
        isWorkflowPausedRef.current = isWorkflowPaused;
        isWorkflowActiveRef.current = isWorkflowActive;
    }, [isWorkflowPaused, isWorkflowActive]);
    const { register, handleSubmit, setValue } = useForm({
        defaultValues: {
            name: tier.name,
            description: tier.description,
            status: tier.status,
            effectiveDate: tier.effectiveDate ? new Date(tier.effectiveDate).toISOString().split('T')[0] : "",
            lengthOfService: (tier.lengthOfService === "None" || tier.lengthOfService === "No") ? "" : tier.lengthOfService,
        },
    });

    const [plans, setPlans] = useState(tier.plans);
    const [enableUpgrade, setEnableUpgrade] = useState(!!tier.enableUpgradePlans);
    const [enableVoluntary, setEnableVoluntary] = useState(!!tier.enableVoluntaryPlans);

    const [openCats, setOpenCats] = useState<Record<string, boolean>>({
        "ug1": true,
        "ug2": true
    });
    const [openSubCats, setOpenSubCats] = useState<Record<string, boolean>>({
        "sub_gateway": true,
        "sub_classic": true,
        "sub_teap": true,
        "sub_prov": true,
        "sub_cat": true,
        "sub_trav": true,
        "ugsub_gateway": true,
        "ugsub_classic": true,
        "ugsub_prov": true,
        "ugsub_ph": true,
        "vlsub_ph": true,
        "vlsub_mh": true,
        "vsc1": true
    });
    const [showHeadCountModal, setShowHeadCountModal] = useState<{ section: keyof Tier['plans']; product: Product; variant: string } | null>(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [activeFillingField, setActiveFillingField] = useState<string | null>(null);
    const [pointerPos, setPointerPos] = useState<{ top: number, left: number } | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const innerFormRef = useRef<HTMLDivElement>(null);
    const hasStartedRef = useRef(false);

    // Continuous Pointer Re-sync Effect (similar to CorporateInfoForm)
    useEffect(() => {
        if (!activeFillingField) {
            setPointerPos(null);
            return;
        }

        const updatePosition = () => {
            const el = document.getElementById(activeFillingField);
            const containerEl = innerFormRef.current;
            if (el && containerEl) {
                const rect = el.getBoundingClientRect();
                const containerRect = containerEl.getBoundingClientRect();

                // Position relative to the form container (parent of both scroll area and footer)
                const newPos = {
                    top: rect.top - containerRect.top,
                    left: rect.left - containerRect.left + rect.width / 2
                };
                setPointerPos(newPos);
                console.log(`Pointer positioned for "${activeFillingField}":`, newPos);
            } else {
                if (!el) {
                    console.warn(`Element "${activeFillingField}" not found for pointer positioning`);
                }
                if (!containerEl) {
                    console.warn(`Scroll container not found for pointer positioning`);
                }
            }
        };

        updatePosition();
        let rafId: number;
        const tick = () => {
            updatePosition();
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);

        window.addEventListener('resize', updatePosition);
        // Listen to scroll events on the container and window (with capture)
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', updatePosition);
        }
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', updatePosition);
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', updatePosition);
            }
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [activeFillingField]);

    // --- AUTOMATION LOGIC ---
    useEffect(() => {
        if (isGuideActive && !hasStartedRef.current) {
            const runGuide = async () => {
                try {
                    hasStartedRef.current = true;
                    // Set workflow active to prevent MaxGreeting popup from showing
                    setIsWorkflowActive(true);
                    isWorkflowActiveRef.current = true;

                    const delay = async (ms: number) => {
                        if (!isWorkflowActiveRef.current) throw new Error("WorkflowCancelled");
                        await new Promise(resolve => setTimeout(resolve, ms));
                        while (isWorkflowPausedRef.current) {
                            if (!isWorkflowActiveRef.current) throw new Error("WorkflowCancelled");
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                        if (!isWorkflowActiveRef.current) throw new Error("WorkflowCancelled");
                    };

                    const speak = async (text: string) => {
                        if (!text) return;
                        await speakText(text);
                        if (isWorkflowPausedRef.current) {
                            await delay(0);
                            await speakText(text);
                        }
                    };

                    // Helper to type text into input
                    const typeText = async (fieldName: string, text: string) => {
                        if (!isWorkflowActiveRef.current) throw new Error("WorkflowCancelled");

                        let current = "";
                        for (const char of text) {
                            if (!isWorkflowActiveRef.current) throw new Error("WorkflowCancelled");
                            current += char;
                            setValue(fieldName as any, current);
                            await delay(30 + Math.random() * 20);
                        }
                    };

                    const fillField = async (config: {
                        id: string,
                        fieldName?: string,
                        value?: any,
                        speech: string,
                        action?: () => void,
                        isLast?: boolean
                    }) => {
                        if (!isWorkflowActiveRef.current) throw new Error("WorkflowCancelled");

                        // 1. Highlight and Focus - Wait for element to exist
                        setActiveFillingField(config.id);

                        // 2. Wait for element to exist in DOM (for dynamically rendered elements)
                        let el = document.getElementById(config.id);
                        let retries = 0;
                        while (!el && retries < 10) {
                            await delay(200);
                            el = document.getElementById(config.id);
                            retries++;
                        }

                        if (!el) {
                            console.warn(`Element with id "${config.id}" not found after retries`);
                        }

                        // 3. Auto-scroll Logic - Professional Implementation
                        if (el && scrollContainerRef.current) {
                            const rect = el.getBoundingClientRect();
                            const containerRect = scrollContainerRef.current.getBoundingClientRect();

                            // Check if element is outside the scroll container's visible area
                            const isAbove = rect.top < containerRect.top;
                            const isBelow = rect.bottom > containerRect.bottom;

                            if (isAbove || isBelow) {
                                el.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center',
                                    inline: 'nearest'
                                });
                                // Wait for scroll to stabilize
                                await delay(1000);
                            }
                        }

                        // 3. Professional Speech Timing - EXACTLY like the form page
                        // Speak FIRST and await completion before any action
                        await speak(config.speech);

                        // Brief pause after speech for visual poise
                        await delay(500);

                        // 4. Perform Action AFTER speech completes
                        if (config.action) {
                            config.action();
                        } else if (config.fieldName && config.value !== undefined) {
                            if (config.id.includes("date") || config.id.includes("select") || config.id.includes("radio")) {
                                setValue(config.fieldName as any, config.value);
                            } else {
                                await typeText(config.fieldName, config.value);
                            }
                        }

                        // Post-action pause for visual feedback and state updates to settle
                        await delay(800);
                        if (config.isLast) setActiveFillingField(null);
                    };

                    await delay(1500);

                    // 1. Basic Information section
                    await fillField({
                        id: "tier-name-input",
                        fieldName: "name",
                        value: "Standard Coverage Tier",
                        speech: TIER_VOICE_MESSAGES.EDIT_NAME
                    });

                    await fillField({
                        id: "tier-desc-input",
                        fieldName: "description",
                        value: "Unified benefit package for all full-time permanent staff.",
                        speech: TIER_VOICE_MESSAGES.EDIT_DESCRIPTION
                    });

                    await fillField({
                        id: "tier-date-input",
                        fieldName: "effectiveDate",
                        value: "2026-03-01",
                        speech: TIER_VOICE_MESSAGES.EDIT_EFFECTIVE_DATE
                    });

                    await fillField({
                        id: "tier-service-select",
                        fieldName: "lengthOfService",
                        value: "3 Months",
                        speech: TIER_VOICE_MESSAGES.LENGTH_OF_SERVICE
                    });

                    // 2. Corporate Level Group Plans (Employer Paid)
                    // STEP: Expand "Mental Health & Wellbeing" section
                    await fillField({
                        id: "cat-cm1-btn",
                        speech: TIER_VOICE_MESSAGES.EXPAND_MENTAL_HEALTH,
                        action: () => {
                            if (!openCats["cm1"]) toggleCat("cm1");
                        }
                    });

                    await delay(500);

                    // STEP: Select "Complete Wellness"
                    await fillField({
                        id: "plan-cw1-check",
                        speech: TIER_VOICE_MESSAGES.SELECT_COMPLETE_WELLNESS,
                        action: () => {
                            const target = PLAN_CATEGORIES.CORPORATE[0].products.find(p => p.id === "cw1");
                            if (target) togglePlan("corporate", target);
                        }
                    });

                    // STEP: Fill Headcount Modal - Three-Step Process
                    await delay(800);

                    // Step 1: Fill headcount input
                    await fillField({
                        id: "new-hc-input",
                        speech: TIER_VOICE_MESSAGES.MODAL_HEADCOUNT,
                        action: () => {
                            const input = document.getElementById("new-hc-input") as HTMLInputElement;
                            if (input) input.value = "150";
                        }
                    });

                    await delay(800);

                    // Step 2: Select effective date
                    await fillField({
                        id: "hc-date-select",
                        speech: TIER_VOICE_MESSAGES.MODAL_EFFECTIVE_DATE,
                        action: () => {
                            const select = document.getElementById("hc-date-select") as HTMLSelectElement;
                            if (select) {
                                // Select "Feb-01-2026" which is now at index 2 (after "Select" and "Jan-01-2026")
                                select.selectedIndex = 2;
                                // Trigger change event to ensure any listeners are notified
                                select.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                        }
                    });

                    await delay(800);

                    // Step 3: Click update button
                    await fillField({
                        id: "hc-update-btn",
                        speech: TIER_VOICE_MESSAGES.MODAL_UPDATE,
                        action: () => {
                            const btn = document.getElementById("hc-update-btn");
                            if (btn) {
                                // Trigger click event naturally
                                btn.click();
                                btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

                                // Fallback: Directly call the update if the modal is still open after a short delay
                                setTimeout(() => {
                                    if (showHeadCountModal) {
                                        const input = document.getElementById('new-hc-input') as HTMLInputElement;
                                        updateHeadCount(Number(input?.value || 150));
                                    }
                                }, 300);
                            }
                        }
                    });

                    // Wait for modal to close and state to settle
                    await delay(1500);

                    // STEP: Expand "Emergency Travel Protection" section
                    await fillField({
                        id: "cat-cm2-btn",
                        speech: TIER_VOICE_MESSAGES.EXPAND_TRAVEL_PROTECTION,
                        action: () => {
                            if (!openCats["cm2"]) toggleCat("cm2");
                        }
                    });

                    await delay(800);

                    // STEP: Select "Max Insurance Travel" with Single variant
                    await fillField({
                        id: "plan-tr1-single-check",
                        speech: TIER_VOICE_MESSAGES.SELECT_TRAVEL_PLAN,
                        action: () => {
                            const target = PLAN_CATEGORIES.CORPORATE[1].products.find(p => p.id === "tr1");
                            if (target) togglePlan("corporate", target, "Single");
                        }
                    });

                    // STEP: Fill Headcount Modal for Travel
                    await delay(800);

                    await fillField({
                        id: "new-hc-input",
                        speech: "I'll set the headcount for travel protection to 150 as well.",
                        action: () => {
                            const input = document.getElementById("new-hc-input") as HTMLInputElement;
                            if (input) input.value = "150";
                        }
                    });

                    await delay(800);

                    await fillField({
                        id: "hc-date-select",
                        speech: "Selecting the effective date.",
                        action: () => {
                            const select = document.getElementById("hc-date-select") as HTMLSelectElement;
                            if (select) {
                                select.selectedIndex = 2;
                                select.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                        }
                    });

                    await delay(800);

                    await fillField({
                        id: "hc-update-btn",
                        speech: "And updating the travel protection headcount.",
                        action: () => {
                            const btn = document.getElementById("hc-update-btn");
                            if (btn) {
                                btn.click();
                                btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                                setTimeout(() => {
                                    if (showHeadCountModal) {
                                        const input = document.getElementById('new-hc-input') as HTMLInputElement;
                                        updateHeadCount(Number(input?.value || 150));
                                    }
                                }, 300);
                            }
                        }
                    });

                    await delay(1500);

                    await delay(800);

                    // 3. Core Plans (Essential Health) - Two-Step Process

                    // STEP 1: Expand Private Health section
                    await fillField({
                        id: "cat-cr1-btn",
                        speech: TIER_VOICE_MESSAGES.EXPAND_PRIVATE_HEALTH,
                        action: () => {
                            setOpenCats(prev => ({ ...prev, "cr1": true }));
                        }
                    });

                    await delay(1200);

                    // STEP 2: Select Medcan Year Round Care from Private Health
                    await fillField({
                        id: "plan-myr1-check",
                        speech: TIER_VOICE_MESSAGES.SELECT_CORE_PLAN,
                        action: () => {
                            const p1 = PRIVATE_HEALTH_PRODUCTS.find(p => p.id === "myr1");
                            if (p1) togglePlan("core", p1);
                        }
                    });

                    await delay(800);

                    // STEP 3: Expand Health & Dental Insurance section
                    await fillField({
                        id: "cat-cr2-btn",
                        speech: TIER_VOICE_MESSAGES.EXPAND_HEALTH_DENTAL,
                        action: () => {
                            setOpenCats(prev => ({ ...prev, "cr2": true }));
                        }
                    });

                    await delay(1200);

                    // STEP 4: Expand Gateway subcategory
                    await fillField({
                        id: "subcat-sub_gateway-btn",
                        speech: "Expanding the Gateway plans subcategory.",
                        action: () => {
                            setOpenSubCats(prev => ({ ...prev, "sub_gateway": true }));
                        }
                    });

                    await delay(1200);

                    // STEP 5: Select Gateway Silver from Health & Dental
                    await fillField({
                        id: "plan-gs1-check",
                        speech: TIER_VOICE_MESSAGES.SELECT_HEALTH_DENTAL,
                        action: () => {
                            const p3 = PLAN_CATEGORIES.CORE[1].subcategories?.[0].products.find(p => p.id === "gs1");
                            if (p3) togglePlan("core", p3, "Single");
                        }
                    });

                    await delay(800);

                    // STEP 6: Expand Life & Disability Protection section
                    await fillField({
                        id: "cat-cr4-btn",
                        speech: TIER_VOICE_MESSAGES.EXPAND_LIFE_PROTECTION,
                        action: () => {
                            setOpenCats(prev => ({ ...prev, "cr4": true }));
                        }
                    });

                    await delay(1200);

                    // STEP 7: Select Protection 100 from Life Protection
                    await fillField({
                        id: "plan-p100-check",
                        speech: TIER_VOICE_MESSAGES.SELECT_LIFE_PLAN,
                        action: () => {
                            const p2 = PLAN_CATEGORIES.CORE[2].products.find(p => p.id === "p100");
                            if (p2) togglePlan("core", p2);
                        }
                    });

                    await delay(1200);

                    // 4. Upgrade Plans (Employee Paid Difference)
                    await fillField({
                        id: "upgrade-enable-yes",
                        speech: TIER_VOICE_MESSAGES.ENABLE_UPGRADE,
                        action: () => {
                            const radio = document.getElementById("upgrade-enable-yes") as HTMLInputElement;
                            if (radio) {
                                radio.click();
                                setEnableUpgrade(true);
                            }
                        }
                    });

                    await delay(1500);

                    // STEP 1: Expand Private Health category (Matching visual sequence)
                    await fillField({
                        id: "cat-ug1-btn",
                        speech: "Now expanding the Private Health category for premium upgrade options.",
                        action: () => {
                            setOpenCats(prev => ({ ...prev, "ug1": true }));
                        }
                    });

                    await delay(1200);

                    // STEP 1.1: Expand Private Health subcategory
                    await fillField({
                        id: "subcat-ugsub_ph-btn",
                        speech: "Opening the detailed list of Private Health upgrade plans.",
                        action: () => {
                            setOpenSubCats(prev => ({ ...prev, "ugsub_ph": true }));
                        }
                    });

                    await delay(1200);

                    // STEP 2: Select Complete Executive Care upgrade
                    await fillField({
                        id: "plan-ug_cx1-check",
                        speech: "I'll enable a premium 'Complete Executive Care' upgrade option here.",
                        action: () => {
                            const target = PLAN_CATEGORIES.UPGRADE[0].subcategories?.[0].products.find(p => p.id === "ug_cx1");
                            if (target) togglePlan("upgrade", target);
                        }
                    });

                    await delay(1200);

                    // STEP 3: Expand Health & Dental Insurance section
                    await fillField({
                        id: "cat-ug2-btn",
                        speech: "Next, let's look at the Health & Dental Insurance upgrade options.",
                        action: () => {
                            setOpenCats(prev => ({ ...prev, "ug2": true }));
                        }
                    });

                    await delay(1200);

                    // STEP 4: Expand Gateway subcategory
                    await fillField({
                        id: "subcat-ugsub_gateway-btn",
                        speech: "Expanding the Gateway plans subcategory.",
                        action: () => {
                            setOpenSubCats(prev => ({ ...prev, "ugsub_gateway": true }));
                        }
                    });

                    await delay(1200);

                    // STEP 5: Select Gateway Silver upgrade plan
                    await fillField({
                        id: "plan-ug_gs1-check",
                        speech: TIER_VOICE_MESSAGES.SELECT_UPGRADE_PLAN,
                        action: () => {
                            const target = PLAN_CATEGORIES.UPGRADE[1].subcategories?.[0].products.find(p => p.id === "ug_gs1");
                            if (target) togglePlan("upgrade", target);
                        }
                    });

                    await delay(800);

                    // 5. Voluntary Plans (Employee Choice)
                    await fillField({
                        id: "voluntary-enable-yes",
                        speech: TIER_VOICE_MESSAGES.ENABLE_VOLUNTARY,
                        action: () => {
                            const radio = document.getElementById("voluntary-enable-yes") as HTMLInputElement;
                            if (radio) {
                                radio.click();
                                setEnableVoluntary(true);
                            }
                        }
                    });

                    await delay(1500);

                    // STEP 1: Expand Health & Dental Insurance category for voluntary plans
                    await fillField({
                        id: "cat-vl2-btn",
                        speech: "Let me expand the Health & Dental Insurance section to view voluntary plan options.",
                        action: () => {
                            setOpenCats(prev => ({ ...prev, "vl2": true }));
                        }
                    });

                    await delay(1200);

                    // STEP 2: Expand Specialty Care subcategory
                    await fillField({
                        id: "subcat-vsc1-btn",
                        speech: "Expanding the Specialty Care subcategory.",
                        action: () => {
                            setOpenSubCats(prev => ({ ...prev, "vsc1": true }));
                        }
                    });

                    await delay(1200);

                    // STEP 3: Select High Cost Drugs voluntary plan
                    await fillField({
                        id: "plan-vhcd1-check",
                        speech: TIER_VOICE_MESSAGES.SELECT_VOLUNTARY_PLAN,
                        action: () => {
                            const target = PLAN_CATEGORIES.VOLUNTARY[1].subcategories?.[0].products.find(p => p.id === "vhcd1");
                            if (target) togglePlan("voluntary", target, "Family");
                        }
                    });

                    await delay(1200);

                    // 6. Save and Finalize
                    await fillField({
                        id: "tier-save-btn",
                        speech: TIER_VOICE_MESSAGES.SAVING,
                        action: () => {
                            const btn = document.getElementById("tier-save-btn");
                            if (btn) {
                                btn.click();
                                // Direct submit fallback
                                setTimeout(() => {
                                    handleSubmit(onFormSubmit)();
                                }, 500);
                            }
                        },
                        isLast: true
                    });

                    // 7. Success message
                    const successMsg = TIER_VOICE_MESSAGES.SAVED_SUCCESSFULLY;
                    openChat(successMsg);
                    await speakText(successMsg);

                    await delay(1000);

                } catch (e: any) {
                    if (e.message === "WorkflowCancelled") {
                        console.log("Tier Editor workflow cancelled");
                    }
                } finally {
                    hasStartedRef.current = false;
                }
            };
            runGuide();
        }
    }, [isGuideActive]);

    const toggleCat = (id: string) => {
        setOpenCats(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleSubCat = (id: string) => {
        setOpenSubCats(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const togglePlan = (section: keyof Tier['plans'], product: Product, variant: string = "Single") => {
        setPlans((prev) => {
            const list = prev[section] as Plan[];
            const exists = list.find((p) => p.id === product.id && p.variant === variant);

            if (exists) {
                return { ...prev, [section]: list.filter((p) => !(p.id === product.id && p.variant === variant)) };
            } else {
                const newPlan: Plan = {
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    type: section.toUpperCase() as any,
                    variant: variant as any,
                    headcount: 1
                };

                if (section === "corporate") {
                    setTimeout(() => {
                        setShowHeadCountModal({ section, product, variant });
                    }, 50);
                }

                return { ...prev, [section]: [...list, newPlan] };
            }
        });
    };

    const isSelected = (section: keyof Tier['plans'], productId: string, variant?: string) => {
        if (variant) {
            return (plans[section] as Plan[]).some(p => p.id === productId && p.variant === variant);
        }
        return (plans[section] as Plan[]).some(p => p.id === productId);
    };

    const updateHeadCount = (count: number) => {
        if (!showHeadCountModal) return;
        const { section, product, variant } = showHeadCountModal;
        setPlans(prev => ({
            ...prev,
            [section]: (prev[section] as Plan[]).map(p =>
                (p.id === product.id && p.variant === variant) ? { ...p, headcount: count } : p
            )
        }));
        setShowHeadCountModal(null);
    };

    const onFormSubmit = (data: Partial<Tier>) => {
        if (plans.core.length === 0) {
            setShowInfoModal(true);
            return;
        }

        onSave({
            ...data,
            status: "Active",
            effectiveDate: data.effectiveDate ? new Date(data.effectiveDate).toISOString() : null,
            plans,
            isValid: true,
            enableUpgradePlans: enableUpgrade,
            enableVoluntaryPlans: enableVoluntary
        });
    };

    // Helper to render products within a category/subcategory
    const renderProducts = (section: keyof Tier['plans'], products: Product[]) => {
        return products.map(p => {
            const selected = (plans[section] as Plan[]).find(item => item.id === p.id);
            const isHighlighted = activeFillingField === `plan-${p.id}-check` ||
                p.variants?.some(v => activeFillingField === `plan-${p.id}-${v.toLowerCase()}-check`);
            return (
                <div
                    key={p.id}
                    className={clsx(
                        "rounded border bg-white p-2 transition-all duration-300",
                        isHighlighted
                            ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md z-10"
                            : "border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-700">{p.name}</span>
                        <input
                            id={`plan-${p.id}-check`}
                            type="checkbox"
                            checked={isSelected(section, p.id)}
                            onChange={() => togglePlan(section, p)}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                    </div>
                    {p.hasVariants && (
                        <div className="flex gap-4 mt-1.5 ml-0.5">
                            {p.variants?.map(v => (
                                <label key={v} className="flex items-center gap-1.5 cursor-pointer group">
                                    <input
                                        id={`plan-${p.id}-${v.toLowerCase()}-check`}
                                        type="checkbox"
                                        checked={isSelected(section, p.id, v)}
                                        onChange={() => togglePlan(section, p, v)}
                                        className={clsx(
                                            "h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-0 transition-all duration-300",
                                            activeFillingField === `plan-${p.id}-${v.toLowerCase()}-check` && "ring-2 ring-blue-500 scale-125"
                                        )}
                                    />
                                    <span className="text-[9px] font-bold text-slate-500 group-hover:text-blue-700 transition-colors uppercase">{v}</span>
                                </label>
                            ))}
                        </div>
                    )}
                    {selected && section === "corporate" && (
                        <div className="pt-2 space-y-2">
                            <div className="space-y-1">
                                <p className="text-[8px] font-extrabold text-[#1e3a5f] uppercase tracking-tighter">HEAD COUNT</p>
                                <input type="number" value={selected.headcount} readOnly className="w-10 h-5 border border-gray-300 rounded text-[10px] px-1 bg-white outline-none font-bold text-gray-700" />
                            </div>
                            <div className="flex gap-2.5 items-center">
                                <Edit2 className="h-3.5 w-3.5 text-red-500 cursor-pointer hover:text-red-700" onClick={() => setShowHeadCountModal({ section, product: p, variant: 'Single' })} />
                                <Trash2 className="h-3.5 w-3.5 text-red-500 cursor-pointer hover:text-red-700" />
                                <div className="h-3 w-3 rounded-full border border-red-500 flex items-center justify-center text-[7px] text-red-500 font-black cursor-pointer hover:bg-red-50">i</div>
                            </div>
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="w-full bg-[#f8fafc] rounded-xl shadow-sm overflow-hidden border border-slate-200/60 relative animate-scale-in">

            {/* 1. Header */}
            <div className="bg-[#0a1e3b] px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-white/90">{tier.name ? "Edit Tier" : "Add Tier"}</span>
                <button onClick={onCancel} className="text-white/60 hover:text-white transition-colors">
                    <X size={14} />
                </button>
            </div>

            <div ref={innerFormRef} className="relative">
                <div ref={scrollContainerRef} className="p-4 space-y-4 max-h-[85vh] overflow-y-auto relative">
                    {/* 2. Tier Configuration */}
                    <div className="border border-gray-300 rounded bg-white overflow-hidden">
                        <div className="bg-[#1e3a5f] px-3 py-1.5">
                            <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Tier Configuration</h3>
                        </div>
                        <div className="p-4 grid grid-cols-5 gap-4 items-end">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-700 text-nowrap">Tier Name<span className="text-red-600">*</span></label>
                                <input
                                    id="tier-name-input"
                                    {...register("name")}
                                    className={clsx(
                                        "w-full border rounded px-2 py-1.5 text-xs transition-all duration-300",
                                        activeFillingField === "tier-name-input"
                                            ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md"
                                            : "border-gray-300 bg-gray-50 focus:bg-white"
                                    )}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-700">Description<span className="text-red-600">*</span></label>
                                <input
                                    id="tier-desc-input"
                                    {...register("description")}
                                    className={clsx(
                                        "w-full border rounded px-2 py-1.5 text-xs transition-all duration-300",
                                        activeFillingField === "tier-desc-input"
                                            ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md"
                                            : "border-gray-300 bg-gray-50 focus:bg-white"
                                    )}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-700">Status<span className="text-red-600">*</span></label>
                                <input {...register("status")} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-gray-100" readOnly />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-700">Effective Date<span className="text-red-600">*</span></label>
                                <input
                                    id="tier-date-input"
                                    type="date"
                                    {...register("effectiveDate")}
                                    className={clsx(
                                        "w-full border rounded px-2 py-1.5 text-xs transition-all duration-300",
                                        activeFillingField === "tier-date-input"
                                            ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md"
                                            : "border-gray-300 focus:ring-1 focus:ring-blue-100"
                                    )}
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 space-y-1">
                                    <label className="text-[10px] font-bold text-gray-700">Length of Service<span className="text-red-600">*</span></label>
                                    <select id="tier-service-select" {...register("lengthOfService")} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-gray-50">
                                        <option value="">Select</option>
                                        <option value="No">No</option>
                                        <option value="3 Months">3 Months</option>
                                        <option value="6 Months">6 Months</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Corporate Level Plans */}
                    <div className="border border-gray-300 rounded-sm bg-white p-4 space-y-4 shadow-sm">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Corporate Level Group Plans</p>
                        <div className="flex gap-4 items-start">
                            {PLAN_CATEGORIES.CORPORATE.map(cat => (
                                <div key={cat.id} className="w-72 space-y-2">
                                    <button
                                        id={`cat-${cat.id}-btn`}
                                        onClick={() => toggleCat(cat.id)}
                                        className={clsx(
                                            "w-full flex items-center justify-between border rounded px-3 py-1.5 text-xs text-gray-700 font-bold bg-white hover:bg-gray-50 transition-all duration-300 shadow-sm",
                                            activeFillingField === `cat-${cat.id}-btn` ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md z-10" : "border-gray-300"
                                        )}
                                    >
                                        <span className="truncate">{cat.name}</span>
                                        <ChevronDown size={14} className={clsx("text-gray-400 transition-transform", openCats[cat.id] && "rotate-180")} />
                                    </button>
                                    {openCats[cat.id] && (
                                        <div className="border border-gray-200 rounded p-2 bg-gray-50/50 space-y-2 max-h-96 overflow-y-auto">
                                            {renderProducts("corporate", cat.products)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Core Plans */}
                    <div className="border border-gray-300 rounded-sm bg-white p-4 space-y-4 shadow-sm">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Core Plans (100% Premium Paid Directly by Employer)</p>
                        <div className="flex gap-4 items-start overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300">
                            {PLAN_CATEGORIES.CORE.map(cat => (
                                <div key={cat.id} className="min-w-[320px] max-w-[350px] space-y-3">
                                    <button
                                        id={`cat-${cat.id}-btn`}
                                        onClick={() => toggleCat(cat.id)}
                                        className={clsx(
                                            "w-full flex items-center justify-between border rounded px-3 py-1.5 text-xs text-[#1e3a5f] font-bold bg-white hover:bg-blue-50/30 transition-all duration-300 shadow-sm",
                                            activeFillingField === `cat-${cat.id}-btn` ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md z-10" : "border-gray-300"
                                        )}
                                    >
                                        <span className="truncate">{cat.name}</span>
                                        <ChevronDown size={14} className={clsx("text-gray-400 transition-transform", openCats[cat.id] && "rotate-180")} />
                                    </button>
                                    {openCats[cat.id] && (
                                        <div className="space-y-3">
                                            {cat.subcategories ? cat.subcategories.map(sub => (
                                                <div key={sub.id} className="border border-slate-300 rounded-md overflow-hidden bg-slate-50 shadow-sm">
                                                    <button
                                                        id={`subcat-${sub.id}-btn`}
                                                        onClick={() => toggleSubCat(sub.id)}
                                                        className={clsx(
                                                            "w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold text-white uppercase tracking-wider transition-all duration-300",
                                                            activeFillingField === `subcat-${sub.id}-btn` ? "bg-[#1e3a5f] scale-[1.02] shadow-md z-10" : "bg-[#2d4d75] hover:bg-[#1e3a5f]"
                                                        )}
                                                    >
                                                        {sub.name} <ChevronDown size={14} className={clsx("transition-transform", openSubCats[sub.id] && "rotate-180")} />
                                                    </button>
                                                    {openSubCats[sub.id] && (
                                                        <div className="bg-[#f0f4f8] p-2 space-y-2">
                                                            {renderProducts("core", sub.products)}
                                                        </div>
                                                    )}
                                                </div>
                                            )) : (
                                                <div className="border border-gray-200 rounded p-2 bg-gray-50/50 space-y-2 max-h-[500px] overflow-y-auto">
                                                    {renderProducts("core", cat.products)}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 5. Upgrade Plans Bar */}
                    <div className="border border-gray-300 rounded-sm bg-white overflow-hidden shadow-sm">
                        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Upgrade Plans (Premium difference paid by employee through payroll deduction)</p>
                            <div className="flex items-center gap-4 text-[11px] font-bold text-[#1e3a5f]">
                                <span>Enabled?</span>
                                <div className="flex gap-3">
                                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-blue-700 transition-colors">
                                        <input
                                            id="upgrade-enable-yes"
                                            type="radio"
                                            checked={enableUpgrade}
                                            onChange={() => {
                                                if (plans.core.length === 0) {
                                                    setShowInfoModal(true);
                                                    return;
                                                }
                                                setEnableUpgrade(true);
                                            }}
                                            className="h-3.5 w-3.5 border-gray-300 text-blue-600"
                                        /> Yes
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-blue-700 transition-colors">
                                        <input
                                            type="radio"
                                            checked={!enableUpgrade}
                                            onChange={() => setEnableUpgrade(false)}
                                            className="h-3.5 w-3.5 border-gray-300 text-blue-600"
                                        /> No
                                    </label>
                                </div>
                            </div>
                        </div>
                        {enableUpgrade && (
                            <div className="p-4 flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 bg-gray-50/20">
                                {PLAN_CATEGORIES.UPGRADE.map(cat => (
                                    <div key={cat.id} className="min-w-[320px] max-w-[350px] space-y-3">
                                        <button
                                            id={`cat-${cat.id}-btn`}
                                            onClick={() => toggleCat(cat.id)}
                                            className={clsx(
                                                "w-full flex items-center justify-between border rounded px-3 py-1.5 text-xs text-[#1e3a5f] font-bold bg-white hover:bg-blue-50/30 transition-all duration-300 shadow-sm",
                                                activeFillingField === `cat-${cat.id}-btn` ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md z-10" : "border-gray-300"
                                            )}
                                        >
                                            <span className="truncate">{cat.name}</span>
                                            <ChevronDown size={14} className={clsx("text-gray-400 transition-transform", openCats[cat.id] && "rotate-180")} />
                                        </button>
                                        {openCats[cat.id] && (
                                            <div className="space-y-3">
                                                {cat.subcategories ? cat.subcategories.map(sub => (
                                                    <div key={sub.id} className="border border-slate-300 rounded-md overflow-hidden bg-slate-50 shadow-sm">
                                                        <button
                                                            id={`subcat-${sub.id}-btn`}
                                                            onClick={() => toggleSubCat(sub.id)}
                                                            className={clsx(
                                                                "w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold text-white uppercase tracking-wider transition-all duration-300",
                                                                activeFillingField === `subcat-${sub.id}-btn` ? "bg-[#1e3a5f] scale-[1.02] shadow-md z-10" : "bg-[#2d4d75] hover:bg-[#1e3a5f]"
                                                            )}
                                                        >
                                                            {sub.name} <ChevronDown size={14} className={clsx("transition-transform", openSubCats[sub.id] && "rotate-180")} />
                                                        </button>
                                                        {openSubCats[sub.id] && (
                                                            <div className="bg-[#f0f4f8] p-2 space-y-2">
                                                                {renderProducts("upgrade", sub.products)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )) : (
                                                    <div className="border border-gray-200 rounded p-2 bg-gray-50/50 space-y-2 max-h-[500px] overflow-y-auto">
                                                        {renderProducts("upgrade", cat.products)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 6. Voluntary Plans */}
                    <div className="border border-gray-300 rounded-sm bg-white overflow-hidden shadow-sm">
                        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Voluntary Plans (100% Premium Paid Directly by Employee)</p>
                            <div className="flex items-center gap-4 text-[11px] font-bold text-[#1e3a5f]">
                                <span>Enabled?</span>
                                <div className="flex gap-3">
                                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-blue-700 transition-colors">
                                        <input
                                            id="voluntary-enable-yes"
                                            type="radio"
                                            checked={enableVoluntary}
                                            onChange={() => setEnableVoluntary(true)}
                                            className="h-3.5 w-3.5 border-gray-300 text-blue-600"
                                        /> Yes
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-blue-700 transition-colors">
                                        <input
                                            type="radio"
                                            checked={!enableVoluntary}
                                            onChange={() => setEnableVoluntary(false)}
                                            className="h-3.5 w-3.5 border-gray-300 text-blue-600"
                                        /> No
                                    </label>
                                </div>
                            </div>
                        </div>
                        {enableVoluntary && (
                            <div className="p-4 flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 bg-gray-50/20">
                                {PLAN_CATEGORIES.VOLUNTARY.map(cat => (
                                    <div key={cat.id} className="min-w-[320px] max-w-[350px] space-y-3">
                                        <button
                                            id={`cat-${cat.id}-btn`}
                                            onClick={() => toggleCat(cat.id)}
                                            className={clsx(
                                                "w-full flex items-center justify-between border rounded px-3 py-1.5 text-xs text-[#1e3a5f] font-bold bg-white hover:bg-blue-50/30 transition-all duration-300 shadow-sm",
                                                activeFillingField === `cat-${cat.id}-btn` ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md z-10" : "border-gray-300"
                                            )}
                                        >
                                            <span className="truncate">{cat.name}</span>
                                            <ChevronDown size={14} className={clsx("text-gray-400 transition-transform", openCats[cat.id] && "rotate-180")} />
                                        </button>
                                        {openCats[cat.id] && (
                                            <div className="space-y-3">
                                                {cat.subcategories ? cat.subcategories.map(sub => (
                                                    <div key={sub.id} className="border border-slate-300 rounded-md overflow-hidden bg-slate-50 shadow-sm">
                                                        <button
                                                            id={`subcat-${sub.id}-btn`}
                                                            onClick={() => toggleSubCat(sub.id)}
                                                            className={clsx(
                                                                "w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold text-white uppercase tracking-wider transition-all duration-300",
                                                                activeFillingField === `subcat-${sub.id}-btn` ? "bg-[#1e3a5f] scale-[1.02] shadow-md z-10" : "bg-[#2d4d75] hover:bg-[#1e3a5f]"
                                                            )}
                                                        >
                                                            {sub.name} <ChevronDown size={14} className={clsx("transition-transform", openSubCats[sub.id] && "rotate-180")} />
                                                        </button>
                                                        {openSubCats[sub.id] && (
                                                            <div className="bg-[#f0f4f8] p-2 space-y-2">
                                                                {renderProducts("voluntary", sub.products)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )) : (
                                                    <div className="border border-gray-200 rounded p-2 bg-gray-50/50 space-y-2 max-h-[500px] overflow-y-auto">
                                                        {renderProducts("voluntary", cat.products)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Edit Head Count Modal */}
                    {showHeadCountModal && (
                        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                            <div className="w-[450px] bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-300">
                                <div className="bg-[#1e3a5f] px-4 py-2 flex items-center justify-between">
                                    <h4 className="text-[13px] font-bold text-white">Edit Head Count</h4>
                                    <button onClick={() => setShowHeadCountModal(null)} className="text-white hover:text-gray-300"><X size={16} /></button>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="grid grid-cols-2 gap-y-4 items-center">
                                        <span className="text-xs font-bold text-gray-600">Current Head Count:</span>
                                        <input
                                            type="text"
                                            value={showHeadCountModal ? (plans[showHeadCountModal.section].find((px: any) => px.id === showHeadCountModal.product.id && px.variant === showHeadCountModal.variant)?.headcount || 1) : 1}
                                            readOnly
                                            className="w-16 border border-gray-300 rounded px-2 py-1 text-xs bg-gray-100 text-center outline-none"
                                        />
                                        <span className="text-xs font-bold text-gray-600">New Head Count:</span>
                                        <input
                                            type="number"
                                            id="new-hc-input"
                                            defaultValue={1}
                                            className={clsx(
                                                "w-16 border rounded px-2 py-1 text-xs text-center outline-none transition-all duration-300",
                                                activeFillingField === "new-hc-input"
                                                    ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md"
                                                    : "border-gray-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                                            )}
                                        />
                                        <span className="text-xs font-bold text-gray-600">Effective Date:</span>
                                        <select
                                            id="hc-date-select"
                                            className={clsx(
                                                "border rounded px-2 py-1 text-xs w-36 font-bold text-slate-700 outline-none transition-all duration-300",
                                                activeFillingField === "hc-date-select"
                                                    ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md"
                                                    : "border-gray-300 bg-gray-50"
                                            )}
                                        >
                                            <option value="">Select</option>
                                            <option>Jan-01-2026</option>
                                            <option>Feb-01-2026</option>
                                            <option>Mar-01-2026</option>
                                            <option>Apr-01-2026</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-center gap-3">
                                    <button onClick={() => setShowHeadCountModal(null)} className="px-6 py-1.5 border border-gray-300 rounded bg-white text-xs font-bold text-[#1e3a5f] hover:bg-gray-50">Close</button>
                                    <button
                                        id="hc-update-btn"
                                        onClick={() => {
                                            const input = document.getElementById('new-hc-input') as HTMLInputElement;
                                            updateHeadCount(Number(input?.value || 1));
                                        }}
                                        className={clsx(
                                            "px-6 py-1.5 bg-[#1e3a5f] rounded text-xs font-bold text-white transition-all duration-300",
                                            activeFillingField === "hc-update-btn"
                                                ? "shadow-xl ring-4 ring-blue-500/30 scale-[1.05]"
                                                : "shadow-sm hover:bg-slate-800"
                                        )}
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Info Modal */}
                    {showInfoModal && (
                        <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                            <div className="w-[480px] bg-white rounded shadow-2xl overflow-hidden border border-gray-300">
                                <div className="bg-[#1e3a5f] px-4 py-2 flex justify-center">
                                    <h4 className="text-[14px] font-bold text-white">Info</h4>
                                </div>
                                <div className="p-10 flex flex-col items-center justify-center space-y-8">
                                    <p className="text-[15px] font-medium text-gray-700 text-center">Please select one core plan from above</p>
                                    <button
                                        onClick={() => setShowInfoModal(false)}
                                        className="px-4 md:px-8 pt-14 md:pt-0 py-1.5 bg-[#1e3a5f] rounded text-xs font-bold text-white shadow hover:bg-slate-800 transition-colors min-w-[80px]"
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sticky Footer */}
                <div className="bg-white px-6 py-3 flex justify-end gap-3 border-t border-gray-200 sticky bottom-0 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                    <button id="tier-save-btn" onClick={handleSubmit(onFormSubmit)} className="bg-[#1e3a5f] rounded px-4 md:px-8 pt-14 md:pt-0 py-2 text-[11px] font-black text-white hover:bg-slate-800 transition-all shadow-md uppercase tracking-wide">Save</button>
                    <button onClick={onCancel} className="bg-white border border-slate-300 rounded px-4 md:px-8 pt-14 md:pt-0 py-2 text-[11px] font-black text-[#1e3a5f] hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm uppercase tracking-wide">Close</button>
                </div>

                {/* Guide Pointer (Nina's Mouse) - Outside scroll container to stay on top of footer */}
                {pointerPos && activeFillingField && (
                    <div
                        style={{
                            position: 'absolute',
                            top: pointerPos.top - 10,
                            left: pointerPos.left,
                            transform: 'translate(-50%, -100%)',
                            pointerEvents: 'none',
                            zIndex: 10000
                        }}
                        className="transition-all duration-300 ease-out"
                    >
                        <div className="relative flex flex-col items-center animate-Nina-pointer-float">
                            <div className="text-red-500 filter drop-shadow-[0_4px_12px_rgba(239,68,68,0.4)] transform rotate-[225deg]">
                                <MousePointer2 className="w-6 h-6 fill-red-500" />
                            </div>
                            <div className="absolute inset-0 -m-1 rounded-full bg-red-500 animate-ping opacity-20 scale-125" />
                        </div>
                    </div>
                )}
            </div>
            <style jsx global>{`
                @keyframes Nina-pointer-float {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-8px); }
                }
                .animate-Nina-pointer-float {
                  animation: Nina-pointer-float 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
