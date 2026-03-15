# Portfolio Website — Executable Dev Plan v3

## Project

**Repo:** `github.com/georginaydenov/Georgi-Naydenov-Portfolio`
**Live:** `georginaydenov.github.io/Georgi-Naydenov-Portfolio/`
**Branch:** `feature/multi-file-arch` (create from `main`)

---

## What This Plan Is

This is the single document you follow to transform a 1,533-line monolithic React SPA into a multi-file Jekyll-powered portfolio with a blog, 13 React components, a CMS admin panel, 3 interactive embeds, and full SEO — all deployable on GitHub Pages with zero build tools.

Every step references a specific agent SKILL.md file. You execute agents in the numbered order. Each agent's SKILL.md contains the exact files to produce, code samples, schemas, and a quality gate checklist.

---

## Reference Documents

| Document | Location | Purpose |
|----------|----------|---------|
| `JEKYLL-README.md` | Root | Canonical reference for Jekyll + React coexistence. Every agent reads this FIRST. |
| `00-jekyll-integrator/SKILL.md` | Agent 0 | Jekyll config, layouts, blog scaffold, `_data/` migration |
| `01-architect/SKILL.md` | Agent 1 | Module system, import maps, directory scaffold, thin `index.html` shell |
| `02-data-engineer/SKILL.md` | Agent 2 | JSON schemas, data extraction, `data-loader.js` |
| `03-component-developer/SKILL.md` | Agent 3 | 13 React component modules, props interfaces, icon mapping |
| `04-style-architect/SKILL.md` | Agent 4 | CSS tokens, animations, overrides, `blog.css` |
| `05-asset-creator/SKILL.md` | Agent 5 | SVG badges, OG images, favicons, thumbnails |
| `06-embed-developer/SKILL.md` | Agent 6 | TOGAF ADM diagram, skill map, analytics dashboard |
| `07-seo-performance-engineer/SKILL.md` | Agent 7 | Meta tags, structured data, resource hints, Lighthouse |
| `08-qa-regression-tester/SKILL.md` | Agent 8 | 60 screenshots, 20 functional tests, accessibility audit |
| `09-content-manager/SKILL.md` | Agent 9 | CMS admin panel, `content-api.js`, GitHub API publishing |

---

## Current State (What You're Starting With)

**One file:** `index.html` — 1,533 lines containing everything:
- React 18.2.0 loaded via ESM from `esm.sh`
- Tailwind CSS loaded via CDN
- 27 Lucide icons imported
- 55 portfolio items hardcoded as a `const DATA = [...]` array
- 5 components (`CountUp`, `ScrollableTabs`, `Toast`, `Card`, `App`) defined inline
- 112 lines of CSS animations in a `<style>` block
- URL state sync, dark mode, deep linking, search, multi-level filter cascade
- No blog, no SEO, no sitemap, no badges, no thumbnails, no content management

**One other file:** `README.md` — project documentation (does not affect the build)

---

## Target State (What You're Building)

