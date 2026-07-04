import { useState } from 'react'
import { aggregateMistakes, computeGrade } from '../game/scoring'
import { clearHistory, loadHistory } from '../game/persistence'
import type { GameRecord } from '../game/types'
import { MistakeLog } from './MistakeLog'

function formatDate(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function GameCard({ record, index }: { record: GameRecord; index: number }) {
  const [open, setOpen] = useState(false)
  const grade = computeGrade(record.stats)
  const showGrade = grade >= 60 && record.stats.attempted > 0
  const mistakes = aggregateMistakes(record.mistakes) // per-game counts

  return (
    <li className="history-card">
      <div className="history-head">
        <div className="history-when">
          <span className="history-index">#{index}</span>
          <span className="history-date">{formatDate(record.at)}</span>
        </div>
        {showGrade && <span className="history-grade">{grade}%</span>}
      </div>

      <div className="history-stats">
        <span>
          <strong>{record.stats.correct}</strong> correct
        </span>
        <span>
          <strong>{record.stats.attempted}</strong> attempted
        </span>
        <span>
          <strong>{record.stats.skippedRounds}</strong> skipped
        </span>
        <span>
          <strong>{record.remaining}</strong> not reached
        </span>
      </div>

      {mistakes.length > 0 && (
        <>
          <button className="btn btn--ghost btn--sm" onClick={() => setOpen((v) => !v)}>
            {open ? 'Hide mistakes' : `Mistakes (${mistakes.length})`}
          </button>
          {open && (
            <div className="history-mistakes">
              <MistakeLog mistakes={mistakes} />
            </div>
          )}
        </>
      )}
    </li>
  )
}

/** History list embedded on the home screen. Renders nothing when empty. */
export function HistoryList() {
  const [history, setHistory] = useState<GameRecord[]>(() => loadHistory())

  if (history.length === 0) return null

  function handleClear() {
    clearHistory()
    setHistory([])
  }

  return (
    <section className="home-history">
      <div className="home-history-head">
        <h2 className="home-history-title">Recent games</h2>
        <button className="btn btn--ghost btn--sm" onClick={handleClear}>
          Clear history
        </button>
      </div>
      <ul className="history-list">
        {history.map((record, i) => (
          <GameCard key={record.at} record={record} index={history.length - i} />
        ))}
      </ul>
    </section>
  )
}
