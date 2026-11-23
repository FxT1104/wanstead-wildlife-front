import type { InfoPage } from './types'

/**
 * Pages d'information (rubrique « About the Website » du site actuel).
 * Titres et résumés repris du prototype ; `sections` est à remplir pendant la migration.
 */
export const infoPages: InfoPage[] = [
  {
    slug: 'about-the-website',
    title: 'About the Website',
    summary: 'How the website started, what it covers and how it is kept up to date.',
    theme: 'website',
    sections: [],
  },
  {
    slug: 'about-me',
    title: 'About me',
    summary: 'The naturalist behind more than forty years of local records.',
    theme: 'website',
    sections: [],
  },
  {
    slug: 'list-of-people',
    title: 'List of people',
    summary: 'The people who contributed records and photographs.',
    theme: 'website',
    sections: [],
  },
  {
    slug: 'list-of-places',
    title: 'List of places',
    summary: 'Every place name used in the records, and where to find it.',
    theme: 'website',
    sections: [],
  },
  {
    slug: 'abbreviations',
    title: 'Abbreviations',
    summary: 'What the abbreviations used in the records mean.',
    theme: 'website',
    sections: [],
  },
  {
    slug: 'web-links',
    title: 'Web links',
    summary: 'Local groups, societies and websites about wildlife and conservation.',
    theme: 'website',
    sections: [],
  },
  {
    slug: 'wildlife-information',
    title: 'Wildlife information',
    summary: 'General information about the wildlife recorded in the area.',
    theme: 'wildlife',
    sections: [],
  },
  {
    slug: 'wildlife-photos',
    title: 'Wildlife photos',
    summary: 'Photographs of the animals, plants and fungi of the area.',
    theme: 'wildlife',
    sections: [],
  },
  {
    slug: 'the-study-area',
    title: 'The study area',
    summary: 'The southern part of Epping Forest covered by the records.',
    theme: 'wildlife',
    sections: [],
  },
  {
    slug: 'photos-of-places',
    title: 'Photos of places',
    summary: 'Photographs of the sites in the study area.',
    theme: 'wildlife',
    sections: [],
  },
  {
    slug: 'published-reports',
    title: 'Published reports',
    summary: 'Reports and articles published about the wildlife of the area.',
    theme: 'records',
    sections: [],
  },
  {
    slug: 'new-and-revised-records-and-articles',
    title: 'New and revised records and articles',
    summary: 'The latest additions and corrections to the records.',
    theme: 'records',
    sections: [],
  },
]
