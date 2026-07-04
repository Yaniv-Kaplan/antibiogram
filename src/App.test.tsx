import { afterEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import App from './App'

// Tell React we're in a proper act() environment (silences the dev warning).
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

// Smoke test: render the whole app in jsdom to catch component/runtime crashes,
// then exercise the start -> playing transition.

let container: HTMLDivElement
let root: Root

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

function render() {
  container = document.createElement('div')
  document.body.appendChild(container)
  act(() => {
    root = createRoot(container)
    root.render(<App />)
  })
}

describe('App smoke', () => {
  it('renders the start screen and can begin a session', () => {
    render()
    expect(container.textContent).toContain('Antibiogram Trainer')

    const startBtn = [...container.querySelectorAll('button')].find((b) =>
      b.textContent?.startsWith('Start'),
    )
    expect(startBtn).toBeTruthy()

    act(() => startBtn!.dispatchEvent(new MouseEvent('click', { bubbles: true })))

    // The grid should now be present with germ headers and family rows.
    expect(container.querySelector('.grid')).toBeTruthy()
    expect(container.textContent).toContain('Streptococci')
    expect(container.textContent).toContain('antibiotics left')
  })
})
