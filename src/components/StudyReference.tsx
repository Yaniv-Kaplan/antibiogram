import { ANTIBIOTICS, cellKey } from '../data/antibiogram'
import type { LayoutMode, PlacedChip } from '../game/types'
import { Grid } from './Grid'
import { Legend } from './Legend'

// The fully-populated chart: every antibiotic in its correct cells. Static, so
// compute once at module load.
const FULL_BOARD: Record<string, PlacedChip[]> = (() => {
  const board: Record<string, PlacedChip[]> = {}
  for (const a of ANTIBIOTICS) {
    for (const g of a.germs) {
      ;(board[cellKey(a.familyId, g)] ??= []).push({ antibioticId: a.id, status: 'correct' })
    }
  }
  return board
})()

interface Props {
  layout: LayoutMode
  onBack: () => void
}

export function StudyReference({ layout, onBack }: Props) {
  return (
    <div className="app" data-layout={layout}>
      <header className="topbar">
        <div className="topbar-title">Study reference — full antibiogram</div>
        <div className="topbar-actions" style={{ marginLeft: 'auto' }}>
          <button className="btn btn--primary" onClick={onBack}>
            Back to home
          </button>
        </div>
      </header>
      <main className="playfield">
        <Grid board={FULL_BOARD} feedback={null} />
      </main>
      <Legend />
    </div>
  )
}
