import { useCallback, useReducer } from 'react'
import { ANTIBIOTIC_BY_ID, ANTIBIOTICS, cellKey } from '../data/antibiogram'
import { firstUnclaimedGerm, isCorrectPlacement, shuffle, unclaimedGerms } from './scoring'
import type { GameState, PlacedChip, RoundState, Settings } from './types'
import { DEFAULT_SETTINGS } from './types'

type Action =
  | { type: 'start'; settings: Settings }
  | { type: 'drop'; familyId: string; germId: string }
  | { type: 'continue' }
  | { type: 'tryAgain' }
  | { type: 'reveal' }
  | { type: 'skip' }
  | { type: 'end' }
  | { type: 'home' }
  | { type: 'setSettings'; settings: Settings }

export function initialState(settings: Settings = DEFAULT_SETTINGS): GameState {
  return {
    phase: 'start',
    deck: [],
    round: null,
    board: {},
    stats: { correct: 0, attempted: 0, skippedRounds: 0, playedRounds: 0 },
    mistakes: [],
    feedback: null,
    settings,
    celebration: null,
  }
}

function makeRound(antibioticId: string): RoundState {
  const a = ANTIBIOTIC_BY_ID[antibioticId]
  return {
    antibioticId,
    familyId: a.familyId,
    correctGerms: a.germs,
    claimedGerms: [],
    pending: a.germs.length,
  }
}

/** Add a chip to the board (cells can legitimately hold chips from several
 *  antibiotics of the same family). */
function withChip(
  board: Record<string, PlacedChip[]>,
  familyId: string,
  germId: string,
  chip: PlacedChip,
): Record<string, PlacedChip[]> {
  const key = cellKey(familyId, germId)
  return { ...board, [key]: [...(board[key] ?? []), chip] }
}

/** Advance to the next antibiotic, or end the game when the deck is empty. */
function advance(state: GameState, base: Partial<GameState>): GameState {
  const [next, ...rest] = state.deck
  if (next === undefined) {
    return { ...state, ...base, round: null, feedback: null, phase: 'end' }
  }
  return { ...state, ...base, deck: rest, round: makeRound(next), feedback: null }
}

