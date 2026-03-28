# UI Pixel-Perfect Implementation Status

## ✅ Image 1: Corporate Customer Info Form - COMPLETED

### Exact UI Match:
- ✅ **Dark Navy Headers** (`#1e3a5f`) on all sections
- ✅ **3-Column Layout**: 2 columns for main form + 1 column for side panels
- ✅ **Compact Spacing**: Reduced padding and gaps
- ✅ **White Section Backgrounds**
- ✅ **Small Input Fields**: `py-1.5` instead of `py-2`
- ✅ **Text Size**: Labels are `text-xs`, inputs are `text-sm`

### Sections Implemented:
1. ✅ **Corporate Customer Info** - Dark navy header, 2-column grid
2. ✅ **Group Contacts** - 5-column layout (First, Last, Phone, Email, Role)
3. ✅ **Enrollment start date** - Radio buttons for waiting periods
4. ✅ **Define Plan Coverage** - Yes/No radio
5. ✅ **Payment Information** - Credit Card / Pre Authorized Debit radio
6. ✅ **Show Employer Name** - Yes/No radio
7. ✅ **No. of Employees** - Number input

### Right Side Panels:
1. ✅ **Guest Profile** - Search, Provincial offices, Street Address
2. ✅ **Payment Options** - Subscription dropdown
3. ✅ **Corporate Logo** - Dashed border upload box

### Button:
- ✅ **Save & Next** - Dark navy background (`#1e3a5f`)

---

## 🔄 Image 2: Manage Tiers Table - NEEDS UPDATE

### Required Changes:
- [ ] Clean white table with gray header row
- [ ] Columns: S.no | Tier Name | Time of Service | Member Count | Plans | Link | Wallet | Status | Actions
- [ ] Edit/Delete icons on the right (colored icons visible in screenshot)
- [ ] "Previous" button bottom-left
- [ ] "Next" button bottom-right
- [ ] Remove current card-based layout

---

## 🔄 Image 3: Setup Status Gauges - NEEDS UPDATE

### Required Changes:
- [ ] Three circular gauge charts (not simple cards)
- [ ] Green gauge showing "50" for Status
- [ ] Gray gauge showing "--" for Employees Enrolled
- [ ] Gray gauge showing "0 FE" for Expected Premium
- [ ] Labels below each gauge
- [ ] "Previous" and "Next" buttons at bottom

---

## 🔄 Image 4 & 5: Tier Editor Panel - NEEDS MAJOR UPDATE

### Required Changes:
- [ ] **Full-screen modal** (not inline panel)
- [ ] Top bar with "Edit Tier" title and user info on right
- [ ] **Tier Configuration** section with fields in horizontal layout:
  - Tier Name | Description | Status | Effective Date | Length of Service
- [ ] **Save** button on the right of this section

### Plan Sections:
1. [ ] **Corporate Level Group Plans**
   - Two dropdowns side-by-side: "Mental Health & Wellbeing" + "Emergency Travel Protection"
   - Expandable plan list below with checkboxes
   - Each plan shows: Checkbox | Plan Name | Variants (Single/Couple/Family with radio buttons)

2. [ ] **Core Plans** (100% premium paid directly by employer)
   - Three dropdowns: "Private Health" | "Health & Dental Insurance" | "Mental Health & Wellbeing" | "Life & Disability Protection"
   - Checkbox list of plans below

3. [ ] **Upgrade Plans**
   - Enable: Yes/No radio buttons
   - When enabled, show category dropdowns

4. [ ] **Voluntary Plans**
   - Enable: Yes/No radio buttons  
   - When enabled, show category dropdowns and plan list

### Bottom Actions:
- [ ] "Close" button bottom-right

---

## Current Implementation Status

### ✅ Completed (1/6 stages pixel-perfect):
1. **Stage 1: Corporate Info Form** - Matches Image 1 exactly

### 🔄 Needs Rebuild (5/6 stages):
2. **Stage 2: Tier Table** - Current implementation doesn't match Image 2
3. **Stage 2: Tier Editor** - Current implementation doesn't match Images 4 & 5
4. **Stage 3: Setup Status** - Current implementation doesn't match Image 3
5. **Stage 4: Subdomain Modal** - Not shown in images, keeping current
6. **Stage 5: Admin Invite** - Not shown in images, keeping current
7. **Stage 6: Overview** - Not shown in images, keeping current

---

## Next Steps

1. ✅ Corporate Info Form - DONE
2. ⏭️ Rebuild TierTable to match Image 2
3. ⏭️ Rebuild TierEditorPanel to match Images 4 & 5
4. ⏭️ Rebuild SetupStatus to match Image 3
5. ⏭️ Test full flow

---

## Technical Notes

### Color Palette from Screenshots:
- **Navy Header**: `#1e3a5f`
- **Navy Hover**: `#2a4a75`
- **Table Header**: `#f3f4f6` (gray-100)
- **Border**: `#d1d5db` (gray-300)
- **Text Primary**: `#111827` (gray-900)
- **Text Secondary**: `#6b7280` (gray-500)

### Typography:
- **Headers**: `text-sm font-semibold`
- **Labels**: `text-xs text-gray-600`
- **Inputs**: `text-sm`

### Spacing:
- **Section Padding**: `p-4`
- **Header Padding**: `px-4 py-2`
- **Input Padding**: `px-3 py-1.5`
- **Gap Between Sections**: `gap-4`

---

**Status**: 1 of 6 stages pixel-perfect ✅  
**Next**: Rebuild remaining 3 visible stages to match screenshots
