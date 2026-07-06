import {
  ANTIBIOTIC_BY_ID,
  ANTIBIOTICS,
  FAMILIES,
  GERM_GROUPS,
  GERMS,
  cellKey,
  type Antibiotic,
  type Germ,
  type GermGroup,
} from '../data/antibiogram'
import type { FeedbackState, PlacedChip } from '../game/types'
import { Cell } from './Cell'

// ---- Static maths (depend only on the dataset) ---------------------------

/** Antibiotics grouped by family, in dataset order. */
const ANTIBIOTICS_BY_FAMILY: Record<string, Antibiotic[]> = {}
for (const a of ANTIBIOTICS) (ANTIBIOTICS_BY_FAMILY[a.familyId] ??= []).push(a)

const GERM_GROUP_BY_ID: Record<string, GermGroup> = Object.fromEntries(
  GERM_GROUPS.map((g) => [g.id, g]),
)

/**
 * Apply a saved display order (array of ids) to a dataset list. Unknown/duplicate
 * ids are dropped and any ids missing from the order are appended in natural
 * order, so a stale saved order can never hide or duplicate a row/column.
 */
function applyOrder<T extends { id: string }>(items: T[], order?: string[]): T[] {
  if (!order || order.length === 0) return items
  const byId = new Map(items.map((i) => [i.id, i]))
  const seen = new Set<string>()
  const out: T[] = []
  for (const id of order) {
    const item = byId.get(id)
    if (item && !seen.has(id)) {
      out.push(item)
      seen.add(id)
    }
  }
  for (const item of items) if (!seen.has(item.id)) out.push(item)
  return out
}

/** Group header spans as consecutive same-group runs of the ordered germs. */
function computeGroupSpans(germs: Germ[]) {
  const spans: { group: GermGroup; startCol: number; count: number }[] = []
  let col = 2
  for (let i = 0; i < germs.length; ) {
    const groupId = germs[i].group
    let j = i + 1
    while (j < germs.length && germs[j].group === groupId) j++
    spans.push({ group: GERM_GROUP_BY_ID[groupId], startCol: col, count: j - i })
    col += j - i
    i = j
  }
  return spans
}

interface Props {
  board: Record<string, PlacedChip[]>
  feedback: FeedbackState | null
  /** Family row of the current antibiotic, used to target the miss reveal. */
  activeFamilyId?: string
  /** Column (germ id) display order; undefined = natural chart order. */
  germOrder?: string[]
  /** Row (family id) display order; undefined = natural chart order. */
  familyOrder?: string[]
}

interface FamilyLayout {
  startRow: number
  /** Number of lanes = distinct antibiotics currently placed (min 1). */
  lanes: number
  /** Lane index per placed antibiotic (compacted, dataset order). */
  laneOf: Record<string, number>
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

const isPlaced = (
  board: Record<string, PlacedChip[]>,
  germs: Germ[],
  familyId: string,
  antibioticId: string,
) => germs.some((g) => board[cellKey(familyId, g.id)]?.some((c) => c.antibioticId === antibioticId))

/**
 * Row heights follow what's actually on the board: a family is 1 lane tall until
 * a second (then third) antibiotic is placed in it, so a pill is always exactly
 * one row high and empty rows stay minimal.
 */
function computeLayout(
  board: Record<string, PlacedChip[]>,
  families: { id: string }[],
  germs: Germ[],
): Record<string, FamilyLayout> {
  const byId: Record<string, FamilyLayout> = {}
  let row = 3 // header occupies rows 1–2
  for (const family of families) {
    const present = (ANTIBIOTICS_BY_FAMILY[family.id] ?? []).filter((a) => isPlaced(board, germs, family.id, a.id))
    const laneOf: Record<string, number> = {}
    present.forEach((a, i) => (laneOf[a.id] = i))
    const lanes = Math.max(1, present.length)
    byId[family.id] = { startRow: row, lanes, laneOf }
    row += lanes
  }
  return byId
}

/** Merge consecutive same-antibiotic, same-status cells into spanning bars. */
function buildBars(
  board: Record<string, PlacedChip[]>,
  layout: Record<string, FamilyLayout>,
  families: { id: string; colorVar: string }[],
  germs: Germ[],
): Bar[] {
  const bars: Bar[] = []
  for (const family of families) {
    const { startRow, laneOf } = layout[family.id]
    for (const antibiotic of ANTIBIOTICS_BY_FAMILY[family.id] ?? []) {
      const lane = laneOf[antibiotic.id]
      if (lane === undefined) continue // not placed yet
      const rowLine = startRow + lane
      let i = 0
      while (i < germs.length) {
        const status = statusOf(board, family.id, germs[i].id, antibiotic.id)
        if (!status) {
          i++
          continue
        }
        let j = i + 1
        while (j < germs.length && statusOf(board, family.id, germs[j].id, antibiotic.id) === status) j++
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

export function Grid({ board, feedback, activeFamilyId, germOrder, familyOrder }: Props) {
  const germs = applyOrder(GERMS, germOrder)
  const families = applyOrder(FAMILIES, familyOrder)
  const groupSpans = computeGroupSpans(germs)
  const isRevealTarget = (familyId: string, germId: string) =>
    !!feedback && !feedback.retry && feedback.revealGerms.includes(germId) && familyId === activeFamilyId

  const isWrongCell = (familyId: string, germId: string) =>
    !!feedback &&
    !feedback.retry &&
    feedback.placedCell.familyId === familyId &&
    feedback.placedCell.germId === germId

  const layout = computeLayout(board, families, germs)
  const bars = buildBars(board, layout, families, germs)

  return (
    <div className="grid-scroll">
      <div className="grid" role="grid" aria-label="Antibiogram">
        {/* Header */}
        <div className="grid-corner" style={{ gridColumn: 1, gridRow: 1 }} />
        {groupSpans.map(({ group, startCol, count }) => (
          <div
            key={`${group.id}:${startCol}`}
            className="group-head"
            style={{ gridRow: 1, gridColumn: `${startCol} / span ${count}`, background: `var(${group.colorVar})` }}
          >
            {group.label}
          </div>
        ))}
        <div className="grid-corner grid-corner--lower" style={{ gridColumn: 1, gridRow: 2 }} />
        {germs.map((germ, i) => (
          <div key={germ.id} className="germ-head" style={{ gridRow: 2, gridColumn: 2 + i }} title={germ.fullName ?? germ.label}>
            {germ.label}
            {germ.id === 'atypicals' && germ.fullName && <em className="germ-sub">{germ.fullName}</em>}
          </div>
        ))}

        {/* Row labels + droppable cells (each family is as tall as its placements) */}
        {families.map((family) => {
          const { startRow, lanes } = layout[family.id]
          return (
            <div key={family.id} style={{ display: 'contents' }}>
              <div
                className="row-label"
                style={{ gridColumn: 1, gridRow: `${startRow} / span ${lanes}` }}
                title={family.label}
              >
                <span>{family.label}</span>
              </div>
              {germs.map((germ, i) => (
                <Cell
                  key={cellKey(family.id, germ.id)}
                  familyId={family.id}
                  germId={germ.id}
                  isRevealTarget={isRevealTarget(family.id, germ.id)}
                  wrongName={
                    isWrongCell(family.id, germ.id) ? ANTIBIOTIC_BY_ID[feedback!.antibioticId].name : undefined
                  }
                  style={{ gridColumn: 2 + i, gridRow: `${startRow} / span ${lanes}` }}
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
