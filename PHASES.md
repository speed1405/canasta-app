# Canasta App — Phased Development Plan

This document describes the step-by-step delivery roadmap for the Canasta training application.
Each phase builds on the previous one and produces working, shippable software.
The roadmap is split across three versions:

- **v1 (Phases 1–6)** — core single-player training app, shipped in ~10 weeks.
- **v2 (Phases 7–10)** — post-launch iteration, user accounts, team play, and online
  multiplayer.
- **v3 (Phases 11–12)** — advanced AI, tournaments, and community/social features.

For the full project specification — including data structures, AI behaviour, design targets, and
testing strategy — see [PLAN.md](./PLAN.md).

---

## Phase Overview

| Phase | Version | Name | Weeks | Key Deliverable |
|---|---|---|---|---|
| 1 | v1 | Foundation | 1–2 | Project scaffold + all game-logic modules + core UI primitives |
| 2 | v1 | Play Mode | 3–5 | Fully playable 2-player and 3-player games vs. AI |
| 3 | v1 | Learn Mode | 6–7 | Interactive lessons covering every Canasta rule |
| 4 | v1 | Practice Mode | 8 | Curated scenario drills with progress tracking |
| 5 | v1 | Reference & Polish | 9 | Rules cheat sheet, statistics, settings, PWA, and accessibility |
| 6 | v1 | Deploy & Harden | 10 | CI/CD, performance optimisation, and final QA |
| 7 | v1.x | Post-Launch Iteration | 11–12 | Real-world bug fixes, UX improvements, content expansion |
| 8 | v2 | User Accounts & Cloud Sync | 13–16 | Auth, cloud-saved stats, cross-device sync, profile page |
| 9 | v2 | Partnership / Team Canasta | 17–21 | 4-player (2 vs. 2) variant with team AI and team scoring |
| 10 | v2 | Online Multiplayer | 22–27 | Real-time game rooms, matchmaking, reconnect, in-game chat |
| 11 | v3 | Advanced AI & Tournaments | 28–33 | ML/neural-net AI, tournament brackets, global leaderboards |
| 12 | v3 | Community & Social | 34–38 | Friends, game replays, achievements, custom card themes |

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

## Phase 7 — Post-Launch Iteration (Weeks 11–12)

**Goal:** respond to real-world usage by fixing production bugs, polishing UX pain points,
and expanding content based on user feedback gathered after the v1 launch.

### Tasks

**Monitoring & bug fixes**
- [ ] Integrate an error-reporting service (e.g., Sentry) to capture uncaught exceptions in
  production.
- [ ] Monitor Core Web Vitals via the production deployment dashboard; investigate any
  regressions introduced by real traffic patterns.
- [ ] Triage and fix all P1/P2 bugs reported by users within 48 hours of report.
- [ ] Release patch versions (`v1.0.x`) as needed.

**UX improvements**
- [ ] Review session-recording or user-feedback data; identify the top 5 usability friction
  points and address them.
- [ ] Improve onboarding flow based on drop-off metrics (e.g., clearer call-to-action on the
  home screen, skip button for returning players).
- [ ] Add a "What's new" changelog modal that appears once after each app update.
- [ ] Improve accessibility of any elements flagged by real users with assistive technologies.

**Content expansion**
- [ ] Add at least 5 new Practice Mode scenario drills based on common mistakes observed
  in Play Mode game data.
- [ ] Add a "Tips & Strategy" section to the Reference screen covering intermediate-level
  tactics (e.g., when to freeze the pile, optimal discard selection).
- [ ] Localise the app into at least one additional language (i18n framework in place from
  this phase onward).

### Exit Criteria

- Zero P1 open bugs; no more than 3 P2 open bugs.
- Error-reporting dashboard active and alerting on new exception spikes.
- At least 5 new Practice drills live.
- "Tips & Strategy" section published in the Reference screen.

---

## Phase 8 — User Accounts & Cloud Sync (v2, Weeks 13–16)

**Goal:** give players a persistent identity so their statistics, lesson progress, and
preferences follow them across devices and browsers.

### Tasks

**Auth system**
- [ ] Choose and integrate an auth provider (Firebase Auth or Supabase Auth recommended):
  - Email/password registration and login.
  - "Sign in with Google" OAuth.
  - Password reset via email.
- [ ] Add auth-aware routing: unauthenticated users can still play as a guest but are
  prompted to sign in to enable cloud sync.
- [ ] Implement a profile page (`/profile`): display name, avatar (Gravatar fallback),
  account creation date.

**Cloud storage**
- [ ] Migrate `stats.ts` to write game records to the cloud (Firestore or Supabase
  `postgres` table) when the user is signed in; fall back to `localStorage` for guests.
