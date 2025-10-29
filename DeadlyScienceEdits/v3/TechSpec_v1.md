# DeadlyScience Salesforce Implementation Tech Spec (v1)

## 1. Summary
**Scope:** Configure Salesforce Nonprofit Cloud (with NPSP + Program Management Module) to support the DeadlyScience session lifecycle: planning (Session Setup), delivery (In-Person & Virtual), monitoring (Data Completeness), reporting (Impact & Eligibility Dashboards), logistics visibility (Resource Dispatch), and intake (School Request Form). Deliveries span multi-school sessions with demographic capture and survey outcomes. Universal filter and status vocabularies must be shared across Lightning apps and Experience Cloud surfaces.

**Assumptions:**
- Org already has NPSP + PMM installed; Education Data Architecture not required.
- Schools are represented as `Account` records (Type = School) with Contacts for staff; NPSP Households remain unchanged.
- Shopify remains the shipment system of record; Salesforce stores read-only shipment snapshots via scheduled integration.
- Virtual teacher forms are delivered via Experience Cloud (Salesforce Surveys) with authenticated teacher access links.
- Reminder emails use Salesforce Flow with standard Business Hours (Mon–Fri, 9am–5pm AEST) until further definition; public holidays handled manually.
- Impact reporting leverages standard Salesforce reports/dashboards with possible LWC tiles where standard charting is insufficient.

**Non-Goals:**
- No Apex, OmniStudio, or external middleware beyond declarative ETL (e.g., Data Loader, Mulesoft) for Shopify snapshots.
- No custom mobile app or offline delivery; mobile Lightning UI suffices.
- No automated shipment creation or updates back to Shopify.
- No historical data migration; only net-new data captured under this model.

## 2. Data Model
| Object | Type | Purpose | Key Fields / Notes |
| --- | --- | --- | --- |
| `Account` | Standard | Represents schools and partner organisations. | Use `RecordType = School`. Store ICSEA, ARIA, state via custom fields (`ICSEA_Score__c` Number, `ARIA_Category__c` Picklist, `State__c` Picklist NSW/QLD/etc.). |
| `Contact` | Standard | School contacts, presenters, coordinators. | Link to Accounts. Flag presenters via `Presenter__c` checkbox. |
| `Campaign` | Standard / NPSP | Marketing initiatives or grant-funded cohorts. | Used for grant/program tagging when required. |
| `Program__c` | PMM | Represents a DeadlyScience program offering (e.g., DeadlyLabs). | Use PMM standard fields; add `Canonical_Code__c` (Text, 40) to match chip values. |
| `Program_Engagement__c` | PMM | Tracks school participation in programs (multi-year). | Link `Account` + `Program__c`; store eligibility status via `Eligibility_Status__c` (Picklist). |
| `Service_Delivery__c` | PMM (renamed to Session__c via UI) | Core session record; rename label to “Session”. | Custom fields: `Status__c` (Picklist, GVS), `Delivery_Type__c` (Picklist, GVS), `Scheduled_Date__c` (DateTime), `Program__c` (Lookup to Program__c), `Grant__c` (Lookup to Campaign), `Reminder_Opt_Out__c` (Checkbox). |
| `Session_School__c` | Custom (junction) | Junction between Session and School for multi-school delivery. | Master-Detail to `Service_Delivery__c` and Lookup to `Account`. Fields: `Status__c` (Picklist, GVS), `Attendance__c` (Picklist: Attended, No_Show, Rescheduled), `Demographics_Status__c` (Picklist, GVS), `Demographics_Source__c` (Picklist: Presenter, Teacher_Link), `Total_Students__c` (Number, 3), `ATSI_Students__c` (Number, 3), `Year_Levels__c` (Multi-select Picklist GVS), `Female_Students__c`, `Male_Students__c`, `Non_Binary_Students__c` (Number, 3 each), `Other_Gender_Students__c` (Number,3), `Teacher_Contact__c` (Lookup Contact), `Reminder_Sent_Count__c` (Number,1), `Next_Reminder_Date__c` (Date), `Shipment_Linked__c` (Checkbox), `Shipment__c` (Lookup to Shipment snapshot). |
| `Session_School_Survey__c` | Custom | Stores aggregated survey responses per school session. | Master-Detail to `Session_School__c`. Fields for questions Q1–Q8 (Number 1–5), `Open_Comment__c` (Long Text 4000), `Respondent_Type__c` (Picklist: Student, Teacher), `Response_Count__c` (Number, 3). |
| `Survey_Response__c` | Salesforce Surveys (standard) | Individual survey responses from Salesforce Surveys for teacher submissions. | Map to Session via Flow, aggregated into `Session_School_Survey__c`. |
| `Shipment__c` | Custom (read-only) | Shopify shipment snapshot. | Fields: `Shopify_Order_Number__c` (Text 30), `SKU__c` (Text 50), `Quantity__c` (Number, 6), `Order_Date__c` (Date), `Status__c` (Picklist Draft/Packed/Dispatched/Delivered/Cancelled), `Linked_Session__c` (Lookup Service_Delivery__c). Field-level security read-only. |
| `Reminder_Log__c` | Custom (optional) | Tracks each reminder email for audit. | Master-Detail to `Session_School__c`; fields `Reminder_Date__c` (Date), `Reminder_Type__c` (Picklist: First, Second). |

