import { describe, expect, it } from 'vitest'
import {
  ANTIBIOTICS,
  FAMILY_BY_ID,
  GERM_BY_ID,
} from '../data/antibiogram'
import {
  aggregateMistakes,
  computeGrade,
  firstUnclaimedGerm,
  isCorrectPlacement,
  unclaimedGerms,
} from './scoring'
import { initialState, reducer } from './useGame'
import type { RoundState, Settings } from './types'

const SETTINGS: Settings = { celebrations: 'both', tryAgain: true, layout: 'compact' }

function round(): RoundState {
  // ceftriaxone lives in ceph3 and covers mssa + strep + ...
  return {
    antibioticId: 'ceftriaxone',
    familyId: 'ceph3',
    correctGerms: ['mssa', 'strep', 'ecoli'],
    claimedGerms: ['mssa'],
    pending: 2,
  }
}

describe('dataset integrity', () => {
  it('has exactly 24 antibiotics', () => {
    expect(ANTIBIOTICS).toHaveLength(24)
  })

  it('every antibiotic references a valid family and only valid, unique germ ids', () => {
    for (const a of ANTIBIOTICS) {
      expect(FAMILY_BY_ID[a.familyId], `family for ${a.id}`).toBeDefined()
      expect(a.germs.length, `${a.id} covers at least one germ`).toBeGreaterThan(0)
      expect(new Set(a.germs).size, `${a.id} has no duplicate germs`).toBe(a.germs.length)
      for (const g of a.germs) {
        expect(GERM_BY_ID[g], `germ ${g} on ${a.id}`).toBeDefined()
      }
    }
  })

  it('has unique antibiotic ids', () => {
    const ids = ANTIBIOTICS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('placement evaluation', () => {
  it('accepts a covered, unclaimed germ in the right family', () => {
    expect(isCorrectPlacement(round(), 'ceph3', 'strep')).toBe(true)
  })
  it('rejects an already-claimed germ', () => {
    expect(isCorrectPlacement(round(), 'ceph3', 'mssa')).toBe(false)
  })
  it('rejects the right germ in the wrong family row', () => {
    expect(isCorrectPlacement(round(), 'ceph4', 'strep')).toBe(false)
  })
  it('rejects a germ the antibiotic does not cover', () => {
    expect(isCorrectPlacement(round(), 'ceph3', 'pseudomonas')).toBe(false)
  })
  it('reports the unclaimed germs and the first of them', () => {
    expect(unclaimedGerms(round())).toEqual(['strep', 'ecoli'])
    expect(firstUnclaimedGerm(round())).toBe('strep')
  })
})

describe('grade', () => {
  it('is 0 when nothing attempted', () => {
    expect(computeGrade({ correct: 0, attempted: 0 })).toBe(0)
  })
  it('rounds to an integer percent', () => {
    expect(computeGrade({ correct: 6, attempted: 8 })).toBe(75)
    expect(computeGrade({ correct: 1, attempted: 3 })).toBe(33)
  })
})

describe('mistake aggregation', () => {
  it('groups repeats and folds in cross-game counts, sorted by frequency', () => {
    const m = [
      { antibioticId: 'vancomycin', placedFamilyId: 'ceph1', placedGermId: 'ecoli' },
      { antibioticId: 'vancomycin', placedFamilyId: 'ceph1', placedGermId: 'ecoli' },
      { antibioticId: 'metronidazole', placedFamilyId: 'quinolone', placedGermId: 'mssa' },
    ]
    const agg = aggregateMistakes(m, { 'metronidazole->quinolone::mssa': 5 })
    expect(agg[0].antibioticId).toBe('metronidazole')
    expect(agg[0].count).toBe(6) // 1 this game + 5 stored
    expect(agg[1].count).toBe(2)
    expect(agg[1].antibioticName).toBe('Vancomycin')
  })
})

describe('reducer flow', () => {
  function playing() {
    return reducer(initialState(SETTINGS), { type: 'start', settings: SETTINGS })
  }

  it('starts with 23 in the deck and a first round', () => {
    const s = playing()
    expect(s.phase).toBe('playing')
    expect(s.deck).toHaveLength(23)
    expect(s.round).not.toBeNull()
  })

  it('scores a correct drop and does not clutter with wrong chips before continue', () => {
    let s = playing()
    const r = s.round!
    // wrong drop first (family right or wrong — pick a definitely-wrong germ)
    const wrongGerm = ['mrsa', 'atypicals', 'anaerobes'].find((g) => !r.correctGerms.includes(g))!
    s = reducer(s, { type: 'drop', familyId: r.familyId, germId: wrongGerm })
    expect(s.feedback).not.toBeNull()
    expect(s.stats.attempted).toBe(1)
    expect(s.stats.correct).toBe(0)
    // no board chip yet
    expect(Object.keys(s.board)).toHaveLength(0)
    // continue places a single dashed chip in a correct cell
    s = reducer(s, { type: 'continue' })
    expect(s.feedback).toBeNull()
    const chips = Object.values(s.board).flat()
    expect(chips).toHaveLength(1)
    expect(chips[0].status).toBe('missed')
  })

  it('excludes skipped rounds from the grade', () => {
    let s = playing()
    s = reducer(s, { type: 'skip' })
    expect(s.stats.skippedRounds).toBe(1)
    expect(s.stats.attempted).toBe(0)
    expect(s.stats.correct).toBe(0)
  })
})
