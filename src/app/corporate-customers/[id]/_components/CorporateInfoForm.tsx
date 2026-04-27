"use client";

import React, { useMemo } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Corporate } from "@/lib/types";
import { useCorporateEngine } from "./useCorporateEngine";
import { Loader2, UploadCloud, MousePointer2 } from "lucide-react";
import { speakText } from "@/lib/google-tts";
import { useEffect, useState, useRef } from "react";
import clsx from "clsx";
import { SAMPLE_CORPORATE_1 } from "@/lib/sample-data";
import { useChat } from "@/context/ChatContext";

// Define the schema
const corporateSchema = z.object({
    broker: z.string().optional(),
    selectProfile: z.string().optional(),
    paymentPlatform: z.string().optional(),

    name: z.string().min(2, "Company name is required"),
    provincialOffices: z.string().min(1, "Provincial office required"),

    policyStartDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    contactEmail: z.string().email("Invalid email"),
    address: z.object({
        street1: z.string().min(5, "Street address required"),
        street2: z.string().optional(),
        unit: z.string().optional(),
        city: z.string().min(2, "City required"),
        province: z.string().min(2, "Province required"),
        country: z.string().min(2, "Country required"),
        postalCode: z.string().min(5, "Postal code required"),
    }),

    contacts: z.array(z.object({
        firstName: z.string().min(1, "First name required"),
        lastName: z.string().min(1, "Last name required"),
        phone: z.string().min(10, "Phone required"),
        email: z.string().email("Invalid email"),
        role: z.string().min(1, "Role required"),
    })).min(1, "At least one contact required"),

    waitingPeriodInitial: z.string().min(1, "Selection required"),
    waitingPeriodNewHires: z.string().min(1, "Selection required"),
    defineCoverageTiers: z.string().min(1, "Selection required"),
    paymentMethod: z.string().min(1, "Selection required"),
    showEmployerName: z.string().min(1, "Selection required"),
    employeeCount: z.union([z.coerce.number(), z.string(), z.null()]).optional(),
});

export type FormValues = z.infer<typeof corporateSchema>;

