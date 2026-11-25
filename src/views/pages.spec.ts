import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/App.vue'
import { installRouterHooks, routes } from '@/router'
import { setToken } from '@/api/client'
import { fakeJwt } from '@/test/jwt'

async function render(path: string) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  installRouterHooks(router)
  router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [router] }, attachTo: document.body })
  await flushPromises()
  return { wrapper, router }
}

const signIn = (roles: string[]) => setToken(fakeJwt({ username: 'someone@example.test', roles, exp: 2_000_000_000 }))

function mockApi(handler: (method: string, url: string, body: unknown) => [number, unknown?]) {
  const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
    const body = typeof init.body === 'string' ? JSON.parse(init.body) : undefined
    const [status, data] = handler(init.method ?? 'GET', url, body)
    return new Response(data === undefined ? null : JSON.stringify(data), { status })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

beforeEach(() => {
  localStorage.clear()
  setToken(null)
})
afterEach(() => vi.unstubAllGlobals())

describe('access control', () => {
  it('sends visitors to the sign-in page and remembers where they were going', async () => {
    const { router, wrapper } = await render('/admin/articles')
    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/admin/articles')
    wrapper.unmount()
  })

  it('refuses the admin area to signed-in users without ROLE_ADMIN', async () => {
    signIn(['ROLE_USER'])
    const { router, wrapper } = await render('/admin')
    expect(router.currentRoute.value.name).toBe('forbidden')
    expect(wrapper.find('h1').text()).toBe('Access restricted')
    wrapper.unmount()
  })

  it('shows Sign in or My account in the header', async () => {
    let r = await render('/')
    expect(r.wrapper.find('.header-tools').text()).toContain('Sign in')
    r.wrapper.unmount()
    signIn(['ROLE_ADMIN'])
    r = await render('/')
    expect(r.wrapper.find('.header-tools').text()).toContain('My account')
    expect(r.wrapper.find('.header-tools').text()).toContain('Admin')
    r.wrapper.unmount()
  })
})

describe('sign in', () => {
  it('stores the token and follows the redirect', async () => {
    const token = fakeJwt({ username: 'admin@example.test', roles: ['ROLE_ADMIN'], exp: 2_000_000_000 })
    const fetchMock = mockApi((method, url) => {
      if (method === 'POST' && url === '/api/login') return [200, { token }]
      if (url.startsWith('/api/support_requests')) return [404]
      return [200, { member: [], totalItems: 0 }]
    })
    const { wrapper, router } = await render('/account/sign-in?redirect=/admin')
    await wrapper.find('#email').setValue('admin@example.test')
    await wrapper.find('#password').setValue('a long password')
    await wrapper.find('form').trigger('submit')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('admin'))

    const [, init] = fetchMock.mock.calls[0]!
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json')
    wrapper.unmount()
  })

  it('shows a generic message for wrong credentials', async () => {
    mockApi(() => [401, { message: 'Invalid credentials.' }])
    const { wrapper } = await render('/account/sign-in')
    await wrapper.find('#email').setValue('a@b.test')
    await wrapper.find('#password').setValue('wrong')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('.error-summary').text()).toContain('The email address or password is incorrect.')
    expect((wrapper.find('#password').element as HTMLInputElement).value).toBe('')
    wrapper.unmount()
  })
})

describe('help requests (local mode)', () => {
  it('sends a request, shows its reference and lets the admin close it', async () => {
    let r = await render('/help?topic=accessibility')
    expect((r.wrapper.find('#topic').element as HTMLSelectElement).value).toBe('accessibility')
    await r.wrapper.find('#subject').setValue('Contrast too low')
    await r.wrapper.find('#description').setValue('The footer links are hard to read.')
    await r.wrapper.find('form.community-form').trigger('submit')
    await flushPromises()

    expect(r.wrapper.find('.success-message').text()).toMatch(/Your reference is [0-9A-F]{8}/)
    expect(r.wrapper.find('.request-list').text()).toContain('Received')
    r.wrapper.unmount()

    signIn(['ROLE_ADMIN'])
    r = await render('/admin/support')
    await vi.waitFor(() => expect(r.wrapper.find('.request-list').exists()).toBe(true))
    await r.wrapper.find('.request-list button.primary').trigger('click')
    await flushPromises()
    expect(r.wrapper.find('[role="status"]').text()).toContain('is now “Closed”')
    r.wrapper.unmount()
  })
})

describe('privacy', () => {
  it('deletes local data after confirmation and signs the user out', async () => {
    localStorage.setItem('ww:preferences', JSON.stringify({ scale: 130 }))
    signIn(['ROLE_USER'])
    const { wrapper } = await render('/privacy')
    await wrapper.find('button.danger-button').trigger('click')
    await wrapper.find('[role="group"] button.danger-button').trigger('click')
    await flushPromises()

    expect(localStorage.getItem('ww:community')).toBeNull()
    expect(wrapper.find('.header-tools').text()).toContain('Sign in')
    expect(wrapper.text()).toContain('has been deleted')
    wrapper.unmount()
  })
})

describe('admin articles', () => {
  it('creates an article with a slug generated from the title', async () => {
    signIn(['ROLE_ADMIN'])
    let posted: Record<string, unknown> | undefined
    mockApi((method, url, body) => {
      if (url === '/api/categories')
        return [200, { member: [{ '@id': '/api/categories/1', '@type': 'Category', id: 1, name: 'Birds', slug: 'birds', description: null }], totalItems: 1 }]
      if (method === 'POST' && url === '/api/articles') {
        posted = body as Record<string, unknown>
        return [201, { ...posted, id: 7, '@id': '/api/articles/7', '@type': 'Article', createdAt: '2026-11-20T10:00:00+00:00' }]
      }
      if (url === '/api/articles/7')
        return [200, { ...posted, id: 7, '@id': '/api/articles/7', '@type': 'Article', createdAt: '2026-11-20T10:00:00+00:00' }]
      return [404]
    })

    const { wrapper, router } = await render('/admin/articles/new')
    await vi.waitFor(() => expect(wrapper.find('#title').exists()).toBe(true))
    await wrapper.find('#title').setValue('Herons on Heronry Pond')
    await wrapper.find('#category').setValue('/api/categories/1')
    await wrapper.find('#content').setValue('A colony of grey herons.')
    await wrapper.find('form').trigger('submit')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('admin-article-edit'))

    expect(posted).toMatchObject({
      title: 'Herons on Heronry Pond',
      slug: 'herons-on-heronry-pond',
      category: '/api/categories/1',
      publishedAt: null,
    })
    wrapper.unmount()
  })
})
