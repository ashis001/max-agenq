import { Corporate, Tier, Plan, CorporateUser, CorporateAddress } from "./types";

/**
 * SAMPLE DATA: TECHFLOW SOLUTIONS INC.
 * A fully completed corporate profile with active tiers and plans.
 */
export const SAMPLE_CORPORATE_1: Corporate = {
    id: "techflow-001",
    name: "TechFlow Solutions Inc.",
    stage: "OVERVIEW",
    broker: "James Anderson-ADVISOR-1004",
    selectProfile: "Health Insurance",
    paymentPlatform: "AuthorizeNet",
    provincialOffices: "Toronto",
    policyStartDate: new Date("2026-03-01"),
    contactEmail: "hr@techflow.io",
    address: {
        street1: "123 Tech Square",
        unit: "Suite 400",
        city: "Toronto",
        province: "Ontario",
        country: "Canada",
        postalCode: "M5V 3L9"
    },
    contacts: [
        {
            firstName: "Sarah",
            lastName: "Chen",
            phone: "4165550123",
            email: "sarah.chen@techflow.io",
            role: "Plan Administrator"
        },
        {
            firstName: "Michael",
            lastName: "Ross",
            phone: "4165550124",
            email: "m.ross@techflow.io",
            role: "System Administrator"
        }
    ],
    waitingPeriodInitial: true,
    waitingPeriodNewHires: "Three Months",
    defineCoverageTiers: true,
    paymentMethod: "Credit Card",
    showEmployerName: true,
    employeeCount: 150,
    corporateInfoCompleted: true,
    subdomain: "techflow-benefits",
    admins: ["sarah.chen@techflow.io", "m.ross@techflow.io"],
    hasValidPlans: true,
    tiers: [
        {
            id: "tier-exec",
            name: "Management & Executives",
            description: "Full coverage for senior leadership team",
            status: "Active",
            effectiveDate: "2026-03-01T00:00:00.000Z",
            lengthOfService: "None",
            isValid: true,
            enableUpgradePlans: true,
            enableVoluntaryPlans: true,
            plans: {
                corporate: [
                    { id: "eap3", name: "Max Insurance EAP 3.0", category: "Mental Health", type: "CORPORATE", headcount: 12 },
                    { id: "tr1", name: "Max Insurance Travel", category: "Travel", type: "CORPORATE", variant: "Family", headcount: 12 }
                ],
                core: [
                    { id: "cx1", name: "Complete Executive Care", category: "Health", type: "CORE", headcount: 12 },
                    { id: "gg1", name: "Gateway Gold", category: "Insurance", type: "CORE", variant: "Family", headcount: 12 }
                ],
                upgrade: [
                    { id: "ug_mdc1", name: "Medcan Dedicated Care", category: "Health", type: "UPGRADE", headcount: 5 }
                ],
                voluntary: [
                    { id: "vhcd1", name: "High-Cost Drugs", category: "Drugs", type: "VOLUNTARY", variant: "Family", headcount: 8 }
                ]
            }
        },
        {
            id: "tier-std",
            name: "Standard Employee",
            description: "Standard corporate benefit package",
            status: "Active",
            effectiveDate: "2026-03-01T00:00:00.000Z",
            lengthOfService: "3 Months",
            isValid: true,
            enableUpgradePlans: false,
            enableVoluntaryPlans: true,
            plans: {
                corporate: [
                    { id: "db_core", name: "Dialogue Basic EAP", category: "Mental Health", type: "CORPORATE", headcount: 138 }
                ],
                core: [
                    { id: "gs1", name: "Gateway Silver", category: "Insurance", type: "CORE", variant: "Single", headcount: 80 },
                    { id: "gs1_fam", name: "Gateway Silver", category: "Insurance", type: "CORE", variant: "Family", headcount: 58 }
                ],
                upgrade: [],
                voluntary: [
                    { id: "vhcd1", name: "High-Cost Drugs", category: "Drugs", type: "VOLUNTARY", variant: "Single", headcount: 20 }
                ]
            }
        }
    ]
};

/**
 * SAMPLE DATA: BLUE HORIZON LOGISTICS
 * An in-progress setup currently at the Tiers definition stage.
 */
export const SAMPLE_CORPORATE_2: Corporate = {
    id: "blue-horizon-002",
    name: "Blue Horizon Logistics",
    stage: "TIERS",
    broker: "Sarah Johnson-ADVISOR-1001",
    selectProfile: "Corporate Insurance",
    paymentPlatform: "Stripe",
    provincialOffices: "Vancouver",
    policyStartDate: new Date("2026-05-15"),
    contactEmail: "admin@bluehorizon.logistics",
    address: {
        street1: "456 Logistic Way",
        city: "Vancouver",
        province: "British Columbia",
        country: "Canada",
        postalCode: "V6B 1C1"
    },
    contacts: [
        {
            firstName: "John",
            lastName: "Smith",
            phone: "6045559876",
            email: "j.smith@bluehorizon.logistics",
            role: "Executive"
        }
    ],
    waitingPeriodInitial: false,
    waitingPeriodNewHires: "None",
    defineCoverageTiers: true,
    paymentMethod: "Pre Authorized Debit",
    showEmployerName: false,
    employeeCount: 45,
    corporateInfoCompleted: true,
    hasValidPlans: false,
    tiers: [
        {
            id: "tier-ops",
            name: "Operations Staff",
            description: "Benefits for drivers and warehouse crew",
            status: "Draft",
            effectiveDate: null,
            lengthOfService: "6 Months",
            isValid: false,
            plans: {
                corporate: [],
                core: [],
                upgrade: [],
                voluntary: []
            }
        }
    ],
    admins: []
};

/**
 * SAMPLE DATA: GREEN VALLEY ORGANICS
 * A newly initiated corporate account just starting the info stage.
 */
export const SAMPLE_CORPORATE_3: Corporate = {
    id: "green-valley-003",
    name: "Green Valley Organics",
    stage: "CORPORATE_INFO",
    broker: "Emily Davis-ADVISOR-1002",
    contactEmail: "hello@greenvalley.com",
    corporateInfoCompleted: false,
    hasValidPlans: false,
    address: {
        street1: "",
        city: "",
        province: "",
        country: "Canada",
        postalCode: ""
    },
    contacts: [],
    tiers: [],
    admins: [],
    waitingPeriodInitial: null,
    waitingPeriodNewHires: null,
    defineCoverageTiers: null,
    paymentMethod: null,
    showEmployerName: null,
    employeeCount: null,
    policyStartDate: null
};

export const ALL_SAMPLE_CORPORATES = [
    SAMPLE_CORPORATE_1,
    SAMPLE_CORPORATE_2,
    SAMPLE_CORPORATE_3
];
