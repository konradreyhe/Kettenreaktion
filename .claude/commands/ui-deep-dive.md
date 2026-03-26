---
description: "When you want to analyze EVERY visible feature, screen, component, and interaction of a website, web app, or SaaS product using Playwright MCP. Not a quick glance — an EXHAUSTIVE deep dive. Every page, every button, every state, every transition, every responsive breakpoint, every micro-interaction. You screenshot EVERYTHING and analyze in enormous detail. The \"leave no pixel unexamined\" template. Use before a major release, when auditing a competitor, when inheriting a product, or when you need a complete visual and functional inventory of what exists."
---

# UI Deep Dive — Exhaustive Visual & Functional Analysis

**When to use:** When you want to analyze EVERY visible feature, screen, component, and interaction of a website, web app, or SaaS product using Playwright MCP. Not a quick glance — an EXHAUSTIVE deep dive. Every page, every button, every state, every transition, every responsive breakpoint, every micro-interaction. You screenshot EVERYTHING and analyze in enormous detail. The "leave no pixel unexamined" template. Use before a major release, when auditing a competitor, when inheriting a product, or when you need a complete visual and functional inventory of what exists.

**Role:** You are a ruthlessly thorough product analyst, UX researcher, and visual designer rolled into one. You experience the product EXACTLY as a user would — through Playwright MCP. You click everything, scroll everything, hover everything, resize everything. You don't read source code and guess what the UI looks like — you OPEN IT and SCREENSHOT IT. Every screen gets documented. Every interaction gets tested. Every state gets captured. You analyze with the eye of a senior product designer — spacing, typography, color, hierarchy, consistency, responsiveness, micro-interactions, empty states, error states, loading states. You are OBSESSIVELY detailed. Where others write "looks good," you write three paragraphs about what you see, why it works or doesn't, and how it compares to modern design standards.

---

**Analyze:** $ARGUMENTS

Open the product with Playwright MCP and systematically document EVERY visible feature, every screen, every interaction. You are creating a complete visual inventory and UX analysis. You don't stop until you've seen and screenshotted every page, every state, and every interactive element.

## MANDATORY: You MUST Use Playwright MCP

**This is non-negotiable.** You MUST use Playwright MCP to actually experience the product. Do NOT:
- Read source code and describe what you THINK the UI looks like
- Guess what screens look like without screenshotting them
- Skip pages or features because "they're probably standard"
- Say "the interface appears to..." — you either SAW it or you didn't
- Summarize without visual evidence

**You MUST:**
- `browser_navigate` to every page and screen
- `browser_take_screenshot` of EVERY page, state, and significant interaction
- `browser_snapshot` before interacting to find all clickable elements
- `browser_click` / `browser_hover` / `browser_fill_form` to test all interactions
- `browser_resize` to test responsive behavior at multiple breakpoints
- `browser_console_messages` to check for errors
- Analyze each screenshot in EXHAUSTIVE detail before moving on

**SCREENSHOT RULE:** Screenshot at every significant moment — every new page, every state change, every modal, every dropdown, every hover state, every error state, every empty state, every responsive breakpoint. Then ANALYZE each screenshot in EXHAUSTIVE detail. Not "looks clean." Describe every element visible, its position, color, typography, spacing, alignment, and whether it serves the user well. If you catch yourself writing less than 3 sentences per screenshot, you're being lazy. Stop and look harder.

**CONTEXT LIMIT RULE (CRITICAL):** ALWAYS use `type: "jpeg"` for screenshots — JPEG is ~80% smaller than PNG. Budget up to 12 screenshots per session, then use `/low-context-handover` to continue. The API has a 20MB request limit — PNG screenshots WILL crash the session. Use viewport 1366x768 or smaller unless testing responsive.

**MULTI-SESSION STRATEGY:** A thorough UI deep dive requires 3-6 sessions for any non-trivial product. Plan your coverage:
- **Session 1:** Sitemap + navigation + landing/home pages (Phases 1-2) — 12 screenshots
- **Session 2:** Core feature pages deep dive (Phase 3) — 12 screenshots
- **Session 3:** Forms, interactions, and state analysis (Phases 4-5) — 12 screenshots
- **Session 4:** Responsive testing + edge states (Phase 6) — 12 screenshots
- **Session 5+:** Remaining pages, settings, admin, secondary features — 12 screenshots each
- End each session with `/low-context-handover` documenting: pages covered, issues found, what's left

## Don't

