# Canasta Training App — Project Plan

## Overview

This document outlines the plan for building an **interactive Canasta training application** that runs in a web browser and works seamlessly on both **mobile devices** and **desktop/PC**. The app will teach players the rules of Canasta, let them practice key situations, and guide them through full games against a computer opponent.

> **Scope note:** This version targets **individual (2-player) Canasta** — one human vs. one AI. Partnership/team play (4-player) is planned as a future feature.

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
- Dealing: each player receives **15 cards** (2-player individual rule).
- Drawing: on your turn draw **2 cards** from the stock, then discard 1 (2-player individual rule).
- Picking up the discard pile instead of drawing from the stock (frozen vs unfrozen pile).
- Forming melds (natural, mixed, and wild-card melds).
- Wild-card limit: a meld may contain at most as many wild cards as natural cards (no meld can be more than half wild cards).
- Completing a Canasta (7+ cards of the same rank): natural Canasta (no wild cards, worth 500 pts) vs. mixed Canasta (contains wild cards, worth 300 pts).
- Special cards: wild cards (jokers & 2s), red 3s, black 3s.
  - **Red 3s**: immediately placed face-up on the table when drawn or dealt; a replacement card is drawn. Each red 3 is worth 100 pts (all four together double to 800 pts). If a player holds all four they score 800 pts instead of 400 pts. Red 3s score against you if you have not completed any meld by end of round.
  - **Black 3s**: may only be discarded (to block the pile); they cannot be melded except in a going-out play with three or four black 3s and no wild cards. They score 5 pts each at end of round.
- Minimum initial meld requirement (based on your current score): below 0 pts → 15 pts; 0–1,499 pts → 50 pts; 1,500–2,999 pts → 90 pts; 3,000+ pts → 120 pts.
- Going out: a player may go out only when they have **at least 2 completed canastas** and can legally meld or discard their last card. Going out scores a bonus of +100 pts (or +200 pts for going out concealed — melding the entire hand at once without having previously melded).
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
A complete **2-player individual** (human vs. AI) game of Canasta with turn-by-turn guidance.

**Individual-play rules in effect:**
- Each player is dealt **15 cards** at the start.
- On your turn, draw **2 cards** from the stock (or pick up the discard pile instead); then discard 1 card.
- Each player needs **2 completed canastas** (in their own melds) to be eligible to go out.
- Going-out bonus: +100 pts (or +200 pts for a concealed go-out).

Features:
- Deal a full hand (15 cards each).
- Draw 2 cards from stock or pick up the entire discard pile.
- Drag-and-drop (or tap-to-select) card placement for melds.
- AI opponent that makes legal, sensible moves.
- Optional "hint" button that explains the best move with a reason.
- Round-end scoring screen.
- Multi-round match tracking (first to 5 000 points wins).

### 4. Reference — Quick Rules Lookup
A searchable, offline-available cheat sheet covering:
- Minimum initial meld scores by total score bracket.
- Card point values for cards in melds and hand at end of round: Joker = 50, Ace/2 = 20, 8–K = 10, 4–7 = 5. (Note: 3s cannot be melded normally — red 3s are bonus/penalty cards worth 100 pts each; black 3s score 5 pts against you if left in hand.)
- Canasta values: natural canasta = 500 pts, mixed canasta = 300 pts.
- End-of-round bonuses and penalties (going-out bonus, red-3 bonuses/penalties).
- Going-out conditions (2 canastas required per player).
- 2-player individual-play specifics: 15-card deal, 2-card draw.

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
| `deck.ts` | Create, shuffle, and deal the double deck (108 cards); deal 15 cards per player for individual play |
| `hand.ts` | Represent a player's hand; sort, add, remove cards |
| `meld.ts` | Validate and score a meld; enforce wild-card limit (≤ natural cards); check Canasta completion; distinguish natural (500 pts) vs. mixed (300 pts) canastas |
| `pile.ts` | Discard pile rules; freeze / unfreeze logic; block with black 3 |
| `scoring.ts` | Calculate round and match scores (card values, canasta bonuses, going-out bonus, concealed-go-out bonus, red-3 bonus/penalty) |
| `rules.ts` | Validate any proposed game action (draw 2 cards, pick up pile, meld, discard, go out) for individual-play rules |
| `ai.ts` | Simple rule-based AI to choose draw/meld/discard actions |