```
/
├── _config.yml                     # Jekyll config (6 plugins)
├── Gemfile                         # github-pages gem 232
├── index.html                      # React SPA thin shell (--- front matter, layout: null)
├── robots.txt                      # Crawler directives
│
├── _data/                          # Portfolio data (dual-access: React fetch + Jekyll Liquid)
│   ├── portfolio.json              # 55+ items — single source of truth
│   ├── categories.json             # Taxonomy definitions
│   └── site-config.json            # Bio, certs, links, meta
│
├── _posts/                         # Blog posts (Markdown + front matter)
├── _drafts/                        # Unpublished blog drafts
├── _layouts/                       # Jekyll templates (default, post, blog)
├── _includes/                      # Reusable HTML partials (head, header-blog, footer-blog)
├── blog/                           # Blog listing page (paginated)
│
├── components/                     # 13 React ES modules (no front matter — static passthrough)
│   ├── App.js                      #   Root orchestrator
│   ├── Header.js, Hero.js, ...     #   11 extracted/new components
│   └── ContentManager.js           #   CMS admin panel
│
├── utils/                          # 6 utility modules (static passthrough)
│   ├── data-loader.js              #   Async JSON loader with cache
│   ├── filter-engine.js            #   Filter + sort logic
│   ├── url-sync.js, theme.js, ... 
│   └── content-api.js              #   localStorage drafts + GitHub API
│
├── styles/                         # CSS files (static passthrough)
│   ├── tokens.css                  #   40+ CSS custom properties
│   ├── animations.css              #   6 keyframes + 7 utility classes
│   ├── overrides.css               #   Scrollbar, link underline, selection
│   └── blog.css                    #   Blog typography and post styling
│
├── assets/                         # Visual assets (static passthrough)
│   ├── badges/                     #   10+ SVG platform badges
│   ├── og/                         #   5 Open Graph images (1200×630)
│   ├── thumbnails/                 #   Category placeholder thumbnails
│   ├── favicon.svg, favicon.ico    #   Favicon set
│   └── apple-touch-icon.png
│
├── embeds/                         # 3 standalone interactive HTML (no front matter)
│   ├── togaf-adm-diagram.html
│   ├── skill-map.html
│   └── stats-dashboard.html
│
├── agent-skills/                   # Agent specifications (excluded from Jekyll build)
│   ├── 00-jekyll-integrator/
│   ├── 01-architect/
│   └── ... through 09-content-manager/
│
└── scripts/                        # Build scripts (excluded from Jekyll build)
    ├── generate-sitemap.js
    └── generate-og-images.js
```

**Auto-generated by Jekyll plugins (not committed):**
- `/sitemap.xml` — by `jekyll-sitemap`
- `/feed.xml` — by `jekyll-feed`
- `<meta>` SEO tags on blog pages — by `jekyll-seo-tag`

---

## Execution Plan

### Before You Start

1. **Read `JEKYLL-README.md`** cover to cover. It defines the rules every step must follow — especially the `_data/` vs `/data/` path change and the front matter rules.
2. **Create the branch:** `git checkout -b feature/multi-file-arch`
3. **Take baseline screenshots** of the current live site at 375px, 768px, and 1440px in both light and dark mode. These are your regression targets.
4. **Run a Lighthouse audit** on the current site. Record the scores. This is your baseline.

---

### Step 1: Jekyll Foundation

**Execute:** `00-jekyll-integrator/SKILL.md`

**What you do:**
1. Create `_config.yml` at the repo root — Jekyll 3.10.0 config with `jekyll-feed`, `jekyll-sitemap`, `jekyll-seo-tag`, `jekyll-paginate`, `jekyll-redirect-from`, `jekyll-optional-front-matter`
2. Create `Gemfile` pinned to `github-pages` gem 232
3. Update `.gitignore` — add `_site/`, `.jekyll-cache/`, `.jekyll-metadata`, `Gemfile.lock`, `vendor/`
4. Create `_layouts/default.html` — base HTML shell with `{% seo %}` and `{% feed_meta %}`
5. Create `_layouts/post.html` — single blog post template with portfolio cross-references via `site.data.portfolio`
6. Create `_layouts/blog.html` — paginated blog listing
7. Create `_includes/head.html`, `_includes/header-blog.html`, `_includes/footer-blog.html`
8. Create `blog/index.html` — blog entry point
9. Create `_posts/2026-03-15-welcome-to-the-blog.md` — example first post
10. Create `_drafts/` directory (empty)
11. Add `---\nlayout: null\n---` as the first lines of the current `index.html` (React code stays unchanged)

**What NOT to do:** Do NOT add front matter to any `.js`, `.css`, or `.json` file. Do NOT restructure the React code. Jekyll wraps around it.

