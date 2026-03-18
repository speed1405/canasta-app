import type { RoundEndData } from '../../store/gameStore'

interface Props {
  data: RoundEndData
  onAcknowledge: () => void
}

export function RoundEndModal({ data, onAcknowledge }: Props) {
  const buttonLabel = data.matchOver ? 'New Game' : 'Next Round'
  const isPartnership = !!data.teamScores

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-green-800 px-6 py-4 text-center">
          <h2 className="text-2xl font-bold text-white">
            {data.matchOver ? '🏆 Game Over!' : `Round ${data.roundNumber} Complete`}
          </h2>
          {data.winner && (
            <p className="mt-1 text-green-200 text-lg font-semibold">
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
                  <th className="py-2 text-left font-semibold text-slate-600">Team</th>
                  <th className="py-2 text-right font-semibold text-slate-600">Round</th>
                  <th className="py-2 text-right font-semibold text-slate-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.teamScores!.map(t => (
                  <tr key={t.teamIndex} className="border-b border-slate-100 last:border-0">
                    <td className="py-3">
                      <div className="font-medium text-slate-800">{t.teamName}</div>
                      <div className="text-xs text-slate-500">{t.playerNames.join(' & ')}</div>
                    </td>
                    <td
                      className={`py-3 text-right font-semibold tabular-nums ${
                        t.roundScore >= 0 ? 'text-green-700' : 'text-red-600'
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
                  <th className="py-2 text-left font-semibold text-slate-600">Player</th>
                  <th className="py-2 text-right font-semibold text-slate-600">
                    Round Score
                  </th>
                  <th className="py-2 text-right font-semibold text-slate-600">
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
                        s.roundScore >= 0 ? 'text-green-700' : 'text-red-600'
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
            <p className="mt-3 text-center text-xs text-slate-500">
              First to 5,000 points wins the match
            </p>
          )}
        </div>

        {/* Action */}
        <div className="px-6 pb-6">
          <button
            onClick={onAcknowledge}
            className="w-full rounded-xl bg-green-700 px-6 py-3 text-white font-bold text-lg hover:bg-green-600 active:bg-green-800 transition-colors"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
