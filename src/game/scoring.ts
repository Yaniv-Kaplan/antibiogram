import type { MistakeEntry, RoundState, Stats } from './types'
import { ANTIBIOTIC_BY_ID, FAMILY_BY_ID, GERM_BY_ID } from '../data/antibiogram'

/** Grade as an integer percent; 0 when nothing was attempted. */
export function computeGrade(stats: Pick<Stats, 'correct' | 'attempted'>): number {
  if (stats.attempted === 0) return 0
  return Math.round((stats.correct / stats.attempted) * 100)
}

/**
 * A drop is correct when it lands in the antibiotic's own family row, on a germ
 * the antibiotic covers, that hasn't already been filled this round.
 */
export function isCorrectPlacement(
  round: RoundState,
  familyId: string,
  germId: string,
): boolean {
  return (
    familyId === round.familyId &&
    round.correctGerms.includes(germId) &&
    !round.claimedGerms.includes(germId)
  )
}

/** The next correct germ still needing a chip (used for missed/skip fills). */
export function firstUnclaimedGerm(round: RoundState): string | undefined {
  return round.correctGerms.find((g) => !round.claimedGerms.includes(g))
}

/** Correct germs not yet placed — highlighted as the true location on a miss. */
export function unclaimedGerms(round: RoundState): string[] {
  return round.correctGerms.filter((g) => !round.claimedGerms.includes(g))
}

/** Stable signature so the same confusion aggregates across plays. */
export function mistakeSignature(m: MistakeEntry): string {
  return `${m.antibioticId}->${m.placedFamilyId}::${m.placedGermId}`
}

export interface AggregatedMistake extends MistakeEntry {
  count: number
  antibioticName: string
  placedLabel: string
  correctLabel: string
}

/**
 * Group repeated mistakes and attach human-readable labels, sorted by
 * frequency (desc). `extraCounts` folds in cross-game counts from storage.
 */
export function aggregateMistakes(
  mistakes: MistakeEntry[],
  extraCounts: Record<string, number> = {},
): AggregatedMistake[] {
  const bySig = new Map<string, AggregatedMistake>()
  for (const m of mistakes) {
    const sig = mistakeSignature(m)
    const existing = bySig.get(sig)
    if (existing) {
      existing.count += 1
      continue
    }
    const antibiotic = ANTIBIOTIC_BY_ID[m.antibioticId]
    const placedFamily = FAMILY_BY_ID[m.placedFamilyId]
    const placedGerm = GERM_BY_ID[m.placedGermId]
    const correctFamily = FAMILY_BY_ID[antibiotic.familyId]
    const correctGermLabels = antibiotic.germs.map((g) => GERM_BY_ID[g].label).join(', ')
    bySig.set(sig, {
      ...m,
      count: 1,
      antibioticName: antibiotic.name,
      placedLabel: `${placedFamily?.label ?? m.placedFamilyId} × ${placedGerm?.label ?? m.placedGermId}`,
      correctLabel: `${correctFamily.label} × ${correctGermLabels}`,
    })
  }
  for (const agg of bySig.values()) {
    agg.count += extraCounts[mistakeSignature(agg)] ?? 0
  }
  return [...bySig.values()].sort((a, b) => b.count - a.count)
}

/** Fisher–Yates shuffle returning a new array. */
export function shuffle<T>(input: readonly T[]): T[] {
  const arr = input.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
