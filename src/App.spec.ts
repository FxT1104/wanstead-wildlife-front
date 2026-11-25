import { describe, expect, it } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from './App.vue'
import { routes } from './router'

async function render(path: string) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [router] }, attachTo: document.body })
  await flushPromises()
  return { wrapper, router }
}

// Vérifications structurelles de base sur chaque page (WCAG 1.3.1 / 2.4.1).
const paths = [
  '/',
  '/wildlife',
  '/wildlife/birds',
  '/places',
  '/places/wanstead-park',
  '/community',
  '/community/write',
  '/about',
  '/about/the-study-area',
  '/places/leyton-flats',
  '/search',
  '/accessibility',
  '/help',
  '/privacy',
  '/account/sign-in',
  '/account/create',
  '/does-not-exist',
]

describe.each(paths)('page %s', (path) => {
  it('has a skip link, a single <main> and exactly one <h1>', async () => {
    const { wrapper } = await render(path)
    expect(wrapper.find('a.skip').attributes('href')).toBe('#main')
    expect(wrapper.findAll('main#main')).toHaveLength(1)
    expect(wrapper.findAll('h1')).toHaveLength(1)
    wrapper.unmount()
  })
})

describe('routing', () => {
  it('shows the 404 page for an unknown wildlife group', async () => {
    const { wrapper, router } = await render('/wildlife/dragons')
    expect(router.currentRoute.value.name).toBe('not-found')
    expect(wrapper.find('h1').text()).toBe('Page not found')
    wrapper.unmount()
  })

  it('marks the current page in the main navigation', async () => {
    const { wrapper } = await render('/places')
    const current = wrapper.findAll('#site-nav a[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0]!.text()).toBe('Places')
    wrapper.unmount()
  })
})
