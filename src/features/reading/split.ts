/**
 * Allège les longs paragraphes à l'affichage : un paragraphe de plus de ~90 mots est coupé
 * en plusieurs, uniquement aux fins de phrase. Le texte n'est pas modifié, seulement sa présentation.
 */
import type { Run } from '@/content/types'

const words = (s: string) => s.split(/\s+/).filter(Boolean).length

/** Fin de phrase suivie d'une majuscule, sauf après une abréviation courante (« St. Mary's », « e.g. Oak »). */
const SENTENCE_END =
  /(?<=[.!?]["”’)]?)(?<!\b(?:St|Dr|Mr|Mrs|Ms|Prof|No|nr|approx|c|e\.g|i\.e|vs|var|sp|spp|ssp)\.)\s+(?=["“(]?[A-Z])/

export function splitLongParagraph(runs: Run[], target = 70): Run[][] {
  const total = runs.reduce((n, r) => n + words(r.text), 0)
  if (total <= Math.round(target * 1.3)) return [runs]

  const chunks: Run[][] = []
  let current: Run[] = []
  let count = 0
  let seen = 0

  for (const r of runs) {
    // Liens et passages mis en forme : jamais coupés.
    if (r.href || r.em || r.strong) {
      current.push(r)
      count += words(r.text)
      seen += words(r.text)
      continue
    }
    const sentences = r.text.split(SENTENCE_END)
    sentences.forEach((sentence, i) => {
      const isLast = i === sentences.length - 1
      current.push({ ...r, text: sentence + (isLast ? '' : ' ') })
      count += words(sentence)
      seen += words(sentence)
      // On coupe après une phrase si le morceau est assez long et qu'il reste assez de texte derrière.
      if (!isLast && count >= target && total - seen >= 25) {
        current[current.length - 1]!.text = sentence
        chunks.push(current)
        current = []
        count = 0
      }
    })
  }
  if (current.length) chunks.push(current)
  return chunks.map((c) => c.filter((r) => r.text !== ''))
}

/** Temps de lecture arrondi (≈ 200 mots par minute), au moins 1 minute */
export function readingMinutes(text: string): number {
  return Math.max(1, Math.round(words(text) / 200))
}
