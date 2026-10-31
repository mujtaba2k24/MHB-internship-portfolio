# Applied Linguistics Internship Portfolio

A premium academic portfolio for **Mujtaba Hussain Bhatti**, an English Applied Linguistics undergraduate at the University of Sindh, Jamshoro.
It documents the planned and in-progress internship context without inventing activities, hours, findings, marks, or official documents.

> A personal portfolio with a fictional streaming-platform look. It is not affiliated with Netflix or any other streaming service and uses none of their logos.

## Run it locally

Requires **Node.js 18+**.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

Production build:

```bash
npm run build
npm run preview
```

The static site is written to `dist/` and can be deployed as-is to Vercel, Netlify, GitHub Pages or any static host.

## Updating the content

**All content lives in one file: [`src/data/portfolio.ts`](src/data/portfolio.ts).** It was generated from the resume, and every component reads from it.

| To change… | Edit |
| --- | --- |
| Name, intro, email, LinkedIn, GitHub | `profile` |
| Academic or internship work | `projects` (add a verified object; it appears in Academic and Internship Work and the profile summary) |
| Achievements / certifications | `achievements`, `certifications` |
| Skills and their "where it's used" notes | `skillCategories`, `skillEvidence` |
| Internship timeline | `internshipStages` |
| Key learning highlights | `topPicks` |
| Intro highlight reel | `introSlides` |
| Profile order (Recruiter / Developer / Creative) | `viewerProfiles` |
| Opening portfolio card text | `profile.originalLabel` |

The six documentation sections are implemented in `src/components/InternshipDocumentation.tsx`: Aims and Objectives, Daily Logbook, Reflective Logbook, Internship Report, Supervisor Feedback, and Acceptance Letter. Daily and reflective entries plus the report draft are stored locally in the current browser and are not submitted anywhere.

**CV:** add Mujtaba's verified CV to `public/assets/` and update `profile.resumePdf` when it is available. The current site clearly marks the CV as not yet provided.

**Photo:** add Mujtaba's own photo as `pic1.jpeg` (high-res source) and `pic.png` (background-removed cutout with the same framing), then run:

```bash
npm run images
```

This rebuilds the responsive WebP portraits and the social share image in `public/assets/`.

## What's inside

```
src/
  data/portfolio.ts        ← single source of truth (from the resume)
  App.tsx                  ← stages: opening → profile select → home; overlays
  components/
    OpeningSequence        ← portfolio card → MUJTABA → portfolio identity → profile reveal
    ProfileSelector        ← portfolio view selector (changes section order only)
    Navbar                 ← hide-on-scroll nav, profile switcher, mobile menu
    Hero                   ← billboard: parallax portrait, particles, light streaks, floating chips
    PlayIntro              ← highlight reel (pause, ← →, tap zones)
    ContinueWatching       ← cards with section progress bars
    About                  ← About the Intern
    InternshipDocumentation← aims, journey, logbooks, report, and document placeholders
    Originals / ProjectCard← Academic and Internship Work
    ProjectModal           ← detailed work overlay
    TopPicks               ← Key Learning Highlights
    Skills                 ← Applied Linguistics Competencies
    Achievements           ← Academic Activities and Achievements
    ResumeViewer/ResumeModal ← profile summary and CV-unavailable state
    FinalCTA               ← contact links
    CustomCursor, fx.tsx   ← cursor states, magnetic buttons, 3D tilt, text reveals, particles
  hooks/                   ← Lenis smooth scroll + scroll lock, media queries, watch progress
scripts/build-images.mjs   ← portrait/share-image pipeline (sharp)
```

**Stack:** React 18, TypeScript, Vite 6, Tailwind CSS 4, Framer Motion 11, Lenis.

## Accessibility and performance

- `prefers-reduced-motion` is respected: smooth scroll, the custom cursor, tilt, particles, grain and the pinned horizontal scroll turn off, and the opening jumps straight to its final frame.
- Hover effects only run on devices with a precise pointer. Touch devices get tap interactions and native swipe rails.
- The custom cursor appears only with a mouse or trackpad.
- Overlays close with Esc, and the highlight reel supports Space and the ← → keys.
- Portraits are responsive WebP files (25–90 KB). Overlays are code-split, and particles pause when they're off screen.

## Keyboard shortcuts

- **Opening:** Enter or Esc skips it.
- **Play Intro:** Space pauses, ← and → change slides, Esc closes.
- **Project and resume overlays:** Esc closes.
