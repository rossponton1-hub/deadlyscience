# DeadlyScience Prototype Audit (v2)

_Date: 2024-05-17_

## A) Workflow Overview
```
School Request Form ──▶ Resource Dispatch (shipments)
        │
        ▼
Session Setup ──▶ Session Finder (optional lookup)
        │                  │
        ├────▶ Deliver Session (In_Person)
        │          │
        │          └────▶ Data Completeness
        │                           │
        └────▶ Deliver Virtual ─────┘
                                    │
                                    ▼
                      Impact Dashboard / Eligibility Dashboard
```
- **Primary flow:** Create Session in **Session Setup**, capture outcomes in **Deliver Session** (In_Person) or **Deliver Virtual**, reconcile outstanding items in **Data Completeness**, then monitor performance via **Impact** and **Eligibility** dashboards.
- **Deep-link behaviour:** Deliver pages accept `session`, `school`, and `source` query parameters; Data Completeness constructs URLs with the same keys, enabling round-trips between monitoring and delivery. Session Finder also injects query parameters when routing to delivery pages.
- **Componentisation assessment:** Filters, chips, and picklists are currently defined page-by-page without shared configuration. Aligning with Salesforce requires centralising enumerations and filter presets so Lightning components (or LWC) can reference a single source of truth.

## B) Filters & Status Alignment
| Context | Current values observed | Issues | Required canonical values |
| --- | --- | --- | --- |
| **Session__c.Status__c** | Session Setup: Draft, Confirmed, In Progress, Completed, Cancelled; Deliver pages: Scheduled/Delivered chips; Data Completeness: Not delivered/Partially complete labels | Divergent vocabulary, mixing planning and monitoring language | Planned, Scheduled, Delivered, Cancelled |
| **Session_School__c.Status__c** | In-person dropdown: Delivered, Didn’t Attend, Cancelled, Rescheduled; Virtual state: pending, submitted, won’t submit, didn’t attend; Data Completeness: Missing/Partially Complete text | Apostrophes, mismatched casing, no Wont_Submit in in-person UI, monitoring uses prose not codes | Delivered, No_Show, Cancelled, Rescheduled, Wont_Submit |
| **Delivery_Type__c** | Session Setup allows In-Person, Virtual, Hybrid; documentation references “Blended” | Hybrid/Blended must be removed per scope | In_Person, Virtual |
| **Demographics_Status__c** | Deliver Session: Pending/Complete flags; Deliver Virtual: pending/submitted/won’t submit; Data Completeness: Missing / Partially complete | Values differ, Not_Applicable absent, no explicit Reminded state | Pending, Reminded, Submitted, Wont_Submit, Not_Applicable |
| **Universal date presets** | Deliver pages: Past 7 Days / Next 90 Days / This Year (no Custom Range); Session Finder: Upcoming / Last 14 / Last 30 / This Year; Data Completeness: Last 30 / Last 60 / Last 90 / All Time | No shared logic, missing Custom Range everywhere, inconsistent look-back windows | Last_7_Days, Next_90_Days, This_Year, Custom_Range |
| **Program / grant filters** | Impact: lowercase `deadlylabs`; Eligibility: Title case `DeadlyLabs`; other pages mix case | Casing mismatch breaks shared SOQL queries | Canonical codes (e.g., DeadlyLabs, MarineScience) reused everywhere |
| **Dashboard filters vs schema** | Impact chips include domains and demographic percentages; Eligibility adds ARIA, ICSEA, grant presets, state multi-select | Need confirmation each filter maps to an existing Salesforce field; ATSI filter exposes tri-state (“Both/One/None”) conflicting with percent requirement | Limit filters to defined schema: program, grant, school, domain chips, demographic percentage thresholds, eligibility status, state |

