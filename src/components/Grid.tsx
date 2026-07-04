import {
  ANTIBIOTIC_BY_ID,
  ANTIBIOTICS,
  FAMILIES,
  GERM_GROUPS,
  GERMS,
  cellKey,
  type Antibiotic,
} from '../data/antibiogram'
import type { FeedbackState, PlacedChip } from '../game/types'
import { Cell } from './Cell'

// ---- Static layout maths (depend only on the dataset) --------------------

/** Antibiotics grouped by family, in dataset order. */
const ANTIBIOTICS_BY_FAMILY: Record<string, Antibiotic[]> = {}
for (const a of ANTIBIOTICS) (ANTIBIOTICS_BY_FAMILY[a.familyId] ??= []).push(a)

/** Vertical lane of each antibiotic within its family row (0-based). */
const LANE_OF: Record<string, number> = {}
for (const f of FAMILIES) (ANTIBIOTICS_BY_FAMILY[f.id] ?? []).forEach((a, i) => (LANE_OF[a.id] = i))

const laneCount = (familyId: string) => Math.max(1, ANTIBIOTICS_BY_FAMILY[familyId]?.length ?? 1)

/** First grid-row line for each family (header occupies rows 1–2). */
const FAMILY_START_ROW: Record<string, number> = {}
{
  let row = 3
  for (const f of FAMILIES) {
    FAMILY_START_ROW[f.id] = row
    row += laneCount(f.id)
  }
}

/** Germ column index (0..11). */
const GERM_INDEX: Record<string, number> = {}
GERMS.forEach((g, i) => (GERM_INDEX[g.id] = i))

/** Group header spans, computed from how many germs each group holds. */
const GROUP_SPANS = (() => {
  let start = 2
  return GERM_GROUPS.map((group) => {
    const count = GERMS.filter((g) => g.group === group.id).length
    const span = { group, startCol: start, count }
    start += count
    return span
  })
})()

interface Props {
  board: Record<string, PlacedChip[]>
  feedback: FeedbackState | null
  /** Family row of the current antibiotic, used to target the miss reveal. */
  activeFamilyId?: string
}

interface Bar {
  key: string
  name: string
  colorVar: string
  status: 'correct' | 'missed'
  startCol: number
  span: number
  row: number
}

function statusOf(
  board: Record<string, PlacedChip[]>,
  familyId: string,
  germId: string,
  antibioticId: string,
): 'correct' | 'missed' | undefined {
  const chips = board[cellKey(familyId, germId)]
  return chips?.find((c) => c.antibioticId === antibioticId)?.status
}

/** Merge consecutive same-antibiotic, same-status cells into spanning bars. */
function buildBars(board: Record<string, PlacedChip[]>): Bar[] {
  const bars: Bar[] = []
  for (const family of FAMILIES) {
    for (const antibiotic of ANTIBIOTICS_BY_FAMILY[family.id] ?? []) {
      const rowLine = FAMILY_START_ROW[family.id] + LANE_OF[antibiotic.id]
      let i = 0
      while (i < GERMS.length) {
        const status = statusOf(board, family.id, GERMS[i].id, antibiotic.id)
        if (!status) {
          i++
          continue
        }
        let j = i + 1
        while (j < GERMS.length && statusOf(board, family.id, GERMS[j].id, antibiotic.id) === status) j++
        bars.push({
          key: `${antibiotic.id}:${i}`,
          name: antibiotic.name,
          colorVar: family.colorVar,
          status,
          startCol: 2 + i,
          span: j - i,
          row: rowLine,
        })
        i = j
      }
    }
  }
  return bars
}

export function Grid({ board, feedback, activeFamilyId }: Props) {
  const isRevealTarget = (familyId: string, germId: string) =>
    !!feedback && !feedback.retry && feedback.revealGerms.includes(germId) && familyId === activeFamilyId

  const isWrongCell = (familyId: string, germId: string) =>
    !!feedback &&
    !feedback.retry &&
    feedback.placedCell.familyId === familyId &&
    feedback.placedCell.germId === germId

  const bars = buildBars(board)

  return (
    <div className="grid-scroll">
      <div className="grid" role="grid" aria-label="Antibiogram">
        {/* Header */}
        <div className="grid-corner" style={{ gridColumn: 1, gridRow: 1 }} />
        {GROUP_SPANS.map(({ group, startCol, count }) => (
          <div
            key={group.id}
            className="group-head"
            style={{ gridRow: 1, gridColumn: `${startCol} / span ${count}`, background: `var(${group.colorVar})` }}
          >
            {group.label}
          </div>
        ))}
        <div className="grid-corner grid-corner--lower" style={{ gridColumn: 1, gridRow: 2 }} />
        {GERMS.map((germ, i) => (
          <div key={germ.id} className="germ-head" style={{ gridRow: 2, gridColumn: 2 + i }} title={germ.fullName ?? germ.label}>
            {germ.label}
            {germ.id === 'atypicals' && germ.fullName && <em className="germ-sub">{germ.fullName}</em>}
          </div>
        ))}

        {/* Row labels + droppable cells (each spans its family's lanes) */}
        {FAMILIES.map((family) => {
          const start = FAMILY_START_ROW[family.id]
          const span = laneCount(family.id)
          return (
            <div key={family.id} style={{ display: 'contents' }}>
              <div
                className="row-label"
                style={{ gridColumn: 1, gridRow: `${start} / span ${span}` }}
                title={family.label}
              >
                <span>{family.label}</span>
              </div>
              {GERMS.map((germ, i) => (
                <Cell
                  key={cellKey(family.id, germ.id)}
                  familyId={family.id}
                  germId={germ.id}
                  isRevealTarget={isRevealTarget(family.id, germ.id)}
                  wrongName={
                    isWrongCell(family.id, germ.id) ? ANTIBIOTIC_BY_ID[feedback!.antibioticId].name : undefined
                  }
                  style={{ gridColumn: 2 + i, gridRow: `${start} / span ${span}` }}
                />
              ))}
            </div>
          )
        })}

        {/* Merged placement bars, one per antibiotic run, above the cells */}
        {bars.map((bar) => (
          <div
            key={bar.key}
            className={`bar bar--${bar.status}`}
            style={{ gridColumn: `${bar.startCol} / span ${bar.span}`, gridRow: bar.row, background: `var(${bar.colorVar})` }}
            title={bar.name}
          >
            <span className="bar-label">{bar.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