**Validate locally:**
```bash
bundle install
bundle exec jekyll serve
# Portfolio at localhost:4000/Georgi-Naydenov-Portfolio/ — must look identical
# Blog at localhost:4000/Georgi-Naydenov-Portfolio/blog/ — must render
```

**Quality gate:** All items in `00-jekyll-integrator/SKILL.md → Quality Gate` pass.

**Commit:** `feat: add Jekyll integration layer for blog capabilities`

---

### Step 2: Architecture Scaffold

**Execute:** `01-architect/SKILL.md`

**Prerequisite:** Step 1 is complete. `JEKYLL-README.md` has been read.

**What you do:**
1. Rewrite `index.html` into a thin shell — keep the `---\nlayout: null\n---` front matter from Step 1, add `<script type="importmap">` aliasing `react`, `react-dom/client`, `lucide-react` to their `esm.sh` CDN URLs, add `<link>` tags for `/styles/tokens.css`, `/styles/animations.css`, `/styles/overrides.css`, add `<link rel="modulepreload">` for critical-path modules, add `<div id="root">` with fallback content, add `<script type="module" src="/components/App.js">`
2. Create all directories: `components/`, `utils/`, `styles/`, `assets/badges/`, `assets/og/`, `assets/thumbnails/`, `embeds/`, `scripts/`
3. Create `_data/` directory (NOT `/data/` — Jekyll requires the underscore prefix; see `JEKYLL-README.md`)
4. Stub all 13 component `.js` files with JSDoc headers and placeholder exports
5. Stub all 6 utility `.js` files with JSDoc headers
6. Stub all 3 `.css` files with header comments
7. Stub all 3 `.json` data files as empty `[]` or `{}`
8. Write `ARCHITECTURE.md` — module dependency graph (Mermaid), loading sequence, file manifest

**Critical rule from JEKYLL-README.md:** NO front matter on any `.js`, `.css`, or `.json` file. These must pass through Jekyll as static assets.

**Validate:** Open `index.html` locally via `bundle exec jekyll serve`. App.js placeholder renders. No console errors. No 404s in Network tab.

**Quality gate:** All items in `01-architect/SKILL.md → Quality Gate` pass.

**Commit:** `feat: scaffold multi-file architecture with import map`

---

### Step 3: Data Extraction

**Execute:** `02-data-engineer/SKILL.md`

**Prerequisite:** Step 2 is complete. Scaffold stubs exist.

**What you do:**
1. Extract all 55 items from `const DATA = [...]` (lines 163–707 of the original `index.html`) into `/_data/portfolio.json`. Enrich each item with optional fields: `thumbnail`, `tags`, `dateAdded`, `language`, `featured`. Convert the one `React.createElement` description (id: `interview-economy`) to a plain string with `"language": "bg"`.
2. Extract `CATEGORIES`, `SECTIONS`, `SUBCATEGORY_LABELS`, `SECTION_TOPIC_LABELS` into `/_data/categories.json`. Store icon names as strings (e.g., `"Bot"`, `"FileText"`) — not React elements.
3. Extract hero bio, certifications, social links, CV URL into `/_data/site-config.json`.
4. Implement `/utils/data-loader.js` — async `fetch()` with module-level caching. Fetch paths use `/_data/` (Jekyll path). Include `invalidateCache()` for Content Manager integration and `loadAll()` for parallel loading.
5. Write `/_data/DATA-SCHEMA.md` documenting every field.

**Key path change (from JEKYLL-README.md):** All fetch URLs use `/_data/portfolio.json`, NOT `/data/portfolio.json`. This is because Jekyll's `_data/` directory gives dual access — React fetches at runtime AND Jekyll Liquid templates access via `site.data.portfolio`.

**Validate:** `JSON.parse()` succeeds on all 3 files. Item count matches original. `data-loader.js` returns identical data to the hardcoded array.

**Quality gate:** All items in `02-data-engineer/SKILL.md → Quality Gate` pass.

**Commit:** `feat: extract portfolio data into JSON files in _data/`

---

