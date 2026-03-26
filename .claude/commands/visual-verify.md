---
description: "After UI changes, when you need to verify what the user actually sees. Code review misses visual bugs — screenshots catch them."
---

# Visual & Browser Verification with Playwright MCP

**When to use:** After UI changes, when you need to verify what the user actually sees. Code review misses visual bugs — screenshots catch them.

**Role:** You are a visual QA engineer. Your job is to verify that the application looks and behaves correctly from the user's perspective.

---

**Verify visually:** $ARGUMENTS

Describing visual bugs in words introduces "translation loss." A screenshot is always more precise than a description. See the bug, understand the code, fix it, verify it visually. Close the loop.

**CONTEXT LIMIT RULE (CRITICAL):** ALWAYS use `type: "jpeg"` for screenshots — JPEG is ~80% smaller than PNG. After 15 screenshots, use `/low-context-handover` to continue in a new session. The API has a 20MB request limit — PNG screenshots WILL crash the session.

## Don't

- Don't declare UI changes "done" without visual verification
- Don't rely only on code reading for layout, spacing, or styling changes
- Don't skip responsive checks (mobile, tablet, desktop)
- Don't forget to check the browser console for errors
- Don't test only the happy path visually (check error states, empty states, loading states)

---

## Setup

**Playwright MCP (automated/repeatable testing):**
```
claude mcp add playwright npx '@playwright/mcp@latest'
```

**Chrome Extension (interactive testing):**
```
claude --chrome    # or type /chrome in session
# Requires: Claude in Chrome extension v1.0.36+
# Can: navigate, click, read console, take screenshots, share login state
```

**Manual DevTools (universal fallback):**
Open browser → F12 → copy console errors into conversation.

---

## Quick Pre-Commit Check (5 minutes)

```
1. Start local dev server (confirm URL loads)
2. browser_navigate("http://localhost:PORT")
3. browser_take_screenshot()
4. Quick checklist: text visible? no overlap? colors correct? no console errors?
5. browser_resize(375, 812) → browser_take_screenshot()  # mobile check
6. All PASS → commit. Any FAIL → fix first.
```

---

## Full Visual Audit Workflow

### Step 1: Navigate & Screenshot

```
browser_navigate("https://target-url.com")
browser_resize(1440, 900)                      # Desktop
browser_take_screenshot({ fullPage: true })
```

### Step 2: Responsive Check

Test at standard breakpoints:

| Viewport | Size | Check |
|----------|------|-------|
| Desktop | 1440×900 | Layout, spacing, alignment |
| Tablet | 768×1024 | Adaptation, overflow, touch targets |
| Mobile | 375×812 | Readability, no horizontal scroll, navigation |
| Wide | 1920×1080 | No stretched elements |

```
browser_resize(375, 812)
browser_take_screenshot({ fullPage: true })
```

### Step 3: Console & Network Check

```
browser_console_messages()     # No JS errors
browser_network_requests()     # No 404s, 500s, CORS errors
```

Verify:
- No JavaScript errors (filter for errors, not warnings)
- No failed network requests (404s, 500s, CORS errors)
- No unhandled promise rejections

### Step 4: Interaction Testing

Test the actual user flow:
- Click every interactive element in the changed area
- Submit forms with valid and invalid data
- Test error states (empty fields, wrong formats, server errors)
- Test loading states (slow network simulation if applicable)
- Test edge cases (very long text, empty content, special characters)

### Step 5: Dark Mode (if applicable)

```
browser_evaluate(`document.documentElement.classList.toggle('dark')`)
browser_take_screenshot()
```

### Step 6: Generate Test Files (Optional)

If using Playwright MCP, generate a test file from the verification session:
- Walk through the critical user flow step by step
- Let Playwright capture selectors against the real UI
- Save the generated test file for CI
- Run the generated test to confirm it passes

---

## Playwright MCP Tool Reference

