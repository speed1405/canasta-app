import { useState } from 'react'
import { PageLayout } from '../components/PageLayout'
import { CARD_POINT_VALUES } from '../game/scoring'
import { minimumMeldPoints } from '../game/types'

const SECTIONS = [
  {
    id: 'meld-minimums',
    title: 'Initial Meld Requirements',
    content: (
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-700">
            <th className="text-left p-2 font-semibold border border-slate-200 dark:border-slate-600">Running score</th>
            <th className="text-right p-2 font-semibold border border-slate-200 dark:border-slate-600">Min. meld pts</th>
          </tr>
        </thead>
        <tbody>
          {[
            { score: -100, label: 'Below 0' },
            { score: 0, label: '0 – 1,499' },
            { score: 1500, label: '1,500 – 2,999' },
            { score: 3000, label: '3,000+' },
          ].map(({ score, label }) => (
            <tr key={score} className="even:bg-slate-50 dark:even:bg-slate-800">
              <td className="p-2 border border-slate-200 dark:border-slate-600">{label}</td>
              <td className="p-2 border border-slate-200 dark:border-slate-600 text-right font-mono">
                {minimumMeldPoints(score)} pts
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
  },
  {
    id: 'card-values',
    title: 'Card Point Values',
    content: (
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-700">
            <th className="text-left p-2 font-semibold border border-slate-200 dark:border-slate-600">Card</th>
            <th className="text-right p-2 font-semibold border border-slate-200 dark:border-slate-600">Points</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(CARD_POINT_VALUES).map(([rank, pts]) => (
            <tr key={rank} className="even:bg-slate-50 dark:even:bg-slate-800">
              <td className="p-2 border border-slate-200 dark:border-slate-600">{rank}</td>
              <td className="p-2 border border-slate-200 dark:border-slate-600 text-right font-mono">{pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
  },
  {
    id: 'canasta-values',
    title: 'Canasta Bonuses',
    content: (
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-700">
            <th className="text-left p-2 font-semibold border border-slate-200 dark:border-slate-600">Type</th>
            <th className="text-right p-2 font-semibold border border-slate-200 dark:border-slate-600">Bonus</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border border-slate-200 dark:border-slate-600">Natural canasta (no wilds)</td>
            <td className="p-2 border border-slate-200 dark:border-slate-600 text-right font-mono text-green-600 font-bold">500</td>
          </tr>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <td className="p-2 border border-slate-200 dark:border-slate-600">Mixed canasta (has wilds)</td>
            <td className="p-2 border border-slate-200 dark:border-slate-600 text-right font-mono text-green-600 font-bold">300</td>
          </tr>
        </tbody>
      </table>
    ),
  },
  {
    id: 'bonuses-penalties',
    title: 'End-of-Round Bonuses & Penalties',
    content: (
      <ul className="text-sm space-y-2">
        <li className="flex justify-between"><span>Going out</span><span className="font-mono font-bold text-green-600">+100</span></li>
        <li className="flex justify-between"><span>Going out concealed</span><span className="font-mono font-bold text-green-600">+200</span></li>
        <li className="flex justify-between"><span>Red 3 (per card, if melds opened)</span><span className="font-mono font-bold text-green-600">+100</span></li>
        <li className="flex justify-between"><span>All four red 3s (if melds opened)</span><span className="font-mono font-bold text-green-600">+800</span></li>
        <li className="flex justify-between"><span>Red 3 (per card, if no melds opened)</span><span className="font-mono font-bold text-red-600">−100</span></li>
        <li className="flex justify-between"><span>Black 3 left in hand</span><span className="font-mono font-bold text-red-600">−5</span></li>
        <li className="flex justify-between"><span>Cards left in hand</span><span className="font-mono font-bold text-red-600">−face value</span></li>
      </ul>
    ),
  },
  {
    id: 'going-out',
    title: 'Going-Out Conditions',
    content: (
      <ul className="text-sm space-y-2">
        <li>✅ You must have at least <strong>one completed canasta</strong> (7+ cards, same rank).</li>
        <li>✅ You can legally meld <em>and/or</em> discard your last card in one turn.</li>
        <li>⭐ <strong>Concealed go-out:</strong> meld your entire hand at once without having previously melded (+200 instead of +100).</li>
      </ul>
    ),
  },
  {
    id: 'variants',
    title: 'Variant Specifics',
    content: (
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-700">
            <th className="text-left p-2 font-semibold border border-slate-200 dark:border-slate-600">Rule</th>
            <th className="text-center p-2 font-semibold border border-slate-200 dark:border-slate-600">2-Player</th>
            <th className="text-center p-2 font-semibold border border-slate-200 dark:border-slate-600">3-Player</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border border-slate-200 dark:border-slate-600">Cards dealt</td>
            <td className="p-2 border border-slate-200 dark:border-slate-600 text-center">15</td>
            <td className="p-2 border border-slate-200 dark:border-slate-600 text-center">13</td>
          </tr>
          <tr className="bg-slate-50 dark:bg-slate-800">
            <td className="p-2 border border-slate-200 dark:border-slate-600">Cards drawn per turn</td>
            <td className="p-2 border border-slate-200 dark:border-slate-600 text-center">2</td>
            <td className="p-2 border border-slate-200 dark:border-slate-600 text-center">2</td>
          </tr>
          <tr>
            <td className="p-2 border border-slate-200 dark:border-slate-600">Target score</td>
            <td className="p-2 border border-slate-200 dark:border-slate-600 text-center">5,000</td>
            <td className="p-2 border border-slate-200 dark:border-slate-600 text-center">5,000</td>
          </tr>
        </tbody>
      </table>
    ),
  },
]

export function Reference() {
  const [search, setSearch] = useState('')
  const query = search.toLowerCase()

  const filtered = SECTIONS.filter(
    (s) =>
      !query ||
      s.title.toLowerCase().includes(query) ||
      s.id.toLowerCase().includes(query),
  )

  return (
    <PageLayout title="Reference">
      {/* Search */}
      <div className="mb-6">
        <input
          type="search"
          placeholder="Search rules…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search rules"
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-slate-500 text-center py-8">No results for "{search}"</p>
      )}

      <div className="space-y-6">
        {filtered.map((section) => (
          <section key={section.id} aria-labelledby={`ref-${section.id}`}>
            <h2
              id={`ref-${section.id}`}
              className="text-lg font-bold mb-3 text-slate-900 dark:text-white"
            >
              {section.title}
            </h2>
            <div className="text-slate-700 dark:text-slate-300">
              {section.content}
            </div>
          </section>
        ))}
      </div>
    </PageLayout>
  )
}
