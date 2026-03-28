# Corporate Customer Data Analysis

This document provides a detailed breakdown of the data structures and business logic discovered within the corporate customer onboarding module.

## 1. Core Data Structure (`Corporate` Type)

The primary data entity is the `Corporate` interface, which is structured across several setup stages.

| Field | Type | Validation / Constraints | Stage |
| :--- | :--- | :--- | :--- |
| `name` | `string` | Required, min 2 chars | CORPORATE_INFO |
| `broker` | `string` | Selection from registered advisors | CORPORATE_INFO |
| `policyStartDate`| `Date` | Required, must be a valid ISO date | CORPORATE_INFO |
| `contactEmail` | `string` | Required, must be a valid email | CORPORATE_INFO |
| `employeeCount` | `number` | Optional, must be positive | CORPORATE_INFO |
| `paymentMethod` | `Enum` | [Credit Card, Pre Authorized Debit] | CORPORATE_INFO |
| `waitingPeriod` | `Enum` | [None, 3 Months, 6 Months, Custom] | CORPORATE_INFO |

## 2. Dynamic Entities

### HR Benefits Contacts (`CorporateUser`)
Each corporation must have at least one contact.
- **Fields**: `firstName`, `lastName`, `phone`, `email`, `role`.
- **Roles**: [Accountant, Executive, Plan Administrator, System Administrator, Wellness Champion].

### Tiers & Plan Hierarchy (`Tier`, `Plan`)
Tiers allow grouping employees for different benefit eligibility.
- **Plan Categories**:
    - **Corporate Level**: Paid 100% by Employer (e.g., EAP, Travel).
    - **Core Plans**: Standard health/dental coverage.
    - **Upgrade Plans**: Employee-paid difference (via payroll).
    - **Voluntary Plans**: 100% Employee-paid (e.g., High-Cost Drugs).

## 3. Business Logic & Progression

1. **State Persistence**: Data is managed via the `useCorporateEngine` hook and persisted to Supabase via `upsertCorporate`.
2. **Conditional Rendering**:
    - **Upgrade/Voluntary Enablement**: Toggles in the `TierEditorPanel` control whether these sections are visible to employees.
    - **Headcount Tracking**: Corporate-level plans require a `headcount` value for billing and eligibility reporting.
3. **Stage Transitions**: The `stage` field (`CORPORATE_INFO` -> `TIERS` -> `SUBDOMAIN` -> etc.) controls the sidebar navigation and accessibility of specific form sections.

## 4. UI/UX Integrations

- **Searchable Indices**: Corporations are indexed by `name` and `broker` for dashboard filtering.
- **Branding**: The system supports custom `subdomains` (Stage 4) and corporate logos for a white-labeled employee experience.
