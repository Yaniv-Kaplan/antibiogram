import { DEFAULT_SETTINGS, type GameRecord, type MistakeEntry, type Settings } from './types'
import { mistakeSignature } from './scoring'

const SETTINGS_KEY = 'antibiogram.settings.v1'
const MISTAKES_KEY = 'antibiogram.mistakeCounts.v1'
const HISTORY_KEY = 'antibiogram.history.v1'
const HISTORY_LIMIT = 100

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return { ...fallback, ...(JSON.parse(raw) as object) } as T
  } catch {
    return fallback
  }
}

export function loadSettings(): Settings {
  if (typeof localStorage === 'undefined') return DEFAULT_SETTINGS
  return safeParse<Settings>(localStorage.getItem(SETTINGS_KEY), DEFAULT_SETTINGS)
}

export function saveSettings(settings: Settings): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

/** Cross-game mistake frequency, keyed by mistake signature. */
export function loadMistakeCounts(): Record<string, number> {
  if (typeof localStorage === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(MISTAKES_KEY) || '{}') as Record<string, number>
  } catch {
    return {}
  }
}

/** Fold a finished game's mistakes into the persisted cross-game counts. */
export function recordMistakes(mistakes: MistakeEntry[]): void {
  if (typeof localStorage === 'undefined' || mistakes.length === 0) return
  const counts = loadMistakeCounts()
  for (const m of mistakes) {
    const sig = mistakeSignature(m)
    counts[sig] = (counts[sig] ?? 0) + 1
  }
  localStorage.setItem(MISTAKES_KEY, JSON.stringify(counts))
}

/** Past games, newest first. */
export function loadHistory(): GameRecord[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    return Array.isArray(parsed) ? (parsed as GameRecord[]) : []
  } catch {
    return []
  }
}

/** Prepend a finished game to history (capped at HISTORY_LIMIT). */
export function saveGameToHistory(record: GameRecord): void {
  if (typeof localStorage === 'undefined') return
  const history = [record, ...loadHistory()].slice(0, HISTORY_LIMIT)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function clearHistory(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(HISTORY_KEY)
}