## 3. Global Value Sets (GVS)
| API Name | Label | Values (pipe-delimited) | Notes |
| --- | --- | --- | --- |
| `Session_Status_GVS` | Session Status | Planned \| Scheduled \| Delivered \| Cancelled | Assigned to `Service_Delivery__c.Status__c`. |
| `Session_School_Status_GVS` | Session School Status | Delivered \| No_Show \| Cancelled \| Rescheduled \| Wont_Submit | Used on `Session_School__c.Status__c`. |
| `Demographics_Status_GVS` | Demographics Status | Pending \| Reminded \| Submitted \| Wont_Submit \| Not_Applicable | Shared across UI states and Data Completeness. |
| `Delivery_Type_GVS` | Delivery Type | In_Person \| Virtual | Applied to `Service_Delivery__c.Delivery_Type__c`. |
| `Year_Level_GVS` | Year Levels (NSW) | Kindergarten \| Year_1 \| Year_2 \| Year_3 \| Year_4 \| Year_5 \| Year_6 \| Year_7 \| Year_8 \| Year_9 \| Year_10 \| Year_11 \| Year_12 | Multi-select on `Session_School__c.Year_Levels__c`. |
| `Program_Code_GVS` | Program Codes | DeadlyLabs \| DeadlyLearners \| MarineScience \| SpaceScience \| STEMOnCountry | Used for `Program__c.Canonical_Code__c`, chip filters, and UI presets. |
| `Grant_Code_GVS` | Grant Codes | BHPFoundation \| CSIROPartnership \| SmithFamily \| GeneralDonation | Assigned to `Service_Delivery__c.Grant_Code__c` (Text formula referencing Campaign) or direct picklist if campaigns not used. |

## 4. Survey Mapping
| Question | Field API | Data Type / Scale | Aggregation Rules |
| --- | --- | --- | --- |
| Q1: “Students enjoyed the session” | `Q1_Engagement__c` | Number (1–5) | Store average per respondent type in `Session_School_Survey__c`. Student and Teacher responses stored separately (two records). Reporting averages combine both weighted by `Response_Count__c`. |
| Q2: “Students learned new STEM concepts” | `Q2_Learning__c` | Number (1–5) | Same as above. |
| Q3: “Students feel confident in science” | `Q3_Confidence__c` | Number (1–5) | Same as above. |
| Q4: “Students want to do more science” | `Q4_FutureInterest__c` | Number (1–5) | Same as above. |
| Q5: “Teacher satisfied with session” | `Q5_Teacher_Satisfaction__c` | Number (1–5) | If both teacher and student surveys contribute, teacher record overwrites student value only on teacher record. |
| Q6: “Session aligned with curriculum” | `Q6_Curriculum_Alignment__c` | Number (1–5) | Average by respondent type. |
| Q7: “Resources culturally relevant” | `Q7_Cultural_Relevance__c` | Number (1–5) | Weighted average. |
| Q8: “Would recommend DeadlyScience” | `Q8_Recommendation__c` | Number (1–5) | Weighted average. |
| Open comment | `Open_Comment__c` | Long Text (4000) | Store latest comment per respondent type; maintain history via `Survey_Response__c` if multiple. |

Flows ingest individual `Survey_Response__c` records, map to `Session_School__c` via invitation context, update or create `Session_School_Survey__c` child rows for Student vs Teacher, and recalc averages.

