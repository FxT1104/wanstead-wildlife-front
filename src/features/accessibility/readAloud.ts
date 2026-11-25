/**
 * Lecture à voix haute du contenu de la page (« Listen to this page »).
 *
 * S'appuie sur la synthèse vocale intégrée au navigateur (Web Speech API, speechSynthesis) : rien à installer,
 * aucune donnée envoyée à un service tiers par le site. Utile aux personnes malvoyantes, dyslexiques ou qui
 * comprennent mieux à l'écoute. Les personnes aveugles utilisent en général leur propre lecteur d'écran
 * (NVDA, JAWS, VoiceOver, TalkBack) : le site reste compatible grâce au HTML sémantique et aux attributs ARIA.
 *
 * La page est lue bloc par bloc (titre, paragraphe, élément de liste…) : on peut avancer, reculer,
 * et le bloc lu est surligné. Une phrase par énoncé évite aussi la coupure de Chrome sur les longs textes.
 */

export interface ReadBlock {
  el: Element
  text: string
}

/** Éléments lus, du plus général au plus fin ; un élément qui en contient un autre est ignoré (pas de doublon). */
const READABLE = 'h1, h2, h3, h4, h5, h6, p, li, blockquote, figcaption, dt, dd, caption, img[alt]'
/** Parties ignorées : navigation, formulaires, éléments masqués ou purement visuels */
const SKIPPED =
  'nav, form, button, dialog, script, style, noscript, [hidden], [aria-hidden="true"], .sr-only, .read-aloud-skip, table'

const clean = (text: string) => text.replace(/\s+/g, ' ').trim()

/** Visible à l'écran (les éléments masqués en CSS ne sont pas lus) */
export function isVisible(el: Element): boolean {
  return el.getClientRects().length > 0
}

/**
 * Blocs à lire dans `root`, dans l'ordre du document.
 * Les tableaux ne sont pas lus cellule par cellule : on annonce leur titre.
 */
export function collectBlocks(root: Element, visible: (el: Element) => boolean = isVisible): ReadBlock[] {
  const blocks: ReadBlock[] = []
  const candidates = root.querySelectorAll(`${READABLE}, table`)
  for (const el of candidates) {
    if (el.tagName === 'TABLE') {
      if (el.parentElement?.closest(SKIPPED) || !visible(el)) continue
      const caption = clean(el.querySelector('caption')?.textContent ?? '')
      blocks.push({ el, text: caption ? `Table: ${caption}. The table is not read aloud.` : 'A table follows. It is not read aloud.' })
      continue
    }
    if (el.closest(SKIPPED) || !visible(el)) continue
    if (el.tagName === 'IMG') {
      const alt = clean(el.getAttribute('alt') ?? '')
      if (alt) blocks.push({ el, text: `Image: ${alt}` })
      continue
    }
    // Conteneur d'autres blocs (ex. <li> qui contient des <p>) : ses enfants seront lus un par un.
    if (el.querySelector(READABLE.replace(', img[alt]', ''))) continue
    const text = clean((el as HTMLElement).innerText ?? el.textContent ?? '')
    if (text) blocks.push({ el, text })
  }
  return blocks
}

/** Voix anglaise, britannique de préférence (le site est en anglais britannique) */
export function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return (
    voices.find((v) => v.lang === 'en-GB' && v.localService) ??
    voices.find((v) => v.lang === 'en-GB') ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null
  )
}

export const RATES = [
  { value: 0.75, label: 'Slow' },
  { value: 1, label: 'Normal' },
  { value: 1.25, label: 'Fast' },
] as const
