# Light PWA — Claude Context

> Read this file first. It gives you full context on the project so you can pick up where we left off.

---

## What is this?

**Light** is a personal life dashboard PWA for Stefan (iPhone 17 Pro Max primary device). 10-page app covering all life domains. Dark glass-morphism design. Installed as home screen app from Safari.

- **Repo:** `tefata98/didactic-engine`
- **Live URL:** `https://tefata98.github.io/didactic-engine/`
- **Deploy:** Push to `main` → GitHub Actions → GitHub Pages (auto)
- **Branch convention:** Feature work on `claude/build-lifeos-pwa-UFeOd`, merge to `main` to deploy

---

## Stack

| Layer | Tech |
|-------|------|
| UI | React 18 + Vite 5 + Tailwind CSS 3 |
| Routing | React Router DOM 7 |
| Charts | Recharts 3 |
| Icons | Lucide React |
| Backend | Supabase (auth + data sync) |
| Tests | Vitest + jsdom + Testing Library |
| PWA | Service Worker (`public/sw.js`, cache v3) |

---

## Project Structure

```
src/
  pages/          # 10 pages + LoginPage
  components/     # AppShell, BottomNav, LockScreen, ExerciseIllustration, MuscleGroupDiagram
  hooks/          # useSounds, useBiometric, useNotifications, useTimer
  utils/          # supabase.js, syncService.js, anthropicService.js, storageService.js, dateHelpers.js, constants.js
  context/        # AppContext.jsx (global state: user, settings, notifications, auth)
  modules/        # vocals/vocalsData.js
  routes.jsx      # All routes + AuthGuard
  index.css       # CSS custom properties, dark/light theme, glass morphism
public/
  sw.js           # Service Worker (cache, background notifications, offline mode)
  manifest.json   # PWA manifest
  icon-192.png    # Golden lotus icon
  icon-512.png
```

---

## Pages

| Page | Route | Key features |
|------|-------|-------------|
| Dashboard | `/` | Today's stats, habits, quick actions |
| Planner | `/planner` | Task CRUD with modals |
| Fitness | `/fitness` | Band workouts, SVG illustrations, muscle diagrams, schedule tab |
| Vocals | `/vocals` | Singer warmup routines, health tips, daily routines |
| Finance | `/finance` | Budget tracking, spending charts |
| Reading | `/reading` | Book list, reading timer |
| Sleep | `/sleep` | Sleep tracker, wind-down routine |
| News | `/news` | AI-generated news (Anthropic API), 1hr cache, category chips |
| Profile | `/profile` | User profile |
| Settings | `/settings` | Dark mode, sounds, Face ID, offline, sync, logout |
| Login | `/login` | Username + password, auto-signup, guest mode |

---

## Supabase

**Credentials (hardcoded in `src/utils/supabase.js`):**
```
URL:          https://hrmhvomfjmaxtobvvzrw.supabase.co
Anon key:     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhybWh2b21mam1heHRvYnZ2enJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNTk3NTcsImV4cCI6MjA4NzgzNTc1N30.QyExHJ5Rce4u8B7KosV3JYrKMPWGYym9sC19o6sVcI8
DB password:  atherark123
Access token: sbp_2ec42e36904c713eceb0983689a4c32bc6c0bee1
```

**Database table:** `user_data` (see `supabase-setup.sql` for full SQL + RLS policies)
```sql
id uuid PRIMARY KEY
user_id uuid REFERENCES auth.users
namespace text
data jsonb
updated_at timestamptz
```

**Setup required in Supabase Dashboard:**
1. Run SQL from `supabase-setup.sql` in SQL Editor
2. Authentication → Providers → Email → disable "Confirm email"
3. Authentication → Users → Add User:
   - Email: `tefata@lightapp.io`
   - Password: `thedark`
   - Check "Auto Confirm User"

---

## Auth / Login

- Login maps username to email: `tefata` → `tefata@lightapp.io`
- Auto-signup: tries signIn first, falls back to signUp if user doesn't exist
- Auth state persisted in localStorage via `NAMESPACES.identity`
- "Continue without login" → guest mode (no sync)
- AuthGuard in `src/routes.jsx` redirects unauthenticated users to `/login`

**Credentials for the app:**
- Username: `tefata`
- Password: `thedark`

---

## Design System

```css
/* Dark theme (default) */
--bg-base: #0f172a
--bg-card: rgba(255,255,255,0.04)
--text-primary: rgba(255,255,255,0.92)

/* Light theme: [data-theme="light"] on <html> */
--bg-base: #f1f5f9
--bg-card: rgba(255,255,255,0.85)
--text-primary: #0f172a
```

- Glass cards: `backdrop-blur`, `border: 1px solid rgba(255,255,255,0.06)`
- Gradient accents: indigo-500 → violet-600
- Floating orbs for background depth
- `font-heading` class for headings

---

## Key Hooks

| Hook | Purpose |
|------|---------|
| `useSounds` | Web Audio API tones (tap, success, toggle, timerDone) — no audio files |
| `useBiometric` | WebAuthn Face ID / fingerprint lock on visibility change |
| `useNotifications` | SW-based background notifications |
| `useTimer` | Countdown timer with tick sounds |

---

## Completed Work (Sprints 1–6)

- **Sprint 1:** Planner modal fix, scroll-to-top on nav, iOS safe area, bottom nav styling
- **Sprint 2:** Fitness SVG exercise illustrations, muscle group diagrams, schedule tab, alternative exercises
- **Sprint 3:** News 1hr cache, article detail view, sticky category chips, SW notifications
- **Sprint 4:** Dark/light theme toggle, Web Audio sounds, WebAuthn biometrics, offline mode SW toggle
- **Sprint 5:** Supabase auth, login page, pull/push sync, settings page with logout
- **Sprint 6:** Vitest setup, 26 tests passing (dateHelpers + storageService)

---

## Known Issues / Pending

- Supabase network is blocked in Claude Code sandbox — use Dashboard UI for SQL + user creation
- Email domain is `@lightapp.io` (not `@light.app` — Supabase rejects `.app` TLD)
- GitHub Pages deploy requires push to `main` (GitHub Actions workflow in `.github/workflows/deploy.yml`)

---

## Commands

```bash
npm run dev       # dev server at localhost:5173/didactic-engine/
npm run build     # production build → dist/
npm test          # vitest (26 tests)
npm run preview   # preview production build locally

# Deploy (push to main triggers GitHub Actions)
git checkout main
git merge claude/build-lifeos-pwa-UFeOd
git push origin main
```

---

## Important Files

| File | Purpose |
|------|---------|
| `src/utils/constants.js` | NAMESPACES, DEFAULT_SETTINGS, USER_PROFILE |
| `src/utils/storageService.js` | localStorage abstraction by namespace |
| `src/utils/syncService.js` | Supabase pull/push/debouncedPush |
| `src/utils/anthropicService.js` | AI news generation (Anthropic API) |
| `src/utils/supabase.js` | Supabase client (hardcoded creds) |
| `public/sw.js` | Service Worker — cache, notifications, offline |
| `supabase-setup.sql` | Full SQL to run in Supabase Dashboard |
| `.github/workflows/deploy.yml` | GitHub Actions → GitHub Pages |