### Step 4: Style Extraction (parallel with Step 3)

**Execute:** `04-style-architect/SKILL.md`

**Can run in parallel with Step 3** — no dependency between them.

**What you do:**
1. Extract all 6 `@keyframes` and 7 animation utility classes from the inline `<style>` block (lines 14–112) into `/styles/animations.css`. Replace hardcoded timing values with CSS custom property references where applicable.
2. Define 40+ CSS custom properties in `/styles/tokens.css` — colors, surfaces, text, borders, shadows, radii, transitions. Include `.dark` overrides for every token.
3. Move scrollbar hiding, link underline animation, and `scroll-behavior: smooth` into `/styles/overrides.css`.
4. Create `/styles/blog.css` — prose typography for Jekyll blog posts (inherits token values).
5. Remove the entire `<style>` block from `index.html`.
6. Write `STYLE-GUIDE.md` — token reference table with light/dark values.

**Validate:** All animations play identically. Dark mode transitions remain smooth. No FOUC.

**Quality gate:** All items in `04-style-architect/SKILL.md → Quality Gate` pass.

**Commit:** `feat: extract CSS into token system and animation files`

---

### Step 5: Component Decomposition

**Execute:** `03-component-developer/SKILL.md`

**Prerequisite:** Steps 2, 3, and 4 are all complete. Data loader works. Styles are extracted.

**What you do — extract/create 13 components in this order:**

| # | Component | Source | Key Detail |
|---|-----------|--------|------------|
| 1 | `CountUp.js` | Lines 744–762 | Animated counter. No deps. |
| 2 | `Toast.js` | Lines 809–816 | Notification bar. Imports `Check` icon. |
| 3 | `ScrollableTabs.js` | Lines 764–807 | Horizontal scroll with chevrons. |
| 4 | `ScrollToTop.js` | Extracted from App render | `{ visible, onClick }` props. |
| 5 | `Footer.js` | Lines 1518–1524 | Self-contained. |
| 6 | `Card.js` | Lines 818–957 | **Most complex.** Icon selection, badges, share handler, deep-link highlight. Import `copyToClipboard` from `/utils/clipboard.js`. |
| 7 | `ErrorBoundary.js` | **New** | Class component (React error boundaries require it). Catches render crashes. |
| 8 | `Toolbar.js` | Lines 1383–1478 | Search, platform toggle, section pills, topic chips. Receives all filter state as props. |
| 9 | `Hero.js` | Lines 1247–1377 | Full hero + compact bar. Uses `CountUp`. Receives `config` from `site-config.json`. |
| 10 | `Header.js` | Lines 1157–1244 | Sticky nav, category tabs, CV button, dark mode toggle, mobile menu. Includes a "Blog" link pointing to `/blog/`. |
| 11 | `CardGrid.js` | Lines 1481–1507 | Grid container + empty state. Renders `Card` components. |
| 12 | `ContentManager.js` | **New (shell only)** | Placeholder for Agent 9. Renders trigger button + empty modal. |
| 13 | `App.js` | Lines 959–1526 | Root orchestrator. Calls `loadAll()` on mount. Owns all state. Composes all other components. Creates icon registry mapping string names → Lucide components. |

Also create utility modules:
- `/utils/filter-engine.js` — `filterPortfolio(data, filters)` + `getAvailableTopics(data, filters)`
- `/utils/url-sync.js` — `readFiltersFromURL()`, `writeFiltersToURL(filters)`
- `/utils/theme.js` — `getInitialTheme()`, `applyTheme(isDark)`
- `/utils/clipboard.js` — `copyToClipboard(text)` with Clipboard API + textarea fallback

**All components use `React.createElement()`.** No JSX — browser-native ES modules can't parse it.

**Validate:** The app renders identically to the original at 375px, 768px, and 1440px. All 20 functional features work (filter cascade, search, dark mode, URL sync, deep linking, share, toast, hero collapse, scroll-to-top, mobile menu, card animations, empty state, etc.).

