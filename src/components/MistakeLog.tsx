import type { AggregatedMistake } from '../game/scoring'

interface Props {
  mistakes: AggregatedMistake[]
}

export function MistakeLog({ mistakes }: Props) {
  if (mistakes.length === 0) {
    return <p className="mistake-empty">No mistakes recorded — nicely done.</p>
  }
  return (
    <ul className="mistake-log">
      {mistakes.map((m) => (
        <li key={`${m.antibioticId}:${m.placedFamilyId}:${m.placedGermId}`} className="mistake">
          <div className="mistake-head">
            <strong className="mistake-name">{m.antibioticName}</strong>
            {m.count > 1 && <span className="mistake-count" title="Times this mistake occurred">×{m.count}</span>}
          </div>
          <div className="mistake-detail">
            <span className="mistake-placed">You placed it at {m.placedLabel}</span>
            <span className="mistake-arrow">→</span>
            <span className="mistake-correct">Belongs at {m.correctLabel}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
