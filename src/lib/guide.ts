// Single source of truth for the live onboarding walkthrough.
// Components push each spoken step here; the right-panel WorkflowCard
// and dialog render directly from this store instead of a hardcoded list.

import { WorkflowStepItem } from "@/context/ChatContext";

export interface OnboardingStepItem extends WorkflowStepItem {
    id: string;
}

interface GuideState {
    title: string;
    steps: OnboardingStepItem[];
    currentIndex: number;
    isCompleted: boolean;
    // Stable total for the "Step X of TOTAL" pill. Components declare how
    // many steps they will add via planWorkflowSteps so the total is known
    // up front and adapts to the number of tiers/data entered.
    totalSteps: number;
}

let state: GuideState = {
    title: "Corporate Customer Onboarding",
    steps: [],
    currentIndex: -1,
    isCompleted: false,
    totalSteps: 0,
};

// Estimated step total for the "Training Mode (Sample Data)" demo flow.
// Used to seed a stable pill count from step 1; planWorkflowSteps lets
// phases add to it, and completeOnboardingGuide locks the real count.
// (greeting 1 + corporate info ~25 + tier editor ~35 + tier table ~2
//  + setup status 6 + corporate overview 1)
export const ONBOARDING_TOTAL_STEPS = 70;

const listeners = new Set<() => void>();

function emit() {
    listeners.forEach((l) => l());
}

export function getOnboardingGuide(): GuideState {
    return state;
}

export function subscribeOnboardingGuide(cb: () => void): () => void {
    listeners.add(cb);
    return () => {
        listeners.delete(cb);
    };
}

/**
 * Declare how many steps an upcoming phase will add. This keeps the
 * "Step X of TOTAL" pill stable (never "Step 1 of 1") and lets the total
 * adapt to the amount of data (e.g. number of tiers).
 */
export function planWorkflowSteps(n: number) {
    if (!n || n <= 0) return;
    state = { ...state, totalSteps: state.totalSteps + n };
    emit();
}

/** Reset the store and start a fresh onboarding run. */
export function resetOnboardingGuide(title: string) {
    state = {
        title,
        steps: [],
        currentIndex: -1,
        isCompleted: false,
        totalSteps: 0,
    };
    emit();
}

/**
 * Append a step. `dialog` is the EXACT text Nina speaks, so the
 * workflow table's dialog and the spoken audio always match.
 * `t` is an optional short title; falls back to the spoken text.
 * `exampleValue` captures what was actually selected/typed for this step
 * (dropdown choice, typed input, date, checkbox, etc.).
 */
export function pushOnboardingStep(
    dialog: string,
    action?: string,
    t?: string,
    exampleValue?: string
) {
    if (!dialog) return;
    const step: OnboardingStepItem = {
        id: `${state.steps.length}-${Date.now()}`,
        t: t ?? dialog,
        dialog,
        action,
        e: dialog,
        x: exampleValue,
    };
    state = {
        ...state,
        steps: [...state.steps, step],
        currentIndex: state.steps.length, // index of the newly added step
    };
    emit();
}

/** Mark the run finished and lock the total to the real step count. */
export function completeOnboardingGuide() {
    state = {
        ...state,
        isCompleted: true,
        totalSteps: state.steps.length,
        currentIndex: state.steps.length - 1,
    };
    emit();
}