```
browser_navigate(url)              → Navigate to URL
browser_snapshot()                  → Accessibility tree with [ref] markers
browser_take_screenshot(options?)   → Screenshot (primary review tool)
  options: { fullPage?, element?, ref?, type? }
browser_evaluate(function, ref?)    → Execute JS in browser (must return serializable value)
browser_run_code(code)              → Full Playwright API (has `page` object)
browser_wait_for(options)           → Wait for text/textGone/time (SECONDS, not ms!)
browser_click(ref, options?)        → Click element
browser_type(ref, text, options?)   → Type text (slowly?, submit?)
browser_fill_form(fields)           → Fill multiple form fields
browser_press_key(key)              → Keyboard input ("Enter", "Tab", "Shift+A")
browser_hover(ref)                  → Hover over element
browser_drag(startRef, endRef)      → Drag and drop
browser_select_option(ref, values)  → Select dropdown option
browser_resize(width, height)       → Change viewport size
browser_navigate_back()             → Go back
browser_tabs()                      → List open tabs
browser_console_messages()          → Read console output
browser_network_requests()          → Read network activity
browser_handle_dialog(action)       → Accept/dismiss dialogs
browser_file_upload(ref, paths)     → Upload files
browser_close()                     → Close browser
```

### Critical Gotchas

1. **`browser_wait_for` time is in SECONDS**, not milliseconds
2. **`browser_evaluate` must return serializable values** — no DOM nodes, no functions
3. **Always `browser_snapshot()` before interacting** — refs change after navigation
4. **Screenshots are the primary tool** — snapshot gives structure, screenshot gives visuals
5. **`browser_run_code` has full Playwright API** — use for complex multi-step operations

---

## Browser-Side Analysis Functions

Copy-paste these into `browser_evaluate()` for programmatic analysis.

### WCAG Contrast Checker

```javascript
(() => {
  function luminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
  function parseColor(str) {
    const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
  }
  function contrastRatio(c1, c2) {
    const l1 = luminance(...c1), l2 = luminance(...c2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
  const issues = [];
  document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,li,td,th,label,button').forEach(el => {
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return;
    const fg = parseColor(style.color), bg = parseColor(style.backgroundColor);
    if (bg[0] === 0 && bg[1] === 0 && bg[2] === 0 && style.backgroundColor === 'rgba(0, 0, 0, 0)') return;
    const ratio = contrastRatio(fg, bg);
    const fontSize = parseFloat(style.fontSize);
    const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && parseInt(style.fontWeight) >= 700);
    if (!(isLargeText ? ratio >= 3 : ratio >= 4.5)) {
      issues.push({ tag: el.tagName, text: el.textContent?.substring(0, 40), ratio: Math.round(ratio * 100) / 100, required: isLargeText ? 3 : 4.5 });
    }
  });
  return { totalChecked: document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,li').length, failures: issues.slice(0, 20) };
})()
```

### Layout Overlap Detection

```javascript
(() => {
  const elements = document.querySelectorAll('h1,h2,h3,p,img,button,a,div[class],section,header,footer,nav');
  const rects = [];
  elements.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && r.top < window.innerHeight && r.bottom > 0) {
      rects.push({ tag: el.tagName, class: el.className?.substring?.(0, 30) || '', top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height) });
    }
  });
  const overlaps = [];
  for (let i = 0; i < rects.length && i < 50; i++) {
    for (let j = i + 1; j < rects.length && j < 50; j++) {
      const a = rects[i], b = rects[j];
      if (a.left < b.left + b.width && a.left + a.width > b.left && a.top < b.top + b.height && a.top + a.height > b.top) {
        const overlapArea = Math.max(0, Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left)) *
                           Math.max(0, Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top));
        const minArea = Math.min(a.width * a.height, b.width * b.height);
        if (overlapArea / minArea > 0.3) {
          overlaps.push({ a: `${a.tag}.${a.class}`, b: `${b.tag}.${b.class}`, overlapPct: Math.round(overlapArea / minArea * 100) });
        }
      }
    }
  }
  return { visibleElements: rects.length, significantOverlaps: overlaps.slice(0, 10) };
})()
```

### Typography Audit

```javascript
(() => {
  const fonts = new Set(), sizes = {}, truncated = [];
  document.querySelectorAll('h1,h2,h3,h4,p,span,a,li,td,button,label').forEach(el => {
    const s = getComputedStyle(el);
    if (s.display === 'none') return;
    fonts.add(s.fontFamily.split(',')[0].trim().replace(/['"]/g, ''));
    const size = Math.round(parseFloat(s.fontSize));
    sizes[size] = (sizes[size] || 0) + 1;
    if (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight) {
      truncated.push({ tag: el.tagName, text: el.textContent?.substring(0, 50), overflow: s.overflow });
    }
  });
  return { fontsUsed: [...fonts], fontSizeDistribution: sizes, truncatedElements: truncated.slice(0, 10) };
})()
```

