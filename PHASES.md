# Canasta App — Phased Development Plan

This document describes the step-by-step delivery roadmap for the Canasta training application.
Each phase builds on the previous one and produces working, shippable software.

For the full project specification — including data structures, AI behaviour, design targets, and
testing strategy — see [PLAN.md](./PLAN.md).

---

## Phase Overview

| Phase | Name | Weeks | Key Deliverable |
|---|---|---|---|
| 1 | Foundation | 1–2 | Project scaffold + all game-logic modules + core UI primitives |
| 2 | Play Mode | 3–5 | Fully playable 2-player and 3-player games vs. AI |
| 3 | Learn Mode | 6–7 | Interactive lessons covering every Canasta rule |
| 4 | Practice Mode | 8 | Curated scenario drills with progress tracking |
| 5 | Reference & Polish | 9 | Rules cheat sheet, statistics, settings, PWA, and accessibility |
| 6 | Deploy & Harden | 10 | CI/CD, performance optimisation, and final QA |

---

## Phase 1 — Foundation (Weeks 1–2)

**Goal:** establish the project skeleton and implement every piece of pure game logic, all fully
unit-tested, before any game UI is built.

### Tasks

- [ ] Scaffold the project: `npm create vite@latest` with the React + TypeScript template.
- [ ] Install and configure Tailwind CSS, Zustand, `react-router-dom`, Vitest, and
  React Testing Library.
- [ ] Configure `vite-plugin-pwa` (manifest entry point only; service worker content added in
  Phase 5).
- [ ] Implement pure TypeScript game-logic modules (no UI dependency):
  - `deck.ts` — create, shuffle, and deal the 108-card double deck; support 15-card deal
    (2-player) and 13-card deal (3-player).
  - `hand.ts` — represent a player's hand; sort, add, and remove cards.
  - `meld.ts` — validate and score melds; enforce the wild-card limit (≤ natural cards);
    detect natural canastas (500 pts) and mixed canastas (300 pts).
  - `pile.ts` — discard-pile rules: freeze on wild-card discard; one-turn block with black 3.
  - `scoring.ts` — calculate round and match scores (card values, canasta bonuses,
    going-out bonus, concealed-go-out bonus, red-3 bonuses/penalties).
  - `rules.ts` — validate any proposed action (draw, pick up pile, meld, discard, go out)
    for both 2-player and 3-player variants.
  - `stats.ts` — store and query per-player game history in `localStorage`.
- [ ] Write unit tests for every logic module targeting ≥ 90 % branch coverage (both variants
  where applicable).
- [ ] Create primitive UI components:
  - `Card` component — renders rank/suit with correct colours; `aria-label` for
    accessibility; scales to viewport.
  - `Hand` component — fan layout with horizontal scroll on small screens; tap-to-select
    on touch devices.
- [ ] Build a first-run onboarding flow (shown once per device): brief intro slides that
  describe each app section and prompt the user to pick a starting point (Learn, Practice,
  or Play).
- [ ] Set up routing skeleton (`react-router-dom`) with placeholder pages for every route
  defined in the spec.

### Exit Criteria

- All logic modules pass their unit-test suites with no failures.
- `Card` and `Hand` components render correctly on a 375 px mobile viewport and a 1 280 px
  desktop viewport.
- Routing skeleton navigates between all placeholder pages without errors.

---

## Phase 2 — Play Mode (Weeks 3–5)

**Goal:** deliver a fully playable individual Canasta game (2-player and 3-player variants)
against a rule-based AI, with five difficulty levels.

### Tasks

- [ ] Build the `GameBoard` layout: game table, meld zones, stock pile, discard pile, and
  player hand area; landscape-preferred on mobile with a scrollable portrait fallback.
- [ ] Implement the draw UI: tap "Draw 2" button or tap the discard pile to pick up the
  entire pile (pile rules enforced by `rules.ts`).
- [ ] Implement meld placement UI: drag-and-drop on desktop; tap-to-select + tap-to-place
  on touch devices; inline validation feedback on illegal moves.
- [ ] Implement the discard UI: tap or drag a card to the discard pile.
- [ ] Implement the AI (`ai.ts`) with five distinct strategy profiles:
  - **Beginner** — random legal moves; never considers strategy.
  - **Easy** — always melds when possible; discards safely; never freezes deliberately.
  - **Medium** — prioritises completing melds and canastas; avoids gifting useful discards.
  - **Hard** — full card-counting; models opponent's hand; freezes pile strategically;
    times going-out to maximise score delta.
  - **Expert** — minimax meld evaluation; Bayesian hand modelling; Monte Carlo go-out
    simulation; adaptive aggression/defence meta-strategy.