- [ ] Sync lesson progress and practice-drill results to the cloud per user.
- [ ] Sync Settings preferences to the cloud so they apply on any device.
- [ ] Provide a merge strategy for when a guest converts to a signed-in account
  (local records are uploaded and merged with any existing cloud records).

**Privacy & data management**
- [ ] Add a "Delete my account" flow in Settings (deletes cloud data and account).
- [ ] Ensure all cloud data is scoped per user and not readable by other users (security
  rules / row-level security).
- [ ] Update the Privacy Policy and display it during registration.

### Exit Criteria

- A user can register, log in on a second device, and see their game history and lesson
  progress without any manual export/import.
- Guest play continues to work without an account.
- "Delete my account" removes all cloud data within 24 hours.
- Firestore / Supabase security rules audited; no cross-user data leaks.

---

## Phase 9 — Partnership / Team Canasta (v2, Weeks 17–21)

**Goal:** add the 4-player (2 vs. 2 partnership) variant of Canasta, which is the most common
form of the game worldwide.

### Tasks

**Game logic**
- [ ] Extend `GameVariant` to include `'4-player-partnership'`.
- [ ] Implement partnership-specific rules in `rules.ts`:
  - Partners sit opposite each other; turn order is player 0 → 1 → 2 → 3.
  - Partners share a common set of melds (cards melded by either partner are added to
    the shared table area).
  - A player may not go out without their partner's permission if the partner has melded
    fewer than 2 canastas (ask-permission rule).
  - Scoring is calculated per team, not per individual.
- [ ] Update `scoring.ts` to aggregate scores at the team level.
- [ ] Update `deck.ts` to deal 11 cards per player (4-player partnership standard).
- [ ] Implement partner AI strategy in `ai.ts`: a cooperative strategy that considers the
  partner's visible melds when choosing draws and discards.
- [ ] Write unit tests for all partnership rule variants.

**UI**
- [ ] Build a 4-player `GameBoard` layout: human and AI partner sit at top/bottom;
  opponents sit left/right.
- [ ] Shared meld zone clearly labelled per team.
- [ ] "Ask partner" dialog: prompt the human to request permission to go out; AI partner
  responds based on its current hand evaluation.
- [ ] Team score display in round-end and game-over screens.
- [ ] Add `'4-player-partnership'` option to the new-game screen variant selector.

### Exit Criteria

