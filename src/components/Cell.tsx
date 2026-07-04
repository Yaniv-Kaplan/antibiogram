import { useDroppable } from '@dnd-kit/core'
import type { CSSProperties } from 'react'
import { cellKey } from '../data/antibiogram'

interface Props {
  familyId: string
  germId: string
  /** Highlight as the true location during miss feedback. */
  isRevealTarget: boolean
  /** The player just dropped a wrong block here (transient). */
  wrongName?: string
  /** Explicit grid placement (the row spans its family's lanes). */
  style?: CSSProperties
}

export function Cell({ familyId, germId, isRevealTarget, wrongName, style }: Props) {
  const id = cellKey(familyId, germId)
  const { setNodeRef, isOver, active } = useDroppable({ id, data: { familyId, germId } })

  const className = [
    'cell',
    active ? 'cell--armed' : '',
    isOver ? 'cell--over' : '',
    isRevealTarget ? 'cell--reveal' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={setNodeRef} className={className} style={style}>
      {wrongName && (
        <span className="chip chip--wrong" title={wrongName}>
          {wrongName}
        </span>
      )}
    </div>
  )
}