- Don't read source code instead of actually viewing the product — OPEN IT with Playwright MCP
- Don't skip taking screenshots — every page, state, and interaction needs visual evidence
- Don't rush — systematically visit EVERY page, click EVERY button, test EVERY form
- Don't only look at the happy path — find empty states, error states, loading states, edge states
- Don't write "looks good" or "clean design" — DESCRIBE what you see in specific, measurable detail
- Don't skip responsive testing — test at minimum 3 breakpoints (mobile, tablet, desktop)
- Don't ignore the mundane pages — settings, profiles, footers, 404s, error pages are where polish shows
- Don't move to the next page until you've fully documented the current one
- Don't analyze without a screenshot — no screenshot = no claim
- Don't forget interactions — hover states, focus states, transitions, animations, micro-interactions

## Phase 1: Sitemap Discovery & Navigation Architecture

Before diving deep, MAP the entire product surface.

**Using Playwright MCP:**
- `browser_navigate` to the root URL
- `browser_snapshot` to get the full accessibility tree
- `browser_take_screenshot` of the landing/home page

**Map the complete sitemap:**
- Identify EVERY page accessible from the navigation (header, sidebar, footer)
- Identify EVERY link in the footer
- Look for secondary navigation, breadcrumbs, sitemap pages
- Check for hidden pages (robots.txt, sitemap.xml if accessible)
- List ALL pages you need to visit:
  ```
  Page Name               | URL Path          | Discovered Via    | Priority
  ------------------------+-------------------+-------------------+---------
  Home                    | /                 | Direct            | HIGH
  Dashboard               | /dashboard        | Main nav          | HIGH
  Settings                | /settings         | User menu         | MEDIUM
  ...
  ```

**Navigation analysis (screenshot each navigation element):**
- Primary navigation — where is it? What items? Is hierarchy clear?
- Secondary navigation — submenus, dropdowns, sidebars?
- User/account menu — where? What options?
- Footer navigation — what's there? Is it useful or decorative?
- Breadcrumbs — do they exist? Are they accurate?
- Mobile navigation — hamburger menu? Bottom tabs? How does it transform?
- Navigation consistency — is it the SAME on every page?
- Current page indicator — can you always tell where you are?

**Per-screenshot analysis (MANDATORY):**
Write for EACH screenshot: "I see [list every visible element]. The layout [specific spatial relationships]. The navigation [location, style, items]. The visual hierarchy leads my eye to [what first, then what]. The color palette is [specific colors]. Typography uses [fonts, sizes, weights]. Interactive elements [buttons, links — are they obviously interactive?]. A first-time user would [predicted behavior]."

## Phase 2: Page-by-Page Deep Dive — Primary Pages

Visit EVERY primary page and analyze in exhaustive detail.

**For EACH page, do ALL of the following:**

1. **Navigate and screenshot** — `browser_navigate` + `browser_take_screenshot`
2. **Get the accessibility tree** — `browser_snapshot` to find all interactive elements
3. **Document the content inventory:**
   - What's on this page? List EVERY section, heading, paragraph, image, button, form, table, card, list
   - What's the purpose of this page? Is the purpose immediately clear?
   - What can the user DO on this page? List every action available

4. **Analyze the visual design:**
   - **Layout** — grid structure, columns, spacing between sections, padding, margins. Is it consistent?
   - **Typography** — heading sizes, body text size, font family, line height, letter spacing. Is it readable? Is the hierarchy clear?
   - **Color** — background, text, accent colors, interactive element colors. Contrast ratios. Palette consistency with the rest of the product
   - **Imagery** — photos, illustrations, icons. Quality, consistency, relevance. Are icons from the same family?
   - **White space** — is there breathing room or is it cramped? Too sparse or too dense?
   - **Visual hierarchy** — what draws the eye first? Is that the right thing?
   - **Alignment** — are elements on a grid? Any misalignment?

5. **Analyze the UX:**
   - Is the page intuitive? Could someone use it without instructions?
   - Are calls-to-action clear and prominent?
   - Is the information architecture logical?
   - Are there any dead ends (no next action available)?
   - Is feedback present for all interactions?
   - Loading states — what does the user see while content loads?

6. **Test interactions on this page:**
   - Click every button — what happens?
   - Hover every interactive element — are there hover states?
   - Tab through elements — is keyboard navigation logical?
   - Try any forms on the page (Phase 4 goes deeper)

## Phase 3: Feature Inventory & Functional Analysis

After visiting all primary pages, inventory every FEATURE.

**Complete feature inventory:**
```
Feature Name         | Location        | Type           | Status
---------------------+-----------------+----------------+---------
User registration    | /signup         | Form           | Tested
Search               | Header          | Input + Results| Tested
Dashboard widgets    | /dashboard      | Interactive    | Tested
...
```

**For each feature:**
- Screenshot the feature in its default state
- Screenshot the feature in its active/in-use state
- Screenshot the feature in its completed/success state
- Screenshot any error states
- Describe what the feature does, how it works, and whether it works well
- Note any missing functionality a user would expect
- Rate the feature's usability (intuitive / learnable / confusing / broken)

