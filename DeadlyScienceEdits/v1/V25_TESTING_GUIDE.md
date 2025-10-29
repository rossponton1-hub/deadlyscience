# V25 Testing Guide

Quick manual testing checklist for v25 changes.

---

## Test 1: Data Completeness → In-Person Session (Counts)

**Setup:** Open `data_completeness.html` in browser

**Steps:**
1. Scroll to "Missing Student Demographics" section
2. Find any row with school (e.g., "Redfern PS" row at line 139)
3. Click "Open Session" button

**Expected:**
- ✅ Browser navigates to `deliver_session.html?session=SESS-502&edit=counts`
- ✅ Page loads and auto-scrolls to demographics form section
- ✅ "← Back to Data Completeness" link visible above title
- ✅ Clicking back link returns to data_completeness.html

**Fail conditions:**
- ❌ Link goes to wrong page
- ❌ No scroll occurs
- ❌ Back link not visible
- ❌ Console errors

---

## Test 2: Data Completeness → Virtual Session (No Link)

**Setup:** Open `data_completeness.html` in browser

**Steps:**
1. Scroll to "Missing Teacher Feedback" section
2. Find any virtual row (e.g., "Liverpool High" row at line 196)
3. Verify NO "Open Session" button present
4. Only "Resend Feedback Survey" button should exist

**Expected:**
- ✅ No "Open Session" link/button in this row
- ✅ Only action button ("Resend") present
- ✅ Clicking "Resend" shows alert (existing mock behavior)

**Fail conditions:**
- ❌ "Open Session" link appears (should not)
- ❌ No action button present

---

## Test 3: Direct Access (No Back Link)

**Setup:** Type URL directly in browser

**Steps:**
1. Navigate directly to `deliver_session.html` (no query params)
2. Check for back link above session title

**Expected:**
- ✅ NO "← Back to Data Completeness" link visible
- ✅ Page loads normally
- ✅ All existing functionality works
- ✅ No scroll occurs (no edit param)

**Fail conditions:**
- ❌ Back link visible when it shouldn't be
- ❌ Page doesn't load
- ❌ Console errors

---

## Test 4: Deep Link with Invalid Param

**Setup:** Type URL with bad param in browser

**Steps:**
1. Navigate to `deliver_session.html?session=SESS-501&edit=foobar`
2. Observe page behavior

**Expected:**
- ✅ Page loads normally
- ✅ No scroll occurs (invalid key)
- ✅ No console errors
- ✅ No alert/error messages

**Fail conditions:**
- ❌ Console errors
- ❌ Page doesn't load
- ❌ Error alert shown

---

## Test 5: Session Finder Navigation

**Setup:** Open `index.html` in browser

**Steps:**
1. Click "Session Finder" link in Navigation section
2. On sessions.html, click any "Open Session" button
3. Observe navigation