## C) Field Naming & API Mapping
| UI label / variable | Observed usage | Salesforce API field |
| --- | --- | --- |
| TotalStudents, totalStudents, `TotalStudents` alert text | Deliver Session inputs, Data Completeness summaries | `Total_Students__c` |
| ATSIStudents, ATSI_Count, `atsiStudents` | Deliver Session + dashboards | `ATSI_Students__c` |
| YearLevels, `selectedYearLevels` | Multi-checkbox arrays, summaries | `Year_Levels__c` |
| StudentSurveyStatus, TeacherFeedback | Delivery completion banners | `Student_Survey_Status__c`, `Teacher_Feedback_Status__c` |
| DemographicsSource / `demographicSource` | Not explicitly rendered but implied by mode | `Demographics_Source__c` (Presenter, Teacher_Link) |
| Status chips (“Pending”, “Submitted”, “Won’t Submit”) | Button labels and `data-status` attributes | `Demographics_Status__c` |
| Mode badges (“In-Person”, “Virtual”, “Blended”) | Session lists and detail panels | `Delivery_Type__c` |
| Reminder copy (“24hr/48hr/72hr reminder emails”) | Deliver pages + Data Completeness banners | Should reference Salesforce Time-Based Workflow / Flow; align to `Reminder_Cadence__c` (if created) |
| Resource Dispatch status (Draft, Packed, Dispatched, Delivered, Cancelled) | Resource dispatch cards | `Shipment__c.Status__c` |
| School Lookup dispatch flag (“Add to Dispatch”) | CTA button | Replace with read-only indicator tied to `Session_School__c.Shipment_Linked__c` |

## D) Page-Level Findings & Tooltip Targets
### Session Setup (`session_setup.html`)
- Status picklist includes Draft/Confirmed/In Progress/Completed; must map to Planned/Scheduled/Delivered/Cancelled.
- Delivery mode dropdown lists Hybrid; remove to comply with In_Person/Virtual only.
- Grant funding multiselect is free-form text; needs alignment with `Grant_Funding__c` values and canonical casing.
- Tooltip opportunity: explain when to transition from Planned → Scheduled and who owns the update.

### Session Finder (`sessions.html`)
- Positioned as primary navigation; per scope it should be an optional utility.
- Status filter chips use `complete/awaiting/incomplete`; these must translate to canonical statuses/demographic states.
- Date filters (Upcoming, Last 14/30) diverge from universal presets and lack Custom Range.
- Add tooltip clarifying relationship between “Awaiting” and `Demographics_Status__c` Pending/Reminded.

### Deliver Session – In-Person (`deliver_session.html`)
- Filter presets: Past 7 Days / Next 90 / This Year without Custom Range; need shared component.
- School action dropdown lacks Wont_Submit and displays apostrophes (“Didn’t Attend”). Replace with canonical picklist values.
- Reminder copy promises 24/48/72-hour nudges; Salesforce automation must instead note T+1 and T+3 calendar days and highlight business hours assumption.
- Demographic labels use TotalStudents/ATSI; rename to Salesforce field labels and add tooltip describing presenter-owned data entry.

### Deliver Virtual (`deliver_virtual.html`)
- Same filter gaps as in-person; also references Scheduled/Delivered chips instead of Planned/Scheduled/Delivered.
- Demographics chips mix `wont-submit` class with “Won’t Submit” text; align to `Wont_Submit` string.
- Provide Not_Applicable action per requirements and ensure Demographics_Source__c defaults to Teacher_Link.
- Reminder banner again cites 24/48/72-hour cadence; must match T+1/T+3 schedule and business-hour note.
- Tooltip: clarify teacher submission flow, including automatic reminder cancellation on Submitted or Wont_Submit.

### Data Completeness (`data_completeness.html`)
- Date dropdown lacks Custom Range and uses “Last 30/60/90 days, All Time.”
- Status column uses narrative text (“Not delivered,” “Partially complete”) rather than canonical statuses; needs to reference Session__c.Status__c and Demographics_Status__c values.
- Actions include “Mark Won’t Submit” (apostrophe) but do not expose Not_Applicable.
- Reminder summary mentions 24/48/72 hours; flag need for Salesforce Time-Based Flow using business days assumption.

