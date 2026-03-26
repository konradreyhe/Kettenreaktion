---
description: "When you need to verify your UI is usable by everyone. Keyboard users, screen reader users, users with low vision, motor impairments, cognitive disabilities. Not a checkbox exercise — a real audit of whether real people can actually use this."
---

# Accessibility Audit — WCAG Compliance & Inclusive Design

**When to use:** When you need to verify your UI is usable by everyone. Keyboard users, screen reader users, users with low vision, motor impairments, cognitive disabilities. Not a checkbox exercise — a real audit of whether real people can actually use this.

**Role:** You are an accessibility auditor. You don't just check WCAG boxes — you USE the interface the way disabled users do. Unplug your mouse. Turn on a screen reader. Squint at the screen. Tab through every element. If someone can't use it, it's broken. Full stop.

---

**Audit scope:** $ARGUMENTS

Audit this for real-world accessibility. Not just WCAG compliance (though that matters) — actual usability for people who navigate differently. Every interactive element. Every piece of content. Every state and transition. If it's not accessible, it doesn't work.

## Don't

- Don't just run an automated tool and call it done — automated tools catch ~30% of accessibility issues
- Don't assume "we don't have disabled users" — you do, they just can't use your product yet
- Don't skip manual testing — the most important issues require human judgment
- Don't defer everything to "nice to have" — access is not a feature, it's a requirement
- Don't only check the happy path — error states, loading states, and empty states need to be accessible too

## Step 1: Automated Scan (The Floor, Not the Ceiling)

Run automated tools as a starting point — they catch the obvious stuff:
- Check all pages/views with an accessibility linter or browser extension
- Flag all errors, warnings, and notices
- Note: automated tools miss ~70% of real accessibility issues. This step finds the low-hanging fruit. The REAL audit is manual.

Common automated catches:
- Missing alt text on images
- Missing form labels
- Insufficient color contrast
- Missing document language
- Empty links or buttons
- Missing heading hierarchy

## Step 2: Keyboard Navigation Audit

Put your mouse in a drawer. Now use the interface:

- **Tab order:** Does Tab move through interactive elements in a logical reading order? No jumps, no traps, no skipped elements?
- **Focus visibility:** Can you ALWAYS see which element has focus? Is the focus indicator high-contrast and obvious?
- **Keyboard traps:** Can you Tab INTO and OUT OF every component? Modals, dropdowns, date pickers, custom widgets — can you escape them with Escape or Tab?
- **All interactions via keyboard:** Can every clickable thing be activated with Enter or Space? Drag-and-drop has a keyboard alternative? Hover-triggered content is reachable?
- **Skip links:** Is there a "Skip to main content" link for keyboard users to bypass navigation?
- **Shortcuts:** Do custom keyboard shortcuts conflict with screen reader shortcuts? Can they be remapped or disabled?
- **Focus management:** When a modal opens, does focus move to it? When it closes, does focus return to the trigger? After page navigation, where does focus go?

## Step 3: Screen Reader Audit

Experience the interface through audio alone:
- **Page structure:** Are headings used correctly (h1 → h2 → h3, no skipped levels)? Do they describe the content?
- **Landmarks:** Are `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>` used? Can a screen reader user jump between sections?
- **Link and button text:** Does every link/button make sense OUT OF CONTEXT? "Click here" and "Read more" are useless to someone tabbing through a list of links.
- **Images:** Do informational images have descriptive alt text? Do decorative images have `alt=""`? Do complex images (charts, diagrams) have detailed descriptions?
- **Forms:** Is every input associated with a visible `<label>`? Are required fields announced? Are error messages associated with their inputs (`aria-describedby`)?
- **Dynamic content:** When content changes (notifications, live updates, form validation), is it announced? `aria-live` regions? `role="alert"`?
- **Tables:** Do data tables have proper headers (`<th>`, `scope`)? Are they readable when linearized?
- **Custom widgets:** Do custom components (tabs, accordions, sliders, trees) have correct ARIA roles, states, and properties?

## Step 4: Visual & Cognitive Accessibility

