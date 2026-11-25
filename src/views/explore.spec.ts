import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/App.vue'
import { routes } from '@/router'

async function render(path: string) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [router] }, attachTo: document.body })
  await flushPromises()
  return wrapper
}

// Wildlife et Places utilisent le même composant : même structure, même filtre.
describe.each([
  { path: '/wildlife', h1: 'The livinglandscape.', summary: 'Explore wildlife', count: 15, query: 'frog', hits: ['Fish, Amphibians, Reptiles'] },
  { path: '/places', h1: 'Places todiscover.', summary: 'Explore places', count: 9, query: 'wanstead', hits: ['Wanstead Flats', 'Wanstead Park'] },
])('$path entry page', ({ path, h1, summary, count, query, hits }) => {
  it('shows the cover, the breadcrumb and a filterable list of links', async () => {
    const wrapper = await render(path)
    expect(wrapper.find('h1').text()).toBe(h1)
    expect(wrapper.find('.book-path [aria-current="page"]').exists()).toBe(true)
    expect(wrapper.find('.book-finder summary').text()).toBe(summary)
    expect(wrapper.findAll('.book-picker li a')).toHaveLength(count)

    await wrapper.find('#book-query').setValue(query)
    expect(wrapper.findAll('.book-picker strong').map((s) => s.text())).toEqual(hits)
    expect(wrapper.find('.book-count').text()).toBe(`${hits.length} ${path === '/wildlife' ? 'groups' : 'places'}`.replace(/^1 (\w+)s$/, '1 $1'))
    wrapper.unmount()
  })
})
