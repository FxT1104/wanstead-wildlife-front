import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type Router,
  type RouteRecordRaw,
} from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { places, wildlifeGroups } from '@/data/catalogue'
import { useAuth } from '@/features/auth/useAuth'
import { findInfoPage, findSpecies } from '@/content'

declare module 'vue-router' {
  interface RouteMeta {
    /** Titre de l'onglet (WCAG 2.4.2 : chaque page a un titre unique) */
    title: string | ((to: RouteLocationNormalized) => string)
    /** Classe posée sur <body>, utilisée par les feuilles de style du prototype */
    bodyClass?: string
    /** Classe posée sur <main> */
    mainClass?: string
    /** Réservé aux utilisateurs connectés */
    requiresAuth?: boolean
    /** Réservé aux administrateurs (ROLE_ADMIN) */
    requiresAdmin?: boolean
    /** Inutile une fois connecté (connexion, inscription) */
    guestOnly?: boolean
  }
}

const groupName = (to: RouteLocationNormalized) =>
  wildlifeGroups.find((g) => g.slug === to.params.group)?.name ?? 'Wildlife'
const placeName = (to: RouteLocationNormalized) => places.find((p) => p.slug === to.params.place)?.name ?? 'Places'

/** Slug inconnu : afficher la page 404 en conservant l'URL demandée. */
const notFound = (to: RouteLocationNormalized) => ({
  name: 'not-found',
  params: { pathMatch: to.path.slice(1).split('/') },
  query: to.query,
  hash: to.hash,
  replace: true,
})

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView, meta: { title: 'Home', bodyClass: 'nature-home' } },
  {
    path: '/wildlife',
    name: 'wildlife',
    component: () => import('@/views/WildlifeView.vue'),
    meta: { title: 'Wildlife', bodyClass: 'wildlife-book' },
  },
  {
    path: '/wildlife/:group',
    name: 'wildlife-group',
    component: () => import('@/views/wildlife/WildlifeGroupView.vue'),
    beforeEnter: (to) => wildlifeGroups.some((g) => g.slug === to.params.group) || notFound(to),
    props: true,
    meta: { title: groupName, bodyClass: 'editorial-support' },
  },
  {
    path: '/wildlife/:group/:species',
    name: 'species',
    component: () => import('@/views/wildlife/SpeciesView.vue'),
    beforeEnter: (to) => !!findSpecies(String(to.params.group), String(to.params.species)) || notFound(to),
    props: true,
    meta: {
      title: (to) => findSpecies(String(to.params.group), String(to.params.species))?.commonName ?? 'Species',
      bodyClass: 'editorial-support',
    },
  },
  {
    path: '/places',
    name: 'places',
    component: () => import('@/views/PlacesView.vue'),
    meta: { title: 'Places', bodyClass: 'wildlife-book' },
  },
  {
    path: '/places/:place',
    name: 'place',
    component: () => import('@/views/places/PlaceView.vue'),
    beforeEnter: (to) => places.some((p) => p.slug === to.params.place) || notFound(to),
    props: true,
    meta: { title: placeName, bodyClass: 'editorial-support' },
  },
  {
    path: '/community',
    name: 'community',
    component: () => import('@/views/community/CommunityView.vue'),
    meta: { title: 'Community journal', bodyClass: 'nature-inner', mainClass: 'community-page' },
  },
  {
    path: '/community/write',
    name: 'community-write',
    component: () => import('@/views/community/CommunityWriteView.vue'),
    meta: { title: 'Write an article', bodyClass: 'nature-inner', mainClass: 'community-page' },
  },
  {
    path: '/community/:id',
    name: 'community-article',
    component: () => import('@/views/community/CommunityArticleView.vue'),
    props: true,
    meta: { title: 'Community article', bodyClass: 'nature-inner', mainClass: 'community-page' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/about/AboutView.vue'),
    meta: { title: 'About the Website', bodyClass: 'nature-inner' },
  },
  {
    path: '/about/:page',
    name: 'info',
    component: () => import('@/views/about/InfoPageView.vue'),
    beforeEnter: (to) => !!findInfoPage(String(to.params.page)) || notFound(to),
    props: true,
    meta: { title: (to) => findInfoPage(String(to.params.page))?.title ?? 'About', bodyClass: 'editorial-support' },
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/SearchView.vue'),
    meta: { title: 'Search', bodyClass: 'editorial-support' },
  },
  {
    path: '/accessibility',
    name: 'accessibility',
    component: () => import('@/views/AccessibilityView.vue'),
    meta: { title: 'Accessibility information', bodyClass: 'editorial-support' },
  },
  {
    path: '/help',
    name: 'help',
    component: () => import('@/views/HelpView.vue'),
    meta: { title: 'Help and contact', bodyClass: 'editorial-support' },
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('@/views/PrivacyView.vue'),
    meta: { title: 'Your data', bodyClass: 'editorial-support' },
  },
  {
    path: '/news',
    name: 'news',
    component: () => import('@/views/news/NewsView.vue'),
    meta: { title: 'News', bodyClass: 'editorial-support' },
  },
  {
    path: '/news/:id(\\d+)/:slug?',
    name: 'news-article',
    component: () => import('@/views/news/NewsArticleView.vue'),
    props: (to) => ({ id: Number(to.params.id) }),
    meta: { title: 'News', bodyClass: 'editorial-support' },
  },
  // --- Archive : toutes les pages migrées du site actuel ----------------------
  {
    path: '/archive',
    name: 'archive',
    component: () => import('@/views/archive/ArchiveIndexView.vue'),
    meta: { title: 'Archive', bodyClass: 'editorial-support' },
  },
  {
    path: '/archive/:slug',
    name: 'archive-page',
    component: () => import('@/views/archive/ArchivePageView.vue'),
    props: true,
    meta: { title: 'Archive', bodyClass: 'editorial-support' },
  },
  // --- Comptes -------------------------------------------------------------
  {
    path: '/account/sign-in',
    name: 'login',
    component: () => import('@/views/account/LoginView.vue'),
    meta: { title: 'Sign in', bodyClass: 'editorial-support', guestOnly: true },
  },
  {
    path: '/account/create',
    name: 'register',
    component: () => import('@/views/account/RegisterView.vue'),
    meta: { title: 'Create an account', bodyClass: 'editorial-support', guestOnly: true },
  },
  {
    path: '/account',
    name: 'account',
    component: () => import('@/views/account/AccountView.vue'),
    meta: { title: 'My account', bodyClass: 'editorial-support', requiresAuth: true },
  },
  // --- Administration (ROLE_ADMIN) ------------------------------------------
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { title: 'Administration', bodyClass: 'editorial-support', requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'admin',
        component: () => import('@/views/admin/AdminHomeView.vue'),
        meta: { title: 'Administration' },
      },
      {
        path: 'articles',
        name: 'admin-articles',
        component: () => import('@/views/admin/AdminArticlesView.vue'),
        meta: { title: 'Articles · Administration' },
      },
      {
        path: 'articles/new',
        name: 'admin-article-new',
        component: () => import('@/views/admin/AdminArticleEditView.vue'),
        meta: { title: 'Write an article · Administration' },
      },
      {
        path: 'articles/:id(\\d+)',
        name: 'admin-article-edit',
        component: () => import('@/views/admin/AdminArticleEditView.vue'),
        props: true,
        meta: { title: 'Edit article · Administration' },
      },
      {
        path: 'support',
        name: 'admin-support',
        component: () => import('@/views/admin/AdminSupportView.vue'),
        meta: { title: 'Help requests · Administration' },
      },
      {
        path: 'community',
        name: 'admin-community',
        component: () => import('@/views/admin/AdminCommunityView.vue'),
        meta: { title: 'Community journal · Administration' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/PlaceholderView.vue'),
    props: { heading: 'Page not found', notFound: true },
    meta: { title: 'Page not found', bodyClass: 'editorial-support' },
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('@/views/PlaceholderView.vue'),
    props: { heading: 'Access restricted', forbidden: true },
    meta: { title: 'Access restricted', bodyClass: 'editorial-support' },
  },
]

/**
 * Hooks du routeur :
 * - contrôle d'accès côté navigateur (améliore le parcours ; la vraie protection est faite
 *   par l'API, qui vérifie le JWT à chaque requête) ;
 * - titre d'onglet, classe du <body> et focus sur <main> après chaque navigation.
 */
export function installRouterHooks(router: Router): void {
  router.beforeEach((to) => {
    const { isAuthenticated, isAdmin } = useAuth()
    const needsAdmin = to.matched.some((r) => r.meta.requiresAdmin)
    const needsAuth = needsAdmin || to.matched.some((r) => r.meta.requiresAuth)

    if (needsAuth && !isAuthenticated.value) return { name: 'login', query: { redirect: to.fullPath } }
    if (needsAdmin && !isAdmin.value) return { name: 'forbidden', replace: true }
    if (to.meta.guestOnly && isAuthenticated.value) return { name: 'account' }
    return true
  })

  let firstNavigation = true
  router.afterEach((to, from) => {
    // Lien vers un intertitre de la même page (sommaire) : le navigateur gère le focus, on ne touche à rien.
    if (to.path === from.path && to.hash && !firstNavigation) return
    const title = typeof to.meta.title === 'function' ? to.meta.title(to) : to.meta.title
    document.title = `${title} — Wanstead Wildlife`
    document.body.className = to.meta.bodyClass ?? ''

    // Dans une SPA, le lecteur d'écran n'est pas prévenu d'un changement de page :
    // on place le focus sur <main> (sauf au premier chargement).
    if (firstNavigation) {
      firstNavigation = false
      return
    }
    requestAnimationFrame(() => document.getElementById('main')?.focus())
  })
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Ancre (#intertitre) : on y va ; retour arrière : position mémorisée ; sinon haut de page.
  scrollBehavior: (to, _from, saved) => saved ?? (to.hash ? { el: to.hash, top: 16 } : { top: 0 }),
})
installRouterHooks(router)

export default router
