import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { ANTIBIOTIC_BY_ID, ANTIBIOTICS, FAMILY_BY_ID } from './data/antibiogram'
import { useGame } from './game/useGame'
import { fireConfetti } from './game/confetti'
import { aggregateMistakes } from './game/scoring'
import { loadMistakeCounts, loadSettings, recordMistakes, saveSettings } from './game/persistence'
import type { Settings } from './game/types'
import { TopBar } from './components/TopBar'
import { Grid } from './components/Grid'
import { Tray } from './components/Tray'
import { FeedbackBanner } from './components/FeedbackBanner'
import { StartScreen } from './components/StartScreen'
import { EndScreen } from './components/EndScreen'
import { SettingsPanel } from './components/Settings'
import { Legend } from './components/Legend'

export default function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings())
  const { state, start, drop, cont, tryAgain, reveal, skip, end, setSettings: syncSettings } = useGame(settings)
  const [showSettings, setShowSettings] = useState(false)
  const [dragName, setDragName] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
  )

  // Persist settings and keep the reducer's copy in sync.
  useEffect(() => {
    saveSettings(settings)
    syncSettings(settings)
  }, [settings, syncSettings])

  // Fire celebrations when the reducer signals one.
  useEffect(() => {
    if (state.celebration) fireConfetti(state.celebration.kind)
  }, [state.celebration])

  // Deep link: visiting with #play jumps straight into a session.
  const autoStarted = useRef(false)
  useEffect(() => {
    if (!autoStarted.current && state.phase === 'start' && window.location.hash === '#play') {
      autoStarted.current = true
      start(settings)
    }
  }, [state.phase, start, settings])

  // On finishing a session, snapshot prior counts then persist this game's mistakes.
  const prevCounts = useRef<Record<string, number>>({})
  const recorded = useRef(false)
  useEffect(() => {
    if (state.phase === 'end' && !recorded.current) {
      recorded.current = true
      prevCounts.current = loadMistakeCounts()
      recordMistakes(state.mistakes)
    }
    if (state.phase === 'playing') recorded.current = false
  }, [state.phase, state.mistakes])

  function handleDragStart(e: DragStartEvent) {
    const id = e.active.data.current?.antibioticId as string | undefined
    setDragName(id ? ANTIBIOTIC_BY_ID[id].name : null)
  }
  function handleDragEnd(e: DragEndEvent) {
    setDragName(null)
    const data = e.over?.data.current as { familyId: string; germId: string } | undefined
    if (data) drop(data.familyId, data.germId)
  }

  if (state.phase === 'start') {
    return (
      <>
        <StartScreen onStart={() => start(settings)} onOpenSettings={() => setShowSettings(true)} />
        {showSettings && (
          <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setShowSettings(false)} />
        )}
      </>
    )
  }

  if (state.phase === 'end') {
    const mistakes = aggregateMistakes(state.mistakes, prevCounts.current)
    return (
      <EndScreen
        stats={state.stats}
        remaining={state.deck.length}
        mistakes={mistakes}
        onPlayAgain={() => start(settings)}
      />
    )
  }

  const round = state.round!
  const locked = !!state.feedback && !state.feedback.retry
  const dragColorVar = round ? FAMILY_BY_ID[round.familyId].colorVar : '--fill-penicillin'

  return (
    <div className="app" data-layout={settings.layout}>
      <TopBar
        remaining={state.deck.length + 1}
        total={ANTIBIOTICS.length}
        onSkip={skip}
        onEnd={end}
        onOpenSettings={() => setShowSettings(true)}
        skipDisabled={!!state.feedback}
      />

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <main className="playfield">
          <Grid board={state.board} feedback={state.feedback} activeFamilyId={round.familyId} />
        </main>

        <div className="dock">
          {state.feedback && (
            <FeedbackBanner
              feedback={state.feedback}
              tryAgainEnabled={settings.tryAgain}
              onContinue={cont}
              onTryAgain={tryAgain}
              onReveal={reveal}
            />
          )}
          <Tray round={round} locked={locked} />
        </div>

        <DragOverlay dropAnimation={null}>
          {dragName && (
            <span className="block block--overlay" style={{ background: `var(${dragColorVar})` }}>
              {dragName}
            </span>
          )}
        </DragOverlay>
      </DndContext>

      <Legend />

      {showSettings && (
        <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}
