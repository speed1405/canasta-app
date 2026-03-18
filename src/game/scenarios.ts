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
]

export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id)
}
