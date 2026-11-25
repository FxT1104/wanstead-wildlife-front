import { computed, ref } from 'vue'
import { collectBlocks, pickVoice, type ReadBlock } from './readAloud'

type State = 'idle' | 'playing' | 'paused'

const HIGHLIGHT = 'is-being-read'

export const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

// État partagé : un seul lecteur pour tout le site.
const state = ref<State>('idle')
const index = ref(0)
const total = ref(0)
const rate = ref(1)
let blocks: ReadBlock[] = []
/** Numéro de lecture : ignore les événements d'un énoncé annulé (cancel déclenche « end » ou « error ») */
let run = 0

function highlight(i: number | null) {
  document.querySelectorAll(`.${HIGHLIGHT}`).forEach((el) => el.classList.remove(HIGHLIGHT))
  if (i === null) return
  const el = blocks[i]?.el
  if (!el) return
  el.classList.add(HIGHLIGHT)
  const reduce =
    document.documentElement.classList.contains('reduce-motion') ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
}

function speak(i: number) {
  const synth = window.speechSynthesis
  synth.cancel()
  const block = blocks[i]
  if (!block) return stop()
  index.value = i
  state.value = 'playing'
  highlight(i)
  const current = ++run
  const utterance = new SpeechSynthesisUtterance(block.text)
  const voice = pickVoice(synth.getVoices())
  if (voice) utterance.voice = voice
  utterance.lang = voice?.lang ?? 'en-GB'
  utterance.rate = rate.value
  utterance.onend = () => {
    if (current === run && state.value === 'playing') speak(i + 1)
  }
  utterance.onerror = (e) => {
    // « interrupted » / « canceled » : causés par nos propres pause, stop ou saut de bloc.
    if (current === run && e.error !== 'interrupted' && e.error !== 'canceled') stop()
  }
  synth.speak(utterance)
}

function start(root: Element | null = document.getElementById('main')) {
  if (!speechSupported || !root) return
  blocks = collectBlocks(root)
  total.value = blocks.length
  if (blocks.length) speak(0)
}

/** Pause « dure » (annule puis reprend au début du bloc) : pause()/resume() natifs sont peu fiables selon les navigateurs. */
function pause() {
  if (state.value !== 'playing') return
  run++
  window.speechSynthesis.cancel()
  state.value = 'paused'
}

function resume() {
  if (state.value === 'paused') speak(index.value)
}

function stop() {
  run++
  if (speechSupported) window.speechSynthesis.cancel()
  highlight(null)
  state.value = 'idle'
  blocks = []
  total.value = 0
  index.value = 0
}

function skip(delta: number) {
  if (state.value === 'idle') return
  const next = Math.min(Math.max(index.value + delta, 0), blocks.length - 1)
  if (state.value === 'paused') {
    index.value = next
    highlight(next)
  } else speak(next)
}

function setRate(value: number) {
  rate.value = value
  if (state.value === 'playing') speak(index.value)
}

export function useReadAloud() {
  return {
    supported: speechSupported,
    state,
    rate,
    position: computed(() => (total.value ? `${index.value + 1} of ${total.value}` : '')),
    start,
    pause,
    resume,
    stop,
    previous: () => skip(-1),
    next: () => skip(1),
    setRate,
  }
}