**Quality gate:** All items in `03-component-developer/SKILL.md → Quality Gate` pass.

**Commit:** `feat: decompose monolith into 13 React component modules`

---

### Step 6: Visual Assets (parallel with Step 5)

**Execute:** `05-asset-creator/SKILL.md`

**Can start during Step 5** — no dependency on components.

**What you do:**
1. Create 10+ SVG platform badges (24×24) in `/assets/badges/` — Claude, NotebookLM, Google Docs, Google Slides, PDF, YouTube, LinkedIn, IIBA, TOGAF, GitHub Pages
2. Create favicon set — `favicon.svg` (theme-aware with `prefers-color-scheme`), `favicon.ico` (32×32), `apple-touch-icon.png` (180×180)
3. Create 5 OG images (1200×630) in `/assets/og/` — default + one per category
4. Create 6 category thumbnail placeholders in `/assets/thumbnails/` — colored gradient WebP cards with icon watermarks
5. Create `hero-pattern.svg` — subtle tileable geometric background
6. Write `/assets/manifest.json` — catalog of all assets with paths and dimensions

**Validate:** SVGs render at 24×24. OG images preview correctly in LinkedIn/Twitter debuggers. Favicons display in browser tabs.

**Quality gate:** All items in `05-asset-creator/SKILL.md → Quality Gate` pass.

**Commit:** `feat: create visual asset suite`

---

### Step 7: Interactive Embeds

**Execute:** `06-embed-developer/SKILL.md`

**Prerequisite:** Steps 3 and 4 complete (needs data and token values).

**What you do:**
1. Build `/embeds/togaf-adm-diagram.html` — interactive SVG cycle diagram of TOGAF ADM phases. Click phase → shows description + related portfolio links. Vanilla JS + SVG, no framework.
2. Build `/embeds/skill-map.html` — D3.js force-directed network graph connecting certifications, skills, and knowledge areas. Drag nodes, click to highlight, search to filter.
3. Build `/embeds/stats-dashboard.html` — Chart.js dashboard. Fetches `/_data/portfolio.json` at runtime. 5 panels: category donut, platform bar, subcategory heatmap, timeline, content breakdown.

**Each embed:** Self-contained HTML, dark mode via `prefers-color-scheme` AND `?theme=dark` param, responsive (320px–1200px), keyboard accessible, `postMessage` protocol for parent communication.

**Critical rule (from JEKYLL-README.md):** NO front matter on any embed `.html` file. They must pass through Jekyll as static files.

**Validate:** Each embed loads standalone at its URL. Each renders inside an `<iframe>`. Dark mode works both ways.

**Quality gate:** All items in `06-embed-developer/SKILL.md → Quality Gate` pass.

**Commit:** `feat: create 3 interactive embeddable visualizations`

---

### Step 8: Content Manager

**Execute:** `09-content-manager/SKILL.md`

**Prerequisite:** Steps 3 and 5 complete (needs data layer and component shell).

**What you do:**
1. Build `/utils/content-api.js` — localStorage CRUD (drafts + trash), validation engine, ID and tag auto-generation, GitHub Contents API layer (fetch remote, commit with SHA), export/import JSON utilities.
2. Build `/components/ContentManager.js` — admin mode gate (`Ctrl+Shift+M` or `?admin=true`), slide-over panel with searchable item list, dynamic form that adapts fields based on category selection, live Card preview, Save Draft / Publish / Discard / Delete actions, Settings panel (GitHub PAT input, connection test, export/import).
3. Add "Blog Post" mode to Content Manager — draft blog posts go to `_drafts/`, published posts go to `_posts/`, commits Markdown files via GitHub API.
4. Integrate with `App.js` — import ContentManager, pass props, wire `onPublish` to `invalidateCache()`.

**Admin mode is hidden by default.** No visible UI for visitors. Only someone who knows the shortcut can enter. Only someone with a valid PAT can publish.