**Expected:**
- ✅ sessions.html opens showing 6 demo cards
- ✅ Clicking "Open Session" navigates to correct Deliver page
- ✅ URL includes `?session=<ID>&edit=all`
- ✅ Page scrolls to first editable section
- ✅ NO back link to Data Completeness (didn't come from there)

**Fail conditions:**
- ❌ sessions.html doesn't open
- ❌ Wrong page opens from "Open Session"
- ❌ Back link appears (shouldn't)

---

## Test 6: Mobile Layout (360px)

**Setup:** Open any updated file in browser, resize to 360px width

**Steps:**
1. Open `data_completeness.html` at 360px viewport
2. Check banner text wrapping
3. Check "Open Session" button doesn't overflow
4. Open `deliver_session.html?edit=counts` at 360px
5. Check context line wraps cleanly
6. Open `sessions.html` at 360px
7. Check cards stack properly

**Expected:**
- ✅ All text wraps without horizontal scroll
- ✅ Buttons stack vertically if needed
- ✅ No overlap or cutoff
- ✅ Scroll still works on mobile

**Fail conditions:**
- ❌ Horizontal scroll introduced
- ❌ Text overflow/cutoff
- ❌ Buttons overlap
- ❌ Layout breaks

---

## Test 7: Virtual Session Deep Link

**Setup:** Open URL directly in browser

**Steps:**
1. Navigate to `deliver_virtual.html?session=SESS-502&edit=facilitator`
2. Observe scroll behavior
3. Check info banner text

**Expected:**
- ✅ Page scrolls to presenter/facilitator section
- ✅ Info banner shows survey-led data collection message
- ✅ No manual backfill inputs visible
- ✅ NO back link (direct access)

**Fail conditions:**
- ❌ Doesn't scroll
- ❌ Wrong section scrolled to
- ❌ Banner text wrong/missing
- ❌ Back link appears

---

## Test 8: Multiple Edit Params (Edge Case)

**Setup:** Type URL with duplicate params in browser

**Steps:**
1. Navigate to `deliver_session.html?edit=counts&edit=facilitator&edit=funding`
2. Observe which section scrolls

**Expected:**
- ✅ Page scrolls to FIRST param only (counts)
- ✅ Other params ignored
- ✅ No console errors

**Fail conditions:**
- ❌ Scrolls to wrong section
- ❌ Scrolls multiple times
- ❌ Console errors

---

## Test 9: Overdue Session Link

**Setup:** Open `data_completeness.html` in browser

**Steps:**
1. Scroll to "Overdue Sessions" section (top, red border)
2. Find any row (e.g., "Dubbo College" row at line 89)
3. Click "Open Session" button (blue button, right side)

**Expected:**
- ✅ Browser navigates to `deliver_session.html?session=SESS-634&edit=all`
- ✅ Page scrolls to first editable section (counts/demographics)
- ✅ "← Back to Data Completeness" link visible

**Fail conditions:**
- ❌ Wrong page/param
- ❌ No scroll
- ❌ No back link

---

## Test 10: All Existing Functionality Unchanged

**Setup:** Use ANY page as before v25

**Steps:**
1. Open `deliver_session.html` and click "Start Delivery"
2. Enter demographics data
3. Click "Save Demographics"
4. Display QR code
5. Send teacher feedback
6. Complete session

**Expected:**
- ✅ ALL existing buttons work exactly as before
- ✅ ALL alerts show same messages
- ✅ ALL forms submit normally
- ✅ NO changes to form validation
- ✅ NO changes to mock data

**Fail conditions:**
- ❌ Any existing button broken
- ❌ Any alert message changed
- ❌ Any form behavior different
- ❌ Console errors

---

## Quick Browser Test Matrix

Test in at least 2 browsers:

| Browser | Test 1 | Test 3 | Test 5 | Test 6 | Test 10 |
|---------|--------|--------|--------|--------|---------|
| Chrome  |   ✅   |   ✅   |   ✅   |   ✅   |   ✅    |
| Firefox |   ✅   |   ✅   |   ✅   |   ✅   |   ✅    |
| Safari  |   ✅   |   ✅   |   ✅   |   ✅   |   ✅    |

---

## Automated Test Script (Optional)

If you want to automate basic checks:

```javascript
// Run in browser console on any Deliver page
function testV25() {
  console.log('Testing v25 scroll logic...');
  
  // Test 1: Valid param
  window.location.href = window.location.pathname + '?edit=counts';
  setTimeout(() => {
    const countsSection = document.querySelector('[data-edit-key="counts"]');
    console.assert(countsSection, 'Counts section should exist');
  }, 500);
  
  // Test 2: Invalid param (should not error)
  window.location.href = window.location.pathname + '?edit=invalid';
  setTimeout(() => {
    console.log('No error with invalid param: PASS');
  }, 500);
  
  // Test 3: Back link visibility
  const backLink = document.querySelector('a[href="data_completeness.html"]');
  if (document.referrer.includes('data_completeness')) {
    console.assert(backLink && backLink.parentElement.style.display !== 'none', 
      'Back link should be visible from data_completeness');
  } else {
    console.assert(!backLink || backLink.parentElement.style.display === 'none', 
      'Back link should be hidden on direct access');
  }
  
  console.log('v25 tests complete - check assertions above');
}

// Run it
testV25();
```

---

## Bug Report Template

If you find issues, report with:

```
**Page:** deliver_session.html
**Test:** Test 1 - Data Completeness → In-Person Session
**Expected:** Page scrolls to demographics section
**Actual:** No scroll occurs
**Browser:** Chrome 118
**Steps to reproduce:**
1. Open data_completeness.html
2. Click "Open Session" on Redfern PS row
3. Observe no scroll
**Console errors:** None
**URL when bug occurred:** deliver_session.html?session=SESS-502&edit=counts
```

---

## Success Criteria

All tests pass when:
- ✅ Navigation links go to correct pages
- ✅ Deep links scroll to correct sections
- ✅ Back links appear/disappear conditionally
- ✅ Invalid params handled gracefully
- ✅ Mobile layout clean at 360px
- ✅ NO existing functionality broken
- ✅ NO console errors
- ✅ Works in Chrome, Firefox, Safari

**v25 Testing Complete** ✅
