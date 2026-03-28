export type SetupStage =
    | "CORPORATE_INFO"
    | "TIERS"
    | "SETUP_STATUS"
    | "SUBDOMAIN"
    | "ADMINS"
    | "OVERVIEW";

export interface Plan {
    id: string;
    name: string;
    category: string;
    type: "CORPORATE" | "CORE" | "UPGRADE" | "VOLUNTARY";
    variant?: "Single" | "Couple" | "Family";
    headcount?: number;
    isChecked?: boolean;
}

export interface Tier {
    id: string;
    name: string;
    description: string;
    status: "Active" | "Inactive" | "Draft";
    effectiveDate: string | null;
    lengthOfService: string;
    plans: {
        corporate: Plan[];
        core: Plan[];
        upgrade: Plan[];
        voluntary: Plan[];
    };
    enableUpgradePlans?: boolean;
    enableVoluntaryPlans?: boolean;
    isValid: boolean;
}

export interface CorporateUser {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    role: string;
}

export interface CorporateAddress {
    street1: string;
    street2?: string;
    unit?: string;
    city: string;
    province: string;
    country: string;
    postalCode: string;
}

export interface Corporate {
    id: string;
    stage: SetupStage;

    // Stage 1 Fields
    broker?: string;
    name: string;
    policyStartDate: Date | null;
    contactEmail: string;
    address: CorporateAddress;

    contacts: CorporateUser[];

    waitingPeriodInitial: boolean | null;
    waitingPeriodNewHires: "None" | "Three Months" | "Six Months" | "Custom" | null;

    defineCoverageTiers: boolean | null;

    paymentMethod: "Credit Card" | "Pre Authorized Debit" | null;

    showEmployerName: boolean | null;
    employeeCount: number | null;

    // New UI Integrations
    selectProfile?: string;
    provincialOffices?: string;
    paymentPlatform?: string;


    corporateInfoCompleted: boolean;

    // Stage 2 Fields
    tiers: Tier[];
    hasValidPlans: boolean;

    // Stage 4 Fields
    subdomain?: string;

    // Stage 5 Fields
    admins: string[];
}
