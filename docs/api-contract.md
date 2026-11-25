# Contrat d'API attendu par le front

Ce document liste ce que le front (`wanstead-wildlife-front`) attend de l'API Symfony (`wanstead-wildlife-api`).
Il sert de point de rendez-vous entre front et back : si une route change, mettre ce fichier à jour.

| Besoin | Statut côté API (20/11/2026) | Mode du front en attendant |
|---|---|---|
| Connexion / inscription | ✅ existe (`/api/login`, `/api/register`) | – |
| Compte connecté : `GET /api/me`, `DELETE /api/me` | ❌ à créer | « My account » affiche l'email du jeton ; la suppression renvoie vers le formulaire d'aide |
| Articles (admin) | ⚠️ existe mais **écriture ouverte à tous** : à sécuriser | – |
| Journal communautaire | ❌ à créer | stockage dans le navigateur (`VITE_COMMUNITY_BACKEND=local`) |
| Demandes d'aide (SAV) | ❌ à créer | stockage dans le navigateur (`VITE_SUPPORT_BACKEND=local`) |

Conventions : JSON-LD API Platform (`member`, `totalItems`, `view.next`), erreurs de validation en `422` avec `violations[].propertyPath` = nom du champ ci-dessous (le front affiche le message à côté du champ). Le jeton est envoyé en `Authorization: Bearer <jwt>`.

## 1. Authentification et compte

Existant : `POST /api/login` `{email, password}` → `{token}` ; `POST /api/register` `{email, plainPassword, displayName}` → `201`.
Le front lit `username` (email), `roles` et `exp` dans le jeton.

À créer :

### `GET /api/me`
Connecté. `200` : `{ id, email, displayName, createdAt }` (groupe `user:read`). Le jeton ne contient pas l'id, d'où cette route.

### `DELETE /api/me`
Connecté. Supprime le compte et les données personnelles (UK GDPR, Must du CDC). `204`.
Les articles gardent `author = null` (déjà prévu par `onDelete: SET NULL`). Écrire une ligne dans `Log`.

## 2. Articles (espace admin)

Le front utilise `GET/POST /api/articles`, `GET/PATCH/DELETE /api/articles/{id}` et `GET /api/categories`.
Champs envoyés : `title`, `slug` (`[a-z0-9-]`), `category` (IRI), `summary`, `content`, `publishedAt` (ISO ou `null` = brouillon).

**À corriger côté back avant toute démo :**
- `POST`, `PUT`, `PATCH`, `DELETE` sur `Article` et `Category` : `security: "is_granted('ROLE_ADMIN')"` (aujourd'hui n'importe qui peut écrire).
- `GET /api/articles` : ne renvoyer les brouillons (`publishedAt = null`) qu'aux admins.
- Remplir `author` avec l'utilisateur connecté à la création.

## 3. Journal communautaire

Un visiteur, **sans compte**, publie une note de terrain avec une photo facultative.
Code côté front : `src/features/community/`.

### Ressource `CommunityPost`

| Champ | Type | Règles |
|---|---|---|
| `id` | string (UUID) | généré par le serveur |
| `title` | string | obligatoire, ≤ 140 caractères |
| `category` | string | obligatoire, une valeur parmi `Birds`, `Mammals`, `Insects & invertebrates`, `Plants & fungi`, `Pond life`, `Places & walks`, `General` |
| `authorName` | string \| null | facultatif, ≤ 80 caractères (sinon le front affiche « A visitor ») |
| `place` | string \| null | facultatif, ≤ 120 caractères |
| `body` | string | obligatoire, ≤ 12 000 caractères, **texte brut** (pas de HTML) |
| `photoUrl` | string \| null | URL publique de la photo |
| `photoAlt` | string \| null | **obligatoire si photo**, ≤ 300 caractères |
| `publishedAt` | string ISO 8601 | date de publication |

Une entité séparée d'`Article` est conseillée : `Article` reste réservé à l'auteur du site (admin), et les contributions des visiteurs peuvent être modérées ou purgées sans toucher au contenu migré.

### Endpoints

#### `GET /api/community_posts`
Public. Tri : `publishedAt` décroissant. Pagination API Platform, 12 éléments par page.

Paramètres :
- `page` (int, commence à 1)
- `category[]` (répétable) : filtre `SearchFilter` exact sur `category`

