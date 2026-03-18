# Canasta Training App — Project Plan

## Overview

This document outlines the plan for building an **interactive Canasta training application** that runs in a web browser and works seamlessly on both **mobile devices** and **desktop/PC**. The app will teach players the rules of Canasta, let them practice key situations, and guide them through full games against a computer opponent.

> **Scope note:** This version targets **individual Canasta** — one human vs. one or two AI opponents (**2-player** and **3-player** individual variants). Partnership/team play (4-player) is planned as a future feature.

---

## Goals

- Teach new players the rules and strategy of Canasta through interactive lessons.
- Let experienced players practice specific scenarios (melding, going out, picking up the pile, etc.).
- Provide full single-player games against an AI opponent.
- Work equally well on phones, tablets, and desktops.
- Provide clear, immediate feedback so players understand what they did right or wrong.

---

## Target Platforms

| Platform | Approach |
|---|---|
| Desktop (Chrome, Firefox, Safari, Edge) | Full browser app, mouse/keyboard controls |
| Mobile (iOS Safari, Android Chrome) | Same app, touch-optimized layout, responsive design |
| Tablet | Same app, adapts to screen size |

A **Progressive Web App (PWA)** approach will be used so players can install the app to their home screen and play offline.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| UI Framework | **React** (with TypeScript) | Large ecosystem, good component model, easy to find help |
| Styling | **Tailwind CSS** | Utility-first, easy responsive design, no separate CSS files to manage |
| State management | **Zustand** | Lightweight, simple, works well for card-game state |
| Build tool | **Vite** | Fast dev server, easy PWA plugin support |
| Testing | **Vitest** + **React Testing Library** | Fast unit & integration tests, same config as Vite |
| PWA support | **vite-plugin-pwa** | Service worker & manifest generation |
| Deployment | **Vercel** (or GitHub Pages) | Free tier, automatic deploys from GitHub |

---

## Application Sections

### 1. Learn — Rules & Tutorials
Interactive lessons that walk the player through each rule one step at a time.

Topics to cover:
- What is Canasta? Objective of the game.
- The deck (two standard 52-card decks + 4 jokers = 108 cards total).
- Dealing: each player receives **15 cards** in the 2-player variant or **13 cards** in the 3-player variant.
- Drawing: on your turn draw **2 cards** from the stock, then discard 1 (applies to both 2-player and 3-player variants).
- Picking up the discard pile instead of drawing from the stock (frozen vs unfrozen pile).
- Forming melds (natural, mixed, and wild-card melds).
- Wild-card limit: a meld may contain at most as many wild cards as natural cards (no meld can be more than half wild cards).
- Completing a Canasta (7+ cards of the same rank): natural Canasta (no wild cards, worth 500 pts) vs. mixed Canasta (contains wild cards, worth 300 pts).
- Special cards: wild cards (jokers & 2s), red 3s, black 3s.
  - **Red 3s**: immediately placed face-up on the table when drawn or dealt; a replacement card is drawn. Each red 3 is worth 100 pts (all four together double to 800 pts). If a player holds all four they score 800 pts instead of 400 pts. Red 3s score against you if you have not completed any meld by end of round.
  - **Black 3s**: may only be discarded; they cannot be melded except in a going-out play with three or four black 3s and no wild cards. Discarding a black 3 **blocks** the pile for one turn only (the next player cannot pick it up). Note: a **frozen** pile is a different concept — the pile becomes permanently frozen for the round when a wild card is discarded onto it. Black 3s left in hand at end of round count as **−5 pts each** against your score.
- Minimum initial meld requirement (based on your current score): below 0 pts → 15 pts; 0–1,499 pts → 50 pts; 1,500–2,999 pts → 90 pts; 3,000+ pts → 120 pts.
- Going out: a player may go out when they can legally meld or discard their last card. Going out scores a bonus of +100 pts (or +200 pts for going out concealed — melding the entire hand at once without having previously melded).
- Scoring rules (card point values, canasta bonuses, going-out bonus, red-3 bonuses/penalties).

Each lesson has:
- A short explanation with diagrams/illustrations.
- An interactive quiz question or mini-exercise to confirm understanding before moving on.
- A "try it" board where the player can practice the concept on a live (simplified) hand.

### 2. Practice — Scenario Drills
Curated situations where the player must make the correct move. Immediate feedback is given.

Example scenarios:
- "Can you meld with this hand? Try to form an initial meld that meets the minimum point requirement."
- "The pile is frozen. Which card can you use to pick it up?"
- "You have 2 Canastas. Should you go out? Make your decision."
- "Score this hand — drag each group to the right score category."
- "You drew a red 3 — what do you do next?"
- "Your opponent went out concealed — how does scoring change?"

Progress is tracked per scenario (pass/fail, tries taken).

