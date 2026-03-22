/** Scenario drills for Practice Mode. */

export interface ScenarioOption {
  text: string
}

export interface Scenario {
  id: string
  title: string
  description: string
  icon: string
  instructions: string
  question: string
  options: ScenarioOption[]
  correctIndex: number
  explanation: string
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'initial-meld',
    title: 'Form an initial meld',
    description: 'Meet the minimum point requirement',
    icon: '🃏',
    instructions:
      'Your team has 0 points so far, so you need at least 50 points worth of cards in your first meld(s) to put them on the table. You have the following cards in your hand: A♠ A♦ A♣ K♠ K♦ Q♠ Q♦ Q♣ J♠ 10♠ 9♠ 8♠ 7♠ 6♠ 2♥ (wild).\n\nAces are worth 20 pts each; Kings and Queens are worth 10 pts each.',
    question:
      'Which combination of cards gives you a valid initial meld that meets the 50-point minimum?',
    options: [
      { text: 'Three Aces (A♠ A♦ A♣) = 60 pts' },
      { text: 'Three Queens (Q♠ Q♦ Q♣) = 30 pts' },
      { text: 'Two Kings + one wild (K♠ K♦ 2♥) = 30 pts' },
      { text: 'Three Jacks = 30 pts' },
    ],
    correctIndex: 0,
    explanation:
      'Three Aces = 3 × 20 = 60 points, which exceeds the 50-point minimum. Three Queens or two Kings + wild only total 30 pts — not enough to open.',
  },
  {
    id: 'frozen-pile',
    title: 'Frozen pile pickup',
    description: 'Which card lets you pick up the frozen pile?',
    icon: '🧊',
    instructions:
      'The discard pile is frozen (a wild card was discarded into it earlier, so it has a red back facing up). The top card of the pile is a 7♥. You may only pick up a frozen pile if you hold two natural cards of the same rank as the top card and use them to form a new meld.',
    question: 'Which of these hands lets you legally pick up the frozen pile?',
    options: [
      { text: '7♠ and 2♣ (wild) — a natural 7 and a wild' },
      { text: '7♦ and 7♣ — two natural 7s' },
      { text: '7♠ and 8♠ — a 7 and an 8' },
      { text: 'No card in your hand matches — you cannot pick it up' },
    ],
    correctIndex: 1,
    explanation:
      'To pick up a frozen pile you need two natural (non-wild) cards matching the top card. Two natural 7s qualify. A wild card plus one natural 7 is not allowed when the pile is frozen.',
  },
  {
    id: 'go-out',
    title: 'Should you go out?',
    description: 'You have 2 canastas — decide wisely',
    icon: '🚪',
    instructions:
      'Your team has two complete canastas on the table. You have 3 cards left in your hand. Your partner has not been asked whether you may go out.\n\nRemember: you must ask your partner "May I go out?" before going out (unless going out concealed). Your partner can say yes or no.',
    question: 'What is the correct procedure before going out?',
    options: [
      { text: 'Just go out — you already have 2 canastas so no permission is needed' },
      { text: 'Ask your partner "May I go out?" and only go out if they say yes' },
      { text: 'You cannot go out until you have 3 or more canastas' },
      { text: 'Discard your last card without melding — that counts as going out' },
    ],
    correctIndex: 1,
    explanation:
      'You must ask your partner "May I go out?" before going out (unless going out concealed). They can say yes or no. Two canastas is the minimum requirement, but partner consent is still required.',
  },
  {
    id: 'score-hand',
    title: 'Score this hand',
    description: 'Identify the correct score for a completed round',
    icon: '🧮',
    instructions:
      'Your team ended a round with:\n• 1 natural canasta (500 pts)\n• 1 mixed canasta (300 pts)\n• Card points in melds: 340 pts\n• Red 3 bonus: 2 red 3s × 100 pts each = 200 pts\n• Going-out bonus: 100 pts\n• The opposing team has cards still in hand: −150 pts penalty for them (not you)',
    question: 'What is your team\'s score for this round?',
    options: [
      { text: '1,290 pts' },
      { text: '1,440 pts' },
      { text: '1,540 pts' },
      { text: '1,640 pts' },
    ],
    correctIndex: 1,
    explanation:
      '500 (natural canasta) + 300 (mixed canasta) + 340 (card points) + 200 (red 3s) + 100 (going out) = 1,440 pts. The opposing team\'s penalty is subtracted from their score, not added to yours.',
  },
  {
    id: 'red3-drawn',
    title: 'You drew a red 3',
    description: 'What do you do next?',
    icon: '🔴',
    instructions:
      'You just drew a card from the stock pile and it is a red 3 (3♥). Red 3s are bonus cards and cannot be held in the hand or used in melds.',
    question: 'What must you do immediately after drawing the red 3?',
    options: [
      { text: 'Keep it in your hand and use it as a wild card' },
      { text: 'Place it face-up on the table and draw a replacement card from the stock' },
      { text: 'Discard it face-down on the discard pile' },
      { text: 'Add it to any existing meld as a bonus card' },
    ],
    correctIndex: 1,
    explanation:
      'Red 3s are placed face-up on the table immediately and the player draws a replacement card from the stock. They cannot be kept in hand, used as wilds, or discarded.',
  },
  {
    id: 'concealed-out',
    title: 'Opponent went out concealed',
    description: 'How does scoring change?',
    icon: '🕵️',
    instructions:
      'Your opponent went out concealed — they melded all cards from their hand at once without previously having any melds on the table, and they had not asked their partner for permission.\n\nA concealed going-out earns a 200-point bonus instead of the normal 100-point going-out bonus.',
    question: 'Which statement about going out concealed is correct?',
    options: [
      { text: 'The player gets 200 pts for going out instead of 100 pts, but they still need 2 canastas' },
      { text: 'The player gets 200 pts and does not need any canastas' },
      { text: 'The player gets 100 pts and their partner gets an extra 100 pts bonus' },
      { text: 'Going out concealed is illegal in standard Canasta' },
    ],
    correctIndex: 0,
    explanation:
      'Going out concealed earns a 200-point bonus (double the normal going-out bonus). However, all normal requirements still apply: the team must have at least two canastas. The extra bonus rewards the risk of hiding all melds until going out.',
  },
  {
    id: 'freeze-pile',
    title: 'Freeze the pile',
    description: 'When should you discard a wild card?',
    icon: '🌀',
    instructions:
      'You can freeze the discard pile by discarding a wild card (joker or 2). A frozen pile can only be picked up by an opponent who holds two natural cards matching the top card.\n\nYou are ahead on points and your opponent has many cards in hand.',
    question: 'When is freezing the pile the strongest defensive move?',
    options: [
      { text: 'When you need a wild card for your own melds — discard it to get it back next turn' },
      { text: 'When the pile is already large and your opponent might pick it up for a big advantage' },
      { text: 'Freezing the pile never helps — you are just giving up a wild card' },
      { text: 'Always freeze on the first turn to start your strategy' },
    ],
    correctIndex: 1,
    explanation:
      'Freezing a large pile prevents your opponent from picking it up easily, protecting your lead. Wild cards are valuable, so you only freeze when the defensive benefit outweighs losing the wild card. Freezing on turn one wastes a precious wild card.',
  },
  {
    id: 'black3-discard',
    title: 'Black 3 discard',
    description: 'Block the pile strategically',
    icon: '⛔',
    instructions:
      'Black 3s (3♠, 3♣) are unique cards. When discarded, they temporarily block the discard pile — the next player cannot pick up the pile that turn. Black 3s cannot be melded (except when going out) and have 0 point value.',
    question: 'What is the best strategic use of a black 3?',
    options: [
      { text: 'Hold them all game to meld them for bonus points at the end' },
      { text: 'Discard a black 3 when you want to block your opponent from picking up the pile this turn' },
      { text: 'Add them to a meld to complete a canasta quickly' },
      { text: 'Use them as wild cards since they are worth 0 points' },
    ],
    correctIndex: 1,
    explanation:
      'Black 3s block the pile for one turn when discarded — useful when the pile is attractive to your opponent. They cannot form melds (except when going out concealed) and are not wild cards. Holding them too long is risky since you cannot meld them normally.',
  },
  {
    id: 'wild-card-limit',
    title: 'Wild-card limit',
    description: 'Can you add this wild to your meld?',
    icon: '🃏',
    instructions:
      'Your team has a meld of 5 cards on the table: 8♠ 8♦ 8♣ 8♥ 2♦ (wild). You want to add another wild card (Joker) to this meld to increase its value.\n\nRule: A meld may contain at most as many wild cards as natural cards. A canasta (7+ cards) with any wilds is a "mixed canasta."',
    question: 'Can you legally add the Joker to this meld?',
    options: [
      { text: 'Yes — there is no limit on wild cards in a meld' },
      { text: 'No — the meld already has one wild and adding a second would break the limit' },
      { text: 'Yes — the meld has 4 natural cards and only 1 wild, so adding a second wild is allowed' },
      { text: 'No — you can never add a joker to an existing meld' },
    ],
    correctIndex: 2,
    explanation:
      'The meld has 4 natural 8s and 1 wild (2♦). With a second wild (Joker) it would have 4 naturals and 2 wilds — the number of wilds (2) does not exceed the number of naturals (4), so it is legal. The meld would then be 6 cards total with 2 wilds.',
  },
  {
    id: 'minimum-meld-90',
    title: 'High-score initial meld',
    description: 'Score 1500+ pts — need 90 pts to open',
    icon: '💎',
    instructions:
      'Your team has accumulated 1,500+ points, so your initial meld requirement has increased to 90 points. You hold: A♠ A♦ A♣ K♠ K♦ K♣ Q♠ Q♦ Q♣ J♠ J♦ 2♠ (wild) 2♣ (wild).\n\nAces = 20 pts each, Kings/Queens/Jacks = 10 pts each. Wild cards do not count toward the meld threshold — only the natural card values are used to check the 90-point minimum.',
    question: 'Which combination of cards meets the 90-point opening requirement?',
    options: [
      { text: 'Three Kings (K♠ K♦ K♣) = 30 pts — not enough' },
      { text: 'Three Queens + three Jacks = 60 pts — not enough' },
      { text: 'Two Aces + one wild (A♠ A♦ 2♠) = 40 pts natural — not enough' },
      { text: 'Three Aces + three Kings (A♠ A♦ A♣ K♠ K♦ K♣) = 90 pts — exactly meets the requirement' },
    ],
    correctIndex: 3,
    explanation:
      'Three Aces (3 × 20 = 60 pts) plus three Kings (3 × 10 = 30 pts) totals exactly 90 pts in natural card values, meeting the 90-point threshold. Wild cards do not count toward the threshold calculation, so options using wilds to pad the count are not valid for checking the minimum.',
  },
  {
    id: 'pile-pickup-natural',
    title: 'Pick up the unfrozen pile',
    description: 'When can you take the discard pile?',
    icon: '📤',
    instructions:
      'The discard pile is NOT frozen. The top card is Q♠. To take an unfrozen pile you must be able to use the top card immediately — either adding it to one of your existing melds, or forming a new meld with it plus at least one matching natural card from your hand.',
    question: 'Which hand lets you legally pick up this unfrozen pile (top card Q♠)?',
    options: [
      { text: 'Q♥ and 2♦ (wild) — one natural Queen plus a wild' },
      { text: 'Q♦ and Q♣ — two natural Queens' },
      { text: 'K♠ and J♠ — cards of adjacent ranks' },
      { text: 'You can never pick up the pile unless it is frozen' },
    ],
    correctIndex: 1,
    explanation:
      'To pick up an unfrozen pile you need the top card plus at least one natural matching card from your hand to form or extend a meld. Two natural Queens (Q♦ + Q♣) combined with the top Q♠ create a valid 3-card natural meld. A wild card cannot substitute for the second natural card when starting a new meld from the pile.',
  },
  {
    id: 'natural-vs-mixed',
    title: 'Natural vs. mixed canasta',
    description: 'Identify the canasta type and its bonus',
    icon: '⭐',
    instructions:
      'Your team has a completed meld of exactly 7 cards on the table. The meld contains seven natural 9s drawn from the two decks in play — no wild cards have been added: 9♠ 9♦ 9♣ 9♥ 9♠ 9♦ 9♣ (two decks supply duplicates of each suit).',
    question: 'What type of canasta is this and what bonus does it earn?',
    options: [
      { text: 'Mixed canasta — 300-point bonus because it has more than 5 cards' },
      { text: 'Natural canasta — 500-point bonus because it contains no wild cards' },
      { text: 'Natural canasta — 300-point bonus (same as mixed)' },
      { text: 'It is not a canasta yet — you need at least 8 cards' },
    ],
    correctIndex: 1,
    explanation:
      'A canasta requires 7 or more cards of the same rank. A canasta with NO wild cards is a "natural canasta" worth a 500-point bonus. A canasta containing one or more wild cards is a "mixed canasta" worth 300 points. Seven natural 9s qualifies as a natural canasta.',
  },
  {
    id: 'going-out-requirement',
    title: 'Going-out canasta check',
    description: 'Do you have what you need to go out?',
    icon: '🏁',
    instructions:
      'You want to go out this turn. You have played all your cards into melds and your last discard will empty your hand. Review your team\'s table:\n• Meld A: 6 cards (all natural 8s) — NOT yet a canasta\n• Meld B: 5 cards (mixed Jacks) — NOT yet a canasta\n\nA canasta requires at least 7 cards of the same rank.',
    question: 'Can you legally go out this turn?',
    options: [
      { text: 'Yes — you just need to empty your hand to go out' },
      { text: 'Yes — two melds on the table is enough to go out' },
      { text: 'No — you need at least one completed canasta (7+ cards) to go out' },
      { text: 'No — you need at least three completed canastas to go out' },
    ],
    correctIndex: 2,
    explanation:
      'Going out requires at least one completed canasta (7+ cards of the same rank). Neither of your melds has reached 7 cards yet, so you cannot go out. You must continue building your melds before you can legally end the round.',
  },
  {
    id: 'discard-choice',
    title: 'Optimal discard selection',
    description: 'Choose the safest card to discard',
    icon: '🎯',
    instructions:
      'It is the end of your turn and you must discard one card. Your hand contains:\n• A♠ (20 pts, Aces are high-value and useful for melds)\n• 4♦ (5 pts, low value, rarely fits a meld)\n• J♣ (10 pts, medium value)\n• 2♥ (wild card — extremely versatile)\n\nYou have no melds on the table yet.',
    question: 'Which card is generally the safest to discard?',
    options: [
      { text: 'A♠ — discard the highest-value card to keep your hand light' },
      { text: '4♦ — low-value cards are safest to discard since they give opponents few points' },
      { text: '2♥ — wild cards are common so you will draw another soon' },
      { text: 'J♣ — medium-value cards are always the best discard' },
    ],
    correctIndex: 1,
    explanation:
      'Discarding a low-value card like the 4♦ (worth only 5 pts) is the safest choice. It gives your opponent the least benefit if they pick up the pile. Wild cards (2♥) are precious and should be kept. High-value Aces help meet meld minimums. Discarding low-ranked cards that are hard to meld is a fundamental Canasta strategy.',
  },
  {
    id: 'meld-start-wild',
    title: 'Starting a meld — wild card rule',
    description: 'Can you meld these cards?',
    icon: '🃏',
    instructions:
      'You want to start a brand-new meld using only wild cards. You hold two jokers and no natural cards of any matching rank.\n\nRule: A valid meld must contain at least 2 natural cards of the same rank. Wild cards can supplement a meld but cannot form one on their own.',
    question: 'Can you start a new meld using only two jokers?',
    options: [
      { text: 'Yes — two jokers count as any rank, so they form a valid 2-card meld' },
      { text: 'Yes — wild cards are always legal starters for any meld' },
      { text: 'No — a meld must contain at least 2 natural (non-wild) cards of the same rank' },
      { text: 'No — you need at least 3 jokers to start a meld with wilds' },
    ],
    correctIndex: 2,
    explanation:
      'A meld must always include at least 2 natural cards of the same rank. Wild cards (jokers and 2s) can be added to supplement a meld but cannot form a meld by themselves. You must first have 2 or more matching natural cards before adding any wilds.',
  },
  {
    id: 'joker-point-value',
    title: 'Joker card value',
    description: 'How many points is a joker worth?',
    icon: '🤡',
    instructions:
      'At the end of a round, each card remaining in a player\'s hand subtracts from their score. Each card melded to the table adds to their score. You had a joker in your hand when the round ended — it was never melded.\n\nPoint values: Joker = 50 pts, Ace/2 = 20 pts, K–8 = 10 pts, 7–4 = 5 pts.',
    question: 'How many points does the unmelded joker in your hand subtract from your round score?',
    options: [
      { text: '5 points' },
      { text: '20 points' },
      { text: '50 points' },
      { text: '100 points' },
    ],
    correctIndex: 2,
    explanation:
      'A joker is worth 50 points. Cards still in hand at round end are subtracted from your score, so an unmelded joker costs you 50 points. This is the highest per-card penalty — always try to meld or discard jokers before the round ends.',
  },
  {
    id: 'stock-depleted',
    title: 'Stock pile runs out',
    description: 'What happens when there are no more cards to draw?',
    icon: '📭',
    instructions:
      'It is your turn and the stock pile is empty. You cannot draw from the stock. The discard pile has cards, but you are not able to pick it up (you do not hold matching cards).\n\nWhen the stock is depleted and a player cannot draw, the round ends immediately.',
    question: 'What happens when the stock is exhausted and you cannot pick up the discard pile?',
    options: [
      { text: 'You skip your turn and play passes to the next player' },
      { text: 'The round ends immediately and scores are tallied' },
      { text: 'You must pick up the discard pile regardless of your hand' },
      { text: 'Wild cards are reshuffled back into a new stock' },
    ],
    correctIndex: 1,
    explanation:
      'When the stock pile is exhausted and the current player cannot (or does not) pick up the discard pile, the round ends immediately. All players then score what they have melded on the table, and cards remaining in hand are subtracted.',
  },
  {
    id: 'three-thousand-meld',
    title: 'Opening at 3,000+ points',
    description: 'What is the initial meld requirement at the top score bracket?',
    icon: '💯',
    instructions:
      'Your team has accumulated 3,200 points — you are in the highest scoring bracket. You need to make your initial meld this turn. You hold: A♠ A♦ A♣ K♠ K♦ K♣ Q♠ Q♦ Q♣ J♠ J♦ 9♠ 9♦ 2♣ (wild).\n\nInitial meld thresholds: 0–1,499 pts → 50 pts; 1,500–2,999 pts → 90 pts; 3,000+ pts → 120 pts. Only natural card face values count toward the minimum.',
    question: 'Which combination meets the 120-point minimum required to open at 3,000+ points?',
    options: [
      { text: 'Three Kings + three Queens (K♠ K♦ K♣ Q♠ Q♦ Q♣) = 60 pts — not enough' },
      { text: 'Two Aces + three Kings (A♠ A♦ K♠ K♦ K♣) = 70 pts — not enough' },
      { text: 'Three Aces + three Kings + three Queens (A♠ A♦ A♣ K♠ K♦ K♣ Q♠ Q♦ Q♣) = 120 pts — exactly meets the requirement' },
      { text: 'Three Aces + two wild cards (A♠ A♦ A♣ 2♣ Joker) = 60 pts natural — not enough' },
    ],
    correctIndex: 2,
    explanation:
      'Three Aces (3 × 20 = 60 pts) + three Kings (3 × 10 = 30 pts) + three Queens (3 × 10 = 30 pts) = exactly 120 pts in natural card values, meeting the threshold. Wild cards do not count toward the minimum, so options relying on wilds to pad the value fall short. The 120-pt bar at 3,000+ pts requires committing multiple high-value natural cards.',
  },
  {
    id: 'partner-says-no',
    title: 'Partner vetoes going out',
    description: 'Partner said "No" — what must you do?',
    icon: '🚫',
    instructions:
      'You asked your partner "May I go out?" and they said "No." You were planning to meld your remaining cards and discard your last card to end the round. Your partner has a weak hand and wants more turns to build melds.\n\nRemember: once you ask and receive an answer, you are bound by it for that turn.',
    question: 'Your partner said "No." What must you do for the rest of this turn?',
    options: [
      { text: 'Go out anyway — it is your decision once you have 2 canastas' },
      { text: 'You cannot go out this turn; take a normal turn and play on' },
      { text: 'You must skip your entire turn as a penalty for asking' },
      { text: 'You can still go out if you meld concealed (without asking again)' },
    ],
    correctIndex: 1,
    explanation:
      'Once your partner says "No," you are bound by that answer for the current turn — you cannot go out this turn. You must play normally (meld if you like, then discard). On a future turn you can ask again. Ignoring your partner\'s answer is against the rules.',
  },
  {
    id: 'all-four-red3s',
    title: 'Collecting all four red 3s',
    description: 'What bonus do you get for all four red 3s?',
    icon: '🔴',
    instructions:
      'During the round, your team placed all four red 3s face-up on the table (3♥ and 3♦ from each of the two decks). Your team also has melds on the table.\n\nNormal red 3 value: 100 pts each. Bonus: collecting all four red 3s doubles the total value.',
    question: 'What is the total bonus value of all four red 3s when your team has melded cards?',
    options: [
      { text: '400 pts (4 × 100 pts)' },
      { text: '600 pts (4 × 150 pts)' },
      { text: '800 pts (double the normal 400 pts)' },
      { text: '1,000 pts (special jackpot bonus)' },
    ],
    correctIndex: 2,
    explanation:
      'All four red 3s together are worth 800 points — double the normal total of 400 pts (4 × 100). This doubling bonus only applies when your team collects all four. If your team has not melded anything, the red 3s become penalties (−100 pts each) rather than bonuses.',
  },
  {
    id: 'add-to-opponent-meld',
    title: 'Adding to an opponent\'s meld',
    description: 'Can you extend their meld?',
    icon: '🤝',
    instructions:
      'Your opponent has a meld of four natural Kings (K♠ K♦ K♣ K♥) on the table. You hold K♠ (a duplicate from the second deck) and want to add it to their Kings meld to benefit from the extra card value.',
    question: 'Are you allowed to add your King to your opponent\'s existing meld?',
    options: [
      { text: 'Yes — any player can add matching cards to any meld on the table' },
      { text: 'Yes — but only wild cards can be added to opponent melds' },
      { text: 'No — you may only add cards to your own team\'s melds' },
      { text: 'No — melds can never have more than 4 cards of the same rank' },
    ],
    correctIndex: 2,
    explanation:
      'You may only add cards to your own team\'s melds. Opponents\' melds are off-limits. This means you cannot "dump" cards onto an opponent\'s meld to reduce your hand size, and you cannot piggyback on their canastas.',
  },
  {
    id: 'mixed-rank-meld',
    title: 'Mixed-rank meld attempt',
    description: 'Can cards of different ranks form a meld?',
    icon: '🔀',
    instructions:
      'You hold K♠ K♦ Q♣. All three are face cards (worth 10 pts each) and they share a suit pattern. You want to lay them down as a 3-card meld since they "go together" as face cards.',
    question: 'Can you form a valid meld with K♠ K♦ Q♣?',
    options: [
      { text: 'Yes — all face cards belong to the same group and can be melded together' },
      { text: 'Yes — any three cards of the same point value form a valid meld' },
      { text: 'No — a meld must contain cards of the same rank; Kings and Queens are different ranks' },
      { text: 'No — melds must contain cards of the same suit' },
    ],
    correctIndex: 2,
    explanation:
      'A meld requires cards of the same rank (e.g., three Kings or three Queens). Different ranks cannot be mixed, even if they share the same point value. Suits are irrelevant — you can have K♠ K♦ K♣ across three different suits in the same meld, but you cannot combine Kings and Queens.',
  },
]

export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id)
}
