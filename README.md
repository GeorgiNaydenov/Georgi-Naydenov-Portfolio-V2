# Georgi Naydenov — Portfolio & Knowledge Library

Personal portfolio site built as a hybrid Jekyll + React SPA, deployed on GitHub Pages.

Live: https://georginaydenov.github.io/Georgi-Naydenov-Portfolio/

## What is included

**React SPA (root `/`)**
- Filterable card grid of 58 portfolio items across four categories: Artifacts, Articles, Posts, and Public Appearances
- Animated header with sliding-underline navigation and circular profile photo
- Hero section with bio, certification badges, and animated stat counters
- Multi-level filtering: category, section, platform (Claude / NotebookLM), sub-topic, and full-text search
- URL-synced filter state — every filtered view is shareable as a deep link
- Per-card share button that copies a direct link to the clipboard
- Dark mode with system preference detection and manual toggle
- Scroll-aware hero that collapses on scroll and restores when returning to top

**Jekyll blog (`/blog/`)**
- Paginated post listing and individual post pages with related portfolio item panel
- RSS feed, XML sitemap, and SEO meta tags via Jekyll plugins

**Data layer**
- Portfolio items, categories, and site config stored as JSON in `_data/`
- Consumed at runtime by the React app and statically by Jekyll templates

**Content Manager**
- Slide-over admin panel, accessible via `Ctrl+Shift+M`
- Draft persistence via `localStorage`
- GitHub Contents API integration for publishing directly to the repository

## Tech stack

| Layer | Choice |
|---|---|
| Static site | Jekyll 3 / `github-pages` gem 232 |
| UI framework | React 18 (browser ES modules, no build step) |
| Styling | Tailwind CSS CDN, CSS custom properties |
| Icons | Lucide React, Claude SVG, NotebookLM SVG |
| Deployment | GitHub Pages |

## Local development

**React SPA only — Node.js, no Ruby needed:**

```bash
node server.js
# open http://localhost:4000
```

**Full build including blog — requires Ruby and Bundler:**

```bash
bundle install
bundle exec jekyll serve
# open http://localhost:4000/Georgi-Naydenov-Portfolio/
```

## Project structure

```
/
  index.html          # React SPA entry point (Jekyll front matter: layout: null)
  components/         # React components (ES modules, no JSX)
  utils/              # Data loader, filter engine, URL sync, theme, clipboard
  styles/             # CSS tokens, animations, overrides, blog prose
  _data/              # portfolio.json, categories.json, site-config.json
  _posts/             # Jekyll blog posts (Markdown)
  _layouts/           # Jekyll layouts: default, post, blog
  _includes/          # Jekyll partials: head, header-blog, footer-blog
  assets/             # Images, favicons, SVG badges, OG images
  server.js           # Local dev server (strips Jekyll front matter, serves binary files)
```