---

## Data Structures (key types)

```typescript
type Rank = '2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K'|'A'|'Joker';
type Suit = 'clubs'|'diamonds'|'hearts'|'spades'|'none';

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

// Individual-play (2-player) game state.
// Each player draws 2 cards from stock per turn (or picks up the pile) then discards 1.
// Each player needs 2 completed canastas to be eligible to go out.
interface GameState {
  stock: Card[];
  discardPile: Card[];
  pileIsFrozen: boolean;
  players: [PlayerState, PlayerState]; // index 0 = human, index 1 = AI
  currentPlayerIndex: 0 | 1;
  round: number;
  scores: [number, number];
  phase: 'draw' | 'meld' | 'discard' | 'roundEnd' | 'gameOver';
}
```

---

## Screens & Navigation

```
/                  → Home screen (Learn / Practice / Play / Reference)
/learn             → Lesson list
/learn/:lessonId   → Individual lesson
/practice          → Scenario list
/practice/:scenId  → Individual scenario drill
/play              → New game or resume game
/play/game         → Active game board
/reference         → Rules cheat sheet
```

---

## Milestones

### Milestone 1 — Foundation (Week 1–2)
- [ ] Scaffold the project with Vite + React + TypeScript + Tailwind.
- [ ] Set up routing (`react-router-dom`).
- [ ] Implement `deck.ts`, `hand.ts`, `meld.ts`, `pile.ts`, `scoring.ts`, `rules.ts` with full unit tests.
- [ ] Create a basic `Card` component and `Hand` component that renders correctly on mobile and desktop.

### Milestone 2 — Play Mode (Week 3–5)
- [ ] Build the `GameBoard` layout (table, melds, stock, discard pile, player hand).
- [ ] Implement draw and discard UI (tap or drag).
- [ ] Implement meld placement UI with validation feedback.
- [ ] Implement basic rule-based AI (`ai.ts`).
- [ ] Round-end scoring screen.
- [ ] Hint system (explains suggested move).

### Milestone 3 — Learn Mode (Week 6–7)
- [ ] Create lesson content for all rules topics listed above.
- [ ] Build the lesson UI with progress indicator.
- [ ] Add interactive quiz/mini-exercise components.

### Milestone 4 — Practice Mode (Week 8)
- [ ] Design and implement at least 10 scenario drills.
- [ ] Track per-scenario progress in browser local storage.

### Milestone 5 — Reference & Polish (Week 9)
- [ ] Build searchable Reference screen.
- [ ] PWA manifest and service worker (offline support).
- [ ] Accessibility audit (keyboard navigation, ARIA labels, colour contrast).
- [ ] Cross-browser and cross-device testing.

### Milestone 6 — Deploy (Week 10)
- [ ] Set up CI/CD pipeline (GitHub Actions → Vercel / GitHub Pages).
- [ ] Performance optimization (lazy loading routes, image optimization).
- [ ] Final QA and bug fixes.

---

## Testing Strategy

| Test type | Tool | What is covered |
|---|---|---|
| Unit | Vitest | All game-logic modules (`deck`, `hand`, `meld`, `scoring`, `rules`, `ai`) |
| Component | React Testing Library | Card, Hand, GameBoard, Lesson, Scenario components |
| Integration | React Testing Library | Full game flows (deal → meld → go out → score) |
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
- **Partnership / Team Canasta (4-player, 2 vs. 2)** — planned for v2 once the individual-play experience is solid.
- Advanced AI (Monte Carlo / machine learning).

These can be considered for a future version once the core single-player experience is solid.