## 5. Automation (Flows)
- **Session School Reminder Flow (Record-Triggered):**
  - Trigger: After-save on `Session_School__c` when `Demographics_Status__c` changes.
  - Actions:
    - If status becomes `Submitted` or `Wont_Submit`, set `Next_Reminder_Date__c = NULL`, `Reminder_Sent_Count__c = 0`, and cancel scheduled paths.
    - If `Attendance__c = No_Show`, auto set `Demographics_Status__c = Not_Applicable` and skip reminders.
    - If status set to `Pending` (default) and no reminder scheduled, set `Next_Reminder_Date__c = Session Date + 1 day` (AEST) and queue scheduled flow path.

- **Scheduled Paths:**
  - Path 1: Run at `Session Date + 1 day` (T+1). Send reminder email (Email Alert) using presenter or teacher contact depending on `Demographics_Source__c`. Update `Demographics_Status__c` to `Reminded`, increment `Reminder_Sent_Count__c`, set `Next_Reminder_Date__c = Session Date + 3 days`.
  - Path 2: Conditional scheduled path when `Reminder_Sent_Count__c = 1` and status still `Pending` or `Reminded`. Fire at T+3 to send second reminder and update `Reminder_Sent_Count__c = 2`. Do not change status if already `Reminded`.

- **Reminder Cancellation Flow:**
  - Reuse the record-triggered flow to unschedule pending paths when status becomes `Submitted`, `Wont_Submit`, or `Not_Applicable`.

- **Experience Cloud Submission Flow:**
  - Trigger: On `Survey_Response__c` creation (teacher submission). Map to `Session_School__c`, set `Demographics_Status__c = Submitted`, `Demographics_Source__c = Teacher_Link`, update aggregates, and cancel reminders.

- **Business Hours Note:**
  - Flows will leverage `Set Next Run Time` using AEST timezone. No holiday exclusions; if reminders fall on weekends/holidays, they still send. Future phase may add custom metadata for holiday calendars.

## 6. UI Placement (Lightning)
- **Session__c Lightning Record Page:**
  - Components: Path (using Session Status GVS), Highlights Panel, Related List – Session Schools, Quick Actions (`Create Session School`, `Send Presenter Pack`). Include universal filter component for related lists (LWC) if needed.
  - Quick Action: “Create Session School” to add schools (opens flow embedding Year Levels, demographics defaults).

- **Session_School__c Record Page:**
  - Tabs: Details (demographics fields), Related (Survey Responses, Reminder Logs), Lightning component showing reminder status chips with tooltips.
  - Quick Actions: `Submit Demographics` (opens Screen Flow for presenters), `Mark Wont_Submit`, `Mark Not Applicable` (Flow actions), `Send Teacher Link` (launches Experience Cloud invitation).

- **App Navigation:**
  - Lightning App “DeadlyScience Programs” with tabs: Sessions, Session Schools, Data Completeness (LWC dashboard), Impact Dashboard (embedded Lightning Dashboard or LWC), Eligibility Dashboard.

- **Experience Cloud Site:**
  - “Teacher Portal” site hosting Salesforce Surveys for demographics submission; unique link per Session School using Survey Invitation. Flow handles data ingest.

- **Virtual Delivery UI:**
  - Use Screen Flows embedded on Session School page or custom LWC for teacher link management. Presenters/coordinators access via Lightning App.

- **LWC Needs:**
  - Universal Filter component (shared across Data Completeness, Impact, Eligibility pages).
  - Data Completeness tiles summarising counts by Demographics Status and Attendance.
  - Impact Dashboard advanced visualisations if standard dashboards insufficient (fallback to Dashboard + filters).

