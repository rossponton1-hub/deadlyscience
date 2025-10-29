# V25 Navigation Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INDEX.HTML (Main Menu)                          │
│                                                                              │
│  📋 Planning          🔍 Navigation        🎯 Delivery         📊 Reporting │
│  └─ Session Setup     └─ Session Finder   └─ Deliver Session  └─ Impact     │
│                                            └─ Deliver Virtual  └─ Eligibility│
│                                                                └─ Completeness│
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌───────────────────────┐       ┌────────────────────────┐
        │   SESSIONS.HTML       │       │ DATA_COMPLETENESS.HTML │
        │   (Session Finder)    │       │   (Triage Board)       │
        │                       │       │                        │
        │ 6 Static Demo Cards:  │       │ 5 Sections:            │
        │ • Complete            │       │ 1. Overdue Sessions    │
        │ • Awaiting            │       │ 2. Missing Demographics│
        │ • Missing Counts      │       │ 3. Missing Feedback    │
        │ • Won't Submit        │       │ 4. Incomplete Survey   │
        │ • Missing Funding     │       │ 5. Awaiting Submissions│
        │ • Overdue             │       │                        │
        │                       │       │ Action Mapping:        │
        │ Each card has:        │       │ • Sections 1 & 2:      │
        │ [Open Session] button │       │   "Open Session" links │
        │ [View Issues] button  │       │ • Sections 3-5:        │
        │                       │       │   Action buttons only  │
        └───────────┬───────────┘       └──────────┬─────────────┘
                    │                              │
                    │ Click "Open Session"         │ Click "Open Session"
                    │ with ?edit=all               │ with ?edit=counts/all
                    │                              │
                    └──────────┬───────────────────┘
                               │
                ┌──────────────┴───────────────┐
                │                              │
                ▼                              ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│   DELIVER_SESSION.HTML      │   │   DELIVER_VIRTUAL.HTML      │
│   (In-Person Delivery)      │   │   (Virtual Delivery)        │
│                             │   │                             │
│ Query Params:               │   │ Query Params:               │
│ ?session=<ID>&edit=<key>    │   │ ?session=<ID>&edit=<key>    │
│                             │   │                             │
│ Edit Keys:                  │   │ Edit Keys:                  │
│ • counts → Demographics     │   │ • counts → School List      │
│ • facilitator → Presenter   │   │ • facilitator → Presenter   │
│ • all → First Section       │   │ • all → First Section       │
│                             │   │                             │
│ Back Link:                  │   │ Back Link:                  │
│ [← Back to Completeness]    │   │ [← Back to Completeness]    │
│ (only if from Completeness) │   │ (only if from Completeness) │
│                             │   │                             │
│ Context Line:               │   │ Info Banner:                │
│ "Used by presenters during  │   │ "Demographics collected via │
│  delivery and coordinators  │   │  teacher surveys. Use Send  │
│  for data corrections."     │   │  Links... mark Won't Submit"│
│                             │   │                             │
│ Data Entry:                 │   │ Survey Management:          │
│ • Student counts            │   │ • Send survey links         │
│ • Demographics              │   │ • Track submissions         │
│ • Year levels               │   │ • Resend / Won't Submit     │
│ • QR codes                  │   │ • Didn't Attend             │
│ • Teacher feedback          │   │                             │
└─────────────────────────────┘   └─────────────────────────────┘
```

---

## Navigation Patterns

### Pattern 1: Triage → Fix → Return
```
User Flow:
1. Open Data Completeness (triage board)
2. See "Missing Demographics" for Redfern PS
3. Click "Open Session" 
4. → deliver_session.html?session=SESS-502&edit=counts
5. Page auto-scrolls to demographics form
6. User enters counts, saves
7. Click "← Back to Data Completeness"
8. Back at triage board, row now updated

Navigation:
data_completeness.html
    │ [Open Session]
    ├─> deliver_session.html?edit=counts
    │   └─> [Auto-scroll to demographics]
    │       └─> [User edits & saves]
    │           └─> [← Back to Completeness]
    └── data_completeness.html (return)