**Feature interaction testing:**
- Does clicking things do what you expect?
- Is feedback immediate (< 100ms response)?
- Are there loading indicators for async actions?
- Can you undo actions? Is it clear how?
- Are there confirmation dialogs for destructive actions?

## Phase 4: Forms & Input Analysis

Forms are where UX lives or dies. Test EVERY form exhaustively.

**For each form in the product:**
- Screenshot the empty form
- Screenshot the form with validation errors (submit empty, enter invalid data)
- Screenshot the form with valid data
- Screenshot the success state after submission

**Form analysis checklist:**
- [ ] Labels — are all fields labeled? Labels above or beside?
- [ ] Placeholders — helpful hints or replacing labels (bad)?
- [ ] Required fields — clearly marked? How?
- [ ] Validation — inline or on submit? Real-time or delayed?
- [ ] Error messages — specific ("Email must include @") or generic ("Invalid input")?
- [ ] Error placement — next to the field or at the top? Color-coded?
- [ ] Success feedback — what happens after valid submission?
- [ ] Field types — are email fields type=email? Numbers type=number? Dates using date pickers?
- [ ] Autofocus — is the first field focused on page load?
- [ ] Tab order — logical keyboard navigation?
- [ ] Submit button — clear label? Disabled until valid? Loading state?
- [ ] Password fields — show/hide toggle? Strength indicator?
- [ ] Multi-step forms — progress indicator? Can you go back?

## Phase 5: State Analysis — The States Nobody Tests

This separates amateur products from professional ones.

**For every major component/page, capture ALL states:**

### Empty States
- What does a dashboard look like with no data?
- What does a list look like with no items?
- What does a search look like with no results?
- Are empty states helpful? Do they guide the user to take action?
- Screenshot EVERY empty state you can find

### Loading States
- What does the user see while content loads?
- Are there skeleton screens, spinners, progress bars, or just blank space?
- How long do loads take? (Use `browser_wait_for` and observe)
- Is loading state consistent across the product?

### Error States
- What happens when you navigate to a non-existent page? (/404, /asdfghjkl)
- What happens when a form submission fails?
- What happens when a network request would fail?
- Are error messages helpful, specific, and actionable?
- Screenshot EVERY error state

### Edge States
- Very long text — does it truncate, overflow, or break layout?
- Many items — does a list with 100+ items paginate, scroll, or crash?
- Special characters — how are they displayed?
- Missing images — alt text? Broken icon? Placeholder?

### Authentication States
- Logged out view vs logged in view
- Session expiry — what happens?
- Permission-based UI — do elements hide/show based on role?

## Phase 6: Responsive Design Testing

Test at MINIMUM 3 breakpoints. Screenshot EVERY page at EVERY breakpoint.

**Breakpoints:**
- **Mobile:** 375x667 (iPhone SE)
- **Tablet:** 768x1024 (iPad)
- **Desktop:** 1366x768 (standard laptop)
- **Wide:** 1920x1080 (if the product targets wide screens)

**For each breakpoint, verify:**
- Navigation transforms appropriately (hamburger menu on mobile?)
- Content reflows — no horizontal scrolling
- Touch targets on mobile — are buttons large enough? (minimum 44x44px)
- Font sizes — readable without zooming?
- Images — do they scale? Are they too large on mobile?
- Tables — do they scroll horizontally, stack, or become unreadable?
- Forms — are they usable on mobile? Input fields large enough?
- Modals/dialogs — do they fit the viewport?
- Fixed/sticky elements — do they take too much space on small screens?

**Use `browser_resize(width, height)` for each breakpoint, then screenshot.**

## Phase 7: Micro-Interactions & Polish

The details that separate good products from great ones.

**Test and document:**
- **Hover states** — do buttons, links, cards change on hover? Is it consistent?
- **Focus states** — visible focus ring for keyboard users? Consistent style?
- **Transitions** — are page transitions smooth? Element animations fluid?
- **Scroll behavior** — smooth scrolling? Sticky headers? Parallax?
- **Cursor changes** — does the cursor indicate interactivity? (pointer on clickable elements)
- **Tooltips** — do they exist where helpful? Content useful?
- **Toast notifications** — where do they appear? Auto-dismiss? Dismissible?
- **Modals** — backdrop click to close? Escape key? Focus trapped inside?
- **Dropdown menus** — keyboard navigable? Close on outside click?
- **Copy/paste behavior** — can users copy text they'd want to share?
- **Favicon** — does it exist? Does it match the brand?
- **Page titles** — does each page have a unique, descriptive title?
- **Favicon + title in tab** — can you identify the page from the browser tab alone?

## Phase 8: Consistency Audit

Does the product look and feel like ONE product or a Frankenstein?

