# DeadlyScience Prototype – v3 Updates

This v3 snapshot applies the approved audit and tech spec outcomes without altering the original source files.

## What changed

- Introduced a shared configuration at `config/enums.json` with canonical Salesforce-aligned enumerations for session statuses, demographics, delivery type, date presets (AEST), program codes, grant codes, and ATSI thresholds.
- Added a lightweight helper script `config/universal.js` used by every page to load the shared config, render the universal date filter (Last 7 Days, Next 90 Days, This Year, Custom Range), and provide tooltip/status chip helpers.
- Rebuilt each module listed in scope under `DeadlyScienceEdits/v3/` to consume the shared config and surface the canonical enumerations:
  - Session Setup now uses Session__c.Status__c, Delivery_Type__c (In_Person/Virtual only), and Demographics_Status__c with Presenter/Teacher_Link guidance.
  - Session Finder (utility) applies the universal filters, canonical status chips, and emphasises that creation occurs elsewhere.
  - Deliver Session (in-person) and Deliver Virtual share the same demographic fields, closure codes, reminder messaging (T+1/T+3), and allow `Submit demographics`, `Mark Wont_Submit`, and (virtual) `Mark Not_Applicable` actions.
  - Data Completeness displays Submitted, Pending, Reminded, Wont_Submit, and Not_Applicable metrics while honouring the common date component.
  - Impact and Eligibility dashboards share program/grant casing, ATSI percentage thresholds, and domain chips from the config.
  - Resource Dispatch removes shipment reminders, keeps Shopify as system of record, and shows read-only linkage to Session_Code.
  - School Lookup swaps “Add to Dispatch” for Create Session/View Sessions CTAs with read-only dispatch chips.
  - School Request Form surfaces Salesforce API-style field labels and canonical delivery/program values.

## Using the shared config

1. Each page includes `<script src="config/universal.js"></script>` which asynchronously loads `config/enums.json` and exposes:
   - `loadDeadlyConfig()` – returns the cached JSON object.
   - `renderUniversalDateFilter(containerId, options?)` – injects the shared date filter (with timezone tooltip) and returns the config.
   - `createStatusChip(value, tooltip, tone)` – renders consistent status chips with hover help.
2. When adding new modules, reuse these helpers to ensure a single source of truth for enumerations and tooltips.

## Acceptance alignment

- No references to Blended or Hybrid delivery remain; Delivery_Type__c only offers `In_Person` or `Virtual`.
- Date presets and Custom Range behave identically across all v3 pages with AEST tooltips.
- Impact Dashboard ATSI filter now uses percentage thresholds only, and Eligibility Dashboard reuses the same casing/values.
- Reminder messaging and Demographics_Status__c chips explicitly call out the T+1/T+3 cadence and Reminded state.
- School Lookup only exposes the two CTAs plus read-only dispatch linkage, satisfying the audit follow-ups.

These files are ready for hand-off into a Salesforce implementation sprint once stakeholders review the declarative build plan.
