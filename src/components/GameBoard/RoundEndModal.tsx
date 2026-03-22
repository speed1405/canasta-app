import type { RoundEndData } from '../../store/gameStore'

interface Props {
  data: RoundEndData
  onAcknowledge: () => void
}

export function RoundEndModal({ data, onAcknowledge }: Props) {
  const buttonLabel = data.matchOver ? 'New Game' : 'Next Round →'
  const isPartnership = !!data.teamScores

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-5 text-center ${data.matchOver ? 'bg-gradient-to-r from-amber-700 to-yellow-600' : 'bg-gradient-to-r from-green-800 to-green-700'}`}>
          <div className="text-3xl mb-1" aria-hidden="true">{data.matchOver ? '🏆' : '✅'}</div>
          <h2 className="text-2xl font-bold text-white">
            {data.matchOver ? 'Game Over!' : `Round ${data.roundNumber} Complete`}
          </h2>
          {data.winner && (
            <p className={`mt-1 text-base font-semibold ${data.matchOver ? 'text-yellow-100' : 'text-green-100'}`}>
              Winner: {data.winner}
            </p>
          )}
        </div>

        {/* Score table */}
        <div className="px-6 py-4">
          {isPartnership ? (
            /* Partnership: team score table */
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 text-left font-semibold text-slate-500 text-xs uppercase tracking-wide">Team</th>
                  <th className="py-2 text-right font-semibold text-slate-500 text-xs uppercase tracking-wide">Round</th>
                  <th className="py-2 text-right font-semibold text-slate-500 text-xs uppercase tracking-wide">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.teamScores!.map(t => (
                  <tr key={t.teamIndex} className="border-b border-slate-100 last:border-0">
                    <td className="py-3">
                      <div className="font-semibold text-slate-800">{t.teamName}</div>
                      <div className="text-xs text-slate-400">{t.playerNames.join(' & ')}</div>
                    </td>
                    <td
                      className={`py-3 text-right font-semibold tabular-nums ${
                        t.roundScore >= 0 ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {t.roundScore >= 0 ? '+' : ''}
                      {t.roundScore}
                    </td>
                    <td className="py-3 text-right font-bold tabular-nums text-slate-800">
                      {t.totalScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* Individual score table */
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 text-left font-semibold text-slate-500 text-xs uppercase tracking-wide">Player</th>
                  <th className="py-2 text-right font-semibold text-slate-500 text-xs uppercase tracking-wide">
                    Round
                  </th>
                  <th className="py-2 text-right font-semibold text-slate-500 text-xs uppercase tracking-wide">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.scores.map(s => (
                  <tr key={s.playerId} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 font-medium text-slate-800">{s.name}</td>
                    <td
                      className={`py-3 text-right font-semibold tabular-nums ${
                        s.roundScore >= 0 ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {s.roundScore >= 0 ? '+' : ''}
                      {s.roundScore}
                    </td>
                    <td className="py-3 text-right font-bold tabular-nums text-slate-800">
                      {s.totalScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!data.matchOver && (
            <p className="mt-3 text-center text-xs text-slate-400">
              First to 5,000 points wins the match
            </p>
          )}
        </div>

        {/* Action */}
        <div className="px-6 pb-6">
          <button
            onClick={onAcknowledge}
            className={`w-full rounded-xl px-6 py-3 text-white font-bold text-base hover:opacity-90 active:opacity-80 transition-opacity shadow-sm ${
              data.matchOver
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500'
                : 'bg-gradient-to-r from-green-700 to-green-600'
            }`}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