### Impact Dashboard (`impact_dashboard.html`)
- Program chips use lowercase codes (e.g., `deadlylabs`); must switch to canonical casing.
- ATSI filter allows Both/One/None; requirement is percentage thresholds only.
- Date presets custom to this page; integrate universal Last 7/Next 90/This Year/Custom Range.
- Tooltip placement: define each preset’s timeframe, timezone (AEST), and clarify demographic percentages exclude Wont_Submit.

### Eligibility Dashboard (`eligibility_dashboard.html`)
- Grant presets and program history filters use Title Case; ensure identical values and casing as Impact Dashboard.
- CTA references dispatch integration indirectly; maintain read-only indicator only.
- Tooltips needed for eligibility scoring (ICSEA, ARIA), emphasising data sources and thresholds.

### Resource Dispatch (`resource_dispatch.html`)
- Creation card references “auto-reminders;” requirements state no reminders because Shopify is source of truth.
- Shipments allow Session_Code entry; ensure read-only display of linkage (e.g., chip showing linked session) but no creation from other pages.
- Tooltip: describe each shipment status and clarify manual updates.

### School Lookup (`school_lookup.html`)
- Contains “Add to Dispatch” CTA; must be removed.
- Needs buttons for “Create Session” (prefill school) and “View Sessions” (open Session Finder filtered by school ID).
- Should display read-only dispatch linkage chip if `Session_Code` present.
- Tooltip clarifying eligibility badges and grant presets recommended.

### School Request Form (`school_request_form.html`)
- Confirmation message states submissions create draft shipments automatically; should reflect manual review unless automation exists.
- Ensure any status copy aligns with Session__c.Status__c and Shipment__c.Status__c vocabularies when surfaced.
- Tooltip: inform requester that fulfilment is reviewed by staff and may require additional info.

## E) Recommendations (Priority Order)
1. **Centralise enumerations and filter presets.** Create shared configs for Session__c.Status__c, Session_School__c.Status__c, Demographics_Status__c, Delivery_Type__c, and universal date presets (Last_7_Days, Next_90_Days, This_Year, Custom_Range). Remove Hybrid/Blended references.
2. **Standardise UI copy to Salesforce API field names.** Update labels, validation messages, tooltips, and scripted alerts across delivery, monitoring, and dashboards to use `Total_Students__c`, `ATSI_Students__c`, `Year_Levels__c`, etc., ensuring both delivery modes target identical fields.
3. **Rebuild delivery closure flows.** Add Wont_Submit and Not_Applicable actions to in-person delivery, align virtual states, set Demographics_Source__c defaults (Presenter vs Teacher_Link), and harmonise reminder cadence messaging (T+1 and T+3 calendar days). Document assumption that Salesforce business hours and public holiday handling may be needed.
4. **Implement universal filter component with Custom Range.** Apply to Deliver Session, Deliver Virtual, Session Finder, Data Completeness, Impact, and Eligibility pages. Ensure program/grant filters share casing and only reference available fields.
5. **Revise dashboards for consistency.** Limit ATSI filtering to percentage thresholds, sync grant/program chips across Impact and Eligibility, and ensure reporting tiles use the same denominators (exclude Wont_Submit from outcomes, include in participation counts).
6. **Adjust auxiliary tools.** Replace School Lookup CTA with Create Session / View Sessions, remove dispatch creation shortcuts, show read-only shipment linkage, and align Resource Dispatch copy with Shopify dependency.
7. **Add contextual tooltips and banners.** Provide non-historical hover help for status chips, date presets (with timezone), demographics responsibilities, eligibility logic, and reminder cadence assumptions.

## Reminder & Automation Notes
- Current UI references 24/48/72-hour reminders, but requirements mandate reminders at T+1 day and T+3 days. Salesforce Flow or OmniStudio time-based actions can implement this; confirm business hours (e.g., Mon–Fri 9am–5pm AEST) and note that public holidays are not automatically excluded without custom logic.
- Reminders must cancel automatically when `Demographics_Status__c` becomes Submitted or Wont_Submit.
- Pending records should transition to Reminded after the first scheduled reminder to reflect follow-up status in Data Completeness.
