interface Props {
  remaining: number
  total: number
  onSkip: () => void
  onEnd: () => void
  onOpenSettings: () => void
  skipDisabled: boolean
}

export function TopBar({ remaining, total, onSkip, onEnd, onOpenSettings, skipDisabled }: Props) {
  const done = total - remaining
  return (
    <header className="topbar">
      <div className="topbar-title">Antibiogram Trainer</div>
      <div className="topbar-counter" aria-live="polite">
        <span className="counter-num">{remaining}</span>
        <span className="counter-label">antibiotics left</span>
        <span className="counter-progress">
          ({done}/{total})
        </span>
      </div>
      <div className="topbar-actions">
        <button className="btn btn--ghost" onClick={onOpenSettings}>
          Settings
        </button>
        <button className="btn btn--ghost" onClick={onSkip} disabled={skipDisabled}>
          Skip
        </button>
        <button className="btn btn--end" onClick={onEnd}>
          End
        </button>
      </div>
    </header>
  )
}