- A full multi-round 4-player partnership match can be played to completion without errors.
- Partnership-specific rules (shared melds, ask-permission) are correctly enforced.
- Team scoring produces correct totals across rounds.
- AI partners cooperate visibly (e.g., complete each other's melds).

---

## Phase 10 — Online Multiplayer (v2, Weeks 22–27)

**Goal:** let players compete against real humans in real time using any of the supported
game variants.

### Tasks

**Backend / infrastructure**
- [ ] Provision a real-time backend (e.g., Firebase Realtime Database, Supabase Realtime,
  or a custom WebSocket server on Fly.io).
- [ ] Design a room/game-session data model:
  - Room: `id`, `variant`, `hostId`, `players[]`, `status` (waiting / in-progress / finished).
  - All game state changes broadcast to every player in the room via subscriptions.
- [ ] Implement server-side game-action validation (mirror of `rules.ts`) to prevent
  cheating via client-side manipulation.

**Matchmaking & lobby**
- [ ] Build a lobby screen (`/lobby`):
  - "Create room" — generates a shareable 6-character invite code.
  - "Join room" — enter an invite code to join a friend's room.
  - "Quick match" — join a random public room for the selected variant and difficulty
    (AI fills empty seats if no opponent is found within 30 seconds).
- [ ] Show a waiting room while other players join; display each player's display name and
  ready status.
- [ ] Allow the host to start the game once all seats are filled.

**In-game multiplayer**
- [ ] Replace AI turns with real-time remote player turns; display a "Waiting for
  [player name]…" indicator with a turn timer (60 seconds; auto-discard on timeout).
- [ ] Implement in-game text chat (profanity filter applied).
- [ ] Handle player disconnection: show a reconnection countdown (2 minutes); if the
  player does not reconnect, an AI takes over for the remainder of the match.
- [ ] Spectator mode: allow signed-in users to watch an in-progress public game without
  interacting.

**Post-game**
- [ ] Save multiplayer game records to the cloud and credit wins/losses to each player's
  profile.
- [ ] Show a post-game summary with rematch option.

### Exit Criteria

- Two players on separate devices can complete a full 2-player multiplayer match without
  desync.
- 4-player partnership multiplayer works with 4 human players.
- Turn timer auto-discards correctly on timeout.
- Disconnection and reconnection handled gracefully; AI takeover activates after 2 minutes.
- Server-side rule validation rejects illegal actions sent from a modified client.

---

## Phase 11 — Advanced AI & Tournaments (v3, Weeks 28–33)

**Goal:** elevate the AI to near-human competitive strength using machine learning and
introduce a structured tournament experience.

### Tasks

**Machine-learning AI**
- [ ] Collect a training dataset from Expert-level self-play games (at least 100,000
  complete games).
- [ ] Train a neural-network policy/value model (e.g., a small transformer or LSTM) to
  predict optimal draw, meld, and discard decisions.
- [ ] Integrate the model as a new `'neural'` difficulty level in `ai.ts`; serve inference
  via a WebAssembly (WASM) build of ONNX Runtime so it runs entirely in the browser.
- [ ] Benchmark the neural AI win rate against Expert rule-based AI; target ≥ 60% win rate.
- [ ] Allow human players to select the "Neural" difficulty on the new-game screen.

**Tournament mode**
- [ ] Design a tournament data model: `Tournament` (id, variant, format, rounds, players[],
  bracket/standings).
- [ ] Implement two tournament formats:
  - **Round-robin** — every player faces every other player once; winner has the most
    points after all matches.
  - **Single-elimination bracket** — players are seeded; losers are eliminated each round.
- [ ] Build the tournament lobby (`/tournaments`): create, browse, and join open tournaments.
- [ ] Build the bracket/standings view: live-updating results as matches complete.
- [ ] Integrate tournament results with player profiles and global leaderboards.

**Global leaderboards**
- [ ] Build the leaderboards screen (`/leaderboards`):
  - Overall ranking by Elo-style rating (updated after each multiplayer or tournament
    match).
  - Separate leaderboards per variant (2-player individual, 3-player individual,
    4-player partnership).
  - Friends leaderboard (shows only friends' rankings).
- [ ] Implement the Elo rating system in the backend; update ratings at match completion.

### Exit Criteria

- Neural AI WASM bundle loads in < 500 ms on a mid-range mobile device.
- Neural AI achieves ≥ 60% win rate against the rule-based Expert AI in automated
  benchmark games.
- A 4-player round-robin tournament runs to completion and produces a correct final
  standings table.
- Global leaderboard updates reflect new match results within 60 seconds.

---

## Phase 12 — Community & Social Features (v3, Weeks 34–38)

**Goal:** build the social layer that turns the app from a solo training tool into a living
community for Canasta enthusiasts.

### Tasks

**Friends system**
- [ ] Implement friend requests: send by username or shareable link; accept/decline.
- [ ] Friends list on the profile page with online/in-game status indicators.
- [ ] "Challenge a friend" shortcut: creates a private multiplayer room pre-filled with
  the friend's user ID.
- [ ] Push notifications (web push) for friend requests and game invitations.

**Game replays**
- [ ] Record the full action log of every multiplayer and AI game to the cloud.
- [ ] Build a replay viewer (`/replay/:gameId`): step through turns forward and backward;
  display each player's hand, melds, and discard-pile state at every point in the game.
- [ ] Allow players to share a replay link publicly or with friends only.
- [ ] Add optional AI commentary in the replay viewer: highlight turning-point moments and
  explain why the optimal move differs from the one played.

**Achievements**
- [ ] Design an achievement system with at least 30 achievements, covering:
  - Milestones (first win, 10 wins, 100 wins, first canasta, first concealed go-out, etc.).
  - Skill-based (win against Expert AI, win a match without the hint button, complete all
    lessons, complete all practice drills, etc.).
  - Social (play with 3 different friends, win a tournament, etc.).
- [ ] Display earned achievements on the profile page with unlock date.
- [ ] Show an achievement-earned toast notification in-game at the moment of unlock.

**Custom card themes**
- [ ] Implement a card theme system: card back designs and face-card illustration styles
  can be swapped via a theme pack.
- [ ] Ship at least 3 built-in themes (Classic, Minimalist, and one festive theme).
- [ ] Allow community-contributed themes submitted as pull requests (SVG card sheet +
  `theme.json` manifest).

**Daily & weekly challenges**
- [ ] Generate a "Daily challenge" scenario automatically each day (seeded from the date
  so every player plays the same hand).
- [ ] Publish weekly strategy challenge: a complex hand where players compete for the
  highest score.
- [ ] Display a global challenge leaderboard for the current day/week.

### Exit Criteria

- Friend request, accept, and challenge flow works end-to-end between two test accounts.
- A complete AI game replay can be stepped through without errors or desync.
- At least 30 achievements implemented; achievement toast fires at correct game events.
- Three built-in card themes selectable in Settings; theme persists across sessions.
- Daily challenge is unique per calendar day and identical for all players.

---

## Out of Scope (beyond v3)

The following ideas are noted for future consideration but have no committed timeline:

- Native mobile apps (iOS / Android) via React Native or Capacitor.
- Offline multiplayer via Bluetooth or local Wi-Fi (peer-to-peer).
- Paid DLC card theme packs or cosmetic items.
- Live-streamed tournament broadcasts with commentator audio.
