# v27 Acceptance Checklist

- [ ] Session Finder filters respond to keyboard input and update the result counter via aria-live.
- [ ] Deliver Session shows Presenter Tools Online banner when owning the session and enforces copy-link behaviour for coverage users.
- [ ] Deliver Virtual exposes Presenter Tools Online with coverage messaging and clipboard fallback.
- [ ] Data Completeness dashboard references `Session__c`/`Survey_Response__c` fields and escalates overdue items via alert roles.
- [ ] QR full screen modal launches and closes via keyboard controls on both delivery pages.
- [ ] Copy-link helpers succeed when `navigator.clipboard` is supported and fall back to the textarea method otherwise.
- [ ] Build renders without layout overflow on a 360px wide viewport.
- [ ] Skip links focus the main landmark on each page.
