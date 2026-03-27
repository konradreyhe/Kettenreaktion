# Virality & Sharing Research for Kettenreaktion

> **Research Date:** 2026-03-26
> **Purpose:** Actionable strategies for maximizing viral potential of a daily physics puzzle browser game.
> **Status:** Research complete. Ready for implementation planning.

---

## Table of Contents

1. [Lessons from Wordle's Viral Growth](#1-lessons-from-wordles-viral-growth)
2. [Sharing Formats That Work](#2-sharing-formats-that-work)
3. [GIF/Video Generation in Browser](#3-gifvideo-generation-in-browser)
4. [Web Share API](#4-web-share-api)
5. [Social Media Optimization (OG/Twitter Cards)](#5-social-media-optimization)
6. [Community Building](#6-community-building)
7. [Daily Game Launch Strategy](#7-daily-game-launch-strategy)
8. [Retention Mechanics Beyond Streaks](#8-retention-mechanics-beyond-streaks)
9. [Privacy-Respecting Analytics](#9-privacy-respecting-analytics)
10. [SEO for Browser Games](#10-seo-for-browser-games)
11. [Kettenreaktion Action Plan](#11-kettenreaktion-action-plan)

---

## 1. Lessons from Wordle's Viral Growth

### The Growth Timeline

| Date | Players | Event |
|------|---------|-------|
| Jul 2021 | Private | Josh Wardle creates game for his partner |
| Oct 2021 | ~90 | Public release on powerlanguage.co.uk |
| Nov 2021 | ~90/day | Slow organic growth |
| Dec 2021 | Thousands | Emoji grid sharing feature added |
| Jan 2, 2022 | 300,000/day | Viral explosion begins |
| Jan 9, 2022 | 2,000,000/day | Peak viral growth |
| Jan 31, 2022 | Millions | NYT acquires for low seven figures |
| Q1 2022 | Tens of millions | NYT's best subscriber quarter ever |

Wordle grew from 90 to 300,000 daily players in ~8 weeks -- a 3,000%+ growth rate achieved entirely without paid advertising.

### Why It Went Viral: The Five Pillars

**1. Scarcity (One Puzzle Per Day)**
The one-puzzle-per-day format leverages the scarcity principle: the less accessible something is, the greater the craving. Players cannot binge -- they spend ~3 minutes, then must wait 24 hours. This creates an "appointment" mechanic rather than an open-ended feed. The constraint also means everyone solves the SAME puzzle, creating a shared experience.

**2. The Emoji Grid (Spoiler-Free Sharing)**
A fan (Elizabeth S from New Zealand Twitter) invented the emoji grid as a spoiler-free sharing format. Wardle implemented it, and it became the primary growth catalyst. With just 30 squares and 3 colors, each grid tells a concise narrative of luck, frustration, perseverance, or failure. Between Dec 2021 and Feb 2022, players posted 23.5 million score tweets from 2.1 million unique users.

**3. Social Proof Loop**
Each shared grid was a free advertisement seen by hundreds of followers. Each new player shared their own grid, reaching hundreds more. This exponential loop mirrors platform-level virality. The grid format created FOMO: seeing others share results makes non-players curious.

**4. Universal Accessibility**
No app download, no account creation, no paywall. Just a URL. Works on any device with a browser. Five-letter English words are universally approachable.

**5. Simplicity**
No tutorials needed. Rules are self-evident within one guess. The entire game fits on one screen.

### Key Takeaway for Kettenreaktion

Kettenreaktion already has the one-puzzle-per-day mechanic and the shared-experience element. The critical missing piece is a **sharing format as compelling as Wordle's emoji grid** -- something that tells the story of a physics chain reaction in a visual, spoiler-free, instantly understandable way.

---

## 2. Sharing Formats That Work

### Emoji Text Results (Already Planned)

**Strengths:**
- Universal compatibility (works everywhere text works: Twitter, WhatsApp, Discord, SMS)
- Zero bandwidth cost
- Copy-paste simplicity
- Spoiler-free

**Design Recommendations for Kettenreaktion:**

```
Kettenreaktion #42 -- 3/5 stars
Chain: 7 objects hit
Time: 4.2s

[placement zone emoji] -> [chain reaction emoji sequence]
kettenreaktion.de
```

The emoji sequence should visually represent the chain reaction -- what objects were hit and in what order. Use physics-themed emoji:

- Placement: target emoji for where the player placed their object
- Chain elements: distinct emoji per object type (ball, domino, ramp, etc.)
- Outcome: star rating or checkmark/X

**Important:** Keep it to 3-4 lines maximum. Wordle's grid works because it is compact. Long share texts get ignored.

### Visual Replay (GIF/Video)

**Strengths:**
- Physics chain reactions are inherently visual and satisfying
- GIFs auto-play in most social feeds (Twitter, Discord, Reddit)
- Unique differentiator vs. text-only daily games
- "Oddly satisfying" content has massive organic reach

**This is Kettenreaktion's secret weapon.** Most daily puzzle games can only share text. A physics chain reaction is visually compelling content that people WANT to watch and share even if they do not play the game. This is the equivalent of Wordle's emoji grid -- but potentially more powerful because it is visual content in a video-first social media landscape.

### Score Comparison Cards

A styled image (PNG/JPG) showing:
- Puzzle number and date
- Player's score/star rating
- Key stats (chain length, time, objects hit)
- Game branding and URL
- Designed for 1200x630px (OG image ratio)

This works well for platforms that render image previews (Twitter, Facebook, LinkedIn).

### Recommended Sharing Priority

1. **Emoji text** -- always available, zero friction, universal
2. **GIF/MP4 replay** -- the viral differentiator, opt-in after completing puzzle
3. **Score card image** -- generated as OG image for link previews
4. **Direct challenge link** -- "Can you beat my score?" with link to same puzzle

---

## 3. GIF/Video Generation in Browser

### Format Comparison

| Format | File Size | Quality | Social Support | Browser Generation |
|--------|-----------|---------|----------------|-------------------|
| GIF | Large (~2-5MB) | 256 colors, dithering | Universal auto-play | Mature libraries |
| MP4 (H.264) | Small (~200-500KB) | Excellent | Universal (platforms convert GIF to MP4 anyway) | WebCodecs API |
| WebM (VP9) | Smallest | Excellent | Good (no Safari <16.4) | WebCodecs API |
| Animated WebP | Small | Good | Partial (no email, some social) | Limited |

**Recommendation:** Generate MP4 as primary format, with GIF as fallback. Social platforms (Twitter, Facebook, Reddit, Discord) silently convert uploaded GIFs to MP4 anyway, so uploading MP4 directly gives better quality control and faster uploads. MP4 is 90-95% smaller than GIF for equivalent content.

### Libraries and Approaches

**canvas-record (Recommended)**
- npm: `canvas-record` (v5.5.1, actively maintained as of March 2026)
- Supports: MP4, WebM, MKV, MOV, GIF, PNG/JPG sequences
- Uses WebCodecs when available, falls back to Wasm
- Works with 2D Canvas, WebGL, and WebGPU
- GitHub: [dmnsgn/canvas-record](https://github.com/dmnsgn/canvas-record)

**WebCodecs API (Direct)**
- 5-10x faster than H264MP4Encoder, 20x faster than FFmpeg.wasm
- Hardware-accelerated encoding
- Supports VP8/VP9/AV1/HEVC codecs
- Browser support: Chrome 94+, Edge 94+, Safari 16.4+, Firefox 130+
- Best for MP4/WebM output

**gif.js (Legacy)**
- The classic browser GIF encoder
- Uses Web Workers for background processing
- 256-color limitation, larger files
- No longer actively maintained but still functional
- GitHub: [jnordberg/gif.js](https://github.com/jnordberg/gif.js)

**gifshot (Alternative)**
- Yahoo's library for creating GIFs from media streams, videos, or images
- Client-side processing
- GitHub: [yahoo/gifshot](https://yahoo.github.io/gifshot/)

### Implementation Strategy for Kettenreaktion

```
Recording approach:
1. During physics simulation, capture canvas frames at key intervals
2. After simulation completes, offer "Share Replay" button
3. Use canvas-record with WebCodecs to encode MP4 (primary)
4. Fall back to GIF encoding if WebCodecs unavailable
5. Keep replay to 3-8 seconds (short = shareable)
6. Add game branding overlay (logo, puzzle number, URL)
7. Target file size: <500KB for MP4, <2MB for GIF
```

### Performance Considerations

- Record at 30fps, not 60fps -- halves the work with minimal visual difference for sharing
- Downscale canvas for recording (720p max, 480p ideal for social)
- Use a separate offscreen canvas for recording to avoid impacting game performance
- Encode AFTER simulation completes, not during (show a brief "generating replay..." state)
- Web Workers for encoding to keep UI responsive

---

## 4. Web Share API

### Browser Support (2025-2026)

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome | Yes | Yes |
| Edge | Yes | Yes |
| Safari | Yes | Yes |
| Firefox | **No** | Yes (146+) |
| Samsung Internet | N/A | Yes |

Overall compatibility score: ~67/100. Over 92% global browser support when including mobile. The main gap is Firefox desktop.

### Implementation Best Practices

```typescript
async function shareResult(data: ShareData): Promise<void> {
  // 1. Feature detection
  if (!navigator.share) {
    fallbackShare(data);
    return;
  }

  // 2. Validate shareability (especially for files)
  if (data.files && !navigator.canShare({ files: data.files })) {
    // Remove files, share text only
    delete data.files;
  }

  // 3. Attempt share with error handling
  try {
    await navigator.share(data);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      // User cancelled -- do nothing
      return;
    }
    // Actual error -- use fallback
    fallbackShare(data);
  }
}
```

### Security Requirements

- Must be served over HTTPS (Kettenreaktion will be on Vercel, so this is automatic)
- Can only be invoked in response to a user action (click/tap)
- Cannot be called programmatically without user gesture

### Fallback Strategy (Progressive Enhancement)

```
Priority chain:
1. Web Share API (native share sheet -- best UX on mobile)
2. Platform-specific share intents:
   - Twitter/X: https://twitter.com/intent/tweet?text=...&url=...
   - WhatsApp: https://wa.me/?text=...
   - Reddit: https://reddit.com/submit?title=...&url=...
   - Telegram: https://t.me/share/url?url=...&text=...
3. Clipboard copy ("Copied to clipboard!" toast notification)
```

### Sharing with Files (GIF/MP4 replay)

The Web Share API Level 2 supports file sharing via `navigator.share({ files: [...] })`. This allows sharing the replay GIF/MP4 directly to messaging apps. Always check `navigator.canShare({ files })` first, as file sharing support varies.

---

## 5. Social Media Optimization

### Open Graph Tags (Essential)

```html
<!-- Base OG tags (static, in index.html) -->
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Kettenreaktion" />
<meta property="og:locale" content="de_DE" />
<meta property="og:locale:alternate" content="en_US" />

<!-- Dynamic OG tags (per puzzle, server-side or edge function) -->
<meta property="og:title" content="Kettenreaktion #42 -- Daily Physics Puzzle" />
<meta property="og:description" content="Can you solve today's chain reaction? Place one object and watch physics do the rest." />
<meta property="og:image" content="https://kettenreaktion.de/og/puzzle-42.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://kettenreaktion.de" />
```

### Twitter/X Card Tags

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@kettenreaktion" />
<meta name="twitter:title" content="Kettenreaktion #42" />
<meta name="twitter:description" content="Daily physics chain reaction puzzle" />
<meta name="twitter:image" content="https://kettenreaktion.de/og/puzzle-42.jpg" />
```

**Note:** Twitter/X falls back to OG tags if twitter: tags are missing, but `twitter:card` must be set explicitly to enable rich previews.

### Platform-Specific Requirements

| Platform | Image Size | Format | Notes |
|----------|-----------|--------|-------|
| Twitter/X | 1200x630 | JPG/PNG <5MB | `summary_large_image` for full preview |
| Facebook | 1200x630 | JPG/PNG <8MB | Same as OG standard |
| WhatsApp | 1200x630 | JPG/PNG | Reads OG tags for link previews |
| Discord | 1200x630 | JPG/PNG | Reads both OG and Twitter tags |
| LinkedIn | 1200x630 | JPG/PNG | Strict on image dimensions |
| Telegram | 1200x630 | JPG/PNG | Reads OG tags |
| Slack | 1200x630 | JPG/PNG | Reads OG tags |
| iMessage | 1200x630 | JPG/PNG | Reads OG tags |

**Key insight:** 1200x630px (1.91:1 ratio) is the universal sweet spot. Keep file size under 1MB. Use JPG for photos, PNG for graphics with text.

### Dynamic OG Images

For maximum social impact, generate unique OG images per puzzle showing:
- A preview/thumbnail of the puzzle layout (without solution)
- The puzzle number and date
- Game branding
- A call-to-action ("Can you trigger the chain reaction?")

This can be done via Vercel Edge Functions or a simple image generation service. Posts with optimized OG images see 40-60% higher click-through rates.

---

## 6. Community Building

### Platform Strategy

**Discord Server (Primary Community Hub)**
- Create before launch, invite early testers
- Channels: `#daily-puzzle`, `#strategies`, `#replays`, `#suggestions`, `#dev-updates`
- Bot: post daily puzzle reminder, leaderboard updates
- Encourage replay GIF sharing in `#replays`
- Run weekly "best chain reaction" contests

**Reddit (Discovery & Growth)**
- 74% of gaming Redditors are NOT on Discord and 64% are NOT on Twitch -- Reddit reaches a unique audience
- Target subreddits: r/WebGames, r/puzzlegames, r/IndieGaming, r/casualgames, r/BrowserGames
- Follow the 80/20 rule: 80% valuable content, 20% promotion
- Post development updates, behind-the-scenes physics demos, satisfying chain reaction GIFs
- Do NOT just drop links -- be a genuine community member first

**Twitter/X (Visibility & Shareability)**
- Daily puzzle teasers (short video clips of chain reactions)
- Retweet/quote player results
- Engage with #indiedev, #gamedev, #dailypuzzle communities
- Short-form video clips (chain reactions are perfect for this)

**TikTok/Instagram Reels (Reach)**
- 30%+ of top-performing indie games in 2024 attributed visibility to short-form video
- Physics chain reactions are inherently "oddly satisfying" content
- Record polished replays of particularly impressive chain reactions
- Behind-the-scenes content: how puzzles are designed, physics engine demos

### Content Calendar

| Day | Content Type | Platform |
|-----|-------------|----------|
| Monday | Dev update / behind the scenes | Twitter, Discord |
| Tuesday | Puzzle design spotlight | Reddit, Twitter |
| Wednesday | Community replay highlight | All platforms |
| Thursday | Physics tip / strategy hint | Twitter, Discord |
| Friday | Weekly challenge announcement | All platforms |
| Saturday | Best-of weekly compilation | TikTok, Instagram |
| Sunday | Community spotlight / fan content | Discord, Twitter |

---

## 7. Daily Game Launch Strategy

### Pre-Launch (6-3 Months Before)

1. **Build in public**
   - Share development progress on Twitter with #indiedev #gamedev
   - Post satisfying physics chain reaction clips (these are inherently shareable)
   - Start a devlog on Reddit (r/devblogs, r/IndieGaming)

2. **Set up infrastructure**
   - Discord server (invite-only initially, creates exclusivity)
   - Landing page with email signup ("Get notified at launch")
   - Social media accounts on all platforms

3. **Seed early testers**
   - Invite 50-100 beta testers from Discord/Reddit
   - Iterate on sharing mechanics based on feedback
   - Let testers shape the emoji format

4. **Prepare press kit**
   - Game description, key features, high-quality screenshots
   - GIF/video demos of chain reactions
   - Developer story (solo dev building a daily physics puzzle)
   - Press page on website (kettenreaktion.de/press)

### Launch Week (T-0)

1. **Influencer seeding**
   - Send personalized pitches to micro-influencers (1K-50K followers) in puzzle/casual gaming niche
   - Provide early access 1-2 weeks before launch
   - Focus on content creators who play daily puzzle games
   - Micro-influencers have higher engagement rates and better ROI than large channels

2. **Press outreach**
   - Get the game into journalists' hands 3-4 weeks before launch
   - Target: indie game blogs, puzzle game roundup writers, browser game reviewers
   - Personalize every pitch -- reference their previous coverage of similar games

3. **Community launch**
   - Open Discord to public
   - Post to r/WebGames, r/puzzlegames, r/IndieGaming (stagger posts, do not spam)
   - Launch day tweet thread: the story behind Kettenreaktion
   - Product Hunt launch (schedule for Tuesday-Thursday for best visibility)

4. **Cross-promotion**
   - Reach out to other daily game developers for mutual promotion
   - Daily game aggregator sites (e.g., listdle.com) for listing

### Post-Launch (Ongoing)

1. **Monitor and respond**
   - Track where shares are happening (analytics)
   - Engage with every share on social media in the first weeks
   - Fix bugs rapidly -- nothing kills viral momentum like a broken game

2. **Content machine**
   - Daily: retweet best player replays
   - Weekly: "Puzzle of the week" retrospective
   - Monthly: stats roundup ("This month, players triggered X chain reactions")

3. **Iterate on sharing**
   - A/B test share button placement
   - Track share-to-play conversion rate
   - Ask players what would make them share more

---

## 8. Retention Mechanics Beyond Streaks

### Already Planned: Streaks
Streaks are table stakes for daily games. But alone they create anxiety (fear of losing the streak) more than joy. Pair them with forgiving mechanics.

### Additional Retention Mechanics

**1. Weekly Challenges**
- Every Monday, release a special "Weekly Challenge" puzzle with unique constraints
- Examples: "Complete with a ball only," "Chain must hit 10+ objects," "Finish in under 2 seconds"
- Separate leaderboard for weekly challenges
- Reward: special badge/icon next to name

**2. Personal Best Tracking**
- Track player's best scores across dimensions: longest chain, fastest completion, highest score
- Show "New Personal Best!" celebrations
- "You've improved 23% since last week" nudges

**3. Seasonal Events**
- Monthly or seasonal themes (e.g., "Winter Physics" with ice/friction changes)
- Limited-time puzzles with unique mechanics
- Seasonal leaderboards that reset -- gives newcomers a fair start
- Collectible seasonal badges

**4. Friend Comparisons (Async Social)**
- "Challenge a friend" links (same puzzle, compare scores)
- Mini leaderboard among friends (no accounts needed -- use share links)
- "Your friend scored 4/5 on today's puzzle. Can you beat them?"

**5. Milestone Badges**
- "First Chain Reaction" -- complete your first puzzle
- "Week Warrior" -- play 7 days in a row
- "Chain Master" -- trigger a 10+ object chain
- "Perfectionist" -- get 5/5 stars
- "Century" -- play 100 puzzles
- Apps combining streaks and milestones see 40-60% higher DAU vs. single-feature implementations

**6. Difficulty Progression Visibility**
- Show a calendar/history view of completed puzzles
- Color-code by score (green = great, yellow = ok, red = struggled)
- Visible progress creates a "collection" mentality

**7. "Streak Freeze" / Forgiveness**
- Allow 1 missed day per week without breaking streak
- Reduces streak anxiety while maintaining daily habit
- Duolingo proved this increases long-term retention

---

## 9. Privacy-Respecting Analytics

### Tool Comparison

| Feature | Plausible | Umami | Simple Analytics |
|---------|-----------|-------|-----------------|
| Script size | <1 KB | ~2 KB | ~3 KB |
| Self-hosted | Yes (Community Ed.) | Yes (free) | No (SaaS only) |
| Cloud pricing | From ~$9/mo | From ~$9/mo | From ~$19/mo |
| Cookie-free | Yes | Yes | Yes |
| GDPR compliant | Yes | Yes | Yes |
| Open source | Yes | Yes | No |
| Custom events | Yes | Yes | Yes |
| API access | Yes | Yes | Yes |

**Recommendation: Umami (self-hosted)** for Kettenreaktion's MVP phase.
- Free when self-hosted
- 2KB script, minimal performance impact
- Cookie-free, no GDPR banner needed (important for Germany!)
- Custom events for tracking game-specific metrics
- Can self-host on a free tier (Railway, Fly.io, etc.)

If self-hosting is too much overhead, **Plausible Cloud** is the best managed option (<1KB script, excellent UI).

### Key Metrics to Track

**Acquisition:**
- Daily unique visitors
- Traffic sources (direct, social, referral)
- Which share format drove the visit (UTM parameters on share links)

**Engagement:**
- Daily Active Users (DAU)
- Puzzle completion rate
- Average score / star rating distribution
- Time to complete puzzle
- Share rate (% of completions that trigger a share)

**Retention:**
- Day 1, Day 7, Day 30 retention rates
- Streak distribution (how many players have 7+ day streaks)
- Return visit frequency

**Virality:**
- Share-to-new-player conversion rate (K-factor)
- Which sharing format converts best (emoji text vs. GIF vs. link)
- Social platform breakdown of incoming traffic

**Custom Events to Track:**
```
puzzle_started        -- user begins today's puzzle
puzzle_completed      -- user finishes (with score, time, chain_length)
share_initiated       -- user clicks share button
share_format_selected -- which format (emoji, gif, link)
share_completed       -- share action completed (vs. cancelled)
replay_generated      -- GIF/MP4 replay created
streak_milestone      -- streak reached 7, 30, 100, etc.
```

---

## 10. SEO for Browser Games

### Keyword Strategy

**Primary keywords:**
- "daily puzzle game" / "tagliches Ratselspiel"
- "physics puzzle game online"
- "chain reaction puzzle"
- "browser puzzle game"
- "free daily game"

**Long-tail keywords:**
- "daily physics puzzle game free no download"
- "chain reaction game like Wordle"
- "physics puzzle game browser free"
- "Kettenreaktion Spiel"

**Modifiers to include:**
- "free," "online," "no download," "browser," "daily"

### Technical SEO

**Structured Data (Schema.org Game type):**
```json
{
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "Kettenreaktion",
  "description": "A daily physics chain reaction puzzle game. Place one object, trigger a chain reaction, and share your result.",
  "url": "https://kettenreaktion.de",
  "genre": ["Puzzle", "Physics", "Casual"],
  "gamePlatform": "Web Browser",
  "operatingSystem": "Any",
  "applicationCategory": "Game",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "ratingCount": "1000"
  }
}
```

Pages with structured data get ~30% more clicks in search results.

**Performance:**
- Vite build with code splitting (already planned)
- Lazy-load Phaser/Matter.js (show landing content instantly)
- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
- Pre-render a static landing page for SEO crawlers (SPA games are invisible to crawlers otherwise)

**Content Pages:**
- `/` -- Game page (playable)
- `/how-to-play` -- Rules and tutorial (SEO-friendly static content)
- `/about` -- About page with game description (crawlable text)
- `/press` -- Press kit page
- `/archive` -- Past puzzles (if implemented -- huge SEO value, each puzzle is a unique URL)

**AI Search Optimization:**
- Structured data increases GPT-4 correct response rate from 16% to 54%
- As AI search (Google SGE, Bing Chat, Perplexity) grows, structured data becomes even more important
- Clear, well-structured content helps LLMs recommend your game

### Link Building

- Submit to browser game directories and aggregators
- Get listed on daily game roundup sites (listdle.com, etc.)
- Guest posts on indie game blogs
- Product Hunt launch generates backlinks
- Reddit posts with genuine engagement generate referral traffic

---

## 11. Kettenreaktion Action Plan

### BEFORE Launch (Now - Launch Day)

| Priority | Task | Timeline |
|----------|------|----------|
| **P0** | Design emoji share format -- test with real users | Month 1 |
| **P0** | Implement canvas-record for MP4 replay generation | Month 2-3 |
| **P0** | Set up OG tags and Twitter Cards with dynamic images | Month 3 |
| **P0** | Implement Web Share API with clipboard fallback | Month 3 |
| **P1** | Create Discord server, start inviting testers | Month 1 |
| **P1** | Set up Twitter/X account, begin #buildinpublic posts | Month 1 |
| **P1** | Build press kit page | Month 4 |
| **P1** | Implement Schema.org Game structured data | Month 3 |
| **P1** | Set up Umami analytics (self-hosted) | Month 3 |
| **P2** | Create landing page with email signup | Month 2 |
| **P2** | Start posting chain reaction GIFs to social media | Month 2 |
| **P2** | SEO: create /how-to-play and /about pages | Month 4 |

### AT Launch

| Priority | Task |
|----------|------|
| **P0** | Post to r/WebGames, r/puzzlegames, r/IndieGaming |
| **P0** | Send personalized pitches to 20-30 micro-influencers |
| **P0** | Launch on Product Hunt |
| **P0** | Announce on Discord, open server to public |
| **P1** | Send press kit to indie game journalists |
| **P1** | Post launch thread on Twitter/X |
| **P1** | Submit to daily game aggregators (listdle.com, etc.) |
| **P2** | Cross-promote with other daily game developers |

### AFTER Launch (Ongoing)

| Priority | Task | Timeline |
|----------|------|----------|
| **P0** | Monitor share-to-conversion rates, optimize share flow | Week 1-4 |
| **P0** | Engage with every social media share (first 30 days) | Week 1-4 |
| **P0** | Fix bugs immediately -- broken games kill momentum | Ongoing |
| **P1** | Implement weekly challenges | Month 2 |
| **P1** | Add milestone badges system | Month 2 |
| **P1** | A/B test share button placement and copy | Month 1-2 |
| **P1** | Start TikTok/Reels with satisfying chain reaction clips | Month 1 |
| **P2** | Implement friend challenge links | Month 3 |
| **P2** | Add seasonal events / themed puzzles | Month 4+ |
| **P2** | Build puzzle archive for SEO (each puzzle = unique URL) | Month 3+ |

### The Viral Flywheel

```
Player completes puzzle
        |
        v
Share prompt appears (low friction, one tap)
        |
        +---> Emoji text (Twitter, WhatsApp, SMS)
        |
        +---> GIF/MP4 replay (Twitter, Discord, Reddit, TikTok)
        |
        +---> Challenge link ("Beat my score!")
        |
        v
Friend sees share on social feed
        |
        v
Clicks link -> lands on game -> plays puzzle
        |
        v
Completes puzzle -> sees share prompt -> LOOP REPEATS
```

**The K-factor goal:** Each player should bring in > 1 new player over their lifetime. If K > 1, growth is exponential. Track this metric obsessively.

### Critical Success Factors

1. **The share prompt must appear at the perfect moment** -- immediately after the satisfying chain reaction completes, when dopamine is highest
2. **Sharing must be ONE tap** -- any friction kills conversion
3. **The GIF replay is the differentiator** -- no other daily puzzle game has visual replay sharing. This is Kettenreaktion's unfair advantage
4. **The emoji format must tell a story** -- like Wordle's grid, it should be instantly readable and create curiosity
5. **Launch with all sharing mechanics working perfectly** -- you only get one first impression

---

## Sources

- [Wordle History Timeline](https://playwordwar.com/history-of-wordle.html)
- [Wordle Players Use Emojis to Share Results](https://emojitimeline.com/wordle-players-use-emojis-to-share-their-results/)
- [Wordle Creator Interview - Slate](https://slate.com/culture/2022/01/wordle-game-creator-wardle-twitter-scores-strategy-stats.html)
- [Wordle Brought Tens of Millions to NYT - TechCrunch](https://techcrunch.com/2022/05/04/wordle-new-york-times-user-growth/)
- [NYT Buying Wordle - TIME](https://time.com/6143832/new-york-times-buys-wordle/)
- [Wordle Viral Growth Story - MoEngage](https://www.moengage.com/blog/wordle-viral-growth-story/)
- [Psychology of Wordle - SNHU](https://www.snhu.edu/about-us/newsroom/briefs/psychology-of-wordle)
- [canvas-record - npm](https://www.npmjs.com/package/canvas-record)
- [canvas-record - GitHub](https://github.com/dmnsgn/canvas-record)
- [Save Canvas to MP4 with WebCodecs](https://devtails.xyz/adam/how-to-save-html-canvas-to-mp4-using-web-codecs-api)
- [gif.js](https://jnordberg.github.io/gif.js/)
- [gifshot - Yahoo](https://yahoo.github.io/gifshot/)
- [Web Share API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)
- [Web Share API Browser Support - Can I Use](https://caniuse.com/web-share)
- [Web Share API with Fallback - Medium](https://daviddalbusco.medium.com/how-to-implement-the-web-share-api-with-a-fallback-3557d3730ea7)
- [Open Graph vs Twitter Cards](https://developrythemes.com/open-graph-vs-twitter-cards-which-social-meta-tags-you-actually-need/)
- [OG Image Optimization - Coywolf](https://coywolf.com/guides/open-graph-twitter-card-image-optimization/)
- [Game Marketing on Social Media 2025 - 5W PR](https://www.5wpr.com/new/game-marketing-on-social-media-in-2025-building-interactive-campaigns-for-indie-success/)
- [How to Market an Indie Game - CleverTap](https://clevertap.com/blog/indie-game-marketing/)
- [Reddit Game Marketing Guide 2025 - CloutBoost](https://www.cloutboost.com/blog/how-to-market-a-video-game-on-reddit-the-complete-2025-guide-for-game-developers)
- [Indie Game Marketing Strategies 2025](https://indiegamebusiness.com/indie-game-marketing-strategies/)
- [Indie Game Influencer Marketing - IQfluence](https://iqfluence.io/public/blog/indie-game-influencer-marketing-strategies)
- [Gamification Mechanics - Xtremepush](https://www.xtremepush.com/blog/7-gamification-mechanics-that-drive-player-loyalty-points-badges-leaderboards-tiers-challenges-streaks-and-rewards)
- [Duolingo Gamification Case Study - Trophy](https://trophy.so/blog/duolingo-gamification-case-study)
- [Streaks Feature Examples - Trophy](https://trophy.so/blog/streaks-feature-gamification-examples)
- [Player Retention Strategies 2025 - Mainleaf](https://mainleaf.com/best-player-retention-strategies/)
- [Plausible vs Umami - Vemetric](https://vemetric.com/blog/plausible-vs-umami)
- [Umami vs Plausible vs Matomo - AaronJBecker](https://aaronjbecker.com/posts/umami-vs-plausible-vs-matomo-self-hosted-analytics/)
- [Privacy-Focused Analytics Comparison - Mida](https://www.mida.so/blog/simple-analytics-vs-plausible-vs-umami-vs-piwik-pro-vs-fathom-analytics)
- [Game SEO Guide - Genieee](https://genieee.com/game-seo-guide-how-to-get-your-game-discovered/)
- [Schema.org Game Type](https://schema.org/Game)
- [Structured Data SEO 2026](https://www.digidop.com/blog/structured-data-secret-weapon-seo)
- [GIF vs MP4 Format Guide](https://www.1-converter.com/blog/gif-vs-mp4)
- [Best Animation Formats for Web 2025](https://www.spielcreative.com/blog/best-animation-file-formats/)
- [Listdle - Daily Game Aggregator](https://listdle.com/)
