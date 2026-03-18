# canasta-app

An interactive **Canasta training application** that runs in the browser and works on mobile, tablet, and desktop.

## Features

- **Learn** — step-by-step interactive lessons covering every Canasta rule, with quizzes and mini-exercises.
- **Practice** — curated scenario drills with immediate feedback (melding, picking up the pile, going out, scoring, and more).
- **Play** — full individual-play games (2-player and 3-player variants) against a rule-based AI with Beginner / Easy / Medium / Hard / Expert difficulty.
- **Reference** — searchable offline cheat-sheet for rules, card values, and scoring tables.
- **Statistics** — personal game history, win rate, and high scores stored locally.
- **Settings** — sound effects, card animations, and colour theme preferences.

## Tech stack

React · TypeScript · Vite · Tailwind CSS · Zustand · Vitest · vite-plugin-pwa

## Getting started

```bash
npm install
npm run dev        # start dev server on http://localhost:5173
npm test           # run unit tests (Vitest)
npm run build      # production build
```

## Project structure

```
src/
  game/            # Pure TypeScript game-logic modules (no UI dependency)
    types.ts       # Card, Meld, Player, GameState types and helpers
    deck.ts        # Deck creation, shuffle, and dealing
    hand.ts        # Hand management (sort, add, remove, penalty)
    meld.ts        # Meld validation, scoring, and canasta detection
    pile.ts        # Discard pile rules (freeze, block, pick-up)
    scoring.ts     # Round and match score calculation
    rules.ts       # Action validation (draw, pick-up pile, meld, discard, go-out)
    stats.ts       # Game history stored in localStorage
  components/
    Card/          # Playing card component (accessible, responsive)
    Hand/          # Hand layout (scrollable fan, tap-to-select)
    Onboarding/    # First-run onboarding flow (4 slides)
  pages/           # Route-level page components
  router/          # react-router-dom routing configuration
```

## Documentation

- [PLAN.md](./PLAN.md) — detailed project specification: data structures, AI behaviour, design targets, and testing strategy.
- [PHASES.md](./PHASES.md) — phased development plan with per-phase tasks, exit criteria, and the overall delivery roadmap.