### 3. Play — Full Game vs. AI
A complete **individual** (human vs. AI) game of Canasta with turn-by-turn guidance. Players choose between the **2-player** and **3-player** individual variants before starting a game.

**2-player individual rules in effect:**
- Each player is dealt **15 cards** at the start.
- On your turn, draw **2 cards** from the stock (or pick up the discard pile instead); then discard 1 card.
- Going-out bonus: +100 pts (or +200 pts for a concealed go-out).

**3-player individual rules in effect:**
- Each player is dealt **13 cards** at the start.
- On your turn, draw **2 cards** from the stock (or pick up the discard pile instead); then discard 1 card.
- Going-out bonus: +100 pts (or +200 pts for a concealed go-out).
- All other rules (meld validation, freezing the pile, red/black 3s, scoring) are identical to the 2-player variant.

Features:
- Variant selector (2-player or 3-player) on the new-game screen.
- Deal a full hand (15 cards each for 2-player; 13 cards each for 3-player).
- Draw 2 cards from stock or pick up the entire discard pile.
- Drag-and-drop (or tap-to-select) card placement for melds.
- AI opponents that make legal, sensible moves (one AI in 2-player mode; two AIs in 3-player mode).
- Optional "hint" button that explains the best move with a reason.
- Round-end scoring screen showing all players' scores.
- Multi-round match tracking (first to 5 000 points wins).

### 4. Reference — Quick Rules Lookup
A searchable, offline-available cheat sheet covering:
- Minimum initial meld scores by total score bracket.
- Card point values for cards in melds and hand at end of round: Joker = 50, Ace/2 = 20, 8–K = 10, 4–7 = 5. (Note: 3s cannot be melded normally — red 3s are bonus/penalty cards worth 100 pts each; black 3s score 5 pts against you if left in hand.)
- Canasta values: natural canasta = 500 pts, mixed canasta = 300 pts.
- End-of-round bonuses and penalties (going-out bonus, red-3 bonuses/penalties).
- Going-out conditions: player may go out when they can legally meld or discard their last card.
- 2-player individual-play specifics: 15-card deal, 2-card draw.
- 3-player individual-play specifics: 13-card deal, 2-card draw; all other scoring rules identical to 2-player.

---

## Responsive / Mobile Design

- **Viewport**: `<meta name="viewport" content="width=device-width, initial-scale=1">` set correctly.
- **Card size**: Cards scale with viewport; on small screens a "fan" layout collapses and allows horizontal scrolling.
- **Touch targets**: All interactive elements are at least 44×44 px.
- **Drag-and-drop**: Replaced with tap-to-select + tap-to-place on touch screens (detected via pointer events API).
- **Orientation**: Landscape layout preferred in Play mode; portrait layout supported with a scrollable table area.
- **PWA manifest**: App icon, splash screen, `display: standalone` so it feels like a native app when installed.

---

## Game Logic Modules

These are pure TypeScript modules (no UI dependency) so they can be unit-tested in isolation.

| Module | Responsibility |
|---|---|
| `deck.ts` | Create, shuffle, and deal the double deck (108 cards); deal 15 cards per player for 2-player or 13 cards per player for 3-player |
| `hand.ts` | Represent a player's hand; sort, add, remove cards |
| `meld.ts` | Validate and score a meld; enforce wild-card limit (≤ natural cards); check Canasta completion; distinguish natural (500 pts) vs. mixed (300 pts) canastas |
| `pile.ts` | Discard pile rules; freeze pile (triggered by discarding a wild card) / unfreeze logic; one-turn block with black 3 |
| `scoring.ts` | Calculate round and match scores (card values, canasta bonuses, going-out bonus, concealed-go-out bonus, red-3 bonus/penalty) |
| `rules.ts` | Validate any proposed game action (draw 2 cards, pick up pile, meld, discard, go out) for individual-play rules; handles both 2-player and 3-player variants |
| `ai.ts` | Rule-based AI with three difficulty levels (Easy / Medium / Hard) to choose draw/meld/discard actions |
| `stats.ts` | Record and query per-player game history (wins, losses, high scores, average score) stored in browser `localStorage` |

---

## Data Structures (key types)