**Validate:** Add/edit/delete cycle works. Drafts persist in localStorage. GitHub publish commits correctly (test with a valid PAT). Blog post creation produces valid Markdown with front matter.

**Quality gate:** All items in `09-content-manager/SKILL.md → Quality Gate` pass.

**Commit:** `feat: add Content Manager CMS module`

---

### Step 9: SEO & Performance

**Execute:** `07-seo-performance-engineer/SKILL.md`

**Prerequisite:** Steps 1, 2, 6 complete (needs Jekyll config, index.html shell, OG images).

**What you do:**
1. Add meta tags to `index.html` `<head>` — description, author, `theme-color`, Open Graph, Twitter Card, canonical URL.
2. Add JSON-LD structured data — `Person` schema with credentials, social links, employer.
3. Add resource hints — `preconnect` to `esm.sh` and `cdn.tailwindcss.com`, `modulepreload` for critical-path JS (App.js, data-loader.js, Header.js, Card.js).
4. Create `robots.txt` — allow all, point to sitemap.
5. **DO NOT create a manual `sitemap.xml`** — `jekyll-sitemap` handles this automatically (see `JEKYLL-README.md`).
6. **DO NOT add SEO meta to blog pages** — `jekyll-seo-tag` handles this automatically.
7. Write `/scripts/generate-sitemap.js` for CI regeneration (optional — Jekyll handles it by default).
8. Run Lighthouse audit. Target: Performance ≥ 85, SEO ≥ 95, Accessibility ≥ 90, Best Practices ≥ 90.

**Validate:** OG preview works in LinkedIn Post Inspector. JSON-LD validates at Schema.org. `sitemap.xml` auto-generates with blog + portfolio URLs. `feed.xml` auto-generates with blog posts.

**Quality gate:** All items in `07-seo-performance-engineer/SKILL.md → Quality Gate` pass.

**Commit:** `feat: add SEO, structured data, and performance optimization`

---

### Step 10: QA & Regression

**Execute:** `08-qa-regression-tester/SKILL.md`

**Prerequisite:** ALL previous steps complete. This is the final gate.

**What you do:**

**Visual regression (60 screenshots):**
Capture 10 states × 3 breakpoints (375px, 768px, 1440px) × 2 themes (light, dark). Compare against Step 0 baselines. Zero structural regressions allowed.

**Functional testing (20 tests):**

| # | Test | Expected |
|---|------|----------|
| 1 | Category navigation (4 tabs) | Correct items, correct count |
| 2 | Section filter (All/Prototypes/Guides/POCs) | Items filter correctly |
| 3 | Platform toggle (All/Claude/NotebookLM) | Platform filter works |
| 4 | Subcategory topic pills | Subcategory filter works |
| 5 | Search ("TOGAF") | Only matching items shown |
| 6 | Search + filter combo | Intersection works |
| 7 | Alphabetical sort | A→Z by title |
| 8 | Dark mode toggle | Theme switches, persists |
| 9 | URL state sync | Filter state in URL, restores on load |
| 10 | Deep link (`?item=togaf-adm`) | Scrolls to card |
| 11 | Share button | URL copied, toast shows |
| 12 | Toast notification | Shows, disappears after 3s |
| 13 | Hero collapse | Collapses on scroll >100px |
| 14 | Hero expand | "Show Stats & Bio" restores |
| 15 | Stat click | Navigates to category |
| 16 | Scroll-to-top | Appears >300px, scrolls to top |
| 17 | Mobile menu | Opens/closes with hamburger |
| 18 | External links | Open in new tab |
| 19 | CV button | Opens Enhancv in new tab |
| 20 | Empty state | "No resources found" + clear button |

**Blog testing (6 tests):**

