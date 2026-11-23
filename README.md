# Wanstead Wildlife – Front

Interface du site Wanstead Wildlife (projet « 67e compagnie », Polytech Nancy).
Vue 3 + TypeScript + Vite. Objectif d'accessibilité : WCAG 2.2 AA.

L'API Symfony est dans le dépôt `wanstead-wildlife-api`. Ce que le front attend d'elle est décrit dans [docs/api-contract.md](docs/api-contract.md).
Pour remplir les fiches espèces, lieux et pages d'information : [docs/content-migration.md](docs/content-migration.md).

## Démarrer

Prérequis : Node.js 22 ou plus récent.

```sh
npm install
npm run dev        # http://localhost:5173
```

Pour les pages qui utilisent l'API (connexion, espace admin), lancer aussi l'API (`docker compose up` dans `wanstead-wildlife-api`, port 8090). En développement, Vite relaie `/api/*` vers `http://localhost:8090`.

Configuration : copier `.env.example` en `.env.local` et adapter.

| Variable | Défaut | Rôle |
|---|---|---|
| `VITE_API_PROXY_TARGET` | `http://localhost:8090` | adresse de l'API pour le proxy de dev |
| `VITE_API_BASE_URL` | `/api` | préfixe des appels API |
| `VITE_COMMUNITY_BACKEND` | `local` | `api` quand `/api/community_posts` existera |
| `VITE_SUPPORT_BACKEND` | `local` | `api` quand `/api/support_requests` existera |

En mode `local`, le journal et les demandes d'aide sont stockés dans le navigateur : pratique pour développer et faire une démo, mais rien n'est partagé entre visiteurs.

## Commandes

| Commande | |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` | vérification des types puis build de production dans `dist/` |
| `npm run lint` | ESLint (TypeScript, Vue, règles d'accessibilité `vuejs-accessibility`) |
| `npm test` | tests Vitest |
| `npm run type-check` | vérification des types seule |
| `npm run migrate:crawl` | inventaire du site actuel (voir docs/content-migration.md) |
| `npm run migrate:build` | construit les pages migrées et les tableaux de suivi |

## Organisation

```
src/
  api/            client HTTP (JWT, JSON-LD, erreurs) et types des ressources de l'API
  components/     en-tête, pied de page, panneau d'accessibilité, récapitulatif d'erreurs,
                  blocs de contenu (fil d'Ariane, photo, tableau d'observations…)
  content/        contenu migré du site actuel (espèces, lieux, pages d'information)
  data/           liste des groupes d'espèces et des lieux
  features/       logique par fonctionnalité, sans interface
    accessibility/  préférences de lecture (profil d'accessibilité)
    auth/           connexion, rôles, compte
    community/      journal communautaire (service API / local, validation)
    support/        demandes d'aide (SAV)
    search/         recherche dans le catalogue
    privacy/        export et suppression des données locales (UK GDPR)
  router/         routes, titres de page, contrôle d'accès
  styles/         CSS du prototype (prototype/) + ajouts et corrections
  views/          une vue par page (admin/, account/, community/)
docs/             contrat d'API, guide de migration du contenu
```

## Pages

| Route | Accès | État |
|---|---|---|
| `/`, `/wildlife`, `/places` | public | reprises du prototype |
| `/wildlife/:group` | public | liste des espèces du groupe |
| `/wildlife/:group/:species` | public | fiche espèce (gabarit faune ou flore) |
| `/places/:place` | public | page lieu, avec informations d'accès vérifiées |
| `/about`, `/about/:page` | public | rubrique « About the Website » (11 pages) |
| `/archive`, `/archive/:slug` | public | toutes les pages migrées du site actuel |
| `/search` | public | recherche dans les groupes, lieux et pages d'information |
| `/community`, `/community/write`, `/community/:id` | public | journal des visiteurs |
| `/help` | public | formulaire SAV + suivi des demandes envoyées |
| `/accessibility`, `/privacy` | public | informations accessibilité et données personnelles |
| `/account/sign-in`, `/account/create`, `/account` | public / connecté | comptes |
| `/admin/...` | `ROLE_ADMIN` | articles, demandes d'aide, modération du journal |

Le contrôle d'accès du routeur ne fait qu'améliorer le parcours : la sécurité réelle doit être assurée par l'API.

## Accessibilité : règles suivies dans le code

- Une seule `h1` par page, un `main` unique ciblé par le lien « Skip to content ».
- À chaque changement de page : titre d'onglet mis à jour et focus placé sur `main`.
- Formulaires : `label` sur chaque champ, aides et erreurs reliées par `aria-describedby`, `aria-invalid`, récapitulatif des erreurs qui reçoit le focus.
- Messages dynamiques dans des zones `role="status"` ou `role="alert"`.
- Préférences de lecture (taille, contraste, palette, interligne, police, animations) appliquées sur `<html>`.

Ces règles et le lint ne remplacent pas l'audit (Lighthouse, WAVE, NVDA) ni les tests avec des personnes en situation de handicap.
