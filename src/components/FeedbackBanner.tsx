import { ANTIBIOTIC_BY_ID, GERM_BY_ID } from '../data/antibiogram'
import type { FeedbackState } from '../game/types'

interface Props {
  feedback: FeedbackState
  tryAgainEnabled: boolean
  onContinue: () => void
  onTryAgain: () => void
  onReveal: () => void
}

export function FeedbackBanner({ feedback, tryAgainEnabled, onContinue, onTryAgain, onReveal }: Props) {
  const antibiotic = ANTIBIOTIC_BY_ID[feedback.antibioticId]
  const targets = feedback.revealGerms.map((g) => GERM_BY_ID[g].label).join(', ')

  if (feedback.retry) {
    return (
      <div className="banner banner--retry" role="status">
        <span className="banner-text">
          From memory — place <strong>{antibiotic.name}</strong> where it belongs. It locks in once you
          get it right.
        </span>
        <div className="banner-actions">
          <button className="btn btn--ghost" onClick={onReveal}>
            Reveal answer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="banner banner--miss" role="status">
      <span className="banner-text">
        Not quite — <strong>{antibiotic.name}</strong> belongs on {targets}. It is highlighted on the board.
      </span>
      <div className="banner-actions">
        {tryAgainEnabled && (
          <button className="btn btn--ghost" onClick={onTryAgain}>
            Try again
          </button>
        )}
        <button className="btn btn--primary" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  )
}
