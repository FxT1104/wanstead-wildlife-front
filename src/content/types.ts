/**
 * Modèle du contenu migré depuis le site actuel (wansteadwildlife.org.uk).
 * Même forme que les futures entités Species / Place de l'API : le jour où elles existent,
 * seul src/content/index.ts change, pas les pages.
 *
 * Règles :
 * - un texte = une liste de paragraphes (string[]), en texte brut ;
 * - toute photo a un `alt` qui décrit ce qu'elle montre (WCAG 1.1.1) ;
 * - un champ inconnu reste absent : la page masque la section, elle n'invente rien.
 */

export interface Photo {
  /** Chemin dans public/ (ex. /photos/places/wanstead-park.webp) ou URL */
  src: string
  /** Description pour les personnes qui ne voient pas l'image */
  alt: string
  caption?: string
  /** Auteur de la photo (par défaut : Paul Ferris) */
  credit?: string
  width?: number
  height?: number
}

/** Une observation locale (tableau « Local records ») */
export interface Observation {
  /** Date telle qu'elle figure dans la source (ex. « 12 May 2019 » ou « 1987 ») */
  date: string
  /** Slug d'un lieu de src/data/catalogue.ts, ou texte libre */
  location: string
  observation: string
  /** Initiales de l'observateur (voir la page Abbreviations) */
  observer?: string
}

export interface Species {
  slug: string
  /** Slug du groupe (src/data/catalogue.ts) */
  group: string
  commonName: string
  scientificName?: string
  family?: string
  /** Période d'observation, ex. « April to September » */
  season?: string
  intro?: string[]
  identification?: string[]
  habitat?: string[]
  /** Flore uniquement */
  floweringAndFruiting?: string[]
  photos?: Photo[]
  records?: Observation[]
  /** Lieux où l'espèce est notée (slugs) */
  places?: string[]
}

export interface PlaceContent {
  slug: string
  intro?: string[]
  about?: string[]
  habitatsAndWildlife?: string[]
  atAGlance?: {
    location?: string
    habitats?: string
    access?: string
  }
  /** À n'afficher qu'une fois vérifié : des personnes handicapées s'en servent pour préparer leur visite. */
  accessInformation?: {
    pathsAndSurfaces?: string
    stepFreeAccess?: string
    facilitiesAndTransport?: string
    /** Date de la dernière vérification (ISO) */
    checkedOn?: string
  }
  photos?: Photo[]
}

/** Section d'une page d'information : titre facultatif + paragraphes, liste ou tableau */
export interface InfoSection {
  heading?: string
  paragraphs?: string[]
  list?: string[]
  /** Liste de définitions, ex. abréviations */
  definitions?: { term: string; description: string }[]
  table?: { caption: string; columns: string[]; rows: string[][] }
  photos?: Photo[]
}

export interface InfoPage {
  slug: string
  title: string
  /** Phrase affichée sur la page About */
  summary: string
  /** Regroupement sur la page About */
  theme: 'website' | 'wildlife' | 'records'
  sections: InfoSection[]
}

// --- Pages d'archive : contenu migré tel quel depuis le site actuel -------------------------
// Produites par scripts/migration (npm run migrate:build), lues par les pages du site.

/** Morceau de texte d'un paragraphe : texte simple, lien, emphase */
export interface Run {
  text: string
  /** Lien : route du nouveau site (/archive/…, /places/…) ou adresse externe */
  href?: string
  em?: boolean
  strong?: boolean
  /**
   * Complément lu par les lecteurs d'écran quand le texte du lien ne suffit pas
   * (« click here » → « click here: Wanstead Park plant list »), WCAG 2.4.4.
   */
  label?: string
}

export type Block =
  | { type: 'heading'; level: 2 | 3 | 4; text: string }
  | { type: 'paragraph'; runs: Run[] }
  | { type: 'list'; ordered: boolean; items: Run[][] }
  | { type: 'table'; header: string[] | null; rows: string[][] }
  | {
      type: 'image'
      /** Adresse de l'image sur le site source (ou copie locale dans public/photos/) */
      src: string
      alt: string
      caption?: string
      /** true si la description d'origine n'est qu'un nom de fichier : à réécrire (WCAG 1.1.1) */
      altNeedsReview?: boolean
    }

/** Entrée de l'index des pages migrées (public/archive/index.json) */
export type ArchiveEntry = Omit<ArchivePage, 'blocks'>

export interface ArchivePage {
  /** Identifiant dans l'URL : /archive/<slug> */
  slug: string
  title: string
  /** Rubrique d'origine (titre du menu qui liste la page), ex. « Wanstead Park » */
  section: string | null
  /** Adresse sur le site actuel */
  sourceUrl: string
  /** Page correspondante du nouveau site, si elle existe (groupe, lieu, page d'information) */
  target: { kind: 'group' | 'place' | 'info'; slug: string } | null
  /**
   * Rubrique du nouveau site où la page est listée (« More about Insects », page News…).
   * null : seulement dans l'index complet /archive.
   */
  home: { kind: 'group' | 'place' | 'info'; slug: string } | { kind: 'news' } | null
  /** Page-liste de l'ancien site (pagination de blog) : doublonne des articles, non listée dans les rubriques */
  listing: boolean
  /** Ordre d'ancienneté (numéro d'article Joomla, plus grand = plus récent ; 0 si inconnu) */
  order: number
  /** Début du texte (≈ 180 caractères), pour les cartes d'aperçu */
  excerpt: string
  /** Première photo de la page, pour les cartes d'aperçu (null s'il n'y en a pas) */
  image: string | null
  blocks: Block[]
}
