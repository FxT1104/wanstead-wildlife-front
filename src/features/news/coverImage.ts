/**
 * Image d'une carte d'article : sa première photo, sinon une illustration de groupe d'espèces
 * choisie d'après le sujet (titre + résumé). Toujours décorative dans la carte (le titre est le lien).
 */

/** Mots-clés → illustration (public/assets/groups/<slug>.webp). Le premier groupe trouvé gagne. */
const TOPICS: [RegExp, string][] = [
  [/\b(moths?|butterfl\w*|insects?|bees?|honey|wasps?|beetles?|dragonfl\w*|damselfl\w*|hoverfl\w*|bugs?|crickets?|grasshoppers?|invertebrates?)\b/i, 'insects'],
  [/\b(birds?|skylarks?|larks?|herons?|gulls?|owls?|robins?|ducks?|swans?|geese|goose|warblers?|finch\w*|wheatears?|kingfishers?|woodpeckers?|birding|nest\w*)\b/i, 'birds'],
  [/\b(fungi|fungus|mushrooms?|toadstools?)\b/i, 'fungi'],
  [/\b(mammals?|fox\w*|deer|bats?|mink|voles?|mice|mouse|otters?|hedgehogs?|squirrels?|badgers?|rats?|shrews?)\b/i, 'mammals'],
  [/\b(spiders?)\b/i, 'spiders'],
  [/\b(frogs?|toads?|newts?|fish|snakes?|reptiles?|amphibians?|lizards?|slow-?worms?)\b/i, 'fish-amphibians-reptiles'],
  [/\b(snails?|slugs?|molluscs?|crustaceans?)\b/i, 'molluscs-crustaceans'],
  [/\b(lichens?)\b/i, 'lichens'],
  [/\b(moss(es)?|liverworts?)\b/i, 'liverworts-mosses'],
  [/\b(galls?)\b/i, 'plant-galls'],
  [/\b(algae|pond life)\b/i, 'algae'],
  [/\b(plants?|trees?|flora|flowers?|willows?|pines?|oaks?|orchids?|grass(es|land)?|heath(er)?|hedges?|bluebells?|wood(land)?s?)\b/i, 'plants'],
]

/** Sujet reconnu (slug de groupe), ou null */
export function topicOf(text: string): string | null {
  return TOPICS.find(([re]) => re.test(text))?.[1] ?? null
}

/** Sujet non reconnu : un des paysages illustrés du site, choisi de façon stable d'après le titre (évite les répétitions). */
const LANDSCAPES = ['/assets/parkland-atlas.webp', '/assets/wanstead-fieldbook.webp']
function landscapeFor(title: string): string {
  let hash = 0
  for (const ch of title) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return LANDSCAPES[hash % LANDSCAPES.length]!
}

export interface Cover {
  src: string
  /** true : illustration d'espèce (fond clair, image entière, pas recadrée) */
  illustration: boolean
}

export function coverFor(entry: { title: string; excerpt: string; image: string | null }): Cover {
  if (entry.image) return { src: entry.image, illustration: false }
  const topic = topicOf(`${entry.title} ${entry.excerpt}`)
  return topic
    ? { src: `/assets/groups/${topic}.webp`, illustration: true }
    : { src: landscapeFor(entry.title), illustration: false }
}
