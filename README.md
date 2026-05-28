# Cardoso Nettoyages Sàrl

Site vitrine premium pour **Cardoso Nettoyages Sàrl** — entretien intérieur et extérieur à Fribourg (Rue Saint-Pierre 8) (Fribourg, Suisse).

## Aperçu

Site éditorial inspiré d'oroya.fr avec parallax GSAP, animations au scroll, curseur personnalisé contextuel, loader animé, et 3 landing pages services. SEO complet (meta, Open Graph, Twitter, JSON-LD Schema.org).

## Technologies

- **HTML5** sémantique
- **CSS3** moderne (variables, grid, clamp, backdrop-filter, font-variation-settings)
- **JavaScript vanilla** + **GSAP ScrollTrigger** pour le parallax
- **PHP** pour le traitement du formulaire
- **Schema.org JSON-LD** pour le SEO structuré

## Structure

```
.
├── index.html                      Page d'accueil
├── contact.php                     Traitement du formulaire
├── sitemap.xml                     Plan du site pour Google
├── robots.txt                      Directives pour les bots
├── humans.txt                      Crédits humains
├── services/
│   ├── contrats-entretien.html     Landing page service 01
│   ├── fin-de-chantier.html        Landing page service 02
│   └── conciergerie.html           Landing page service 03
└── assets/
    ├── css/style.css               Feuille de style complète
    ├── js/main.js                  Interactions, animations, formulaire
    └── images/                     Médias (placeholders Unsplash)
```

## Lancer en local

```bash
php -S localhost:8000
```

Puis ouvrir http://localhost:8000

## Configuration avant déploiement

### Domaine
Tous les liens canoniques, Open Graph et JSON-LD pointent vers `https://www.cardoso-nettoyages.ch/`. Si le domaine final est différent, faire un find/replace global.

### E-mail de contact
Dans `contact.php` ligne 22, remplacer `contact@cardoso-nettoyages.ch` par l'e-mail réel de destination.

### Images
Les images sont actuellement servies par Unsplash. Pour une vraie production :
- Héberger les images en local dans `assets/images/`
- Mettre à jour les `src` dans les HTML
- Mettre à jour les `og:image` et JSON-LD avec les URLs définitives

## SEO — Ce qui est en place

### Méta-tags
- Titles optimisés (~55 caractères chacun)
- Descriptions optimisées (~155 caractères chacune)
- Keywords ciblés Fribourg
- Robots, canonical, language, author

### SEO local (très important pour une PME suisse)
- `geo.region`, `geo.placename`, `geo.position`, `ICBM`
- Coordonnées Fribourg (Rue Saint-Pierre 8) : `46.8056, 7.1556`

### Réseaux sociaux
- Open Graph complet (Facebook, LinkedIn, WhatsApp)
- Twitter Card large image
- Locale `fr_CH`

### Données structurées Schema.org
- **Accueil** : `CleaningService` + `WebSite` + catalogue de services
- **Landing pages** : `Service` + `BreadcrumbList`
- Géolocalisation, horaires, secteurs desservis, devise CHF, langues parlées

### Crawl
- `sitemap.xml` avec images
- `robots.txt` autorisant Google, bots IA (GPTBot, ClaudeBot)
- Favicon SVG inline (data URI, zéro requête)

### Performance
- `preconnect` Google Fonts
- `dns-prefetch` Unsplash, CDN GSAP
- `preload` de l'image hero
- Police variable Fraunces (un seul fichier pour tous les poids)

## Soumettre le site à Google après mise en ligne

1. Créer un compte [Google Search Console](https://search.google.com/search-console)
2. Ajouter la propriété `https://www.cardoso-nettoyages.ch/`
3. Vérifier la propriété (balise meta, fichier HTML, ou DNS)
4. Soumettre `sitemap.xml`
5. Demander l'indexation des 4 pages depuis "Inspection d'URL"
6. Créer une fiche **Google Business Profile** (ex-Google My Business) — c'est crucial pour le SEO local

## Contact

**Cardoso Nettoyages Sàrl**
Rue Saint-Pierre 8, 1700 Fribourg — Suisse
📞 026 322 32 70
