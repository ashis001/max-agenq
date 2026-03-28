"use server";

import { Corporate } from "@/lib/types";

// For demo purposes, we'll use a global variable to persist across sessions (in-memory)
// In a real app, this would be a database.
let corporateDB: Corporate[] = [];

export async function saveCorporateState(id: string, data: Partial<Corporate>) {
    console.log(`[SERVER] Saving state for ${id}:`, data);

    const existingIndex = corporateDB.findIndex(c => c.id === id);
    if (existingIndex > -1) {
        corporateDB[existingIndex] = { ...corporateDB[existingIndex], ...data };
    } else {
        corporateDB.push({ ...data, id } as Corporate);
    }

    return { success: true };
}

export async function submitCorporateSetup(id: string, finalData: Corporate) {
    console.log(`[SERVER] Submitting final setup for ${id}:`, finalData);

    const existingIndex = corporateDB.findIndex(c => c.id === id);
    if (existingIndex > -1) {
        corporateDB[existingIndex] = { ...finalData, stage: "OVERVIEW" };
    } else {
        corporateDB.push({ ...finalData, id, stage: "OVERVIEW" } as Corporate);
    }

    return { success: true };
}

export async function getCorporates() {
    return Array.from(corporateDB);
}

export async function getCorporateById(id: string) {
    return corporateDB.find(c => c.id === id) || null;
}
