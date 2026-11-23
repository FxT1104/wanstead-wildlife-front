import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/App.vue'
import { installRouterHooks, routes } from '@/router'

// L'archive migrée (public/archive) n'est pas servie pendant les tests : pages sans contenu migré.

// Contenu de test : simule ce que la migration ajoutera dans src/content/.
vi.mock('@/content/species', () => ({
  species: [
    {
      slug: 'test-heron',
      group: 'birds',
      commonName: 'Test Heron',
      scientificName: 'Ardea testa',
      season: 'All year',
      intro: ['First paragraph.', 'Second paragraph.'],
      habitat: ['Near water.'],
      photos: [{ src: '/photos/heron.webp', alt: 'A heron standing in shallow water', credit: 'Paul Ferris' }],
      records: [{ date: '1987', location: 'wanstead-park', observation: 'Two birds', observer: 'PF' }],
      places: ['wanstead-park'],
    },
    {
      slug: 'test-bluebell',
      group: 'plants',
      commonName: 'Test Bluebell',
      floweringAndFruiting: ['April and May.'],
    },
  ],
}))

vi.mock('@/content/places', () => ({
  placeContent: [
    {
      slug: 'wanstead-park',
      about: ['About the park.'],
      atAGlance: { habitats: 'Woodland, lakes' },
      accessInformation: { stepFreeAccess: 'Main paths are step-free.', checkedOn: '2026-11-20' },
    },
  ],
}))

async function render(path: string) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  installRouterHooks(router)
  router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [router] }, attachTo: document.body })
  await flushPromises()
  return { wrapper, router }
}

describe('wildlife group page', () => {
  it('lists the species of the group with links to their profiles', async () => {
    const { wrapper } = await render('/wildlife/birds')
    expect(wrapper.find('h1').text()).toBe('Birds')
    const link = wrapper.find('.species-list a')
    expect(link.text()).toContain('Test Heron')
    expect(link.attributes('href')).toBe('/wildlife/birds/test-heron')
    expect(wrapper.find('.content-pending').exists()).toBe(false)
    wrapper.unmount()
  })

  it('says the content is coming when a group has no species yet', async () => {
    const { wrapper } = await render('/wildlife/spiders')
    expect(wrapper.find('.content-pending').text()).toContain('The list of spiders is being moved')
    wrapper.unmount()
  })
})

describe('species profile', () => {
  it('shows only the sections that have content', async () => {
    const { wrapper } = await render('/wildlife/birds/test-heron')
    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe('Test Heron')
    const headings = wrapper.findAll('h2').map((h) => h.text())
    expect(headings).toContain('Habitat')
    expect(headings).toContain('Local records')
    expect(headings).not.toContain('Identification')
    expect(headings).not.toContain('Flowering & fruiting')
    expect(wrapper.find('img[alt="A heron standing in shallow water"]').exists()).toBe(true)
    expect(wrapper.find('.records-table caption').text()).toBe('Local records of Test Heron')
    expect(wrapper.find('.records-table tbody td:nth-child(2)').text()).toBe('Wanstead Park')
    expect(wrapper.find('.fact-panel').text()).not.toContain('Family')
    expect(document.title).toBe('Test Heron — Wanstead Wildlife')
    wrapper.unmount()
  })

  it('uses the flora template for plants', async () => {
    const { wrapper } = await render('/wildlife/plants/test-bluebell')
    expect(wrapper.find('.eyebrow').text()).toBe('FLORA PROFILE')
    expect(wrapper.findAll('h2').map((h) => h.text())).toContain('Flowering & fruiting')
    wrapper.unmount()
  })

  it('shows the 404 page for an unknown species or a species in the wrong group', async () => {
    for (const path of ['/wildlife/birds/dodo', '/wildlife/mammals/test-heron']) {
      const { wrapper, router } = await render(path)
      expect(router.currentRoute.value.name).toBe('not-found')
      wrapper.unmount()
    }
  })
})

describe('place page', () => {
  it('shows migrated content, species seen there and checked access details', async () => {
    const { wrapper } = await render('/places/wanstead-park')
    expect(wrapper.find('h1').text()).toBe('Wanstead Park')
    expect(wrapper.find('.content-pending').exists()).toBe(false)
    expect(wrapper.text()).toContain('About the park.')
    expect(wrapper.find('.species-list').text()).toContain('Test Heron')
    expect(wrapper.find('.access-information').text()).toContain('Main paths are step-free.')
    expect(wrapper.find('.access-information').text()).toContain('Last checked on 20 November 2026')
    wrapper.unmount()
  })

  it('never shows unchecked access details', async () => {
    const { wrapper } = await render('/places/bush-wood')
    expect(wrapper.find('.content-pending').exists()).toBe(true)
    expect(wrapper.find('.access-information').text()).toContain('have not been checked yet')
    expect(wrapper.find('.place-pager').text()).toContain('Previous site: Alders Brook')
    wrapper.unmount()
  })
})

describe('about pages', () => {
  it('links to every information page, grouped by theme', async () => {
    const { wrapper } = await render('/about')
    expect(wrapper.findAll('.about-link')).toHaveLength(12)
    expect(wrapper.findAll('main h3').map((h) => h.text())).toEqual([
      'The website and its author',
      'Wildlife and the study area',
      'Reports and updates',
    ])
    wrapper.unmount()
  })

  it('shows an information page with related pages', async () => {
    const { wrapper } = await render('/about/abbreviations')
    expect(wrapper.find('h1').text()).toBe('Abbreviations')
    expect(wrapper.find('.related-pages').text()).toContain('About me')
    expect(document.title).toBe('Abbreviations — Wanstead Wildlife')
    wrapper.unmount()
  })
})