function bumpCelebration(state: GameState, kind: 'block' | 'big'): GameState['celebration'] {
  if (state.settings.celebrations === 'none') return state.celebration
  if (kind === 'block' && state.settings.celebrations !== 'both') return state.celebration
  const seq = (state.celebration?.seq ?? 0) + 1
  return { seq, kind }
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'start': {
      const deck = shuffle(ANTIBIOTICS.map((a) => a.id))
      const [first, ...rest] = deck
      return {
        ...initialState(action.settings),
        phase: 'playing',
        deck: rest,
        round: makeRound(first),
      }
    }

    case 'setSettings':
      return { ...state, settings: action.settings }

    case 'drop': {
      const { round, feedback } = state
      if (!round) return state
      const { familyId, germId } = action

      // During retry, only a correct unclaimed cell resolves the block (as
      // "missed"); anything else is ignored so the player can keep trying.
      if (feedback?.retry) {
        if (!isCorrectPlacement(round, familyId, germId)) return state
        const board = withChip(state.board, familyId, germId, {
          antibioticId: round.antibioticId,
          status: 'missed',
        })
        const nextRound: RoundState = {
          ...round,
          claimedGerms: [...round.claimedGerms, germId],
          pending: round.pending - 1,
        }
        if (nextRound.pending === 0) {
          return advance(state, {
            board,
            stats: { ...state.stats, playedRounds: state.stats.playedRounds + 1 },
          })
        }
        return { ...state, board, round: nextRound, feedback: null }
      }

      // Normal drop (ignore while an unresolved miss banner is showing).
      if (feedback) return state

      if (isCorrectPlacement(round, familyId, germId)) {
        const board = withChip(state.board, familyId, germId, {
          antibioticId: round.antibioticId,
          status: 'correct',
        })
        const nextRound: RoundState = {
          ...round,
          claimedGerms: [...round.claimedGerms, germId],
          pending: round.pending - 1,
        }
        const stats = { ...state.stats, correct: state.stats.correct + 1, attempted: state.stats.attempted + 1 }
        if (nextRound.pending === 0) {
          const celebration = bumpCelebration(state, 'big')
          return advance(
            { ...state, celebration },
            { board, stats: { ...stats, playedRounds: stats.playedRounds + 1 } },
          )
        }
        return { ...state, board, round: nextRound, stats, celebration: bumpCelebration(state, 'block') }
      }

      // Wrong drop: record the miss now, then show the feedback banner.
      return {
        ...state,
        stats: { ...state.stats, attempted: state.stats.attempted + 1 },
        mistakes: [...state.mistakes, { antibioticId: round.antibioticId, placedFamilyId: familyId, placedGermId: germId }],
        feedback: {
          antibioticId: round.antibioticId,
          placedCell: { familyId, germId },
          revealGerms: unclaimedGerms(round),
          retry: false,
        },
      }
    }

    case 'continue': {
      const { round, feedback } = state
      if (!round || !feedback) return state
      const germ = firstUnclaimedGerm(round)
      if (germ === undefined) return { ...state, feedback: null }
      const board = withChip(state.board, round.familyId, germ, {
        antibioticId: round.antibioticId,
        status: 'missed',
      })
      const nextRound: RoundState = {
        ...round,
        claimedGerms: [...round.claimedGerms, germ],
        pending: round.pending - 1,
      }
      if (nextRound.pending === 0) {
        return advance(state, {
          board,
          stats: { ...state.stats, playedRounds: state.stats.playedRounds + 1 },
        })
      }
      return { ...state, board, round: nextRound, feedback: null }
    }

    case 'tryAgain': {
      if (!state.feedback) return state
      return { ...state, feedback: { ...state.feedback, retry: true } }
    }

    // Escape hatch from retry mode: show the correct location again so the
    // player isn't stuck when they can't recall it.
    case 'reveal': {
      if (!state.feedback) return state
      return { ...state, feedback: { ...state.feedback, retry: false } }
    }

    case 'skip': {
      const { round } = state
      if (!round) return state
      // Fill every remaining correct cell with a dashed chip; excluded from grade.
      let board = state.board
      for (const germ of unclaimedGerms(round)) {
        board = withChip(board, round.familyId, germ, { antibioticId: round.antibioticId, status: 'missed' })
      }
      return advance(state, {
        board,
        stats: { ...state.stats, skippedRounds: state.stats.skippedRounds + 1 },
      })
    }

    case 'end':
      return { ...state, phase: 'end', round: null, feedback: null }

    // Back to the home screen (keeping current settings).
    case 'home':
      return initialState(state.settings)

    default:
      return state
  }
}

export function useGame(settings: Settings) {
  const [state, dispatch] = useReducer(reducer, settings, initialState)

  const start = useCallback((s: Settings) => dispatch({ type: 'start', settings: s }), [])
  const drop = useCallback((familyId: string, germId: string) => dispatch({ type: 'drop', familyId, germId }), [])
  const cont = useCallback(() => dispatch({ type: 'continue' }), [])
  const tryAgain = useCallback(() => dispatch({ type: 'tryAgain' }), [])
  const reveal = useCallback(() => dispatch({ type: 'reveal' }), [])
  const skip = useCallback(() => dispatch({ type: 'skip' }), [])
  const end = useCallback(() => dispatch({ type: 'end' }), [])
  const home = useCallback(() => dispatch({ type: 'home' }), [])
  const setSettings = useCallback((s: Settings) => dispatch({ type: 'setSettings', settings: s }), [])

  return { state, start, drop, cont, tryAgain, reveal, skip, end, home, setSettings }
}
