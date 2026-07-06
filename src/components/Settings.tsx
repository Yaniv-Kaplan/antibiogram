import type { CelebrationMode, LayoutMode, Settings } from '../game/types'
import { FAMILIES, GERM_GROUPS, GERMS } from '../data/antibiogram'
import { shuffle } from '../game/scoring'

interface Props {
  settings: Settings
  onChange: (s: Settings) => void
  onClose: () => void
}

/** Shuffle the columns while keeping each germ group's columns contiguous, so
 *  the grouped header row stays valid. */
function shuffledGermOrder(): string[] {
  const order: string[] = []
  for (const groupId of shuffle(GERM_GROUPS.map((g) => g.id))) {
    order.push(...shuffle(GERMS.filter((g) => g.group === groupId).map((g) => g.id)))
  }
  return order
}

const shuffledFamilyOrder = (): string[] => shuffle(FAMILIES.map((f) => f.id))

const isShuffled = (order?: string[]) => !!order && order.length > 0

const LAYOUT_OPTIONS: { value: LayoutMode; label: string; hint: string }[] = [
  { value: 'compact', label: 'Compact', hint: 'Dense grid — the whole table at a glance, like the reference. Cell names truncate; hover for the full name.' },
  { value: 'comfortable', label: 'Comfortable', hint: 'Larger cells with full names; scroll to reach every row and column.' },
]

const CELEBRATION_OPTIONS: { value: CelebrationMode; label: string; hint: string }[] = [
  { value: 'both', label: 'Both', hint: 'A burst on every correct block, plus a bigger one when you finish an antibiotic.' },
  { value: 'big', label: 'Big only', hint: 'Celebrate only when a whole antibiotic is completed correctly.' },
  { value: 'none', label: 'None', hint: 'No celebration animations.' },
]

export function SettingsPanel({ settings, onChange, onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-label="Settings" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Settings</h2>

        <fieldset className="field">
          <legend className="field-legend">Layout</legend>
          {LAYOUT_OPTIONS.map((opt) => (
            <label key={opt.value} className="radio">
              <input
                type="radio"
                name="layout"
                checked={settings.layout === opt.value}
                onChange={() => onChange({ ...settings, layout: opt.value })}
              />
              <span className="radio-label">{opt.label}</span>
              <span className="radio-hint">{opt.hint}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="field">
          <legend className="field-legend">Shuffle the board</legend>
          <p className="field-hint">
            Randomize positions so you memorize the pairings, not the spots. Columns stay grouped
            by category.
          </p>
          <div className="field-buttons">
            <button
              className="btn btn--ghost"
              onClick={() => onChange({ ...settings, germOrder: shuffledGermOrder() })}
            >
              Shuffle columns{isShuffled(settings.germOrder) ? ' ↻' : ''}
            </button>
            <button
              className="btn btn--ghost"
              onClick={() => onChange({ ...settings, familyOrder: shuffledFamilyOrder() })}
            >
              Shuffle rows{isShuffled(settings.familyOrder) ? ' ↻' : ''}
            </button>
            {(isShuffled(settings.germOrder) || isShuffled(settings.familyOrder)) && (
              <button
                className="btn btn--ghost"
                onClick={() => onChange({ ...settings, germOrder: undefined, familyOrder: undefined })}
              >
                Reset order
              </button>
            )}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend className="field-legend">Celebrations</legend>
          {CELEBRATION_OPTIONS.map((opt) => (
            <label key={opt.value} className="radio">
              <input
                type="radio"
                name="celebrations"
                checked={settings.celebrations === opt.value}
                onChange={() => onChange({ ...settings, celebrations: opt.value })}
              />
              <span className="radio-label">{opt.label}</span>
              <span className="radio-hint">{opt.hint}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="field">
          <legend className="field-legend">Try again on a miss</legend>
          <label className="radio">
            <input
              type="checkbox"
              checked={settings.tryAgain}
              onChange={(e) => onChange({ ...settings, tryAgain: e.target.checked })}
            />
            <span className="radio-label">Offer a corrective retry after a wrong placement</span>
          </label>
        </fieldset>

        <div className="modal-actions">
          <button className="btn btn--primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