| # | Test | Expected |
|---|------|----------|
| 21 | Blog index (`/blog/`) | Post list renders with pagination |
| 22 | Blog post page | Post content renders with layout |
| 23 | Blog ↔ Portfolio nav | Links between sections work |
| 24 | RSS feed (`/feed.xml`) | Valid XML with posts |
| 25 | Sitemap (`/sitemap.xml`) | Contains portfolio + blog URLs |
| 26 | Portfolio item cross-reference in post | Links resolve to correct items |

**Content Manager testing (6 tests):**

| # | Test | Expected |
|---|------|----------|
| 27 | Admin mode activation | `Ctrl+Shift+M` opens panel |
| 28 | Add new item (form + preview) | Form renders, preview updates live |
| 29 | Save draft | Persists in localStorage |
| 30 | Validation errors | Required fields catch empty |
| 31 | Export/import JSON | File downloads/uploads correctly |
| 32 | Publish to GitHub (if PAT available) | Commits to repo |

**Accessibility audit:** axe-core (0 violations), keyboard navigation (all elements focusable), color contrast (≥ 4.5:1), screen reader labels, heading hierarchy.

**Cross-browser:** Chrome, Firefox, Safari (desktop + mobile).

**Link validation:** HEAD request to all 55+ external URLs. Flag non-2xx (LinkedIn may return 999 — document as exception).

**Produce:** `QA-REPORT.md` with pass/fail counts, visual diff gallery, accessibility findings, cross-browser matrix, link status, blocking vs. advisory issues.

**Quality gate:** All items in `08-qa-regression-tester/SKILL.md → Quality Gate` pass.

**Commit:** `docs: add QA regression report — APPROVED for merge`

---

### Step 11: Merge & Deploy

1. Ensure all 10 commits are on `feature/multi-file-arch`
2. `QA-REPORT.md` is signed off with zero blockers
3. Update `README.md` to reflect the new multi-file architecture, Jekyll blog, and local dev instructions
4. Merge `feature/multi-file-arch` → `main`
5. GitHub Pages auto-builds via Jekyll
6. Verify live site within 10 minutes
7. Verify blog, RSS, sitemap, OG previews on production

---

## Execution Timeline

```
PREP
────────────────────────────────────────────────────
Day 0      │ Read JEKYLL-README.md
           │ Create branch
           │ Baseline screenshots + Lighthouse

FOUNDATION
────────────────────────────────────────────────────
Day 1      │ Step 1: Jekyll Foundation     (Agent 0)
Day 2      │ Step 2: Architecture Scaffold (Agent 1)

DATA + STYLES
────────────────────────────────────────────────────
Day 3–4    │ Step 3: Data Extraction       (Agent 2)  ┐
           │ Step 4: Style Extraction      (Agent 4)  ┘ parallel

COMPONENTS + ASSETS
────────────────────────────────────────────────────
Day 5–8    │ Step 5: Component Decomp      (Agent 3)  ┐
           │ Step 6: Visual Assets         (Agent 5)  ┘ parallel

ENRICHMENT
────────────────────────────────────────────────────
Day 9–12   │ Step 7: Interactive Embeds    (Agent 6)  ┐
           │ Step 8: Content Manager       (Agent 9)  ┘ parallel

OPTIMIZATION
────────────────────────────────────────────────────
Day 13–14  │ Step 9: SEO & Performance     (Agent 7)

VALIDATION
────────────────────────────────────────────────────
Day 15–18  │ Step 10: QA & Regression      (Agent 8)

LAUNCH
────────────────────────────────────────────────────
Day 19     │ Step 11: Merge & Deploy
```

---

## Dependency Graph