```typescript
type Rank = '2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K'|'A'|'Joker';
type Suit = 'clubs'|'diamonds'|'hearts'|'spades'|'none';

// Selects which individual-play variant is in use.
// '2-player': human vs. 1 AI, 15-card deal.
// '3-player': human vs. 2 AIs, 13-card deal.
type GameVariant = '2-player' | '3-player';

type AIDifficulty = 'easy' | 'medium' | 'hard';

interface Card {
  rank: Rank;
  suit: Suit;
  id: string; // unique (e.g. "Ks-1", "Ks-2" for the two kings of spades)
}

interface Meld {
  rank: Rank;       // the natural rank being melded
  cards: Card[];    // natural cards + wild cards
  isCanasta: boolean;
  isNatural: boolean; // true = no wild cards (worth 500 pts); false = mixed (worth 300 pts)
}

interface PlayerState {
  hand: Card[];
  melds: Meld[];
  redThrees: Card[];  // red 3s laid face-up; score 100 each (800 if all four)
  hasGoneOut: boolean;
}

// Individual-play game state (2-player or 3-player variant).
// Each player draws 2 cards from stock per turn (or picks up the pile) then discards 1.
// 2-player: index 0 = human, index 1 = AI.
// 3-player: index 0 = human, index 1 = AI #1, index 2 = AI #2.
interface GameState {
  variant: GameVariant;
  difficulty: AIDifficulty;
  stock: Card[];
  discardPile: Card[];
  pileIsFrozen: boolean;
  players: PlayerState[];         // length 2 for '2-player', length 3 for '3-player'
  currentPlayerIndex: number;     // 0 | 1 for 2-player; 0 | 1 | 2 for 3-player
  round: number;
  scores: number[];               // parallel array to players[]
  phase: 'draw' | 'meld' | 'discard' | 'roundEnd' | 'gameOver';
}

interface GameRecord {
  id: string;           // UUID
  date: string;         // ISO 8601 timestamp
  variant: GameVariant;
  difficulty: AIDifficulty;
  humanWon: boolean;
  finalScores: number[];
  rounds: number;
  durationMs: number;
}

interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  bestScore: number;
  history: GameRecord[];  // capped at last 100 games
}
```

---

## Screens & Navigation

```
/                  → Home screen (Learn / Practice / Play / Reference / Stats)
/learn             → Lesson list
/learn/:lessonId   → Individual lesson
/practice          → Scenario list
/practice/:scenId  → Individual scenario drill
/play              → New game or resume game (includes AI difficulty selector)
/play/game         → Active game board
/reference         → Rules cheat sheet
/stats             → Personal statistics & game history
/settings          → App preferences (sound, theme, animations)
```

---

## Milestones

### Milestone 1 — Foundation (Week 1–2)
- [ ] Scaffold the project with Vite + React + TypeScript + Tailwind.
- [ ] Set up routing (`react-router-dom`).
- [ ] Implement `deck.ts`, `hand.ts`, `meld.ts`, `pile.ts`, `scoring.ts`, `rules.ts`, `stats.ts` with full unit tests (covering both 2-player and 3-player variants).
- [ ] Create a basic `Card` component and `Hand` component that renders correctly on mobile and desktop.
- [ ] Build a first-run onboarding flow (shown once on first visit): brief intro slides covering the app sections and a prompt to pick a starting point (Learn, Practice, or Play).

### Milestone 2 — Play Mode (Week 3–5)
- [ ] Build the `GameBoard` layout (table, melds, stock, discard pile, player hand).
- [ ] Implement draw and discard UI (tap or drag).
- [ ] Implement meld placement UI with validation feedback.
- [ ] Implement rule-based AI (`ai.ts`) with three difficulty levels:
  - **Easy** — plays legal moves, no lookahead; discards randomly from safe cards.
  - **Medium** — prioritises completing melds and avoids feeding the opponent the pile.
  - **Hard** — tracks seen cards, estimates opponent's hand strength, and plays defensively.
- [ ] Add variant selector (2-player / 3-player) and AI difficulty selector to the new-game screen.
- [ ] Support 3-player game loop: turn order cycles through human → AI #1 → AI #2.
- [ ] Round-end scoring screen showing all players' scores.
- [ ] Hint system (explains suggested move).
- [ ] Save completed game results to `stats.ts` (winner, scores, duration).

### Milestone 3 — Learn Mode (Week 6–7)
- [ ] Create lesson content for all rules topics listed above.
- [ ] Build the lesson UI with progress indicator.
- [ ] Add interactive quiz/mini-exercise components.

### Milestone 4 — Practice Mode (Week 8)
- [ ] Design and implement at least 10 scenario drills.
- [ ] Track per-scenario progress in browser local storage.

### Milestone 5 — Reference & Polish (Week 9)
- [ ] Build searchable Reference screen.
- [ ] Build Statistics screen (`/stats`): games played, win rate, average score, personal best, recent game history.
- [ ] Build Settings screen (`/settings`): sound on/off, animation speed (off / normal / fast), colour theme (light / dark).
- [ ] PWA manifest and service worker (offline support).
- [ ] Accessibility audit (keyboard navigation, ARIA labels, colour contrast).
- [ ] Cross-browser and cross-device testing.

