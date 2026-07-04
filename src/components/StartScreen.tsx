import { ANTIBIOTICS } from '../data/antibiogram'
import { HistoryList } from './HistoryView'

interface Props {
  onStart: () => void
  onOpenSettings: () => void
  onStudy: () => void
}

export function StartScreen({ onStart, onOpenSettings, onStudy }: Props) {
  return (
    <div className="startscreen">
      <div className="home-column">
        <div className="start-card">
          <h1 className="start-title">Antibiogram Trainer</h1>
          <p className="start-sub">
            Memorize which antibiotics cover which germs. You'll get one antibiotic at a time — drag each
            block onto the correct cell (its family row × the germ it covers). Cover several germs? You'll
            get one block per germ.
          </p>
          <ul className="start-points">
            <li>Right placements lock in with a solid outline.</li>
            <li>Misses show you the correct spot with a dashed outline — no penalty drama.</li>
            <li>Skip to reveal an answer, or End anytime for your scorecard.</li>
          </ul>
          <div className="start-actions">
            <button className="btn btn--primary btn--lg" onClick={onStart}>
              Start ({ANTIBIOTICS.length} antibiotics)
            </button>
            <button className="btn btn--ghost" onClick={onStudy}>
              Study reference
            </button>
            <button className="btn btn--ghost" onClick={onOpenSettings}>
              Settings
            </button>
          </div>
        </div>

        <HistoryList />
      </div>
    </div>
  )
}
