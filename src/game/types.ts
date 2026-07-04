export type CelebrationMode = 'both' | 'big' | 'none'
export type LayoutMode = 'comfortable' | 'compact'

export interface Settings {
  celebrations: CelebrationMode
  tryAgain: boolean
  layout: LayoutMode
}

export const DEFAULT_SETTINGS: Settings = {
  celebrations: 'both',
  tryAgain: true,
  layout: 'compact',
}

/** A chip that has settled onto the board (only ever in a correct cell). */
export interface PlacedChip {
  antibioticId: string
  status: 'correct' | 'missed'
}

export interface RoundState {
  antibioticId: string
  familyId: string
  /** Germ ids this antibiotic covers (the target cells, in its family row). */
  correctGerms: string[]
  /** Correct germs already filled this round. */
  claimedGerms: string[]
  /** Blocks still to place (correctGerms.length - resolved). */
  pending: number
}

export interface FeedbackState {
  antibioticId: string
  /** Where the player dropped the block (shown transiently as a wrong chip). */
  placedCell: { familyId: string; germId: string }
  /** Unclaimed correct germs to highlight as the true location. */
  revealGerms: string[]
  /** True once the player chose "Try again" — awaiting a corrective re-drop. */
  retry: boolean
}

/** A single mistake occurrence, logged for the end-game breakdown. */
export interface MistakeEntry {
  antibioticId: string
  placedFamilyId: string
  placedGermId: string
}

export interface Stats {
  correct: number
  attempted: number
  skippedRounds: number
  playedRounds: number
}

/** A finished game, saved to history. */
export interface GameRecord {
  /** Epoch ms when the game ended. */
  at: number
  stats: Stats
  /** Antibiotics never reached (deck remaining at End). */
  remaining: number
  mistakes: MistakeEntry[]
}

export type GamePhase = 'start' | 'playing' | 'end'

export interface GameState {
  phase: GamePhase
  /** Antibiotic ids not yet drawn (does not include the current round). */
  deck: string[]
  round: RoundState | null
  board: Record<string, PlacedChip[]>
  stats: Stats
  mistakes: MistakeEntry[]
  feedback: FeedbackState | null
  settings: Settings
  /** Bumped to trigger a celebration side-effect in the view. */
  celebration: { seq: number; kind: 'block' | 'big' } | null
}