### Milestone 6 — Deploy (Week 10)
- [ ] Set up CI/CD pipeline (GitHub Actions → Vercel / GitHub Pages).
- [ ] Performance optimization (lazy loading routes, image optimization).
- [ ] Final QA and bug fixes.

---

## Sound Effects & Card Animations

Sound and animation make the app feel polished without distracting from learning.

### Sound effects (all toggleable in Settings)
| Event | Sound |
|---|---|
| Card dealt / drawn | Soft card-flip tick |
| Card discarded | Card-place thud |
| Meld placed | Short chime |
| Canasta completed | Fanfare sting |
| Going out | Victory jingle |
| Invalid move | Subtle error tone |

- Sounds are short (<1 s), royalty-free `.ogg`/`.mp3` files bundled with the app.
- A single `SoundManager` utility wraps the Web Audio API; individual components call `playSound('deal')` etc.

### Card animations
| Action | Animation |
|---|---|
| Dealing | Cards fan out from the centre to each player area (300 ms) |
| Drawing from stock | Card slides from the stock pile to the player's hand (200 ms) |
| Picking up the pile | Pile fans out briefly then collapses into the player's hand (400 ms) |
| Discarding | Card moves from hand to discard pile (150 ms) |
| Meld placement | Card lifts and slots into the meld group (200 ms) |
| Canasta completed | Brief golden glow + scale pulse on the meld (600 ms) |

- Animations use CSS transitions / `@keyframes`; no heavy animation library needed.
- Animation speed is user-controlled (off / normal / fast) via a CSS custom property `--anim-speed`.
- `prefers-reduced-motion` media query disables all animations automatically.

---

## Statistics & Game History

Tracked in browser `localStorage` via `stats.ts`; no server required.

### Metrics stored per completed game
- Date and time
- Game variant (2-player / 3-player)
- AI difficulty level
- Winner (human or AI)
- Final scores for all players
- Number of rounds played
- Duration (minutes)

### Statistics screen displays
- Total games played / won / lost
- Win rate (%) overall and per AI difficulty
- Average score per game
- Personal best score
- Longest winning streak
- Recent game history table (last 20 games), sortable by date or score

### Data management
- "Clear history" button in Settings with a confirmation dialog.
- Data is exported as a `.json` file via a "Download stats" button (useful before clearing).

---

## Error Handling Strategy

| Scenario | Handling |
|---|---|
| Invalid game action (e.g. illegal meld) | Inline validation message next to the affected cards; action is blocked; no state change |
| Corrupted / missing `localStorage` data | Detect on app start; show a toast "Save data couldn't be loaded — starting fresh"; reset to defaults |
| Stock exhausted before a player goes out | Both players draw zero cards; game ends immediately; scoring proceeds normally |
| Unhandled JS exception | Global `ErrorBoundary` component catches React render errors and shows a friendly "Something went wrong — reload" screen with a button |
| Service worker update available | Show a non-intrusive banner "Update available — tap to refresh" |

---

## Performance Targets

| Metric | Target |
|---|---|
| First Contentful Paint (mobile 4G) | < 1.5 s |
| Time to Interactive (mobile 4G) | < 3 s |
| Lighthouse Performance score | ≥ 90 |
| Lighthouse Accessibility score | ≥ 95 |
| Bundle size (gzipped JS, initial chunk) | < 150 KB |
| Card animation frame rate | 60 fps on mid-range phones |

Strategies to hit targets:
- Route-based code splitting (`React.lazy` + `Suspense`).
- Card images as inline SVG or CSS (no raster image downloads).
- Tree-shaking via Vite; no unused Tailwind classes (PurgeCSS built into Tailwind v3+).
- Service worker pre-caches all routes and assets so repeat visits are instant.

---

## Testing Strategy

| Test type | Tool | What is covered |
|---|---|---|
| Unit | Vitest | All game-logic modules (`deck`, `hand`, `meld`, `scoring`, `rules`, `ai`, `stats`) |
| Component | React Testing Library | Card, Hand, GameBoard, Lesson, Scenario, Stats, Settings components |
| Integration | React Testing Library | Full game flows (deal → meld → go out → score → stats saved) |
| E2E (optional) | Playwright | Complete lesson and play sessions in a real browser |

---

## Accessibility

- All cards have `aria-label` describing rank and suit.
- Focus management maintained when modals open/close.
- Colour is never the only means of conveying information (e.g. suit icons as well as colour).
- Minimum contrast ratio 4.5:1 for all text.

---

## Out of Scope (v1)

- Multiplayer (real-time online play).
- Account / login system.
- **Partnership / Team Canasta (4-player, 2 vs. 2)** — planned for v2 once the individual-play experience (2-player and 3-player) is solid.
- Advanced AI (Monte Carlo / machine learning).

These can be considered for a future version once the core single-player experience is solid.
