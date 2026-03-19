import type { AchievementDefinition } from './types'

/**
 * The canonical list of all achievements.
 * ≥ 30 entries covering milestones, skill, and social categories.
 */
export const ACHIEVEMENTS: AchievementDefinition[] = [
  // ── Milestones ────────────────────────────────────────────────────────────
  {
    id: 'first_win',
    title: 'First Victory',
    description: 'Win your first game.',
    icon: '🏆',
    category: 'milestone',
  },
  {
    id: 'ten_wins',
    title: 'Getting the Hang of It',
    description: 'Win 10 games.',
    icon: '🎯',
    category: 'milestone',
  },
  {
    id: 'fifty_wins',
    title: 'Seasoned Player',
    description: 'Win 50 games.',
    icon: '⭐',
    category: 'milestone',
  },
  {
    id: 'hundred_wins',
    title: 'Centurion',
    description: 'Win 100 games.',
    icon: '💯',
    category: 'milestone',
  },
  {
    id: 'first_canasta',
    title: 'Canasta!',
    description: 'Complete your first canasta (a meld of 7 cards).',
    icon: '🃏',
    category: 'milestone',
  },
  {
    id: 'first_natural_canasta',
    title: 'Pure Gold',
    description: 'Complete a natural canasta (7 natural cards, no wilds).',
    icon: '✨',
    category: 'milestone',
  },
  {
    id: 'first_go_out',
    title: 'Going Out!',
    description: 'Go out and end a round for the first time.',
    icon: '🚪',
    category: 'milestone',
  },
  {
    id: 'concealed_go_out',
    title: 'Ninja Exit',
    description: 'Go out concealed — meld and discard in one turn without having opened before.',
    icon: '🥷',
    category: 'milestone',
  },
  {
    id: 'first_pile_pickup',
    title: 'Jackpot!',
    description: 'Pick up the discard pile for the first time.',
    icon: '💰',
    category: 'milestone',
  },
  {
    id: 'score_5000',
    title: 'High Roller',
    description: 'Score 5,000 points in a single match.',
    icon: '📈',
    category: 'milestone',
  },
  {
    id: 'score_500_round',
    title: 'Power Round',
    description: 'Score 500 or more points in a single round.',
    icon: '⚡',
    category: 'milestone',
  },
  {
    id: 'play_10_games',
    title: 'Regular',
    description: 'Play 10 games (any result).',
    icon: '🎴',
    category: 'milestone',
  },
  {
    id: 'play_50_games',
    title: 'Dedicated',
    description: 'Play 50 games (any result).',
    icon: '🎲',
    category: 'milestone',
  },
  // ── Skill ─────────────────────────────────────────────────────────────────
  {
    id: 'beat_expert_ai',
    title: 'Grandmaster',
    description: 'Win a game against the Expert AI.',
    icon: '🤖',
    category: 'skill',
  },
  {
    id: 'beat_neural_ai',
    title: 'AI Slayer',
    description: 'Win a game against the Neural AI.',
    icon: '🧠',
    category: 'skill',
  },
  {
    id: 'win_without_hints',
    title: 'No Peeking',
    description: 'Win a game without using the hint button.',
    icon: '🙈',
    category: 'skill',
  },
  {
    id: 'complete_all_lessons',
    title: 'Scholar',
    description: 'Complete all Learn Mode lessons.',
    icon: '📚',
    category: 'skill',
  },
  {
    id: 'complete_all_practice',
    title: 'Drill Sergeant',
    description: 'Pass all Practice Mode drills.',
    icon: '🎯',
    category: 'skill',
  },
  {
    id: 'three_canastas_one_round',
    title: 'Canasta Hat-Trick',
    description: 'Complete 3 canastas in a single round.',
    icon: '🎩',
    category: 'skill',
  },
  {
    id: 'large_pile_pickup',
    title: 'Hoarder',
    description: 'Pick up a discard pile of 10 or more cards.',
    icon: '📦',
    category: 'skill',
  },
  {
    id: 'win_comeback',
    title: 'Phoenix',
    description: 'Win a match after trailing by 1,000 or more points.',
    icon: '🔥',
    category: 'skill',
  },
  {
    id: 'three_naturals',
    title: 'Purist',
    description: 'Complete 3 natural canastas in a single match.',
    icon: '💎',
    category: 'skill',
  },
  {
    id: 'win_no_wilds_melded',
    title: 'Wild-Free',
    description: 'Win a game without including any wild card in your melds.',
    icon: '🌿',
    category: 'skill',
  },
  {
    id: 'daily_challenge_complete',
    title: 'Daily Grind',
    description: 'Complete a Daily Challenge.',
    icon: '📅',
    category: 'skill',
  },
  {
    id: 'weekly_challenge_complete',
    title: 'Week Warrior',
    description: 'Complete a Weekly Challenge.',
    icon: '🗓️',
    category: 'skill',
  },
  {
    id: 'win_3p_game',
    title: 'Three\'s Company',
    description: 'Win a 3-player game.',
    icon: '3️⃣',
    category: 'skill',
  },
  {
    id: 'win_partnership_game',
    title: 'Team Player',
    description: 'Win a 4-player Partnership game.',
    icon: '🤝',
    category: 'skill',
  },
  // ── Social ────────────────────────────────────────────────────────────────
  {
    id: 'first_friend',
    title: 'Making Friends',
    description: 'Add your first friend.',
    icon: '👫',
    category: 'social',
  },
  {
    id: 'three_friends',
    title: 'Social Butterfly',
    description: 'Have 3 different friends.',
    icon: '🦋',
    category: 'social',
  },
  {
    id: 'play_with_friend',
    title: 'Friendly Match',
    description: 'Play an online game with a friend.',
    icon: '🌐',
    category: 'social',
  },
  {
    id: 'play_with_three_friends',
    title: 'Party Time',
    description: 'Play an online game with 3 different friends.',
    icon: '🎉',
    category: 'social',
  },
  {
    id: 'win_tournament',
    title: 'Champion',
    description: 'Win a tournament.',
    icon: '🥇',
    category: 'social',
  },
  {
    id: 'share_replay',
    title: 'The Director',
    description: 'Share a game replay with friends.',
    icon: '🎬',
    category: 'social',
  },
]

/** Look up an achievement definition by ID. */
export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}