export function CorporateInfoForm({ engine }: { engine: ReturnType<typeof useCorporateEngine> }) {
    const { corporate, updateCorporateInfo, isSaving } = engine;

    const defaultValues: FormValues = useMemo(() => ({
        broker: corporate.broker || "",
        selectProfile: corporate.selectProfile || "",
        paymentPlatform: corporate.paymentPlatform || "AuthorizeNet",

        name: corporate.name || "",
        provincialOffices: corporate.provincialOffices || "",

        policyStartDate: corporate.policyStartDate ? new Date(corporate.policyStartDate).toISOString().split('T')[0] : "",
        contactEmail: corporate.contactEmail || "",

        address: corporate.address || { street1: "", city: "", province: "", country: "Canada", postalCode: "" },

        contacts: corporate.contacts && corporate.contacts.length > 0
            ? corporate.contacts.map(c => ({
                firstName: c.firstName || "",
                lastName: c.lastName || "",
                phone: c.phone || "",
                email: c.email || "",
                role: c.role || "Select"
            }))
            : [{ firstName: "", lastName: "", phone: "", email: "", role: "Select" }],

        waitingPeriodInitial: corporate.waitingPeriodInitial === null ? "" : (corporate.waitingPeriodInitial ? "yes" : "no"),
        waitingPeriodNewHires: corporate.waitingPeriodNewHires || "",
        defineCoverageTiers: corporate.defineCoverageTiers === null ? "" : (corporate.defineCoverageTiers ? "yes" : "no"),
        paymentMethod: corporate.paymentMethod || "",
        showEmployerName: corporate.showEmployerName === null ? "" : (corporate.showEmployerName ? "yes" : "no"),
        employeeCount: corporate.employeeCount === null ? "" : corporate.employeeCount,
    }), [corporate]);

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(corporateSchema) as any,
        defaultValues
    });

    const selectedBroker = watch("broker");
    const profileOptions = [
        "Corporate Insurance",
        "Health Insurance",
        "Dental Insurance",
        "All of Them"
    ];

    const { fields } = useFieldArray({
        control,
        name: "contacts"
    });

    const selectedCountry = watch("address.country");

    const CANADA_PROVINCES = [
        "Alberta", "British Columbia", "Manitoba", "New Brunswick",
        "Newfoundland and Labrador", "Nova Scotia", "Ontario",
        "Prince Edward Island", "Quebec", "Saskatchewan",
        "Northwest Territories", "Nunavut", "Yukon"
    ];

    const US_STATES = [
        "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
        "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
        "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
        "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
        "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
    ];

    // --- GUIDE LOGIC ---
    const [isEmailHighlighted, setIsEmailHighlighted] = useState(false);
    const [isRoleHighlighted, setIsRoleHighlighted] = useState(false);
    const hasSpokenEmailRef = useRef(false);
    const hasSpokenRoleRef = useRef(false);
    const emailValue = watch("contacts.0.email");
    const roleValue = watch("contacts.0.role");

    const { openChat, isMuted, isWorkflowPaused, isWorkflowActive, setIsWorkflowActive } = useChat();
    const isWorkflowPausedRef = useRef(isWorkflowPaused);
    const isWorkflowActiveRef = useRef(isWorkflowActive);

    useEffect(() => {
        isWorkflowPausedRef.current = isWorkflowPaused;
        isWorkflowActiveRef.current = isWorkflowActive;
    }, [isWorkflowPaused, isWorkflowActive]);
    const [activeFillingField, setActiveFillingField] = useState<string | null>(null);
    const [isSubmittingHighlighted, setIsSubmittingHighlighted] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [pointerPos, setPointerPos] = useState<{ top: number, left: number } | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // Continuous Pointer Re-sync Effect
    useEffect(() => {
        if (!activeFillingField) {
            setPointerPos(null);
            return;
        }

        const updatePosition = () => {
            const el = document.getElementById(activeFillingField);
            const formEl = formRef.current;
            if (el && formEl) {
                const rect = el.getBoundingClientRect();
                const formRect = formEl.getBoundingClientRect();
                // Position pointer exactly above the center of the element, relative to form container
                // This fix bypasses the transform-containing-block issue caused by parents using CSS animations
                setPointerPos({
                    top: rect.top - formRect.top,
                    left: rect.left - formRect.left + rect.width / 2
                });
            }
        };

        // Update immediately
        updatePosition();

        // Then on every frame for perfect sync during scrolls/animations
        let rafId: number;
        const tick = () => {
            updatePosition();
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);

        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [activeFillingField]);

    const VOICE_MESSAGES: Record<string, string> = {
        "broker": "Select the designated broker to ensure correct commission and account management.",
        "selectProfile": "Select the insurance profile that best matches your group's coverage requirements.",
        "paymentPlatform": "Specify the preferred payment platform for secure transaction processing.",
        "name": "Enter the corporation's official legal name for all policy documentation.",
        "provincialOffices": "Identify the primary office location to ensure alignment with regional benefit standards.",
        "policyStartDate": "Set the policy effective date. Accuracy is vital as this determines when coverage officially begins.",
        "contactEmail": "Provide a valid administrative email for essential updates and certificates.",
        "address.street1": "Enter the primary street address for the corporate office.",
        "address.unit": "Include suite or unit numbers where applicable.",
        "address.city": "Please specify the city.",
        "address.province": "Select the appropriate province or territory.",
        "address.country": "Select the country of registration.",
        "address.postalCode": "Provide the postal code to finalize the address registration.",
        "contacts.0.firstName": "Enter the first name of the primary administrative contact.",
        "contacts.0.lastName": "Enter the last name of the primary contact.",
        "contacts.0.phone": "Provide a direct telephone number for the primary contact.",
        "contacts.0.email": "The primary contact's email is required for all administrative correspondence.",
        "contacts.0.role": "Assign the appropriate role to ensure correct system permissions and access.",
        "waitingPeriodInitial": "Define the required waiting period for initial member enrollment.",
        "waitingPeriodNewHires": "Specify the standard waiting period applicable to all future new hires.",
        "defineCoverageTiers": "Indicate if you wish to implement customized coverage tiers for this plan.",
        "paymentMethod": "Select the organization's preferred billing method.",
        "showEmployerName": "Determine if the employer's name should be visible on the member enrollment portal.",
        "employeeCount": "Provide the estimated total employee count for accurate plan administration."
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        const guideStep = localStorage.getItem("max_guide_step");

        if (guideStep === "add_customer") {
            const runGuide = async () => {
                try {
                    setIsWorkflowActive(true);
                    isWorkflowActiveRef.current = true; // Sync ref immediately to prevent race condition
                    // Helper for natural delay
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
                        // Use silent mode to prevent the Chat Panel from triggering a second voice call
                        openChat(text, true);
                        await speakText(text);
                        if (isWorkflowPausedRef.current) {
                            await delay(0);
                            await speakText(text);
                        }
                    };

                    // 1. Auto-fill data sequentially (Simulating user input)
                    const fillField = async (field: any, value: any, isLast: boolean = false) => {
                        if (!isWorkflowActiveRef.current) throw new Error("WorkflowCancelled");

                        if (value !== undefined && value !== null) {
                            const el = document.getElementById(field) as HTMLElement | null;
                            if (el) {
                                const rect = el.getBoundingClientRect();
                                // Only auto-scroll if the element is BELOW the viewport (moving forward)
                                // If the user has scrolled UP and the element is now below, or if it's off-screen above,
                                // we check if it's above or below.
                                const isBelow = rect.top > window.innerHeight;

                                if (isBelow) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    // Wait for scroll to stabilize
                                    await delay(400);
                                }
                            }

                            setActiveFillingField(field);
                            if (el) el.focus({ preventScroll: true });

                            // Professional Voice-Over - AWAIT completion
                            await speak(VOICE_MESSAGES[field]);

                            // Wait a moment for visual focus to sink in before typing/selecting
                            await delay(200);

                            // If it's a dropdown or radio, simulate selection pause
                            const isSelect = el?.tagName === 'SELECT';
                            const isRadio = field.includes('waitingPeriod') || field.includes('defineCoverage') || field.includes('paymentMethod') || field.includes('showEmployer');

                            if (isSelect) {
                                const selectEl = el as HTMLSelectElement;
                                await delay(400);
                                setValue(field, value);
                                await delay(600);
                            } else if (isRadio) {
                                await delay(400);
                                setValue(field, value);
                                await delay(600);
                            } else {
                                // Realistic character-by-character typing
                                await delay(200);
                                const textValue = String(value);
                                let currentText = "";
                                for (let i = 0; i < textValue.length; i++) {
                                    if (!isWorkflowActiveRef.current) throw new Error("WorkflowCancelled");
                                    currentText += textValue[i];
                                    setValue(field, currentText);
                                    await delay(Math.random() * 25 + 15);
                                }
                                await delay(400);
                            }

                            // Clear only if it's the last field, otherwise keep for smooth transition
                            if (isLast) {
                                setActiveFillingField(null);
                                if (el) el.blur();
                            }
                        }
                    };

                    await delay(500);
                    await fillField("broker", SAMPLE_CORPORATE_1.broker);
                    await fillField("selectProfile", SAMPLE_CORPORATE_1.selectProfile);
                    await fillField("paymentPlatform", SAMPLE_CORPORATE_1.paymentPlatform);

                    await delay(300);
                    await fillField("name", SAMPLE_CORPORATE_1.name || "TechFlow Solutions Inc.");
                    await fillField("provincialOffices", SAMPLE_CORPORATE_1.provincialOffices);

                    await delay(300);
                    if (SAMPLE_CORPORATE_1.policyStartDate) {
                        await fillField("policyStartDate", new Date(SAMPLE_CORPORATE_1.policyStartDate).toISOString().split('T')[0]);
                    }
                    await fillField("contactEmail", SAMPLE_CORPORATE_1.contactEmail);

                    await delay(300);
                    if (SAMPLE_CORPORATE_1.address) {
                        await fillField("address.street1", SAMPLE_CORPORATE_1.address.street1);
                        if (SAMPLE_CORPORATE_1.address.unit) await fillField("address.unit", SAMPLE_CORPORATE_1.address.unit);

                        await fillField("address.city", SAMPLE_CORPORATE_1.address.city);
                        await fillField("address.country", SAMPLE_CORPORATE_1.address.country);
                        await fillField("address.province", SAMPLE_CORPORATE_1.address.province);
                        await fillField("address.postalCode", SAMPLE_CORPORATE_1.address.postalCode);
                    }

                    await delay(300);
                    if (SAMPLE_CORPORATE_1.contacts && SAMPLE_CORPORATE_1.contacts.length > 0) {
                        const contact = SAMPLE_CORPORATE_1.contacts[0];
                        await fillField("contacts.0.firstName", contact.firstName);
                        await fillField("contacts.0.lastName", contact.lastName);
                        await fillField("contacts.0.phone", contact.phone);
                        // Added email autofill as per request
                        await fillField("contacts.0.email", contact.email);

                        // Autofill Role (Moved before Enrollment policies)
                        await delay(300);
                        await fillField("contacts.0.role", "HR Admin Access");
                    }

                    await fillField("waitingPeriodInitial", SAMPLE_CORPORATE_1.waitingPeriodInitial ? "yes" : "no");
                    await fillField("waitingPeriodNewHires", SAMPLE_CORPORATE_1.waitingPeriodNewHires);
                    await fillField("defineCoverageTiers", SAMPLE_CORPORATE_1.defineCoverageTiers ? "yes" : "no");
                    await fillField("paymentMethod", SAMPLE_CORPORATE_1.paymentMethod);
                    await fillField("showEmployerName", SAMPLE_CORPORATE_1.showEmployerName ? "yes" : "no");
                    await fillField("employeeCount", SAMPLE_CORPORATE_1.employeeCount || 150, true);

                    // Final Step: Submit Button Highlight
                    await delay(500);
                    setIsSubmittingHighlighted(true);
                    setIsWorkflowActive(false);

                    const finalMsg = "Excellent. This HR contact is now configured. Please click the 'Save & Next' button below to navigate to the next step.";
                    openChat(finalMsg, true); // Silent mode to prevent repetition

                    await new Promise(resolve => setTimeout(resolve, 500));
                    setActiveFillingField("submit-button");

                    // Wait for speech to finish completely
                    await speak(finalMsg);

                    // Professional pause after speech finishes
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // Navigate now that speech is done
                    if (isWorkflowActiveRef.current) {
                        localStorage.setItem("max_guide_step", "tier_config");
                        handleSubmit(onSubmit)();
                    }

                    // Add to cleanup or tracking if needed
                    return;
                } catch (e: any) {
                    if (e.message === "WorkflowCancelled") {
                        console.log("Workflow cancelled");
                        // Reset local workflow states
                        setActiveFillingField(null);
                        setIsSubmittingHighlighted(false);
                        // Optional: stop speech if still going
                        // stopSpeech(); // imported from google-tts
                    } else {
                        console.error("Workflow error:", e);
                    }
                }
            };

            // Only run if fields are empty to avoid overwriting user edits
            // But for "Use Sample Data" flow, strictly following the script is better
            runGuide();

            // Clear step prevents re-running on refresh, but we might want to keep it until flow is done
            // For now, we rely on the logic running once effectively.
            localStorage.removeItem("max_guide_step");
        }
    }, [setValue]);

    useEffect(() => {
        // Step 2: When role is selected, finish guide and prepare for save
        // Logic moved into runGuide for automated flow
    }, [emailValue, roleValue, isEmailHighlighted, isRoleHighlighted, setValue, handleSubmit]);

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        try {
            // If the guide was active or recently finished, signal the next step
            if (activeFillingField || isSubmittingHighlighted) {
                localStorage.setItem("max_guide_step", "tier_config");
            }

            updateCorporateInfo({
                broker: data.broker,
                name: data.name,
                policyStartDate: new Date(data.policyStartDate),
                contactEmail: data.contactEmail,
                address: data.address,
                contacts: data.contacts,
                waitingPeriodInitial: data.waitingPeriodInitial === "" ? null : data.waitingPeriodInitial === "yes",
                waitingPeriodNewHires: data.waitingPeriodNewHires as any,
                defineCoverageTiers: data.defineCoverageTiers === "" ? null : data.defineCoverageTiers === "yes",
                paymentMethod: data.paymentMethod as any,
                showEmployerName: data.showEmployerName === "" ? null : data.showEmployerName === "yes",
                employeeCount: (data.employeeCount === "" || data.employeeCount === null || data.employeeCount === undefined) ? null : Number(data.employeeCount),
                corporateInfoCompleted: true,

                // New fields
                selectProfile: data.selectProfile,
                provincialOffices: data.provincialOffices,
                paymentPlatform: data.paymentPlatform
            });
            setActiveFillingField(null);
            setIsSubmittingHighlighted(false);
            engine.setSetupStage("TIERS");
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-2 relative">
            {/* Guidance Progress Bar */}
            {(isEmailHighlighted || isRoleHighlighted || isSubmittingHighlighted) && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 rounded-t-xl overflow-hidden z-[100]">
                    <div
                        className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                        style={{
                            width: isSubmittingHighlighted ? "100%" : isRoleHighlighted ? "75%" : "50%"
                        }}
                    />
                </div>
            )}

            {/* Header */}
            <div className="bg-[#0a1e3b] px-4 py-2.5 rounded-t-xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/90">Corporate Customer Info</h3>
            </div>

            {/* Main Form Area - White Background */}
            <div className="bg-white p-4 grid gap-4">

                {/* Row 1: Broker, Select Profile, Payment Platform */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Broker</label>
                        <select
                            id="broker"
                            {...register("broker")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-500",
                                activeFillingField === "broker" ? "border-blue-500 ring-4 ring-blue-500/30 bg-blue-50/50 scale-[1.05] shadow-xl z-10" : "border-gray-300 bg-gray-50"
                            )}
                        >
                            <option value="">Select</option>
                            <option value="Sarah Johnson-ADVISOR-1001">Sarah Johnson-ADVISOR-1001</option>
                            <option value="Emily Davis-ADVISOR-1002">Emily Davis-ADVISOR-1002</option>
                            <option value="David Miller-ADVISOR-1003">David Miller-ADVISOR-1003</option>
                            <option value="James Anderson-ADVISOR-1004">James Anderson-ADVISOR-1004</option>
                            <option value="John-ADVISOR-1005">John-ADVISOR-1005</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Insurance Type</label>
                        <select
                            id="selectProfile"
                            {...register("selectProfile")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-500",
                                activeFillingField === "selectProfile" ? "border-blue-500 ring-4 ring-blue-500/30 bg-blue-50/50 scale-[1.05] shadow-xl z-10" : "border-gray-300 bg-gray-50"
                            )}
                        >
                            <option value="">Select</option>
                            {profileOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Payment Gateway</label>
                        <select
                            id="paymentPlatform"
                            {...register("paymentPlatform")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-500",
                                activeFillingField === "paymentPlatform" ? "border-blue-500 ring-4 ring-blue-500/30 bg-blue-50/50 scale-[1.05] shadow-xl z-10" : "border-gray-300 bg-gray-50"
                            )}
                        >
                            <option value="AuthorizeNet">AuthorizeNet</option>
                            <option value="Stripe">Stripe</option>
                        </select>
                    </div>
                </div>

                {/* Row 2: Name of Corporation, Provincial offices */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Name of Corporation*</label>
                        <input
                            id="name"
                            {...register("name")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                activeFillingField === "name" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                            placeholder="Name of Corporation"
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Offices in Operation*</label>
                        <select
                            id="provincialOffices"
                            {...register("provincialOffices")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                activeFillingField === "provincialOffices" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                        >
                            <option value="">Select</option>
                            <option value="Toronto">Toronto</option>
                            <option value="Vancouver">Vancouver</option>
                            <option value="Montreal">Montreal</option>
                            <option value="Calgary">Calgary</option>
                            <option value="Ottawa">Ottawa</option>
                            <option value="Edmonton">Edmonton</option>
                        </select>
                        {errors.provincialOffices && <p className="text-xs text-red-500 mt-0.5">{errors.provincialOffices.message}</p>}
                    </div>
                </div>

                {/* Row 3: Start Date, Email, Street Address */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Policy Start Date*</label>
                        <input
                            id="policyStartDate"
                            type="date"
                            {...register("policyStartDate")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                activeFillingField === "policyStartDate" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Contact Email*</label>
                        <input
                            id="contactEmail"
                            type="email"
                            {...register("contactEmail")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                activeFillingField === "contactEmail" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                            placeholder="Contact Email"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Street Address*</label>
                        <input
                            id="address.street1"
                            {...register("address.street1")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                activeFillingField === "address.street1" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                            placeholder="Street Address"
                        />
                    </div>
                </div>

                {/* Row 4: Street Address 2, Unit/Apt, City */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Street Address Line 2</label>
                        <input
                            id="address.street2"
                            {...register("address.street2")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                activeFillingField === "address.street2" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                            placeholder="Street Address Line 2"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Unit/Apt/Suite #</label>
                        <input
                            id="address.unit"
                            {...register("address.unit")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                activeFillingField === "address.unit" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                            placeholder="Unit/Apt/Suite #"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">City*</label>
                        <input
                            id="address.city"
                            {...register("address.city")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                activeFillingField === "address.city" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                            placeholder="City"
                        />
                    </div>
                </div>

                {/* Row 5: Country, Province, Postal Code */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Country*</label>
                        <select
                            id="address.country"
                            {...register("address.country")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                activeFillingField === "address.country" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                        >
                            <option value="Canada">Canada</option>
                            <option value="USA">USA</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Province*</label>
                        <select
                            id="address.province"
                            {...register("address.province")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                activeFillingField === "address.province" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                        >
                            <option value="">Select</option>
                            {selectedCountry === "Canada" ? (
                                CANADA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)
                            ) : (
                                US_STATES.map(s => <option key={s} value={s}>{s}</option>)
                            )}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Postal Code*</label>
                        <input
                            id="address.postalCode"
                            {...register("address.postalCode")}
                            className={clsx(
                                "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300 shadow-sm",
                                activeFillingField === "address.postalCode" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                            )}
                            placeholder="Postal Code"
                        />
                    </div>
                </div>

            </div>

            {/* Group Contacts Section */}
            <div className="mt-4">
                <div className="bg-[#0a1e3b] px-4 py-2.5 rounded-t-xl">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/90">HR Benefits Contacts</h3>
                </div>
                <div className="bg-white p-4 space-y-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-5 gap-2">
                            <div>
                                <label className="block text-xs text-red-500 mb-1">First Name*</label>
                                <input
                                    id={`contacts.${index}.firstName`}
                                    {...register(`contacts.${index}.firstName`)}
                                    className={clsx(
                                        "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                        activeFillingField === `contacts.${index}.firstName` ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                                    )}
                                    placeholder="First Name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-red-500 mb-1">Last Name*</label>
                                <input
                                    id={`contacts.${index}.lastName`}
                                    {...register(`contacts.${index}.lastName`)}
                                    className={clsx(
                                        "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                        activeFillingField === `contacts.${index}.lastName` ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                                    )}
                                    placeholder="Last Name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-red-500 mb-1">Phone Number*</label>
                                <input
                                    id={`contacts.${index}.phone`}
                                    {...register(`contacts.${index}.phone`)}
                                    className={clsx(
                                        "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                        activeFillingField === `contacts.${index}.phone` ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                                    )}
                                    placeholder="Phone Number"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-red-500 mb-1">Email*</label>
                                <input
                                    id={`contacts.${index}.email`}
                                    {...register(`contacts.${index}.email`)}
                                    className={clsx(
                                        "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                        isEmailHighlighted && index === 0
                                            ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105"
                                            : "border-gray-300 bg-gray-50"
                                    )}
                                    placeholder="Email"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-red-500 mb-1">Role*</label>
                                <select
                                    id={`contacts.${index}.role`}
                                    {...register(`contacts.${index}.role`)}
                                    className={clsx(
                                        "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300",
                                        isRoleHighlighted && index === 0
                                            ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105"
                                            : "border-gray-300 bg-gray-50"
                                    )}
                                >
                                    <option value="">Select</option>
                                    <option value="Accountant">Accountant</option>
                                    <option value="Executive">Executive</option>
                                    <option value="Plan Administrator">Plan Administrator</option>
                                    <option value="System Administrator">System Administrator</option>
                                    <option value="Wellness Champion">Wellness Champion</option>
                                    <option value="HR Admin Access">HR Admin Access</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Enrollment Section */}
            <div className="mt-4">
                <div className="bg-[#0a1e3b] px-4 py-2.5 rounded-t-xl">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/90">Enrollment Policies</h3>
                </div>
                <div className="bg-white p-4 flex gap-8">
                    <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-2 font-medium">Waiting Period for Initial Enrollment</label>
                        <div
                            id="waitingPeriodInitial"
                            className={clsx(
                                "flex gap-6 items-center p-2 rounded-lg transition-all duration-300",
                                activeFillingField === "waitingPeriodInitial" ? "ring-2 ring-blue-500/20 bg-blue-50/50 scale-[1.02]" : ""
                            )}>
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input type="radio" value="yes" {...register("waitingPeriodInitial")} className="text-blue-600 focus:ring-blue-500" /> Yes
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input type="radio" value="no" {...register("waitingPeriodInitial")} className="text-blue-600 focus:ring-blue-500" /> No
                            </label>
                            {errors.waitingPeriodInitial && <span className="text-xs text-red-500 font-bold ml-2">*{errors.waitingPeriodInitial.message}</span>}
                        </div>
                    </div>

                    <div className="flex-[2]">
                        <label className="block text-xs text-gray-600 mb-2 font-medium">Waiting Period for New Hires</label>
                        <div
                            id="waitingPeriodNewHires"
                            className={clsx(
                                "flex gap-4 items-center p-2 rounded-lg transition-all duration-300",
                                activeFillingField === "waitingPeriodNewHires" ? "ring-2 ring-blue-500/20 bg-blue-50/50 scale-[1.02]" : ""
                            )}>
                            {["None", "Three Months", "Six Months", "Custom"].map(opt => (
                                <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <input type="radio" value={opt} {...register("waitingPeriodNewHires")} className="text-blue-600 focus:ring-blue-500" /> {opt}
                                </label>
                            ))}
                            {errors.waitingPeriodNewHires && <span className="text-xs text-red-500 font-bold ml-2">*{errors.waitingPeriodNewHires.message}</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Define Plan Coverage */}
            <div className="mt-4">
                <div className="bg-[#0a1e3b] px-4 py-2.5 rounded-t-xl">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/90">Define Coverage Tiers</h3>
                </div>
                <div className="bg-white p-4">
                    <div
                        id="defineCoverageTiers"
                        className={clsx(
                            "flex gap-6 items-center p-2 rounded-lg transition-all duration-300",
                            activeFillingField === "defineCoverageTiers" ? "ring-2 ring-blue-500/20 bg-blue-50/50 scale-[1.02]" : ""
                        )}>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="radio" value="yes" {...register("defineCoverageTiers")} className="text-blue-600" /> Yes
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input type="radio" value="no" {...register("defineCoverageTiers")} className="text-blue-600 focus:ring-blue-500" /> No
                        </label>
                        {errors.defineCoverageTiers && <span className="text-xs text-red-500 font-bold ml-2">*{errors.defineCoverageTiers.message}</span>}
                    </div>
                </div>
            </div>


            {/* Bottom Grid: Payment Info, Employer Name, Employees | Corporate Logo */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div className="mt-4">
                        <div className="bg-[#0a1e3b] px-4 py-2.5 rounded-t-xl">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white/90">Payment Information</h3>
                        </div>
                        <div className="bg-white p-4">
                            <div
                                id="paymentMethod"
                                className={clsx(
                                    "flex gap-4 p-2 rounded-lg transition-all duration-300",
                                    activeFillingField === "paymentMethod" ? "ring-2 ring-blue-500/20 bg-blue-50/50 scale-[1.02]" : ""
                                )}>
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input type="radio" value="Credit Card" {...register("paymentMethod")} className="text-blue-600" /> Credit Card
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input type="radio" value="Pre Authorized Debit" {...register("paymentMethod")} className="text-blue-600" /> Pre-Authorized Debit
                                </label>
                                {errors.paymentMethod && <span className="text-xs text-red-500 font-bold ml-2">*{errors.paymentMethod.message}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Show Employer Name & No. of Employees */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="bg-[#0a1e3b] px-4 py-2.5 rounded-t-xl">
                                <h3 className="text-xs font-black uppercase tracking-widest text-white/90">Show Employer Name?</h3>
                            </div>
                            <div className="bg-white p-4">
                                <div
                                    id="showEmployerName"
                                    className={clsx(
                                        "flex gap-6 p-2 rounded-lg transition-all duration-300",
                                        activeFillingField === "showEmployerName" ? "ring-2 ring-blue-500/20 bg-blue-50/50 scale-[1.02]" : ""
                                    )}>
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input type="radio" value="yes" {...register("showEmployerName")} className="text-blue-600" /> Yes
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input type="radio" value="no" {...register("showEmployerName")} className="text-blue-600" /> No
                                    </label>
                                    {errors.showEmployerName && <span className="text-xs text-red-500 font-bold ml-2">*{errors.showEmployerName.message}</span>}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="bg-[#0a1e3b] px-4 py-2.5 rounded-t-xl">
                                <h3 className="text-xs font-black uppercase tracking-widest text-white/90">Employee Count</h3>
                            </div>
                            <div className="bg-white p-4">
                                <input
                                    type="text"
                                    {...register("employeeCount")}
                                    className={clsx(
                                        "w-full rounded border px-3 py-1.5 text-sm transition-all duration-300 shadow-sm",
                                        activeFillingField === "employeeCount" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 scale-[1.02] shadow-md" : "border-gray-300 bg-gray-50"
                                    )}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="bg-[#0a1e3b] px-4 py-2.5 rounded-t-xl">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/90">Corporate Logo</h3>
                    </div>
                    <div className="bg-white p-4 h-[calc(100%-40px)] flex items-center justify-center">
                        <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-center p-4 hover:bg-gray-50 cursor-pointer">
                            <span className="text-xs text-gray-500">Click to upload company logo. Max 300x100 px (.png, .jpg)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6">
                <button
                    id="submit-button"
                    type="submit"
                    disabled={isSaving}
                    className={clsx(
                        "flex items-center gap-2 rounded-xl px-4 md:px-8 pt-14 md:pt-0 py-3 text-sm font-bold text-white transition-all duration-300 disabled:opacity-50",
                        isSubmittingHighlighted
                            ? "bg-[#0a1e3b] ring-4 ring-blue-900/40 scale-105 shadow-[0_0_20px_rgba(10,30,59,0.4)]"
                            : "bg-[#0a1e3b] hover:bg-blue-900 shadow-lg shadow-blue-900/20 hover:shadow-xl hover:-translate-y-0.5"
                    )}
                    onClick={() => {
                        if (timerRef.current) clearInterval(timerRef.current);
                        setCountdown(null);
                    }}
                >
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save & Next →
                </button>
            </div>
            {/* Refined Arrow Pointer Indicator (Follows pointerPos state) */}
            {activeFillingField && pointerPos && (
                <div
                    className="absolute z-[10000] pointer-events-none transition-all duration-500 ease-in-out"
                    style={{
                        left: pointerPos.left,
                        top: pointerPos.top - 10,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <div className="relative flex flex-col items-center animate-Nina-pointer-float">
                        {/* The Sharp Pointer Icon - Rotated to point directly down */}
                        <div className="text-red-500 filter drop-shadow-[0_4px_12px_rgba(239,68,68,0.4)] transform rotate-[225deg]">
                            <MousePointer2 className="w-6 h-6 fill-red-500" />
                        </div>

                        {/* Smooth Pulse Animation (Restored to centered halo) */}
                        <div className="absolute inset-0 -m-1 rounded-full bg-red-500 animate-ping opacity-20 scale-125" />
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes Nina-pointer-float {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-8px); }
                }
                .animate-Nina-pointer-float {
                  animation: Nina-pointer-float 1.5s ease-in-out infinite;
                }
            `}</style>
        </form>
    );
}
