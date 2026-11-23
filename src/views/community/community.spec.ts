import { beforeEach, describe, expect, it, vi } from 'vitest'
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
  return { wrapper, router }
}

describe('community journal (local mode)', () => {
  beforeEach(() => localStorage.clear())

  it('lists the example notes and offers to write one', async () => {
    const { wrapper } = await render('/community')
    expect(wrapper.find('h1').text()).toBe('Community journal')
    expect(wrapper.findAll('.journal-list li')).toHaveLength(3)
    expect(wrapper.find('a.journal-write').attributes('href')).toBe('/community/write')
    wrapper.unmount()
  })

  it('filters by category from the query string', async () => {
    const { wrapper } = await render('/community?category=Birds')
    const items = wrapper.findAll('.journal-list li')
    expect(items).toHaveLength(1)
    expect(items[0]!.text()).toContain('The robin beside the path')
    wrapper.unmount()
  })

  it('shows an error summary and keeps focus on it when the form is incomplete', async () => {
    const { wrapper } = await render('/community/write')
    await wrapper.find('form.community-form').trigger('submit')
    await flushPromises()

    const summary = wrapper.find('.error-summary')
    expect(summary.exists()).toBe(true)
    expect(document.activeElement).toBe(summary.element)
    expect(summary.findAll('a').map((a) => a.attributes('href'))).toEqual(['#title', '#category', '#body'])
    expect(wrapper.find('#title').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('#title').attributes('aria-describedby')).toBe('title-error')
    wrapper.unmount()
  })

  it('publishes a note and opens it', async () => {
    const { wrapper, router } = await render('/community/write')
    await wrapper.find('#title').setValue('Frogspawn in the ditch')
    await wrapper.find('#category').setValue('Pond life')
    await wrapper.find('#body').setValue('Three clumps near the path.')
    await wrapper.find('form.community-form').trigger('submit')
    await flushPromises()

    // La page article est chargée à la demande (import dynamique) : on attend la navigation.
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('community-article'))
    await flushPromises()
    expect(wrapper.find('h1').text()).toBe('Frogspawn in the ditch')
    expect(wrapper.find('[role="status"]').text()).toBe('Your article has been published.')
    expect(wrapper.find('.article-meta').text()).toContain('A visitor')
    wrapper.unmount()
  })

  it('shows a single H1 for an unknown article', async () => {
    const { wrapper } = await render('/community/unknown-id')
    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe('Article not found')
    wrapper.unmount()
  })
})