### Master Quality Analyzer

```javascript
(() => {
  const w = window.innerWidth, h = window.innerHeight;
  const perf = performance.getEntriesByType('navigation')[0];
  const timing = perf ? {
    domLoad: Math.round(perf.domContentLoadedEventEnd),
    fullLoad: Math.round(perf.loadEventEnd),
    firstPaint: Math.round(performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || 0),
  } : null;
  const images = [...document.querySelectorAll('img')].map(img => ({
    src: img.src?.substring(0, 80), natural: `${img.naturalWidth}x${img.naturalHeight}`,
    displayed: `${img.width}x${img.height}`, hasAlt: !!img.alt, loaded: img.complete && img.naturalWidth > 0,
  }));
  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => ({
    level: parseInt(h.tagName[1]), text: h.textContent?.substring(0, 60),
  }));
  const meta = {
    title: document.title,
    description: document.querySelector('meta[name=description]')?.content?.substring(0, 100),
    ogImage: document.querySelector('meta[property="og:image"]')?.content?.substring(0, 100),
    viewport: document.querySelector('meta[name=viewport]')?.content,
  };
  return {
    viewport: { width: w, height: h, dpr: window.devicePixelRatio }, timing,
    images: images.slice(0, 15), headings,
    interactive: { links: document.querySelectorAll('a[href]').length, buttons: document.querySelectorAll('button,[role=button],input[type=submit]').length, forms: document.querySelectorAll('form').length, inputs: document.querySelectorAll('input,textarea,select').length },
    meta,
  };
})()
```

### Safe Zone Compliance (Social Media)

```javascript
(() => {
  const zones = {
    tiktok:    { top: 15, bottom: 20, left: 5, right: 5 },
    instagram: { top: 10, bottom: 15, left: 5, right: 5 },
    youtube:   { top: 5,  bottom: 15, left: 5, right: 5 },
  };
  const w = window.innerWidth, h = window.innerHeight;
  const results = {};
  for (const [platform, zone] of Object.entries(zones)) {
    const safeArea = {
      top: h * zone.top / 100, bottom: h - (h * zone.bottom / 100),
      left: w * zone.left / 100, right: w - (w * zone.right / 100),
    };
    let violations = 0;
    document.querySelectorAll('h1,h2,h3,p,button,a,img').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      if (r.top < safeArea.top || r.bottom > safeArea.bottom ||
          r.left < safeArea.left || r.right > safeArea.right) violations++;
    });
    results[platform] = { violations, safeArea };
  }
  return results;
})()
```

### Color Blindness Simulation

```javascript
(() => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('style', 'position:absolute;width:0;height:0');
  svg.innerHTML = `<defs>
    <filter id="protanopia"><feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/></filter>
    <filter id="deuteranopia"><feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/></filter>
    <filter id="tritanopia"><feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/></filter>
  </defs>`;
  document.body.appendChild(svg);
  // Usage: document.documentElement.style.filter = 'url(#protanopia)' → screenshot → set to 'none'
  return { filtersInjected: ['protanopia', 'deuteranopia', 'tritanopia'] };
})()
```

---

## Scoring Rubric

| Dimension | Weight | What to Check |
|-----------|--------|---------------|
| **Visual Hierarchy** | 15% | Eye flow, focal point, F/Z-pattern |
| **Typography** | 12% | Scale, readability, rhythm, no truncation |
| **Color & Contrast** | 12% | WCAG AA+, harmony, brand match |
| **Spacing & Layout** | 12% | Grid consistency, whitespace, alignment |
| **Responsiveness** | 10% | All breakpoints functional |
| **Interaction Design** | 10% | Feedback, affordances, micro-interactions |
| **Content Quality** | 10% | Real, scannable, compelling |
| **Performance Feel** | 7% | Load time, perceived speed |
| **Accessibility** | 7% | WCAG compliance, keyboard nav |
| **Brand Consistency** | 5% | Identity, memorability |

**Score = sum(dimension x weight) → Target: 7.5+ (production), 8.5+ (showcase)**

---

## Claude Vision Prompt Patterns