```

### Pattern 2: Browse → Open → Edit
```
User Flow:
1. Open main menu (index.html)
2. Click "Session Finder"
3. Browse demo cards
4. Click "Open Session" on incomplete card
5. → deliver_session.html?session=SESS-487&edit=all
6. Page scrolls to first editable section
7. No back link (didn't come from Completeness)
8. Use browser back or menu to navigate

Navigation:
index.html
    │ [Session Finder]
    ├─> sessions.html
    │   └─> [Open Session]
    │       └─> deliver_session.html?edit=all
    │           └─> [Auto-scroll to counts]
    │               └─> [No back link]
    └── Use browser back button
```

### Pattern 3: Direct Access (Bookmark)
```
User Flow:
1. Type URL directly or use bookmark
2. deliver_session.html (no query params)
3. Page loads normally, no scroll
4. No back link shown
5. Use existing menu/navigation

Navigation:
[Direct URL] deliver_session.html
    │
    ├─> No auto-scroll (no ?edit param)
    ├─> No back link (no referrer)
    └─> All existing functionality works
```

### Pattern 4: Survey Actions (No Edit Navigation)
```
User Flow:
1. Open Data Completeness
2. See "Awaiting Teacher Submissions" (virtual)
3. NO "Open Session" link present
4. Click "Resend Link" action button
5. Survey reminder sent (mock alert)
6. Stay on Data Completeness page

Navigation:
data_completeness.html
    │ Section 5: Awaiting Submissions
    ├─> [Resend Link] button
    │   └─> Send reminder (mock)
    └── Stay on same page

(No navigation to Deliver pages for survey actions)
```

---

## Conditional Back Link Logic

```
┌─────────────────────────────────────────────────────┐
│              Deliver Page Loaded                     │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
            ┌─────────────────────┐
            │ Check Referrer      │
            │ document.referrer   │
            └──────────┬──────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌───────────────────┐     ┌──────────────────────┐
│ Referrer includes │     │ Referrer is empty or │
│ "data_completeness│     │ from other page      │
│  .html"           │     │                      │
└────────┬──────────┘     └──────────┬───────────┘
         │                           │
         ▼                           ▼
    ┌────────────┐            ┌─────────────┐
    │ Show Back  │            │ Hide Back   │
    │ Link       │            │ Link        │
    └────────────┘            └─────────────┘
         │                           │
         ▼                           ▼
  "← Back to Data           (No back link visible)
   Completeness"
```

---

## Deep-Link Scroll Logic

```
┌─────────────────────────────────────────────────────┐
│         Page Loads with ?edit= Parameter            │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
            ┌─────────────────────┐
            │ Parse URL           │
            │ ?edit=<key>         │
            └──────────┬──────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌───────────────────┐     ┌──────────────────────┐
│ Key is valid:     │     │ Key is invalid:      │
│ counts, funding,  │     │ xyz, blank, etc      │
│ facilitator, all  │     │                      │
└────────┬──────────┘     └──────────┬───────────┘
         │                           │
         ▼                           ▼
┌──────────────────┐         ┌──────────────┐
│ Look up selector │         │ Ignore       │
│ [data-edit-key=  │         │ gracefully   │
│  "<key>"]        │         │              │
└────────┬─────────┘         └──────┬───────┘
         │                          │
         ▼                          ▼
┌──────────────────┐         ┌──────────────┐
│ Element exists?  │         │ No action    │
└────────┬─────────┘         │ No error     │
         │                   └──────────────┘
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────┐   ┌───────┐
│ Yes │   │ No    │
└──┬──┘   └───┬───┘
   │          │
   ▼          ▼
┌──────────┐ ┌────────┐
│ Scroll   │ │ Ignore │
│ smoothly │ │        │
└──────────┘ └────────┘
```

---

## Section-to-Edit-Key Mapping

### deliver_session.html (In-Person)
```
Section                     data-edit-key       Edit Param
─────────────────────────────────────────────────────────
Demographics Form           "counts"            ?edit=counts
Presenter/Facilitator       "facilitator"       ?edit=facilitator
(No funding section)        N/A                 (ignored)

Default for ?edit=all: "counts" (first editable section)
```

### deliver_virtual.html
```
Section                     data-edit-key       Edit Param
─────────────────────────────────────────────────────────
School List                 "counts"            ?edit=counts
Presenter/Facilitator       "facilitator"       ?edit=facilitator
(No funding section)        N/A                 (ignored)

Default for ?edit=all: "facilitator" (first editable section)
```

---

## Data Completeness Section Actions

```
Section                          Has "Open Session"?    Action Type
────────────────────────────────────────────────────────────────────
1. Overdue Sessions              ✅ Yes (all rows)      Navigate to Deliver
2. Missing Demographics          ✅ Yes (in-person)     Navigate to Deliver
                                 ❌ No (virtual)        (Use survey actions)
3. Missing Teacher Feedback      ❌ No                  Resend survey button
4. Incomplete Student Survey     ❌ No                  Contact presenter
5. Awaiting Submissions          ❌ No                  Resend/Won't Submit
```

---

## URL Examples

### From Data Completeness
```
Overdue (in-person):
data_completeness.html → deliver_session.html?session=SESS-634&edit=all

Missing Demographics (in-person):
data_completeness.html → deliver_session.html?session=SESS-502&edit=counts

Missing Demographics (virtual):
(No link - stays on data_completeness.html, uses Resend button)
```

### From Session Finder
```
Any card:
sessions.html → deliver_session.html?session=SESS-498&edit=all
             OR deliver_virtual.html?session=SESS-501&edit=all
```

### Direct Access
```
deliver_session.html (no params, no scroll, no back link)
deliver_virtual.html (no params, no scroll, no back link)
```

---

## Mobile Navigation (360px viewport)

All flows work identically on mobile:
- ✅ Links remain clickable
- ✅ Scroll behavior works
- ✅ Back links visible/hidden correctly
- ✅ Buttons stack vertically if needed
- ✅ No horizontal scroll introduced
- ✅ Text wraps cleanly

```
┌──────────────────────┐
│  Data Completeness   │  ← Full width on mobile
│  ┌────────────────┐  │
│  │ Missing Demo-  │  │  ← Card stacks
│  │ graphics       │  │
│  │ Redfern PS     │  │
│  │ [Open Session] │  │  ← Button full width
│  └────────────────┘  │
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│  Deliver Session     │  ← Scrolls to section
│  [← Back]            │  ← Back link at top
│  ┌────────────────┐  │
│  │ Demographics   │  │  ← Target section
│  │ [Save]         │  │
│  └────────────────┘  │
└──────────────────────┘
```

**v25 Navigation Flow Complete** ✅
