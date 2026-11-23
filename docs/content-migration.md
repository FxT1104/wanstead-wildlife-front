# Migration du contenu (tâche 3.5)

Les pages groupes, fiches espèces, lieux et pages d'information sont prêtes : elles affichent le contenu de `src/content/` et **masquent toute section vide**. Tant qu'une page n'a pas de contenu, elle affiche un encadré « is being moved from the current Wanstead Wildlife website ».

Objectif du CDC : 100 % des pages et photos des 3 sites actuels, sans perte, avant le 04/12.

## Étape 1 — Migration automatique, sans perte (script)

Le script récupère **toutes les pages** du site actuel et les rend disponibles dans le nouveau site, telles quelles.

```sh
npm run migrate:crawl -- --max 20   # essai sur 20 pages
npm run migrate:crawl               # tout le site (plusieurs minutes : 1,5 s entre deux pages)
npm run migrate:build               # construit le contenu à partir du cache (aucun accès réseau)
```

- **`migrate:crawl`** explore le site à partir des menus de l'accueil et garde chaque page dans `migration/cache/` (non versionné). Relancer la commande réutilise le cache ; `--refresh` force un nouveau téléchargement. Le script respecte `robots.txt`, s'identifie comme robot et attend 1,5 s entre deux pages : le serveur est celui d'un bénévole.
- **`migrate:build`** produit :
  - `public/archive/index.json` (la liste des pages) et `public/archive/pages/<page>.json` (un fichier par page : titres, paragraphes, listes, tableaux, photos, liens). Le navigateur ne charge que la page affichée. Les liens internes pointent vers les nouvelles adresses.
  - `migration/suivi.csv` : une ligne par page source (cible, statut, nombre de mots, d'images, de tableaux). C'est le **tableau de suivi « sans perte »** : chaque ligne doit finir « migré » ou « doublon ».
  - `migration/images.csv` : une ligne par photo, avec sa description et la colonne `description_a_revoir`.

Dans le site :
- les pages qui correspondent à une page existante (groupes, lieux, pages About : table `TARGETS` de `scripts/migration/config.ts`) affichent le contenu migré à la place de l'encadré « being moved » ;
- toutes les autres pages sont sous `/archive/<page>`, avec un index filtrable sur **`/archive`**.

### Photos : à faire à la main

`robots.txt` interdit aux robots le dossier `/images/` du site actuel : le script **ne télécharge pas les photos**. Les pages affichent pour l'instant les photos depuis le site actuel. Pour la livraison :
1. récupérer les fichiers listés dans `migration/images.csv` (ou les demander à l'auteur) et les placer dans `public/photos/` ;
2. **réécrire les descriptions marquées `OUI`** : sur le site actuel, la plupart des descriptions sont le nom du fichier (« wp roding 180722 50626 »), ce qui n'est pas conforme WCAG 1.1.1. Le script propose la légende quand elle existe.

### Ajouter une correspondance

Si une page de l'ancien site doit alimenter une page du nouveau (un nouveau lieu par exemple), ajouter son chemin dans `TARGETS` (`scripts/migration/config.ts`) puis relancer `npm run migrate:build`.

## Étape 2 — Structuration (fiches espèces, lieux)

Les pages d'archive conservent tout, mais en texte libre. Pour obtenir de vraies fiches (filtres, « espèces vues ici », recherche par nom latin), l'équipe transforme progressivement le contenu dans `src/content/` comme décrit ci-dessous. Une fois une page structurée, elle remplace automatiquement l'archive sur la page correspondante.

## Où mettre quoi

| Contenu du site actuel | Fichier | Page affichée |
|---|---|---|
| Fiche d'une espèce (faune, champignons…) | `src/content/species.ts` | `/wildlife/<groupe>/<espèce>` |
| Fiche d'une plante, mousse, algue, lichen | `src/content/species.ts` (groupe `plants`, `liverworts-mosses`, `algae`, `lichens`) | idem, gabarit « Flora » avec « Flowering & fruiting » |
| Page d'un lieu | `src/content/places.ts` | `/places/<lieu>` |
| Pages « About the Website » | `src/content/info.ts` (champ `sections`) | `/about/<page>` |
| Photos | `public/photos/species/`, `public/photos/places/`, `public/photos/info/` | référencées par `src: '/photos/...'` |

Les types sont décrits et commentés dans `src/content/types.ts`. TypeScript signale toute erreur de champ (`npm run type-check`).

Les slugs des groupes et des lieux sont dans `src/data/catalogue.ts`. Une fiche espèce doit utiliser un `group` existant ; une observation peut utiliser un slug de lieu (affiché avec son nom) ou un texte libre.

## Règles

1. **Ne rien inventer.** Recopier le contenu existant, sans le réécrire. Un champ inconnu reste absent (la page masque la section).
2. **Texte brut uniquement**, découpé en paragraphes (`['Paragraphe 1', 'Paragraphe 2']`). Pas de HTML.
3. **Chaque photo a un `alt`** qui décrit ce qu'elle montre, en anglais, en une phrase (« A grey heron standing in shallow water »). Ne pas commencer par « Image of ». Si la photo ne fait que décorer, demander avant de mettre `alt: ''`.
4. **Crédit** : `credit` seulement si la photo n'est pas de Paul Ferris (droit d'auteur : les contenus restent sa propriété).
5. **Accès aux lieux** (`accessInformation`) : ne remplir qu'avec une information **vérifiée** et renseigner `checkedOn`. Sans cela, la page invite à poser la question, ce qui est préférable à une information fausse pour une personne en fauteuil.
6. **Photos** : format WebP, 1600 px de large maximum, nom en minuscules avec tirets. Indiquer `width` et `height` pour éviter les sauts de mise en page.
7. **Suivi** : tenir un inventaire (page source → fichier/slug cible → fait/vérifié) pour prouver l'objectif « sans perte ».

## Exemple

```ts
// src/content/species.ts
export const species: Species[] = [
  {
    slug: 'grey-heron',
    group: 'birds',
    commonName: 'Grey Heron',
    scientificName: 'Ardea cinerea',
    family: 'Ardeidae',
    season: 'All year',
    intro: ['…texte repris du site actuel…'],
    photos: [{ src: '/photos/species/grey-heron.webp', alt: 'A grey heron standing in shallow water', width: 1600, height: 1067 }],
    records: [{ date: '1987', location: 'wanstead-park', observation: '…', observer: 'PF' }],
    places: ['wanstead-park'],
  },
]
```

## Et ensuite : l'API

Quand les entités `Species` et `Place` existeront côté Symfony, il suffira de remplacer les fonctions de `src/content/index.ts` par des appels à l'API ; les pages ne changent pas. Les fichiers `src/content/*.ts` pourront alors servir de jeu de données à importer (fixtures).
