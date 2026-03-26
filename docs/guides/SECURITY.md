# Security Guide

> Per PRINCIPLES.md: "All user input is hostile until proven otherwise."

## Threat Model

Kettenreaktion is a client-side browser game. Attack surface is small but real.

| Asset | Threat | Impact |
|-------|--------|--------|
| Leaderboard scores | Fake score submission | Unfair rankings |
| localStorage data | Tampering (streak, scores) | Local only, acceptable |
| Level data | Extraction/spoiling | Low impact (daily = everyone sees it) |
| Supabase credentials | Key exposure | DB abuse |

## Security Principles Applied

### 1. Input Validation (Fail Fast)

**Leaderboard submissions (Phase 2):**
```typescript
// Server-side validation via Supabase RLS + functions
- score: integer, range 0-2000
- attempts: integer, range 1-3
- puzzle_number: integer, must match today's puzzle
- player_id: UUID format validation
```

**Level JSON loading:**
```typescript
// Validate structure before use — never trust file content
- All required fields present
- Difficulty in range 1-5
- Coordinates within world bounds
- No script injection in string fields
```

### 2. No Secrets in Code or Logs

| Secret | Storage | Access |
|--------|---------|--------|
| Supabase URL | `.env` (VITE_SUPABASE_URL) | Build-time injection |
| Supabase Anon Key | `.env` (VITE_SUPABASE_ANON_KEY) | Build-time injection |

- `.env` in `.gitignore` — never committed
- Anon key is public-facing (RLS protects data, not the key)
- No API keys logged, no tokens in error messages
- `.env.example` committed with placeholder values

### 3. Row Level Security (Supabase, Phase 2)

```sql
-- Players can only insert their own scores
CREATE POLICY "insert_own_score" ON daily_scores
  FOR INSERT WITH CHECK (player_id = current_setting('request.jwt.claims')::json->>'sub');

-- Anyone can read leaderboard
CREATE POLICY "read_leaderboard" ON daily_scores
  FOR SELECT USING (true);

-- No updates or deletes
-- (No policy = denied by default)
```

### 4. Rate Limiting

| Endpoint | Limit | Enforcement |
|----------|-------|-------------|
| Score submission | 3 per puzzle per player | Supabase function + unique constraint |
| Leaderboard read | 60/min per IP | Cloudflare rate limit rule |

### 5. Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  connect-src 'self' https://*.supabase.co;
  media-src 'self';
  worker-src 'self' blob:;
">
```

### 6. Client-Side Considerations

**localStorage is not secure:**
- Players CAN tamper with streak/score data locally
- This is acceptable — local data is for personal tracking only
- Leaderboard scores are validated server-side (Phase 2)
- Never trust client-reported scores for competitive features

**No auth system:**
- Anonymous UUID generated on first visit, stored in localStorage
- No passwords, no PII, no GDPR concern for MVP
- If auth is ever added: use Supabase Auth (OAuth only, no custom passwords)

### 7. Dependency Security

- Minimal dependencies (Phaser, Vite, gif.js, Supabase client)
- `npm audit` on every CI build
- No eval(), no dynamic script loading
- Supabase client is the only external network dependency

### 8. Build Security

- TypeScript `strict: true` catches type-related bugs at compile time
- No `any` types allowed
- ESLint security rules enabled
- Vite produces static assets only — no server-side code in MVP

## Security Checklist (Pre-Launch)

- [ ] `.env` in `.gitignore`
- [ ] `.env.example` has placeholder values only
- [ ] CSP header configured
- [ ] Supabase RLS policies tested
- [ ] `npm audit` shows zero high/critical
- [ ] No `console.log` with sensitive data
- [ ] Score validation tested with edge cases
- [ ] Rate limiting confirmed working
- [ ] HTTPS enforced (Vercel auto)

---
**Last Updated:** 2026-03-26