Réponse `200` (JSON-LD) :
```json
{
  "member": [ { "@id": "/api/community_posts/…", "@type": "CommunityPost", "id": "…", "title": "…", "category": "Birds", "authorName": null, "place": "Bush Wood", "body": "…", "photoUrl": "/media/community/ab12….webp", "photoAlt": "…", "publishedAt": "2026-11-20T10:00:00+00:00" } ],
  "totalItems": 37,
  "view": { "@id": "/api/community_posts?page=1", "next": "/api/community_posts?page=2" }
}
```
Le front se sert de `view.next` pour afficher « Older articles ».

#### `GET /api/community_posts/{id}`
Public. `200` avec l'objet, `404` s'il n'existe pas.

#### `POST /api/community_posts`
**Public** (pas de JWT). Corps en `multipart/form-data` :

| Champ | |
|---|---|
| `title`, `category`, `authorName`, `place`, `body` | texte |
| `photo` | fichier facultatif : JPEG, PNG ou WebP, ≤ 5 Mo |
| `photoAlt` | texte, obligatoire si `photo` est présent |

Réponses :
- `201` : l'objet créé (le front redirige vers `/community/{id}`)
- `422` : erreurs de validation au format API Platform ; le front affiche chaque `violations[].message` à côté du champ `propertyPath` (utiliser les mêmes noms de champs que ci-dessus)
- `413` : fichier trop gros
- `429` : trop de publications (voir ci-dessous)

Pour le multipart avec API Platform : opération `Post` avec `inputFormats: ['multipart' => ['multipart/form-data']]`, et un décodeur multipart ou un contrôleur dédié (voir la doc API Platform « Handling File Upload », VichUploaderBundle possible).

#### `DELETE /api/community_posts/{id}`
Réservé à `ROLE_ADMIN` (modération depuis `/admin/community`). `204`.

### Exigences de sécurité côté serveur

La publication est ouverte à tout le monde : ces points sont à traiter côté back, le front ne peut pas les garantir.

1. **Valider à nouveau toutes les règles** ci-dessus (le front peut être contourné).
2. **Photo** : vérifier le vrai type par les *magic bytes*, pas l'extension ni le Content-Type ; renommer (hash), stocker hors de `public/` ou dans un dossier sans exécution PHP ; idéalement réencoder l'image, ce qui supprime aussi les données EXIF (dont la position GPS du visiteur).
3. **Texte brut** : ne jamais rendre `body` comme du HTML. Le front l'affiche avec `{{ }}` (échappé).
4. **Anti-spam** : limiter le débit par IP (Symfony RateLimiter, ex. 5 publications par heure) et répondre `429`.
5. **Modération** : prévoir au minimum la suppression par un admin (`DELETE` réservé à `ROLE_ADMIN`) et un journal (`Log`) des publications. Une file de validation avant publication (`status: pending`) serait plus sûre ; dans ce cas, renvoyer le statut pour que le front affiche « Your article will appear after review ».
6. **UK GDPR** : `authorName` est une donnée personnelle facultative. Le préciser dans la page « Your data » et prévoir sa suppression sur demande.


## 4. Demandes d'aide (SAV)

Must du CDC : formulaire de demande, suivi et clôture. Code côté front : `src/features/support/support.ts`.

### Ressource `SupportRequest`

| Champ | Type | Règles |
|---|---|---|
| `id` | string (UUID) | généré par le serveur ; sert de référence (8 premiers caractères affichés) |
| `topic` | string | `support`, `accessibility` ou `content` |
| `subject` | string | obligatoire, ≤ 150 |
| `description` | string | obligatoire, ≤ 5 000, texte brut |
| `email` | string \| null | facultatif, email valide (pour répondre) |
| `page` | string \| null | facultatif, ≤ 300 (page concernée) |
| `status` | string | `open`, `in_progress`, `closed` (défaut `open`) |
| `createdAt`, `updatedAt` | ISO 8601 | |

### Endpoints
- `POST /api/support_requests` — **public**, JSON `{topic, subject, description, email, page}` → `201` avec l'objet. Limiter le débit par IP (`429`).
- `GET /api/support_requests/{id}` — public, mais ne renvoyer **que** `id`, `subject`, `status`, `createdAt`, `updatedAt` (pas l'email ni la description) à un non-admin. Le visiteur suit ainsi ses demandes grâce aux ids gardés dans son navigateur.
- `GET /api/support_requests?pagination=false` — `ROLE_ADMIN`, objets complets.
- `PATCH /api/support_requests/{id}` `{status}` — `ROLE_ADMIN` (`application/merge-patch+json`). Journaliser dans `Log`.

UK GDPR : `email` est une donnée personnelle ; prévoir sa suppression quand la demande est close depuis un certain temps (durée à fixer).
