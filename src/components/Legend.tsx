import { LEGEND } from '../data/antibiogram'

/**
 * The chart's footnote, kept verbatim per spec.
 *
 * Future: rather than a static block, these abbreviations could power hover/tap
 * tooltips on the column headers (e.g. ESCAPPM -> its member organisms), a
 * "which organisms make up ESCAPPM?" micro-quiz, or progressive disclosure that
 * collapses full names to acronyms as the player improves. See FUTURE.md.
 */
export function Legend() {
  return (
    <footer className="legend">
      <p className="legend-disclaimer">{LEGEND.disclaimer}</p>
      <p className="legend-abbr">{LEGEND.abbreviations.join('  ·  ')}</p>
    </footer>
  )
}