## 7. Universal Filter Component Contract
```json
{
  "datePreset": "Last_7_Days" | "Next_90_Days" | "This_Year" | "Custom_Range",
  "customRange": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD",
    "timezone": "AEST"
  },
  "programCodes": ["DeadlyLabs", "DeadlyLearners", ...],
  "grantCodes": ["BHPFoundation", "CSIROPartnership", ...],
  "deliveryTypes": ["In_Person", "Virtual"],
  "sessionStatuses": ["Planned", "Scheduled", "Delivered", "Cancelled"],
  "schoolStatuses": ["Delivered", "No_Show", "Cancelled", "Rescheduled", "Wont_Submit"],
  "demographicsStatuses": ["Pending", "Reminded", "Submitted", "Wont_Submit", "Not_Applicable"],
  "impactDomains": ["Engagement", "Learning", "Confidence", "Cultural_Relevance"],
  "searchTerm": "string",
  "stateFilters": ["NSW", "QLD", ...],
  "yearLevels": ["Year_3", "Year_4", ...]
}
```
- Component exposes `onFilterChange` event returning same payload.
- Presets `Last_7_Days`, `Next_90_Days`, `This_Year` computed relative to current date in AEST. `Custom_Range` requires `start`/`end` values.
- Chips render based on canonical Program/Grant codes from `Program_Code_GVS` and `Grant_Code_GVS`.

## 8. Reporting
- **Report Types:**
  - Sessions with Session Schools (custom report type with Session_School__c as child).
  - Session Schools with Survey Summary (include Session_School_Survey__c).
  - Shipments with Sessions.
  - Program Engagements with Accounts.

- **Dashboards:**
  - **Data Completeness Dashboard (LWC/Analytics):** Tiles for Submitted, Pending, Reminded, Wont_Submit, Not_Applicable counts; table of outstanding schools filtered by Demographics Status.
  - **Impact Dashboard:** Charts averaging Q1–Q8 by Program, State, Year Level. ATSI participation gauge using `ATSI_Students__c / Total_Students__c` with % thresholds filters only.
  - **Eligibility Dashboard:** Cohort summary by Eligibility Status, ICSEA bands, grant presets (matching Impact casing), state distribution.

- **Denominator Rules:**
  - Outcome metrics (survey averages) exclude records where Demographics Status = Wont_Submit or Not_Applicable.
  - Participation metrics include Wont_Submit to show request vs response. Non-response rate = Wont_Submit / (Submitted + Wont_Submit).

## 9. Security & Sharing
- **OWD:**
  - `Service_Delivery__c` (Session): Private.
  - `Session_School__c`: Controlled by Parent (via Master-Detail) ensuring presenters see assigned sessions.
  - `Shipment__c`: Public Read Only.

- **Roles & Profiles:**
  - Roles: Program Coordinators (full access), Presenters (read own sessions, update demographics), Executives (read-only dashboards).
  - Use Sharing Rules to grant presenters read/edit on Sessions where they are assigned (via `Presenter_Assignment__c` junction if needed).

- **Field-Level Security:**
  - Demographics fields (`Total_Students__c`, etc.) editable by Presenters & Coordinators; read-only for Executives.
  - Survey fields accessible read-only to all roles.
  - Sensitive data (Teacher contact email) restricted to Coordinators.

- **Field History Tracking:**
  - Enable on `Service_Delivery__c.Status__c`, `Service_Delivery__c.Delivery_Type__c`, `Session_School__c.Status__c`, `Session_School__c.Demographics_Status__c`, `Session_School__c.Attendance__c`.

## 10. Integration (Shopify)
- **Phase 1 Snapshot/ETL:**
  - Daily ETL inserts/updates `Shipment__c` records with fields: School (lookup Account), SKU, Quantity, Order Date, Status, Shopify Order Number.
  - ETL sets `Shipment__c.Linked_Session__c` when Shopify order references Session Code; otherwise blank.
  - Display read-only on Session and Session School layouts via related list and chips (no create/edit from Salesforce).
  - No reminder or automation triggered from shipment records.

## 11. Acceptance Checklist
- [ ] Global value sets applied to all picklists; no hard-coded enumerations elsewhere.
- [ ] `Delivery_Type__c` restricted to In_Person or Virtual (no Blended/Hybrid).
- [ ] Demographics fields identical between in-person and virtual flows; Wont_Submit action available in both interfaces.
- [ ] Universal filter component delivers Last_7_Days, Next_90_Days, This_Year, Custom_Range with timezone labelled AEST.
- [ ] Impact ATSI filters operate on percentage thresholds; Eligibility filters reuse identical casing for program/grant codes.
- [ ] School Lookup offers Create Session and View Sessions buttons only; dispatch linkage shown read-only.
- [ ] Reminder automation sends at T+1 and T+3 days, sets Demographics Status to Reminded after first send, and cancels on Submitted or Wont_Submit.
- [ ] Tooltips added for status chips, date presets, demographics ownership, eligibility calculations, and reminder cadence (no legacy language).

