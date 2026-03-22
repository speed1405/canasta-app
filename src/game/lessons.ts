/** Lesson content for Phase 3 — Learn Mode. */

export interface LessonStep {
  /** Short heading for this step. */
  title: string
  /** Main explanation text (may contain newlines). */
  body: string
  /** Optional illustrative emoji/icon. */
  icon?: string
}

export interface QuizOption {
  text: string
}

export interface QuizQuestion {
  question: string
  options: QuizOption[]
  /** 0-based index of the correct option. */
  correctIndex: number
  /** Shown after the player answers. */
  explanation: string
}

export interface Lesson {
  id: string
  title: string
  description: string
  steps: LessonStep[]
  quiz: QuizQuestion
}

export const LESSONS: Lesson[] = [
  {
    id: 'intro',
    title: 'What is Canasta?',
    description: 'Objective and the 108-card deck',
    steps: [
      {
        title: 'Objective',
        icon: '🏆',
        body: 'Canasta is a card game where the goal is to score points by forming melds — groups of three or more cards of the same rank. The first team (or player) to reach 5,000 points across multiple rounds wins the game.',
      },
      {
        title: 'The Deck',
        icon: '🃏',
        body: 'The game uses two standard 52-card decks plus four jokers, giving 108 cards in total. All cards of the same rank can be grouped together to form melds.',
      },
      {
        title: 'Wild Cards',
        icon: '🃏',
        body: 'Jokers and all four 2s are wild cards. They can substitute for any natural card in a meld, but wild cards may never outnumber natural cards in any meld.',
      },
      {
        title: 'Special Cards',
        icon: '🔴',
        body: 'Red 3s are bonus cards worth 100 points each (500 if you hold all four). They are placed face-up on the table immediately when drawn. Black 3s block the discard pile — opponents cannot pick it up on the turn you discard a black 3.',
      },
    ],
    quiz: {
      question: 'How many cards are in a Canasta deck?',
      options: [
        { text: '52' },
        { text: '104' },
        { text: '108' },
        { text: '112' },
      ],
      correctIndex: 2,
      explanation: 'Canasta uses two 52-card decks plus four jokers: 104 + 4 = 108 cards.',
    },
  },
  {
    id: 'dealing',
    title: 'Dealing',
    description: '15 cards (2-player) or 13 cards (3-player)',
    steps: [
      {
        title: 'How Many Cards?',
        icon: '🤲',
        body: 'In a 2-player game each player is dealt 15 cards. In a 3-player game each player receives 13 cards. The remaining cards form the stock (face-down draw pile).',
      },
      {
        title: 'The Discard Pile',
        icon: '🗂️',
        body: 'After dealing, one card is turned face-up to start the discard pile. If that card is a red 3 or a wild card, additional cards are placed on top until a natural card shows.',
      },
      {
        title: 'Red 3s at the Start',
        icon: '🔴',
        body: 'Any red 3s in your initial hand are placed face-up in front of you immediately, and you draw replacement cards from the stock so you always start with the correct hand size.',
      },
    ],
    quiz: {
      question: 'In a 3-player Canasta game, how many cards does each player start with?',
      options: [
        { text: '11' },
        { text: '13' },
        { text: '15' },
        { text: '17' },
      ],
      correctIndex: 1,
      explanation: 'In a 3-player game each player is dealt 13 cards (15 in a 2-player game).',
    },
  },
  {
    id: 'turns',
    title: 'Turn Structure',
    description: 'Draw 2, then discard 1',
    steps: [
      {
        title: 'Draw Phase',
        icon: '📥',
        body: 'At the start of your turn you must either (a) draw the top two cards from the stock, or (b) pick up the entire discard pile (if allowed — see the Pile lesson). You add these cards to your hand.',
      },
      {
        title: 'Meld Phase',
        icon: '🃏',
        body: 'After drawing, you may lay down melds (new groups of 3+ same-rank cards) or add cards to existing melds on the table. This step is optional — you don\'t have to meld if you don\'t want to.',
      },
      {
        title: 'Discard Phase',
        icon: '📤',
        body: 'To end your turn you must discard exactly one card face-up onto the discard pile. You may not end your turn without discarding (unless you go out by playing all your cards).',
      },
    ],
    quiz: {
      question: 'How many cards do you draw from the stock at the start of your turn?',
      options: [
        { text: '1' },
        { text: '2' },
        { text: '3' },
        { text: 'All remaining stock cards' },
      ],
      correctIndex: 1,
      explanation: 'You draw exactly 2 cards from the stock at the start of each turn (unless you pick up the pile instead).',
    },
  },
  {
    id: 'pile',
    title: 'Picking Up the Pile',
    description: 'Frozen vs. unfrozen pile rules',
    steps: [
      {
        title: 'Why Pick Up?',
        icon: '🗂️',
        body: 'The discard pile can grow large and contain valuable cards. Picking it up gives you many cards at once — but you must meet certain requirements to do so.',
      },
      {
        title: 'Unfrozen Pile',
        icon: '🟢',
        body: 'The pile is unfrozen when the top card is a natural card and your team has already laid down at least one meld. To pick it up you must be able to immediately use the top card in a meld (either as a new meld or added to an existing one).',
      },
      {
        title: 'Frozen Pile',
        icon: '🧊',
        body: 'The pile is frozen when it contains a wild card, or when your team has not yet made its initial meld. To pick up a frozen pile you must hold two natural cards in your hand that match the top card, allowing you to form a new natural meld of three cards.',
      },
      {
        title: 'Picking Up a Frozen Pile',
        icon: '🔒',
        body: 'When you pick up a frozen pile you must immediately meld the top card with two matching natural cards from your hand. You then add all remaining pile cards to your hand. The pile is NOT frozen simply because it\'s large.',
      },
    ],
    quiz: {
      question: 'What makes the discard pile "frozen"?',
      options: [
        { text: 'The pile has more than 10 cards' },
        { text: 'The pile contains a wild card OR your team has not yet made its initial meld' },
        { text: 'The top card is a red 3' },
        { text: 'It is the first round of the game' },
      ],
      correctIndex: 1,
      explanation: 'The pile is frozen when it contains a wild card OR when your team has not yet completed its initial meld. A large pile is not automatically frozen.',
    },
  },
  {
    id: 'melds',
    title: 'Forming Melds',
    description: 'Natural, mixed, and wild-card melds',
    steps: [
      {
        title: 'What is a Meld?',
        icon: '🃏',
        body: 'A meld is a set of three or more cards of the same rank placed face-up on the table. Once melded, cards remain on the table for the rest of the round and contribute to your score.',
      },
      {
        title: 'Natural Melds',
        icon: '🟩',
        body: 'A natural (clean) meld contains only cards of one rank — no wild cards. A canasta made of only natural cards becomes a natural canasta (red flag marker), worth 500 bonus points.',
      },
      {
        title: 'Mixed Melds',
        icon: '🟨',
        body: 'A mixed meld contains at least one wild card (joker or 2) alongside natural cards. The wild cards can never outnumber the natural cards: e.g., 4 natural cards can include up to 3 wild cards.',
      },
      {
        title: 'Wild-Card Limit',
        icon: '⚖️',
        body: 'Within any single meld, wild cards must always be fewer than natural cards. So a 3-card meld can have at most 2 natural + 1 wild; a 4-card meld at most 3 natural + 1 wild. You can never have equal or more wilds than naturals.',
      },
      {
        title: 'Adding to Melds',
        icon: '➕',
        body: 'On any turn after your initial meld, you may add cards to any of your existing melds. You cannot add to opponent melds. Adding more cards to a meld can turn it into a canasta (7+ cards).',
      },
    ],
    quiz: {
      question: 'You have a meld with 2 natural cards. What is the maximum number of wild cards you can add?',
      options: [
        { text: '0 — no wild cards allowed' },
        { text: '1' },
        { text: '2' },
        { text: '3' },
      ],
      correctIndex: 1,
      explanation: 'Wild cards must always be fewer than natural cards. With 2 natural cards, you can have at most 1 wild card.',
    },
  },
  {
    id: 'canasta',
    title: 'Completing a Canasta',
    description: '7+ cards — natural (500 pts) vs. mixed (300 pts)',
    steps: [
      {
        title: 'What is a Canasta?',
        icon: '⭐',
        body: 'A canasta is a completed meld of seven or more cards of the same rank. Completing a canasta is the central goal of the game — you must have at least one canasta before you are allowed to go out.',
      },
      {
        title: 'Natural Canasta',
        icon: '🔴',
        body: 'If all seven (or more) cards in a canasta are natural (no wild cards), it is a natural canasta. It earns a bonus of 500 points. It is traditionally marked with a red card on top.',
      },
      {
        title: 'Mixed Canasta',
        icon: '⚫',
        body: 'If a canasta contains one or more wild cards, it is a mixed canasta. It earns a bonus of 300 points. It is traditionally marked with a black card on top.',
      },
      {
        title: 'Going Out Requirement',
        icon: '🚪',
        body: 'You must complete at least one canasta before you can go out (empty your hand). Without a canasta, you cannot end the round regardless of how many cards you have played.',
      },
    ],
    quiz: {
      question: 'How many bonus points does a natural canasta (no wild cards) earn?',
      options: [
        { text: '100' },
        { text: '300' },
        { text: '500' },
        { text: '1000' },
      ],
      correctIndex: 2,
      explanation: 'A natural canasta earns 500 bonus points. A mixed canasta earns 300 bonus points.',
    },
  },
  {
    id: 'special',
    title: 'Special Cards',
    description: 'Jokers, 2s, red 3s, black 3s',
    steps: [
      {
        title: 'Jokers (Wild)',
        icon: '🃏',
        body: 'The four jokers are the most powerful wild cards. Each joker is worth 50 points when melded. They can represent any rank in a meld but cannot outnumber natural cards.',
      },
      {
        title: '2s (Wild)',
        icon: '2️⃣',
        body: 'All four 2s (deuces) are wild cards, each worth 20 points. Like jokers, they can stand in for any rank in a meld. Combined with jokers, they give you 8 wild cards per deck.',
      },
      {
        title: 'Red 3s (Bonus)',
        icon: '🔴',
        body: 'Red 3s (♥3 and ♦3) are not melded normally. They are placed face-up immediately when drawn and are worth 100 points each. Holding all four red 3s doubles their combined value from 400 to 800 points (200 each). However, if you haven\'t melded anything when the round ends, red 3s count AGAINST you instead.',
      },
      {
        title: 'Black 3s (Block)',
        icon: '⚫',
        body: 'Black 3s (♠3 and ♣3) cannot be melded during play. They can only be discarded. When you discard a black 3, it freezes the pile for one turn so your opponent cannot pick it up. Black 3s held in hand at round end count as −5 points each.',
      },
    ],
    quiz: {
      question: 'What happens to red 3s when a player has not melded anything by end of round?',
      options: [
        { text: 'They are worth double (200 pts each)' },
        { text: 'They are worth 100 pts each as usual' },
        { text: 'They count as −100 pts each (penalty)' },
        { text: 'They are removed from scoring' },
      ],
      correctIndex: 2,
      explanation: 'If you have not melded anything when the round ends, red 3s count against you (−100 pts each) instead of adding to your score.',
    },
  },
  {
    id: 'initial-meld',
    title: 'Initial Meld Requirement',
    description: 'Minimum points by score bracket',
    steps: [
      {
        title: 'What is the Initial Meld?',
        icon: '🎯',
        body: 'The first time your team lays down melds in a round, the total point value of those melds must meet a minimum threshold. This is the initial meld requirement. Until you meet it, you cannot meld and the pile is frozen for you.',
      },
      {
        title: 'Score Brackets',
        icon: '📊',
        body: 'The minimum varies with your current score:\n• Score below 0: 15 points\n• Score 0–1,499: 50 points\n• Score 1,500–2,999: 90 points\n• Score 3,000+: 120 points\n\nAs you get closer to winning, you need a stronger opening meld.',
      },
      {
        title: 'Counting the Points',
        icon: '🧮',
        body: 'Only the face value of the cards in your initial meld counts toward the threshold — canasta bonuses do NOT count. Wild cards count at their face value (joker=50, 2=20). Red 3s are not melds and don\'t count here.',
      },
      {
        title: 'Why It Matters',
        icon: '💡',
        body: 'The initial meld requirement forces you to invest real cards to open, preventing players from making a tiny first meld just to unfreeze the pile. It also means high-scorers need a strong hand to open at all.',
      },
    ],
    quiz: {
      question: 'Your current score is 1,800. What is the minimum point value required for your initial meld?',
      options: [
        { text: '50' },
        { text: '90' },
        { text: '120' },
        { text: '150' },
      ],
      correctIndex: 1,
      explanation: 'With a score of 1,500–2,999 the minimum initial meld requirement is 90 points.',
    },
  },
  {
    id: 'going-out',
    title: 'Going Out',
    description: 'Conditions and bonuses (+100 or +200)',
    steps: [
      {
        title: 'Going Out',
        icon: '🚪',
        body: 'You go out by playing all the cards from your hand — either by melding them or discarding the last one. Going out ends the round immediately. Both players (or all players) then tally their scores for that round.',
      },
      {
        title: 'Requirements',
        icon: '✅',
        body: 'To go out you must:\n1. Have completed at least one canasta.\n2. Either meld all remaining cards, or meld all but one and discard the last.\n\nIf you cannot meet both conditions, you must keep playing.',
      },
      {
        title: 'Standard Going Out (+100)',
        icon: '💯',
        body: 'When you go out normally (some cards were previously melded in earlier turns of the same round), you earn a +100 point bonus on top of your other scores for the round.',
      },
      {
        title: 'Concealed Going Out (+200)',
        icon: '🎩',
        body: 'A concealed going out means you meld ALL your cards in a single turn without having melded anything before. This earns a +200 point bonus instead of +100. You must still have a canasta among the cards you play that turn.',
      },
      {
        title: 'Asking "May I go out?"',
        icon: '🤔',
        body: 'Before going out you may ask your partner (in team play) "May I go out?" Your partner must answer honestly (yes or no), and you are then bound by that answer for the current turn.',
      },
    ],
    quiz: {
      question: 'What bonus do you earn for a concealed going out (melding everything in one turn for the first time)?',
      options: [
        { text: '+50' },
        { text: '+100' },
        { text: '+200' },
        { text: '+500' },
      ],
      correctIndex: 2,
      explanation: 'A concealed going out earns +200 points. A standard going out earns +100 points.',
    },
  },
  {
    id: 'scoring',
    title: 'Scoring',
    description: 'Card values, canasta bonuses, red-3 bonuses/penalties',
    steps: [
      {
        title: 'Card Face Values',
        icon: '🔢',
        body: 'Each melded card is worth its face value:\n• Joker: 50 pts\n• Ace or 2: 20 pts\n• King through 8: 10 pts\n• 7 through 4: 5 pts\n• Black 3: 5 pts (but only held in hand — a penalty)\n\nCards remaining in hand at round end subtract from your score.',
      },
      {
        title: 'Canasta Bonuses',
        icon: '⭐',
        body: 'Completing a canasta earns a bonus:\n• Natural canasta (no wilds): +500 pts\n• Mixed canasta (has wilds): +300 pts\n\nThese bonuses are added once at the end of the round for each completed canasta.',
      },
      {
        title: 'Red-3 Bonuses',
        icon: '🔴',
        body: 'Red 3s you placed on the table during the round are worth +100 pts each, IF your team has made at least one meld. Holding all four red 3s doubles the total to 800 pts. If your team made no melds, each red 3 is −100 pts.',
      },
      {
        title: 'Going Out Bonuses',
        icon: '🚪',
        body: 'The player who goes out earns a bonus:\n• Normal going out: +100 pts\n• Concealed going out: +200 pts',
      },
      {
        title: 'Round Score Calculation',
        icon: '🧮',
        body: 'Round score = (face value of melded cards) + (canasta bonuses) + (red-3 bonuses) + (going-out bonus) − (face value of cards remaining in hand).\n\nThis is added to your cumulative score. The first player or team to reach 5,000 wins.',
      },
    ],
    quiz: {
      question: 'You meld an ace at the end of a round. How many points is it worth?',
      options: [
        { text: '5' },
        { text: '10' },
        { text: '15' },
        { text: '20' },
      ],
      correctIndex: 3,
      explanation: 'Aces are worth 20 points each (same as 2s). Kings through 8s are 10 pts; 7s through 4s are 5 pts.',
    },
  },
  {
    id: 'end-of-round',
    title: 'End of Round',
    description: 'Going out, stock depletion, and what triggers scoring',
    steps: [
      {
        title: 'Two Ways a Round Ends',
        icon: '🏁',
        body: 'A round can end in exactly two ways:\n1. A player goes out (empties their hand after meeting all requirements).\n2. The stock pile runs out and no player can legally draw.\n\nIn both cases, play stops immediately and all players score what they have on the table.',
      },
      {
        title: 'Stock Pile Exhaustion',
        icon: '📭',
        body: 'When the stock pile is empty, the current player may choose to pick up the discard pile if they legally can. If they cannot (or choose not to), the round ends right there. No further turns are taken.',
      },
      {
        title: 'Unfinished Melds Still Count',
        icon: '🃏',
        body: 'At round end, every card your team has melded on the table scores its face value — even incomplete melds (fewer than 7 cards). Only completed canastas earn the 300 or 500-point bonus. Cards still in hand are subtracted.',
      },
      {
        title: 'Cards Left in Hand',
        icon: '✋',
        body: 'Each card still in your hand at round end is a penalty equal to its face value. Jokers (50 pts each) and Aces (20 pts each) are the costliest to be caught holding. Try to meld or discard high-value cards before the round ends unexpectedly.',
      },
      {
        title: 'Winning the Game',
        icon: '🏆',
        body: 'The game ends after any round in which a team\'s cumulative score reaches or exceeds 5,000 points. The team with the highest score at that point wins. If both teams cross 5,000 in the same round, the higher score wins.',
      },
    ],
    quiz: {
      question: 'The stock pile runs out on your turn and you cannot pick up the discard pile. What happens?',
      options: [
        { text: 'Play continues — you just skip drawing this turn' },
        { text: 'The round ends immediately and all players score their melds' },
        { text: 'Wild cards in the discard pile are reshuffled into a new stock' },
        { text: 'You must pick up the discard pile regardless of your hand' },
      ],
      correctIndex: 1,
      explanation: 'When the stock is empty and the current player cannot (or does not) draw from the discard pile, the round ends immediately. All players then score their melded cards and subtract cards remaining in hand.',
    },
  },
  {
    id: 'partnership',
    title: 'Partnership Rules',
    description: 'Team play, communication, and shared melds',
    steps: [
      {
        title: 'Teams of Two',
        icon: '👥',
        body: 'In the classic 4-player game, players sit opposite their partner and form a 2-person team. Both partners share the same melds — cards melded by either partner go to the same table area and both players can add to them.',
      },
      {
        title: 'Shared Melds and Canastas',
        icon: '🤝',
        body: 'Either partner can add cards to any of the team\'s melds. A canasta completed by either partner counts for the entire team. The team only needs one canasta between them to satisfy the going-out requirement.',
      },
      {
        title: 'Communication Rules',
        icon: '🤐',
        body: 'Partners may NOT communicate the contents of their hands or give strategy advice during play. The only permitted question is "May I go out?" — and your partner must answer truthfully with only "Yes" or "No."',
      },
      {
        title: 'Asking to Go Out',
        icon: '🤔',
        body: 'Before going out (except concealed going out), you must ask your partner "May I go out?" If they say yes, you must go out that turn. If they say no, you cannot go out that turn — but you may ask again on a future turn.',
      },
      {
        title: 'Concealed Going Out',
        icon: '🎩',
        body: 'The one exception: concealed going out (melding everything in one turn from a previously unmelded hand) does NOT require asking your partner. You earn +200 pts for going out concealed instead of the usual +100 pts.',
      },
    ],
    quiz: {
      question: 'Your partner says "No" when you ask "May I go out?" What are you bound to do?',
      options: [
        { text: 'Go out anyway — it is your legal right once you have a canasta' },
        { text: 'You cannot go out this turn; play normally and ask again next turn' },
        { text: 'Skip your entire turn as a penalty for asking' },
        { text: 'Discard without melding to show respect for your partner\'s decision' },
      ],
      correctIndex: 1,
      explanation: 'Once your partner says "No," you are bound by that answer for the current turn and cannot go out. You must take a normal turn. You are free to ask again on any future turn.',
    },
  },
  {
    id: 'strategy',
    title: 'Strategy & Tips',
    description: 'Offensive, defensive, and hand-management tactics',
    steps: [
      {
        title: 'Prioritise Wild Cards',
        icon: '🃏',
        body: 'Jokers and 2s are the most versatile cards in the game. Avoid discarding them unless you are freezing the pile defensively. Use wilds to complete melds faster or to reach a canasta when you are short on naturals.',
      },
      {
        title: 'Build Multiple Melds',
        icon: '📈',
        body: 'Starting several melds of different ranks gives you more ways to use incoming cards. Avoid putting all your eggs in one basket — if you only build one meld, a good discard by your opponent may let them freeze the pile and stall your progress.',
      },
      {
        title: 'Freeze the Pile Defensively',
        icon: '🧊',
        body: 'Discarding a wild card freezes the discard pile, making it much harder for opponents to pick it up. This is most valuable when the pile is large and your opponent is close to picking it up. Weigh the cost of losing a wild against the defensive benefit.',
      },
      {
        title: 'Safe Discards',
        icon: '🎯',
        body: 'Discard cards that are hard to meld and have low point value. Cards ranked 4–7 (worth 5 pts) are ideal throwaways. Avoid discarding ranks your opponent recently discarded — they likely don\'t want those ranks either, and you will be giving them nothing. Avoid discarding ranks you know your opponent needs.',
      },
      {
        title: 'Timing Your Going Out',
        icon: '⏰',
        body: 'Going out early with minimal melds scores a smaller round win. Staying in longer lets you build more canastas and card points — but risks your opponent going out first. Watch the stock pile size: if it is shrinking fast, complete canastas and position yourself to go out before the stock runs dry.',
      },
    ],
    quiz: {
      question: 'Which discard is generally safest when you have no information about your opponent\'s hand?',
      options: [
        { text: 'A joker — get rid of it before it costs you 50 pts in hand' },
        { text: 'An ace — high-value cards are risky to hold' },
        { text: 'A low-ranked natural card (e.g., a 4 or 5) with low point value' },
        { text: 'A wild 2 — wilds are common so you will draw another soon' },
      ],
      correctIndex: 2,
      explanation: 'Low-ranked natural cards (4s, 5s, 6s, 7s) are worth only 5 pts and are rarely what opponents need for melds. Discarding them gives opponents little benefit if they pick up the pile. Wild cards (jokers, 2s) and aces should generally be kept — they are far too valuable to throw away casually.',
    },
  },
]

/** Look up a lesson by its ID string. Returns undefined if not found. */
export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id)
}
