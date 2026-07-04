import { useDraggable } from '@dnd-kit/core'
import type { CSSProperties } from 'react'

interface Props {
  id: string
  antibioticId: string
  name: string
  colorVar: string
}

/** A draggable block in the tray (one per germ the current antibiotic covers). */
export function AntibioticBlock({ id, antibioticId, name, colorVar }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { antibioticId },
  })

  const style: CSSProperties = {
    background: `var(${colorVar})`,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <button
      ref={setNodeRef}
      className="block"
      style={style}
      aria-label={`Place ${name}`}
      {...listeners}
      {...attributes}
    >
      {name}
    </button>
  )
}