- [ ] Add a new-game screen with:
  - Variant selector (2-player / 3-player).
  - AI difficulty selector (Beginner / Easy / Medium / Hard / Expert).
- [ ] Support the 3-player turn cycle: human → AI #1 → AI #2.
- [ ] Build the round-end scoring screen (all players' scores, round total, running total).
- [ ] Implement the hint system: a "Hint" button that explains the recommended move in plain
  English.
- [ ] Save completed game results to `stats.ts` (variant, difficulty, winner, scores,
  duration).
- [ ] Write component and integration tests covering the core game loop:
  deal → draw → meld → discard → go out → score saved.

### Exit Criteria

- A complete multi-round match (first to 5 000 pts) can be played to completion in both
  2-player and 3-player variants at every difficulty level without errors.
- All five AI difficulty levels produce noticeably different play styles.
- Hint button returns a sensible explanation for the suggested move on every game phase.
- Round-end and game-over screens display correct scores.

---

## Phase 3 — Learn Mode (Weeks 6–7)

**Goal:** deliver interactive lessons that teach every Canasta rule from scratch.

### Tasks

- [ ] Write lesson content covering all rule topics:
  - Objective of the game; the 108-card deck.
  - Dealing: 15 cards (2-player) or 13 cards (3-player).
  - Turn structure: draw 2 from stock (or pick up pile), then discard 1.
  - Picking up the pile: frozen vs. unfrozen; requirements.
  - Forming melds: natural, mixed, and wild-card melds; wild-card limit.
  - Completing a canasta (7+ cards): natural (500 pts) vs. mixed (300 pts).
  - Special cards: jokers, 2s (wild); red 3s (bonus/penalty); black 3s (block and penalty).
  - Minimum initial meld requirement by score bracket.
  - Going out: conditions, +100 pts bonus, +200 pts concealed bonus.
  - Scoring: card values, canasta bonuses, red-3 bonuses/penalties.
- [ ] Build the lesson list screen (`/learn`) with a progress indicator per lesson.
- [ ] Build the individual lesson screen (`/learn/:lessonId`):
  - Step-by-step explanation with diagrams or illustrations.
  - Interactive quiz question or mini-exercise after each rule block.
  - A "try it" board where the player practices the concept on a simplified live hand.
  - Progress bar and "Next lesson" navigation.
- [ ] Persist lesson completion state in `localStorage`.
- [ ] Write component tests for the lesson and quiz UI components.

### Exit Criteria

- All rule topics have a complete lesson with at least one quiz question or mini-exercise.
- Lesson progress is saved and restored across sessions.
- Lessons render correctly on mobile and desktop.

---

## Phase 4 — Practice Mode (Week 8)

**Goal:** give players a library of curated scenario drills to reinforce specific skills.

### Tasks

- [ ] Design and implement at least 10 scenario drills, including:
  - "Form an initial meld that meets the minimum point requirement."
  - "The pile is frozen — which card lets you pick it up?"
  - "You have 2 canastas — should you go out?"
  - "Score this hand — drag each group to the correct score category."
  - "You drew a red 3 — what do you do next?"
  - "Your opponent went out concealed — how does scoring change?"
  - Additional scenarios covering freezing the pile, black 3 discards, and
    concealed go-outs.
- [ ] Build the scenario list screen (`/practice`) with pass/fail status per drill.
- [ ] Build the individual drill screen (`/practice/:scenId`):
  - Pre-set board state with instructions.
  - Immediate right/wrong feedback with a brief explanation.
  - "Try again" and "Next drill" buttons.
- [ ] Track per-scenario results (pass/fail, attempts) in `localStorage`.
- [ ] Write component tests for the scenario and feedback UI.

### Exit Criteria

- At least 10 scenarios are playable end-to-end.
- Pass/fail tracking persists across sessions.
- Feedback messages clearly explain why an answer is correct or incorrect.

---

## Phase 5 — Reference & Polish (Week 9)

**Goal:** complete all supporting screens, add offline PWA capability, and reach accessibility
and performance targets.

### Tasks

**Reference screen**
- [ ] Build the searchable rules cheat sheet (`/reference`):
  - Minimum initial meld requirements by score bracket.
  - Card point values table.
  - Canasta values (natural 500 pts, mixed 300 pts).
  - End-of-round bonuses and penalties.
  - Going-out conditions.
  - 2-player and 3-player deal/draw specifics.
- [ ] Ensure the reference content is available offline (pre-cached by service worker).

**Statistics screen**
- [ ] Build the Statistics screen (`/stats`):
  - Total games played / won / lost.
  - Win rate (%) overall and broken down by AI difficulty.
  - Average score per game; personal best score; longest winning streak.
  - Recent game history table (last 20 games), sortable by date or score.
- [ ] Add "Download stats" button (exports history as a `.json` file).
- [ ] Add "Clear history" button with a confirmation dialog.

**Settings screen**
- [ ] Build the Settings screen (`/settings`):
  - Sound on/off toggle.
  - Animation speed selector (off / normal / fast).
  - Colour theme selector (light / dark).
- [ ] Implement the `SoundManager` utility (Web Audio API); wire up all in-game sound events
  (card deal, discard, meld, canasta, going out, invalid move).
- [ ] Implement CSS animation system with `--anim-speed` custom property; respect
  `prefers-reduced-motion`.

**PWA & Accessibility**
- [ ] Complete the PWA manifest: app icon set, splash screen, `display: standalone`.
- [ ] Implement and register the service worker; pre-cache all routes and static assets.
- [ ] Add the "Update available — tap to refresh" banner for service-worker updates.
- [ ] Conduct a full accessibility audit:
  - `aria-label` on every card and interactive element.
  - Focus management on modal open/close.
  - Colour is never the sole means of conveying information.
  - Minimum contrast ratio 4.5 : 1 for all text.
  - Keyboard navigation for all actions.
- [ ] Verify Lighthouse Performance ≥ 90 and Lighthouse Accessibility ≥ 95.

### Exit Criteria

- Reference screen is searchable and available offline.
- Statistics screen displays all metrics correctly and export/clear functions work.
- Settings screen persists preferences; sound and animation toggles take effect immediately.
- PWA installs to the home screen on iOS Safari and Android Chrome.
- Lighthouse Performance ≥ 90 and Accessibility ≥ 95 on a mobile Lighthouse run.

---

## Phase 6 — Deploy & Harden (Week 10)

**Goal:** ship the app to production with automated CI/CD, performance optimisations, and a
clean bill of health from final QA.

### Tasks

**CI/CD**
- [ ] Set up a GitHub Actions workflow that runs on every push and pull request:
  - `npm run lint` — ESLint.
  - `npm run test` — Vitest unit and component tests.
  - `npm run build` — Vite production build.
- [ ] Configure automatic deployment to Vercel (or GitHub Pages) on merge to `main`.
- [ ] Protect the `main` branch: require passing CI checks before merging.

**Performance optimisation**
- [ ] Enable route-based code splitting (`React.lazy` + `Suspense`).
- [ ] Confirm card visuals use inline SVG or CSS (no raster image downloads).
- [ ] Verify tree-shaking removes unused code; confirm gzipped initial JS bundle < 150 KB.
- [ ] Confirm service worker pre-caches all routes so repeat visits load instantly.

**Optional E2E tests**
- [ ] (Optional) Add Playwright E2E tests covering a complete lesson session and a
  complete play session in a real browser.

**Final QA**
- [ ] Cross-browser testing: Chrome, Firefox, Safari, Edge on desktop.
- [ ] Cross-device testing: iOS Safari (iPhone), Android Chrome, tablet.
- [ ] Fix all outstanding bugs identified during QA.
- [ ] Tag the v1.0.0 release.

### Exit Criteria

- CI pipeline is green on `main`.
- App is publicly accessible at the production URL.
- No open P1/P2 bugs.
- First Contentful Paint < 1.5 s and Time to Interactive < 3 s on a simulated mobile 4G
  Lighthouse run.
- v1.0.0 GitHub release tag created with release notes.

---

## Out of Scope for v1

The following features are intentionally deferred to a future version:

- Real-time multiplayer (online play).
- User accounts / login system.
- Partnership / Team Canasta (4-player, 2 vs. 2).
- Machine-learning or neural-network AI.

These will be revisited once the core single-player experience is solid and user feedback has
been gathered.