### Pattern 1: Detailed Review (best for thorough analysis)
```
You are a senior UI/UX designer reviewing this screenshot.
First, describe what you see in 2-3 sentences.
Then evaluate: visual hierarchy, typography, color, spacing, overall impression.
Rate each 1-10 with one-sentence justification.
```

### Pattern 2: QA Checklist (best for compliance)
```
PASS or FAIL for each:
□ All text readable (no truncation, sufficient contrast)
□ Images loaded and properly sized
□ CTA button visible and prominent
□ Brand colors correctly applied
□ No layout overlap or broken elements
□ Visual hierarchy guides eye to key message
```

### Pattern 3: Comparison (best for before/after)
```
Compare these two screenshots:
Image 1: [before]  Image 2: [after]
List: 1. What changed  2. What improved  3. What regressed  4. Which is better, why
```

### Pattern 4: Specific Detection (best for targeted checks)
```
Look at this screenshot and answer ONLY:
1. Is there any text cut off or truncated? If yes, what text?
2. Are there any empty/blank areas that look unintentional?
3. Is the CTA visible and prominent?
Answer each with YES/NO and evidence.
```

### Pattern 5: Accessibility Audit
```
Audit for accessibility:
1. Color contrast — any text hard to read?
2. Touch targets — buttons large enough (44x44px min)?
3. Color-only information — anything communicated solely by color?
4. Focus indicators — visible focus states?
Rate WCAG compliance: A / AA / AAA
```

### Pattern 6: Platform-Specific (social media content)
```
This is a frame from a [TikTok/Instagram Reel/YouTube Short].
- Will top 15% be hidden by username overlay?
- Will bottom 20% be hidden by description/buttons?
- Is aspect ratio correct (9:16)?
- Does the hook grab attention in <1 second?
- Would you stop scrolling for this? Why or why not?
```

### Hallucination Reduction

1. Ask for evidence: "Quote the exact text you see"
2. Anchor to coordinates: "Describe what's in the top-left quadrant"
3. Binary questions first: "Is there a button? YES/NO" before "What does it say?"
4. Negative prompting: "If you cannot clearly read the text, say UNCLEAR"

---

## Output Format

```
## Visual Verification Report

### Target
[What was verified and at what URL]

### Screenshots Taken
- Desktop (1440x900): [description]
- Tablet (768x1024): [description]
- Mobile (375x812): [description]

### Console Check
- Errors: [count]:[details if any]
- Warnings: [count]:[notable ones]
- Network failures: [count]:[details if any]

### Interaction Testing
- [Flow 1]: PASS/FAIL:[details]
- Error states: PASS/FAIL:[details]
- Edge cases: PASS/FAIL:[details]

### Issues Found
[Exact description with screenshot reference, viewport, and steps to reproduce]

### Visual Verdict: PASS / FAIL
[Overall assessment with reasoning]
```

---

## Remotion Video QA (for video projects)

### Frame Sampling Strategy
For a 30s video (900 frames at 30fps), sample ~15-25 key frames:
- Frame 0 (intro), scene boundaries, mid-scene peaks, last frame (CTA)

### Via Remotion Studio
```
1. npm run dev → localhost:3000
2. browser_navigate("http://localhost:3000")
3. Select composition → seek to frame N → browser_take_screenshot()
4. Evaluate with scoring rubric
```

### Video Production Quality Score
| Dimension | Weight |
|-----------|--------|
| Text Readability | 20% |
| Color Harmony | 15% |
| Layout Balance | 15% |
| Safe Zones | 10% |
| Animation Quality | 10% |
| Brand Compliance | 10% |
| Visual Hierarchy | 10% |
| Technical Quality | 10% |

**Target: 7.5+ (production), 8.5+ (showcase)**

### Social Media Safe Zones
| Platform | Top | Bottom | Sides |
|----------|-----|--------|-------|
| TikTok | 15% | 20% | 5% |
| Instagram | 10% | 15% | 5% |
| YouTube | 5% | 15% | 5% |

---

## Success Criteria

- All viewports checked (desktop, tablet, mobile)
- Browser console shows no errors related to the changes
- Interactive elements work correctly
- Edge cases and error states verified visually
- Screenshots document the verified state
- Any issues found include exact reproduction steps

---

*Consolidated from Playwright MCP research (promoforge/docs/research/). Setup: `claude mcp add playwright npx '@playwright/mcp@latest'`*