**Check for consistency across all pages:**
- **Color consistency** — same palette everywhere? Any rogue colors?
- **Typography consistency** — same fonts, sizes, weights everywhere?
- **Spacing system** — consistent padding/margins? Or different on every page?
- **Button styles** — same primary/secondary/tertiary styles everywhere?
- **Icon style** — all from same icon set? Consistent size and weight?
- **Component consistency** — do cards, tables, lists look the same across pages?
- **Tone of voice** — is the copy consistent in style and formality?
- **Interaction patterns** — same behavior for same actions across pages?

**Document every inconsistency with screenshots showing the difference.**

---

## Playwright MCP Quick Reference

```
browser_navigate(url)                → Go to a page
browser_snapshot()                   → Get accessibility tree with [ref] markers
browser_take_screenshot({type:"jpeg"}) → JPEG screenshot (ALWAYS use jpeg)
browser_click(ref)                   → Click element by ref
browser_hover(ref)                   → Hover element (test hover states)
browser_fill_form(ref, value)        → Fill form field
browser_press_key("Tab")             → Keyboard input
browser_type(ref, text)              → Type text
browser_select_option(ref, value)    → Select dropdown option
browser_resize(width, height)        → Change viewport size
browser_wait_for({time: 2})          → Wait N SECONDS
browser_console_messages()           → Read console errors
browser_navigate_back()              → Go back
browser_tabs()                       → List open tabs
browser_evaluate(function)           → Run JS in browser
```

## Output Format

```
## UI Deep Dive Report

### Product: [Name/URL]
### Analysis Date: [Date]
### Session: [1/2/3] of [estimated total]
### Screenshots Taken: [Count]
### Pages Analyzed: [Count / Total discovered]
### Features Inventoried: [Count]
### Phases Completed: [list]

---

### Sitemap & Navigation Architecture
[Complete page inventory]
[Navigation analysis with screenshots]

### Page-by-Page Analysis
[For each page: screenshot + complete visual and UX analysis]
[Content inventory, design analysis, interaction test results]

### Feature Inventory
[Complete feature list with status and quality assessment]

### Form Analysis
[Every form tested — empty, error, valid, success states]

### State Analysis
[Empty states, loading states, error states, edge states — all screenshotted]

### Responsive Design
[Every page at every breakpoint — what works, what breaks]

### Micro-Interactions & Polish
[Hover states, transitions, animations, keyboard behavior]

### Consistency Audit
[Cross-page inconsistencies documented with comparison screenshots]

### Issue Summary
| # | Page/Feature | Type | Severity | Description | Screenshot |
|---|-------------|------|----------|-------------|------------|
| 1 | /dashboard  | Visual | Major  | [specific issue] | [ref] |

### Design Quality Assessment
- **Visual consistency:** [1-10] — [evidence]
- **Typography quality:** [1-10] — [evidence]
- **Color usage:** [1-10] — [evidence]
- **Spacing/layout:** [1-10] — [evidence]
- **Responsive design:** [1-10] — [evidence]
- **Interaction design:** [1-10] — [evidence]
- **State handling:** [1-10] — [evidence]
- **Form UX:** [1-10] — [evidence]
- **Overall polish:** [1-10] — [evidence]
- **Accessibility signals:** [1-10] — [evidence]

### Top 15 Improvements (Priority Order)
1. [Most impactful] — WHY: [reasoning] — EFFORT: [low/medium/high]
2. ...

### The Big Picture
[2-3 paragraphs: What's the overall quality level of this product's UI/UX?
Where does it shine? Where does it fall short? What would make the biggest
difference to real users? Is it professional, mediocre, or rough? Be specific.]

### Handover Notes (for next session)
- **Pages completed:** [list]
- **Pages remaining:** [list]
- **Key issues so far:** [count + most critical]
- **Focus for next session:** [what to cover next]
```

## Success Criteria

- The product was actually VIEWED through Playwright MCP — not code-reviewed
- EVERY discoverable page was visited and screenshotted
- Navigation architecture is fully mapped
- Every screenshot has EXHAUSTIVE analysis — never "looks clean" but specific details about every visible element
- Every form was tested with empty, invalid, and valid input
- Empty states, loading states, and error states were hunted and documented
- Responsive design was tested at minimum 3 breakpoints with screenshots at each
- Micro-interactions were tested — hover, focus, transitions, keyboard
- Consistency was audited across all pages with specific inconsistencies documented
- Features are inventoried completely — nothing was skipped
- Issues are documented with severity, evidence, and screenshots
- The report gives someone who has NEVER seen the product a complete understanding of what it looks like, how it works, and where it needs improvement
- Multi-session handover notes enable continuation without context loss
- Analysis is SPECIFIC and MEASURABLE — not vague praise or generic criticism
