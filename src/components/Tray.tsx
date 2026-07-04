import { ANTIBIOTIC_BY_ID, FAMILY_BY_ID } from '../data/antibiogram'
import type { RoundState } from '../game/types'
import { AntibioticBlock } from './AntibioticBlock'

interface Props {
  round: RoundState
  /** When true (miss banner up, not retrying), blocks are not draggable. */
  locked: boolean
}

export function Tray({ round, locked }: Props) {
  const antibiotic = ANTIBIOTIC_BY_ID[round.antibioticId]
  const family = FAMILY_BY_ID[antibiotic.familyId]
  const blocks = Array.from({ length: round.pending })

  return (
    <div className="tray">
      <div className="tray-info">
        <span className="tray-label">Place this antibiotic:</span>
        <strong className="tray-name">{antibiotic.name}</strong>
        <span className="tray-count">
          {round.pending} {round.pending === 1 ? 'block' : 'blocks'} left this round
        </span>
      </div>
      <div className={`tray-blocks${locked ? ' tray-blocks--locked' : ''}`}>
        {locked
          ? blocks.map((_, i) => (
              <span key={i} className="block block--ghost" style={{ background: `var(${family.colorVar})` }}>
                {antibiotic.name}
              </span>
            ))
          : blocks.map((_, i) => (
              <AntibioticBlock
                key={i}
                id={`block-${i}`}
                antibioticId={antibiotic.id}
                name={antibiotic.name}
                colorVar={family.colorVar}
              />
            ))}
      </div>
    </div>
  )
}