```
Step 1 (Jekyll)
  │
  ▼
Step 2 (Architect)
  │
  ├──────────────────────┐
  ▼                      ▼
Step 3 (Data) ←──── Step 4 (Style)
  │                      │
  ├──────────────────────┤
  ▼                      ▼
Step 5 (Components) Step 6 (Assets)
  │                      │
  ├──────────┐           │
  ▼          ▼           │
Step 7    Step 8         │
(Embeds)  (CMS)          │
  │          │           │
  ├──────────┤───────────┘
  ▼          ▼
Step 9 (SEO) ──── needs OG images from Step 6
  │
  ▼
Step 10 (QA) ──── tests EVERYTHING
  │
  ▼
Step 11 (Merge)
```

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Jekyll breaks React SPA | Portfolio 404s or renders wrong | Test locally with `bundle exec jekyll serve` after every step. The `layout: null` front matter prevents Jekyll from wrapping index.html in a layout. |
| `_data/` path not accessible via HTTP | React `fetch()` fails | Add `_data` to `include:` in `_config.yml`. Verify `_site/_data/` contains JSON after build. |
| ESM import map not supported (~93% browsers) | App won't load for some users | Add `es-module-shims` polyfill. Add `<noscript>` fallback. |
| CDN outage (esm.sh, Tailwind) | App broken | Pin specific versions. Consider vendoring React. |
| Module loading waterfall | Slow first load | `<link rel="modulepreload">` for App.js, data-loader.js, Header.js, Card.js. |
| GitHub API rate limits | Content Manager blocked | 5000 req/hr with PAT. Show clear error if rate limited. |
| PAT token in localStorage | Security concern | `public_repo` scope only. Clear warnings in Settings panel. |
| `baseurl` path prefix | 404s on subpaths | All Liquid paths use `| relative_url` filter. React uses `BASE` constant. See JEKYLL-README.md. |
| Jekyll processes an embed HTML | Embed breaks | Ensure NO front matter on `/embeds/*.html`. |
| Blog Liquid syntax in React code | Build error | React `index.html` uses `layout: null` and contains no `{{ }}` Liquid syntax. Safe. |

---

## Definition of Done

All of the following must be true:

**Portfolio (React SPA)**
- [ ] Site loads from `index.html` and renders identically to original
- [ ] All 55+ items driven from `_data/portfolio.json`
- [ ] All 13 component files exist and compose in `App.js`
- [ ] All CSS in `/styles/`, zero inline `<style>` blocks
- [ ] All filters, search, dark mode, URL sync, deep linking work
- [ ] Card animations, toast, scroll-to-top, hero collapse work
- [ ] Mobile responsive at 375px, 768px, 1440px

**Blog (Jekyll)**
- [ ] Blog index renders at `/blog/` with pagination
- [ ] Blog posts render with correct layout and typography
- [ ] Portfolio cross-references work in blog posts (via `site.data.portfolio`)
- [ ] RSS feed auto-generated at `/feed.xml`
- [ ] Sitemap auto-generated at `/sitemap.xml`
- [ ] Navigation between portfolio and blog works bidirectionally

**Content Manager**
- [ ] Admin mode activates via `Ctrl+Shift+M` and `?admin=true`
- [ ] Add/edit/delete cycle works for portfolio items
- [ ] Draft mode works without auth (localStorage)
- [ ] GitHub API publish works with valid PAT
- [ ] Blog post creation produces valid Markdown

**Assets & Embeds**
- [ ] 10+ SVG badges in `/assets/badges/`
- [ ] 5 OG images render in LinkedIn and Twitter previews
- [ ] Favicon displays correctly across browsers
- [ ] 3 embeds load standalone and in iframe
- [ ] All embeds support dark mode and are responsive

**SEO & Performance**
- [ ] Lighthouse Performance ≥ 85
- [ ] Lighthouse Accessibility ≥ 90
- [ ] Lighthouse SEO ≥ 95
- [ ] Lighthouse Best Practices ≥ 90
- [ ] JSON-LD structured data validates

**Quality**
- [ ] Zero visual regressions confirmed by QA
- [ ] 32/32 functional tests pass
- [ ] Zero WCAG AA accessibility violations
- [ ] Chrome, Firefox, Safari all pass
- [ ] All external links resolve (or documented as exceptions)
- [ ] `QA-REPORT.md` complete and signed off
- [ ] `README.md` updated for new architecture
