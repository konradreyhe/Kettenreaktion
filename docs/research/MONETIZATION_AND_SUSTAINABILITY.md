# Monetization & Long-Term Sustainability Research

> Research compiled March 2026. Focused on realistic strategies for a solo developer running a daily physics puzzle browser game (Kettenreaktion).

---

## Table of Contents

1. [How Daily Puzzle Games Monetize](#1-how-daily-puzzle-games-monetize)
2. [Ethical Monetization Principles](#2-ethical-monetization-principles)
3. [Ad Strategies for Browser Games](#3-ad-strategies-for-browser-games)
4. [Sponsorship & Partnership Models](#4-sponsorship--partnership-models)
5. [Free Tier Cost Analysis & Breaking Points](#5-free-tier-cost-analysis--breaking-points)
6. [Donation Models](#6-donation-models)
7. [Premium Features Players Will Pay For](#7-premium-features-players-will-pay-for)
8. [App Store Presence: PWA vs Native Wrapper](#8-app-store-presence-pwa-vs-native-wrapper)
9. [Legal Considerations (GDPR, Germany)](#9-legal-considerations-gdpr-germany)
10. [Hosting Cost Optimization](#10-hosting-cost-optimization)
11. [Recommended Monetization Roadmap by DAU](#11-recommended-monetization-roadmap-by-dau)
12. [Sources](#12-sources)

---

## 1. How Daily Puzzle Games Monetize

### The Wordle Model (NYT Acquisition)

Wordle itself was never directly monetized by its creator Josh Wardle. The New York Times acquired it in January 2022 for a reported "low seven figures" (estimated $1-5 million). The game now serves as a **subscriber funnel**:

- NYT Games has over 1 million premium game subscribers (2025)
- Games-only subscription: $5/month or $40/year
- Players solved over 11 billion puzzles in 2025
- Wordle alone was played 5.3 billion times in 2025
- About half of NYT's 12.33 million subscribers purchase a bundle that includes games
- NYT Games app generated approximately $11.2 million in in-app purchase revenue in Q2 2024 alone

**Takeaway for Kettenreaktion:** Wordle's real value was as a **user acquisition tool** that funneled millions into a paid subscription ecosystem. A solo developer cannot replicate this, but the model proves that daily puzzle games create intense habitual engagement that can be monetized indirectly.

### Common Revenue Models for Daily Puzzle Games

| Model | Examples | Revenue Source |
|-------|----------|---------------|
| Subscription funnel | Wordle (NYT), NYT Crossword | Free game drives paid subscriptions |
| Ad-supported free play | Wordscapes, most mobile puzzles | Banner, interstitial, rewarded ads |
| Freemium (limited free plays) | Many crossword apps | Pay for hints, extra attempts, archives |
| Hybrid (ads + IAP) | Most successful puzzle apps | Ads for free players, IAP to remove ads |
| Acquisition target | Wordle, various indie puzzles | Build audience, sell to media company |

### Market Context (2025-2026)

- Global word/puzzle games app market: approximately $3.36 billion revenue
- Puzzle game in-app purchases grew 18% in 2024
- Subscription models (ad-free passes) grew 22% in 2024
- Ads still drive the bulk of revenue for free puzzle games

---

## 2. Ethical Monetization Principles

### What Players Accept

- **Cosmetic-only purchases** (themes, skins, visual effects) -- does not affect gameplay
- **Ad-free subscriptions** -- clear value exchange
- **Rewarded ads** (opt-in) -- player chooses to watch for a benefit
- **One-time tip/donation** -- voluntary, no pressure
- **Battle pass / season pass** -- fixed cost, earn rewards by playing
- **Archive access** -- pay for past puzzle history

### What Players Reject

- **Pay-to-win** (buying hints that trivialize the puzzle)
- **Aggressive interstitial ads** (forced, unskippable, between every action)
- **Loot boxes / gacha mechanics** (especially in a puzzle game audience)
- **Cookie-wall consent** (illegal in Germany anyway)
- **Paywalling core gameplay** (daily puzzle must always be free)
- **Manipulative FOMO tactics** (countdown timers, "limited time only" pressure)

### The Golden Rule for Kettenreaktion

> The daily puzzle is always free, always the same for everyone, always shareable. Monetization happens around the core experience, never inside it.

This means:
- Never sell extra attempts for the daily puzzle
- Never sell hints that give away the solution
- Never gate sharing behind payment
- Cosmetics, archives, stats, and convenience features are fair game

---

## 3. Ad Strategies for Browser Games

### Ad Formats Ranked by Player Acceptance

| Format | Player Acceptance | eCPM (US/EU) | Notes |
|--------|-------------------|--------------|-------|
| Rewarded video (opt-in) | High | $15-25 (mobile), $3-10 (web) | Best: "Watch to unlock daily stats theme" |
| Banner (non-intrusive) | Medium | ~$1.50 | Bottom of screen, outside game area |
| Interstitial (between screens) | Low-Medium | $3-13 | Only on natural transitions (result -> menu) |
| Site skin / takeover | Medium | Varies (direct deals) | Works well for browser games |
| Pre-roll video | Low | $5-15 | Before daily puzzle loads -- risky for retention |

### Recommended Ad Strategy for Kettenreaktion

**Phase 1 (launch):** No ads. Focus on growth and retention.

**Phase 2 (1K+ DAU):** Single non-intrusive banner below the game canvas. Use Google AdSense as baseline.

**Phase 3 (5K+ DAU):** Add optional rewarded ad: "Watch a short video to see how top players solved yesterday's puzzle." Layer gaming-specific networks (AdinPlay, Venatus) on top of AdSense.

**Phase 4 (10K+ DAU):** Add tasteful interstitial on the result-to-menu transition (max 1 per session). Consider site skins for direct brand deals.

### Browser Game Ad Networks

| Network | Specialization | Min Traffic | Notes |
|---------|---------------|-------------|-------|
| Google AdSense | General | Low | Easy approval, lower eCPMs for games |
| AdinPlay (Venatus) | Browser/HTML5 games | Medium | 10+ years in browser game ads, interstitials + rewarded |
| Venatus | Gaming & entertainment | Medium | Acquired AdinPlay, strong direct demand |
| MonetizeMore | Ad optimization | Medium | Layers multiple demand sources |
| PlayWire | Gaming publishers | Higher | Premium advertisers, higher eCPMs |
| Applixir | Browser game rewarded video | Low | Specifically built for web game rewarded ads |

### Privacy-Friendly Ad Approaches

- Use contextual advertising (ads based on content, not user tracking) to minimize GDPR complexity
- First-party data only: session length, puzzle completion -- no cross-site tracking
- Consider privacy-focused ad networks that do not rely on third-party cookies
- AI-driven ad placement using in-game behavior (not personal data) is an emerging trend

### Revenue Estimates (Browser Game Ads)

Realistic estimates for a browser-based daily puzzle game:

| DAU | Monthly Page Views (est.) | Monthly Ad Revenue (est.) |
|-----|--------------------------|--------------------------|
| 100 | ~3,000 | $3-10 |
| 1,000 | ~30,000 | $30-100 |
| 10,000 | ~300,000 | $300-1,000 |
| 100,000 | ~3,000,000 | $3,000-10,000 |

*Assumes ~1 page view per DAU per day, US/EU traffic mix, single banner + optional rewarded ad. Actual revenue varies enormously by geography, ad network, and fill rate.*

---

## 4. Sponsorship & Partnership Models

### Realistic Options for a Solo Developer

**Tier 1: Reachable at 10K+ DAU**
- **Branded daily puzzles**: A brand sponsors a themed puzzle (e.g., "Today's puzzle brought to you by [Brand]"). Subtle logo placement, no gameplay changes. Potential: $100-500 per sponsored day.
- **Cross-promotion with other indie games**: Free, mutual benefit. Link to each other's games.

**Tier 2: Reachable at 50K+ DAU**
- **Media partnerships**: German-language newspapers or magazines embed the puzzle on their site (similar to how NYT embedded Wordle). Revenue split or flat licensing fee.
- **Educational partnerships**: Physics-based puzzle has natural ties to STEM education.

**Tier 3: Reachable at 100K+ DAU**
- **Direct ad sales**: Bypass ad networks, sell sponsorship slots directly to brands. Higher revenue per impression.
- **White-label licensing**: License the game engine to other publishers who want their own daily puzzle.

### Media Partnership Model (Most Relevant for German Market)

German newspapers and magazines have been expanding their digital game offerings following NYT's success:

1. Approach regional/national outlets (ZEIT, Spiegel, FAZ, Sueddeutsche) with a pitch: "Embed Kettenreaktion as your daily physics puzzle."
2. Revenue model: monthly licensing fee or revenue share on ads shown within their embed.
3. Benefit: massive distribution without marketing spend.
4. Requirement: game must be embeddable via iframe with customizable branding.

---

## 5. Free Tier Cost Analysis & Breaking Points

### Vercel (Current Plan: Hobby/Free)

| Resource | Free Limit | Breaking Point |
|----------|-----------|----------------|
| Bandwidth | 100 GB/month | ~33K-50K DAU (assuming ~2-3 MB per session) |
| Edge Requests | 1M/month | ~33K DAU |
| Builds | 100/day | Not an issue for daily puzzle |
| **Commercial Use** | **NOT ALLOWED** | **Breaks immediately if monetized** |

**CRITICAL: Vercel Hobby plan prohibits commercial use.** Any monetization (ads, donations, subscriptions) requires upgrading to Vercel Pro ($20/month) or switching to a platform that allows commercial use on the free tier.

### Recommended Alternative: Cloudflare Pages (Free)

| Resource | Free Limit | Breaking Point |
|----------|-----------|----------------|
| Bandwidth | **Unlimited** | No limit |
| Requests | **Unlimited** | No limit |
| Builds | 500/month | Not an issue |
| Sites | Unlimited | Not an issue |
| Commercial Use | **Allowed** | No restriction |

**Cloudflare Pages is the clear winner for a monetized browser game.** Unlimited bandwidth, no commercial use restriction, global CDN with 300+ edge locations, built-in DDoS protection.

### GitHub Pages (Current Alternative)

| Resource | Free Limit | Notes |
|----------|-----------|-------|
| Bandwidth | 100 GB/month | Soft limit |
| Site size | 1 GB | Sufficient for game assets |
| Builds | 10/hour | Fine for daily updates |
| Commercial Use | Allowed (public repos) | Terms are more permissive |

### Supabase (Planned for Leaderboard)

| Resource | Free Limit | Breaking Point |
|----------|-----------|----------------|
| Database | 500 MB | ~500K-1M leaderboard entries |
| Bandwidth | 10 GB/month | ~5K-10K DAU submitting scores |
| MAU (Auth) | 50,000 | 50K unique users/month |
| API Requests | Unlimited | No limit |
| Active Projects | 2 | Only need 1 |
| **Inactivity Pause** | **1 week** | Project pauses if no activity for 7 days |

**Supabase Breaking Points:**
- At ~10K DAU: bandwidth may become tight. Optimize payload sizes, cache aggressively on client.
- At 50K MAU: need Pro plan ($25/month) for auth alone.
- Inactivity pause is a risk during low-traffic periods. Mitigate with a daily cron ping.

### Cloudflare (CDN for Assets)

| Resource | Free Limit | Notes |
|----------|-----------|-------|
| CDN Bandwidth | **Unlimited** | No bandwidth charges |
| DNS | Unlimited queries | Free DNS hosting |
| SSL | Free | Automatic HTTPS |
| Workers | 100K requests/day | Sufficient for edge logic |
| DDoS Protection | Included | Enterprise-grade on free tier |

### Total Monthly Cost Projection

| DAU | Hosting | Database | CDN | Total |
|-----|---------|----------|-----|-------|
| 100 | $0 (Cloudflare Pages) | $0 (Supabase Free) | $0 (Cloudflare) | **$0** |
| 1,000 | $0 | $0 | $0 | **$0** |
| 10,000 | $0 | $0-25 | $0 | **$0-25** |
| 50,000 | $0 | $25 (Pro) | $0 | **$25** |
| 100,000 | $0 | $25-50 | $0 | **$25-50** |

**Key insight:** With Cloudflare Pages + Cloudflare CDN, hosting costs stay at $0 regardless of traffic. Supabase is the only cost driver, and only becomes paid at significant scale.

---

## 6. Donation Models

### Platform Comparison

| Platform | Fee on Tips | Monthly Fee | Best For |
|----------|-----------|-------------|----------|
| Ko-fi | **0%** (free tier) | $0 (free) / $6 (Gold) | Game devs, zero-fee tips |
| Buy Me a Coffee | 5% | $0 | Simple tipping, no account required for supporters |
| GitHub Sponsors | **0%** | $0 | Developer audience, GitHub integration |
| Patreon | 5-12% | $0 | Ongoing memberships, exclusive content |

### Do Donations Work for Browser Games?

**Realistically: donations alone will not sustain a project.** However, they serve important purposes:

- **Early revenue** before ads make sense (pre-1K DAU)
- **Community building**: supporters feel invested in the game's future
- **Signal of demand**: donation volume indicates willingness to pay for premium features later
- **Tax-friendly** in Germany (Kleinunternehmerregelung under 22,000 EUR/year)

### Expected Donation Revenue

| DAU | Monthly Donations (est.) | Conversion Rate |
|-----|-------------------------|-----------------|
| 100 | $0-10 | 0-2% |
| 1,000 | $10-50 | 0.5-1% |
| 10,000 | $50-200 | 0.1-0.5% |
| 100,000 | $200-1,000 | 0.05-0.2% |

*Conversion rate drops as audience grows because casual players are less likely to donate than early adopters.*

### Recommendation

- Use **Ko-fi** (zero fees on tips, supports one-time and monthly)
- Place a small, non-intrusive "Support this game" link in the menu (not on the puzzle screen)
- Offer a simple "Supporter" badge next to the player's name on the leaderboard as a thank-you
- Do not guilt-trip or nag. One mention per session maximum.

---

## 7. Premium Features Players Will Pay For

### Ranked by Willingness to Pay (Puzzle Game Audience)

| Feature | Price Point | Player Interest | Implementation Effort |
|---------|------------|-----------------|----------------------|
| Ad-free experience | $2-4/month or $20-30/year | High | Low (toggle ads off) |
| Puzzle archive (play past puzzles) | Included in subscription | High | Medium (store + serve old puzzles) |
| Detailed statistics & analytics | Included in subscription | Medium-High | Medium (track + visualize data) |
| Custom visual themes (dark mode, colors) | $1-3 one-time or included | Medium | Low-Medium |
| Friend challenges (send puzzle to friend) | Free or included | Medium | Medium (share links, compare scores) |
| Replay viewer (watch others' solutions) | Included in subscription | Medium | Medium-High |
| Hint system (gentle, non-spoiling) | Rewarded ad or included | Medium | Medium |
| Stats export (CSV, image) | Included in subscription | Low-Medium | Low |
| Custom physics sandbox | $3-5 one-time | Low-Medium | High |

### Recommended Premium Tier

**"Kettenreaktion+" subscription: $2.99/month or $24.99/year**

Includes:
- Ad-free experience
- Full puzzle archive (play any past puzzle)
- Detailed statistics dashboard (streak history, accuracy trends, time distributions)
- Custom visual themes (5+ themes beyond default)
- Priority support / feature voting

**Why this price point:**
- Low enough for casual players to justify ($0.10/day)
- Comparable to NYT Games standalone ($5/month) but cheaper, reflecting smaller scale
- Annual discount encourages commitment and reduces churn
- At 2% conversion rate with 10K DAU: ~200 subscribers = ~$600/month

---

## 8. App Store Presence: PWA vs Native Wrapper

### Option Comparison

| Approach | Cost | Effort | Discoverability | Maintenance |
|----------|------|--------|-----------------|-------------|
| PWA only (no app store) | $0 | None | Web only, no store | Lowest |
| TWA (Android only) | $25 one-time (Play Store fee) | Low | Google Play search | Low |
| Capacitor (Android + iOS) | $25 (Play) + $99/year (Apple) | Medium | Both stores | Medium |
| Native rewrite | High | Very High | Best store optimization | Highest |

### PWA (Progressive Web App) -- Recommended for MVP

- Install prompt on mobile browsers ("Add to Home Screen")
- Works offline with service worker caching
- No app store fees or review process
- Full control over updates (instant, no store approval)
- Limitation: no app store discoverability

### TWA (Trusted Web Activity) -- Recommended at 10K+ DAU

- Wraps PWA in a Chrome-powered container for Google Play
- No WebView -- uses actual Chrome engine, identical to browser experience
- Google Play listing provides discoverability and credibility
- One-time $25 developer registration fee
- Review process is fast (hours, not days)
- **Cannot be used for iOS**

### Capacitor -- Consider at 50K+ DAU

- Wraps web app with native shell for both Android and iOS
- Access to native APIs (push notifications, haptics)
- Apple App Store requires $99/year developer program
- Apple review rejections are common for wrapped web apps (Guideline 4.2)
- Must demonstrate "sufficient native functionality" to pass Apple review
- Each rejection-resubmission cycle takes days to weeks

### Recommendation

1. **Launch as PWA** with install prompt. Zero cost, full control.
2. **At 10K DAU:** Publish to Google Play via TWA ($25 one-time). Low effort, good Android discoverability.
3. **At 50K+ DAU:** Evaluate iOS via Capacitor. Only if revenue justifies $99/year and the review risk. Consider adding push notifications as "native functionality" to pass Apple review.

---

## 9. Legal Considerations (GDPR, Germany)

### Requirements for a German-Language Browser Game

#### Privacy Policy (Datenschutzerklaerung)

**Mandatory.** Must include:
- What data is collected (even without accounts: IP addresses, cookies, analytics)
- Legal basis for processing (GDPR Art. 6)
- Data retention periods
- User rights (access, deletion, portability)
- Contact information of the data controller
- If using analytics/ads: list all third-party processors

**Must be in German** for a German-language game. English version optional but recommended.

#### Impressum (Legal Notice)

**Mandatory for German websites** under Telemediengesetz (TMG) Section 5. Must include:
- Full name and address of the operator
- Contact information (email, optionally phone)
- If applicable: business registration number
- Responsible for content under Section 18(2) MStV

**This applies even to personal/hobby projects if they are publicly accessible.** There is no exception for non-commercial sites in German law -- though enforcement is rare for small personal projects.

#### Cookie Consent (TTDSG + GDPR)

Under Germany's TTDSG (Telekommunikation-Telemedien-Datenschutz-Gesetz), Section 25:

- **Essential cookies** (session, game state): No consent needed
- **Analytics cookies** (if any): Consent required before setting
- **Ad cookies/tracking**: Consent required before setting
- **Reject must be as easy as Accept** (equal prominence)
- **Cookie walls are not allowed** in Germany
- **Consent is valid for 6 months**, then must be re-requested
- **Fines: up to 300,000 EUR** (TTDSG) or 20M EUR / 4% revenue (GDPR)

**As of April 2025:** New German consent management ordinance aims to reduce cookie banner fatigue by allowing centralized consent management services.

#### Practical Approach for Kettenreaktion

**If no ads and no analytics (launch phase):**
- No cookie banner needed (only essential cookies for game state via localStorage)
- Still need Impressum and Datenschutzerklaerung
- Use localStorage instead of cookies where possible (localStorage is technically not a "cookie" but still falls under TTDSG if used for non-essential purposes)

**If using ads or analytics:**
- Implement a GDPR-compliant consent banner before loading any ad/analytics scripts
- Use a lightweight consent tool (e.g., Klaro, Osano free tier, or custom)
- Consider **contextual ads only** (no tracking = no consent needed for ads themselves, only for the ad network's own cookies)
- If using Google Analytics: switch to privacy-friendly alternatives (Plausible, Umami, Fathom) that can run without cookies

#### Age Restrictions

- GDPR requires parental consent for data processing of children under 16 in Germany
- If the game collects no personal data and uses no tracking, this is less of a concern
- If implementing leaderboards with usernames: consider whether this constitutes personal data

#### Kleinunternehmerregelung (Small Business Tax Exemption)

- If annual revenue is under 22,000 EUR: no VAT (Umsatzsteuer) collection required
- Simplifies early monetization enormously
- Must still declare income in annual tax return (Einkommensteuererklaerung)
- Digital services to EU customers normally require VAT via OSS (One-Stop-Shop), but Kleinunternehmer are exempt

---

## 10. Hosting Cost Optimization

### Architecture for Zero-Cost Hosting

```
[Player Browser]
       |
  [Cloudflare CDN] -- free, unlimited bandwidth
       |
  [Cloudflare Pages] -- free, static hosting, unlimited bandwidth
       |
  [Supabase] -- free tier, leaderboard API only
```

### Optimization Strategies

#### Asset Optimization
- **Sprite sheets**: Combine individual sprites into atlas textures (Phaser supports this natively). Reduces HTTP requests and improves cache efficiency.
- **Image format**: Use WebP for sprites (25-50% smaller than PNG). Provide PNG fallback for older browsers.
- **Audio format**: Use OGG with appropriate compression. Most sound effects can be under 20KB.
- **Font subsetting**: Subset Google Fonts to include only characters used in the game (Latin + German characters). Can reduce font files from 100KB+ to under 20KB.
- **Total target**: Under 500KB initial load, under 1MB total with all assets.

#### Caching Strategy
- **Immutable assets** (sprites, audio, fonts): Cache-Control: `public, max-age=31536000, immutable`. Use content-hash in filenames (Vite does this automatically).
- **Level data**: Cache-Control: `public, max-age=86400` (24 hours). New puzzle loads once per day.
- **HTML/JS entry point**: Cache-Control: `public, max-age=3600, stale-while-revalidate=86400`. Short cache with background revalidation.
- **Target cache hit ratio**: 95%+ (most returning players load zero bytes from origin)

#### Supabase Optimization
- **Client-side caching**: Cache leaderboard data in localStorage. Only fetch fresh data every 5-15 minutes.
- **Batch writes**: Submit score once per puzzle completion, not on every attempt.
- **Pagination**: Load leaderboard in pages of 25-50 entries, not all at once.
- **Edge functions**: Use Supabase Edge Functions sparingly (count toward compute limits).
- **Row-level security**: Implement at database level to avoid unnecessary API calls for authorization.

#### CDN Strategy
- Route all traffic through Cloudflare (free tier includes global CDN)
- Enable Brotli compression (15-25% smaller than Gzip for text assets)
- Use Cloudflare's auto-minification for JS/CSS
- Consider Cloudflare Workers (free: 100K requests/day) for edge logic like daily puzzle date validation

### Bandwidth Estimate

| Component | Size | Frequency | Monthly at 10K DAU |
|-----------|------|-----------|-------------------|
| Initial load (cached) | ~0 bytes | Returning player | ~0 |
| Initial load (new player) | ~500 KB | Once | ~5 GB |
| Daily puzzle data | ~2-5 KB | Daily | ~1-2 GB |
| Leaderboard API | ~1-3 KB | Per session | ~1 GB |
| Ad scripts (if any) | ~50-100 KB | Per session | ~50 GB |
| **Total (no ads)** | | | **~3-8 GB** |
| **Total (with ads)** | | | **~55-60 GB** |

*Ad scripts are the largest bandwidth consumer by far. This is served by the ad network's CDN, not yours.*

---

## 11. Recommended Monetization Roadmap by DAU

### Phase 0: Pre-Launch & Early Growth (0-100 DAU)

**Revenue target: $0/month. Focus: product quality and retention.**

- [ ] Set up Ko-fi page with "Support Kettenreaktion" link
- [ ] Host on **Cloudflare Pages** (not Vercel Hobby -- commercial use prohibited)
- [ ] Implement Impressum and Datenschutzerklaerung (legally required)
- [ ] Use localStorage only (no cookies, no consent banner needed)
- [ ] No ads, no analytics tracking
- [ ] PWA with install prompt
- [ ] Total cost: **$0/month** (domain name only: ~$10-15/year)

### Phase 1: Traction (100-1,000 DAU)

**Revenue target: $10-50/month. Focus: community building.**

- [ ] Add Ko-fi link in game menu (non-intrusive)
- [ ] Add privacy-friendly analytics (Plausible or Umami self-hosted, or Cloudflare Web Analytics -- free, no cookies)
- [ ] Start building an email list (optional, for update announcements)
- [ ] Begin designing premium features (archive, stats, themes)
- [ ] Estimated donation revenue: $10-50/month
- [ ] Total cost: **$0/month**

### Phase 2: Growth (1,000-10,000 DAU)

**Revenue target: $100-500/month. Focus: first real monetization.**

- [ ] Add single banner ad below game canvas (Google AdSense or Applixir)
- [ ] Implement cookie consent banner (required for ads)
- [ ] Add optional rewarded ad ("Watch to see yesterday's top solution replay")
- [ ] Launch **Kettenreaktion+ subscription** ($2.99/month or $24.99/year) with:
  - Ad-free experience
  - Puzzle archive
  - Detailed statistics
  - Custom themes
- [ ] Publish to **Google Play via TWA** ($25 one-time)
- [ ] Implement Supabase leaderboard (free tier sufficient)
- [ ] Estimated revenue: $100-300 (ads) + $50-150 (subscriptions) + $20-50 (donations) = **$170-500/month**
- [ ] Total cost: **$0-25/month** (Supabase may still be free)

### Phase 3: Established (10,000-100,000 DAU)

**Revenue target: $500-5,000/month. Focus: sustainable business.**

- [ ] Layer gaming-specific ad networks (AdinPlay/Venatus, PlayWire) alongside AdSense
- [ ] Add tasteful interstitial on result-to-menu transition (max 1/session)
- [ ] Grow subscription base (target 2-5% conversion)
- [ ] Approach German media outlets for embedding partnerships
- [ ] Consider branded/sponsored daily puzzles ($100-500/sponsored day)
- [ ] Evaluate iOS App Store via Capacitor (if revenue justifies $99/year)
- [ ] Consider hiring help for content (level design) if revenue supports it
- [ ] Estimated revenue: $500-3,000 (ads) + $500-2,000 (subscriptions) + $0-1,000 (sponsorships) = **$1,000-6,000/month**
- [ ] Total cost: **$25-75/month** (Supabase Pro + domain + Apple Developer if applicable)

### Phase 4: Scale (100,000+ DAU)

**Revenue target: $5,000+/month. Focus: professional operation.**

- [ ] Direct ad sales to bypass network fees (30-50% more revenue per impression)
- [ ] Media licensing deals (newspapers, magazines embed the game)
- [ ] White-label licensing to other publishers
- [ ] Consider full-time dedication if revenue supports it
- [ ] Explore acquisition interest (media companies, game publishers)
- [ ] Add push notifications via native app wrapper for re-engagement
- [ ] Family/team subscription tiers
- [ ] Estimated revenue: $5,000-15,000+ (ads) + $3,000-10,000 (subscriptions) + $1,000-5,000 (partnerships) = **$9,000-30,000+/month**
- [ ] Total cost: **$50-200/month**

### Revenue Summary Table

| DAU | Monthly Revenue (est.) | Monthly Cost | Net Profit |
|-----|----------------------|--------------|------------|
| 100 | $0-10 | $0-1 | ~$0 |
| 1,000 | $40-100 | $0-1 | $40-100 |
| 10,000 | $500-2,000 | $25-50 | $450-1,950 |
| 50,000 | $3,000-8,000 | $25-75 | $2,925-7,925 |
| 100,000 | $9,000-30,000 | $50-200 | $8,800-29,800 |

---

## Key Strategic Recommendations

1. **Switch from Vercel Hobby to Cloudflare Pages immediately.** Vercel Hobby prohibits commercial use. Cloudflare Pages offers unlimited bandwidth for free with no commercial restrictions.

2. **Do not add ads until 1K+ DAU.** Ads before you have traction will hurt retention more than they help revenue. The $30-100/month is not worth the UX cost at low scale.

3. **Build the subscription infrastructure early** (archive, stats, themes) even before charging for it. When you flip the switch, the value proposition is already proven.

4. **Invest in shareability over monetization.** The daily puzzle format lives or dies on viral sharing. Every player who shares their result is free marketing worth more than any ad impression.

5. **Keep the German legal requirements simple.** No tracking = no consent banner needed. Add analytics and ads only when the revenue justifies the legal complexity.

6. **Ko-fi from day one.** Zero cost, zero effort, occasional small income, and it signals to players that this is a passion project by a real person (which German users tend to support).

7. **Target German media partnerships** as the primary growth strategy at 10K+ DAU. A single newspaper embed can multiply DAU overnight, and the licensing fee model provides stable recurring revenue.

8. **PWA first, TWA second, Capacitor maybe.** Do not waste time on native wrappers until the web version is proven and growing.

---

## 12. Sources

### Daily Puzzle Game Monetization
- [Wordle Business Model - Vizologi](https://vizologi.com/business-strategy-canvas/wordle-business-model-canvas/)
- [Wordle Statistics 2026 - ElectroIQ](https://electroiq.com/stats/wordle-statistics/)
- [How Does Wordle Make Money - FourWeekMBA](https://fourweekmba.com/how-does-wordle-make-money/)
- [Wordle Business Model - ProductMint](https://productmint.com/wordle-business-model-how-does-wordle-make-money/)
- [Word Game Statistics 2026 - Crosswordle](https://crosswordle.com/blog/word-game-state-of-play-2025)
- [NYT Puzzle Empire - The AI POV](https://theaipov.news/news/the-new-york-times-puzzle-empire-how-wordle-strands-and-connections-changed-daily-games/)
- [NYT Games Subscription Goldmine - Ivey HBA](https://www.ivey.uwo.ca/hba/blog/2025/03/the-daily-puzzle-phenomenon-how-nyt-turned-games-into-a-subscription-goldmine/)

### Ethical Monetization
- [Indie Game Monetization 2025 - Mulitplay](https://mulitplay.com/game-strategies/1766423-indie-game-monetization-strategies)
- [Ethical Monetization System Design - DaydreamSoft](https://www.daydreamsoft.com/blog/ethical-monetization-system-design-earning-revenue-without-losing-player-trust)
- [Game Monetization Models - SetupAd](https://setupad.com/blog/game-monetization-models/)
- [Ethical Game Monetization - Meegle](https://www.meegle.com/en_us/topics/game-monetization/ethical-game-monetization)
- [Mobile Game Monetization 2026 - TekRevol](https://www.tekrevol.com/blogs/mobile-game-monetization/)

### Ad Networks & Strategies
- [Gaming Ad Networks 2025 - AdPushup](https://www.adpushup.com/blog/gaming-ad-networks/)
- [Gaming Ad Networks 2026 - MonetizeMore](https://www.monetizemore.com/blog/top-ad-networks-gaming-vertical/)
- [Rewarded Ads Stats 2026 - MAF](https://maf.ad/en/blog/rewarded-ads-stats/)
- [AdinPlay - Browser Game Monetization](https://adinplay.com/)
- [Browser Game Monetization - Venatus](https://www.venatus.com/publishers/browser-game-monetization)
- [HTML5 Game Ads - AdPushup](https://www.adpushup.com/blog/html5-game-ads/)
- [Browser Game Ad Revenue Guide - Applixir](https://blog.applixir.com/blog/maximizing-visibility-revenue-a-guide-for-browser-based-games/)

### Hosting & Free Tier Limits
- [Vercel Limits](https://vercel.com/docs/limits)
- [Vercel Hobby Plan](https://vercel.com/docs/plans/hobby)
- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase Pricing Breakdown - Metacto](https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance)
- [Cloudflare Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Cloudflare Free Plan](https://www.cloudflare.com/plans/free/)
- [Vercel Alternatives - DigitalOcean](https://www.digitalocean.com/resources/articles/vercel-alternatives)
- [Static Hosting Comparison - Appwrite](https://appwrite.io/blog/post/best-free-static-website-hosting)

### Donation Platforms
- [Ko-fi vs Buy Me a Coffee 2026 - Talks.co](https://talks.co/p/kofi-vs-buy-me-a-coffee/)
- [Ko-fi](https://ko-fi.com/)
- [Buy Me a Coffee Pricing 2026 - SchoolMaker](https://www.schoolmaker.com/blog/buy-me-a-coffee-pricing)

### PWA & App Store
- [PWA vs Native App 2026 - MagicBell](https://www.magicbell.com/blog/pwa-vs-native-app-when-to-build-installable-progressive-web-app)
- [Publishing PWA to App Stores - MobiLoud](https://www.mobiloud.com/blog/publishing-pwa-app-store)
- [PWA to Native with Capacitor - Capgo](https://capgo.app/blog/transform-pwa-to-native-app-with-capacitor/)
- [TWA Bubblewrap Guide - Thinktecture](https://www.thinktecture.com/en/pwa/twa-bubblewrap/)

### GDPR & German Legal
- [GDPR Cookie Consent 2025 - SecurePrivacy](https://secureprivacy.ai/blog/gdpr-cookie-consent-requirements-2025)
- [GDPR Cookies 2026 - Usercentrics](https://usercentrics.com/knowledge-hub/gdpr-cookies/)
- [Cookie Consent Germany - CookieScript](https://cookie-script.com/blog/cookie-consent-requirements-in-germany)
- [Cookie Consent Germany Checklist - CookieYes](https://www.cookieyes.com/blog/cookie-consent-requirements-germany/)
- [German Consent Ordinance - Usercentrics](https://usercentrics.com/knowledge-hub/cookie-flood-control-consent-management-ordinance-tdddg/)
- [GDPR Reform Cookie Banners - Ailance](https://2b-advice.com/en/2025/11/13/dsgvo-reform-these-are-the-planned-changes-for-cookie-banners/)

### Sponsorship & Partnerships
- [Brand Collaborations in Games - Mainleaf](https://mainleaf.com/brand-collaborations-in-games/)
- [In-Game Sponsorships - Adrian Crook](https://adriancrook.com/a-fresh-look-at-in-game-sponsorships/)
- [Video Game Advertising Trends - dblspc](https://dblspc.com/insights/video-game-advertising-trends/)

### Cost Optimization
- [Static Hosting Providers 2026 - Crystallize](https://crystallize.com/blog/static-hosting)
- [Infrastructure Speed Guide 2026 - PageSpeed Matters](https://www.pagespeedmatters.com/resources/guides/ultimate-infrastructure-hosting-guide)

---

*Last updated: 2026-03-26*
