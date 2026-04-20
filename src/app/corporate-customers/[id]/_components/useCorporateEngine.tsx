"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Corporate, SetupStage, Tier } from "@/lib/types";
import { fetchCorporateById, upsertCorporate } from "@/lib/db";

const INITIAL_TIERS: Tier[] = [
    {
        id: "tier-1",
        name: "Tier 1",
        description: "Standard employee coverage",
        status: "Inactive",
        effectiveDate: null,
        lengthOfService: "0 Months",
        plans: { corporate: [], core: [], upgrade: [], voluntary: [] },
        isValid: false,
    },
    {
        id: "tier-2",
        name: "Tier 2",
        description: "Management coverage",
        status: "Inactive",
        effectiveDate: null,
        lengthOfService: "0 Months",
        plans: { corporate: [], core: [], upgrade: [], voluntary: [] },
        isValid: false, // Default tiers are invalid until plans added
    },
    {
        id: "tier-3",
        name: "Tier 3",
        description: "Executive coverage",
        status: "Inactive",
        effectiveDate: null,
        lengthOfService: "0 Months",
        plans: { corporate: [], core: [], upgrade: [], voluntary: [] },
        isValid: false,
    },
];

const INITIAL_STATE: Corporate = {
    id: "new-corp",
    stage: "CORPORATE_INFO",
    name: "",
    policyStartDate: null,
    contactEmail: "",
    address: {
        street1: "",
        city: "",
        province: "",
        country: "Canada",
        postalCode: "",
    },
    contacts: [],
    waitingPeriodInitial: null,
    waitingPeriodNewHires: null,
    defineCoverageTiers: null,
    paymentMethod: null,
    showEmployerName: false,
    employeeCount: null,
    corporateInfoCompleted: false,
    tiers: INITIAL_TIERS,
    hasValidPlans: false,
    admins: [],
};

export function useCorporateEngine(corporateId: string) {
    const [corporate, setCorporate] = useState<Corporate>({ ...INITIAL_STATE, id: corporateId });
    const [isSaving, setIsSaving] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        if (corporateId !== "new-corp") {
            const loadFromLocal = async () => {
                const localData = await fetchCorporateById(corporateId);
                if (localData) setCorporate(localData);
            };
            loadFromLocal();
        }
    }, [corporateId]);

    // -- Actions --

    const updateCorporateInfo = useCallback((data: Partial<Corporate>) => {
        setCorporate((prev) => {
            const newState = { ...prev, ...data };
            return newState;
        });
    }, []);

    const updateTier = useCallback((tierId: string, updates: Partial<Tier>) => {
        setCorporate((prev) => {
            const newTiers = prev.tiers.map((t) => (t.id === tierId ? { ...t, ...updates } : t));
            // Re-validate overall plan validity
            const hasValidPlans = newTiers.some((t) => t.isValid && t.status === "Active");
            return { ...prev, tiers: newTiers, hasValidPlans };
        });
    }, []);

    const setSetupStage = useCallback(async (newStage: SetupStage) => {
        try {
            setIsSaving(true);

            // Persist the current state to local storage on every stage transition
            if (corporateId !== "new-corp") {
                await upsertCorporate({ ...corporate, stage: newStage });
            }

            setCorporate((prev) => ({ ...prev, stage: newStage }));
        } catch (error) {
            console.error("Error during stage transition:", error);
            setCorporate((prev) => ({ ...prev, stage: newStage }));
        } finally {
            setIsSaving(false);
        }
    }, [corporate, corporateId]);

    // -- Validation & Transitions --

    const attemptAdvance = useCallback(async () => {
        // Logic to determine if we can move to next stage
        switch (corporate.stage) {
            case "CORPORATE_INFO":
                if (corporate.corporateInfoCompleted) {
                    await setSetupStage("TIERS");
                    return true;
                }
                break;
            case "TIERS":
                // Rule: If no Tier.isValid === true AND Active, block
                const anyValid = corporate.tiers.some(t => t.isValid && t.status === "Active");
                if (anyValid) {
                    await setSetupStage("SETUP_STATUS");
                    return true;
                } else {
                    return false;
                }
            case "SETUP_STATUS":
                await setSetupStage("SUBDOMAIN");
                return true;
            case "SUBDOMAIN":
                if (corporate.subdomain) {
                    await setSetupStage("ADMINS");
                    return true;
                }
                break;
            case "ADMINS":
                if (corporate.admins.length > 0) {
                    await setSetupStage("OVERVIEW");
                    return true;
                }
                break;
        }
        return false;
    }, [corporate, setSetupStage]);

    const addTier = useCallback(() => {
        const newTier: Tier = {
            id: `tier-${Date.now()}`,
            name: "",
            description: "",
            status: "Inactive",
            effectiveDate: null,
            lengthOfService: "0 Months",
            plans: { corporate: [], core: [], upgrade: [], voluntary: [] },
            isValid: false
        };
        setCorporate(prev => ({ ...prev, tiers: [...prev.tiers, newTier] }));
        return newTier.id;
    }, []);

    const deleteTier = useCallback((tierId: string) => {
        setCorporate(prev => {
            const newTiers = prev.tiers.filter(t => t.id !== tierId);
            const hasValidPlans = newTiers.some((t) => t.isValid && t.status === "Active");
            return { ...prev, tiers: newTiers, hasValidPlans };
        });
    }, []);

    return {
        corporate,
        isSaving,
        updateCorporateInfo,
        updateTier,
        addTier,
        deleteTier,
        setSetupStage,
        attemptAdvance,
    };
}
