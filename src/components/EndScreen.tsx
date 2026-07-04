import { useState } from 'react'
import { computeGrade, type AggregatedMistake } from '../game/scoring'
import type { Stats } from '../game/types'
import { MistakeLog } from './MistakeLog'

interface Props {
  stats: Stats
  remaining: number
  mistakes: AggregatedMistake[]
  onHome: () => void
}

export function EndScreen({ stats, remaining, mistakes, onHome }: Props) {
  const [showDetails, setShowDetails] = useState(false)
  const grade = computeGrade(stats)
  const showGrade = grade >= 60 && stats.attempted > 0

  return (
    <div className="endscreen">
      <div className="end-card">
        <h1 className="end-title">Session complete</h1>

        {showGrade ? (
          <div className="end-grade">
            <span className="end-grade-num">{grade}%</span>
            <span className="end-grade-label">of your placements were correct</span>
          </div>
        ) : (
          <p className="end-nograde">
            Here's how this session broke down — keep going and it will climb.
          </p>
        )}

        <div className="end-stats">
          <div className="stat">
            <span className="stat-num">{stats.correct}</span>
            <span className="stat-label">correct</span>
          </div>
          <div className="stat">
            <span className="stat-num">{stats.attempted}</span>
            <span className="stat-label">attempted</span>
          </div>
          <div className="stat">
            <span className="stat-num">{stats.skippedRounds}</span>
            <span className="stat-label">skipped</span>
          </div>
          <div className="stat">
            <span className="stat-num">{remaining}</span>
            <span className="stat-label">not reached</span>
          </div>
        </div>

        <div className="end-actions">
          <button className="btn btn--ghost" onClick={() => setShowDetails((v) => !v)}>
            {showDetails ? 'Hide details' : 'More details'}
          </button>
          <button className="btn btn--primary" onClick={onHome}>
            Play again
          </button>
        </div>

        {showDetails && (
          <div className="end-details">
            <h2 className="end-details-title">Mistakes</h2>
            <p className="end-details-hint">
              Repeated confusions are counted (across sessions too) so you can spot patterns.
            </p>
            <MistakeLog mistakes={mistakes} />
          </div>
        )}
      </div>
    </div>
  )
}