Not all disabilities are about blindness:
- **Color contrast:** Does ALL text meet WCAG AA minimums? (4.5:1 for normal text, 3:1 for large text). Do UI components and graphical objects meet 3:1?
- **Color alone:** Is color EVER the only way to convey information? Red/green for status without an icon or text? Chart lines distinguished only by color?
- **Text resizing:** Does content work at 200% zoom? No overlap, no truncation, no horizontal scroll at 320px viewport width?
- **Motion:** Are animations essential or decorative? Can they be disabled? `prefers-reduced-motion` respected? No flashing content (3 flashes/second = seizure risk)?
- **Reading level:** Are error messages, instructions, and labels clear and simple? Jargon-free? Can someone with a cognitive disability understand what to do?
- **Timing:** Are there time limits? Can users extend them? Do auto-advancing carousels have pause controls?
- **Consistent navigation:** Is the navigation layout consistent across pages? Do similar elements behave the same way everywhere?

## Step 5: Forms & Error Handling

Forms are where accessibility most commonly fails:
- **Labels:** Every input has a visible, associated `<label>`. Placeholder text is NOT a label (it disappears on focus).
- **Required fields:** Indicated visually AND programmatically (`required` attribute or `aria-required`). Not just a red asterisk.
- **Error identification:** When a form fails validation, are errors specific? ("Email must include @" not "Invalid input"). Linked to their field?
- **Error prevention:** For important actions (financial, legal, data deletion) — can users review, confirm, or undo?
- **Input assistance:** Are expected formats described? (e.g., "Date format: MM/DD/YYYY"). Autocomplete attributes on common fields?
- **Grouping:** Related inputs (radio buttons, checkboxes) wrapped in `<fieldset>` with `<legend>`?

## Step 6: Media & Dynamic Content

- **Video:** Captions for all video content? Accurate, synchronized, including non-speech sounds?
- **Audio:** Transcripts available for audio-only content?
- **Live content:** Live captions for streams or real-time content?
- **Animations:** Purpose explained in alt text or surrounding content? Controllable (pause, stop)?
- **Infinite scroll:** Can keyboard users reach content below the infinite-loading area? Is there a "load more" alternative?
- **Single-page app navigation:** When routes change, is the page title updated? Is focus managed? Does the screen reader announce the new page?

## Step 7: ARIA Correctness Check

ARIA is powerful when used correctly, destructive when misused:
- **First rule of ARIA:** Don't use ARIA if a native HTML element does the job. `<button>` not `<div role="button">`.
- **Roles match behavior:** Does `role="button"` actually behave like a button (Enter/Space activation, focus management)?
- **States are updated:** `aria-expanded`, `aria-selected`, `aria-checked` — are they toggled dynamically when state changes?
- **No ARIA is better than bad ARIA:** Check for `aria-hidden="true"` on visible content. `role="presentation"` on meaningful elements. `aria-label` that contradicts visible text.
- **Labels vs descriptions:** `aria-label` for names, `aria-describedby` for additional help. Not interchangeable.

## Output Format

```
## Accessibility Audit Report

### Scope
[What was audited — pages, components, flows]

### WCAG Level Targeted
[AA (standard) or AAA (enhanced)]

### Summary
- Issues found: [N]
- Critical: [N] | High: [N] | Medium: [N] | Low: [N]
- WCAG criteria violated: [list]

### Issues Found

#### [A11Y-1] [Short description]
- **Severity:** Critical/High/Medium/Low
- **WCAG Criterion:** [e.g., 1.4.3 Contrast Minimum (AA)]
- **Location:** [page/component/file:line]
- **Category:** [Keyboard / Screen Reader / Visual / Cognitive / Forms / Media / ARIA]
- **Impact:** [Who is affected and how — e.g., "Blind users cannot submit the form because error messages are not announced"]
- **How to reproduce:** [Exact steps using keyboard/screen reader]
- **Fix:** [Specific code change]

#### [A11Y-2] ...

### Keyboard Navigation Map
[Tab order through key pages — noting any traps, skips, or illogical order]

### Patterns Observed
[Recurring issues — e.g., "No form inputs have associated labels throughout the app"]

### Well-Implemented Areas
[What's already accessible — acknowledge good work]

### Recommended Testing Setup
[Tools and methods for ongoing accessibility testing]
```

## Success Criteria

- Every interactive element is keyboard-reachable and operable
- Every piece of content is screen-reader-accessible with meaningful announcements
- Color contrast meets WCAG AA on all text and UI components
- No keyboard traps anywhere in the interface
- Forms have proper labels, error handling, and required field indication
- Dynamic content changes are announced to assistive technology
- No ARIA misuse that makes accessibility WORSE
- Every issue has a specific fix, not just "make it accessible"
