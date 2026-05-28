# Cardoso Nettoyages Sàrl

Site vitrine premium pour **Cardoso Nettoyages Sàrl** — entretien intérieur et extérieur à Villars-sur-Glâne (Fribourg, Suisse).

## Aperçu

Site one-page moderne avec parallax, animations au scroll, curseur personnalisé, compteurs animés, tilt 3D, particules canvas et formulaire de contact PHP fonctionnel.

## Technologies

- **HTML5** sémantique
- **CSS3** moderne (variables, grid, clamp, backdrop-filter)
- **JavaScript** vanilla + **GSAP ScrollTrigger** pour le parallax
- **PHP** pour le traitement du formulaire

## Structure

```
.
├── index.html           Page principale
├── contact.php          Traitement du formulaire (validation + mail + log)
└── assets/
    ├── css/style.css    Feuille de style complète
    ├── js/main.js       Interactions et animations
    └── images/          Médias (placeholders Unsplash en attendant)
```

## Lancer en local

Nécessite un serveur PHP pour que le formulaire fonctionne :

```bash
php -S localhost:8000
```

Puis ouvrir http://localhost:8000

## Configuration

Avant déploiement, dans `contact.php` :

- Ligne 22 : remplacer `contact@cardoso-nettoyages.ch` par l'e-mail de destination réel
- Ligne 23 : adapter l'expéditeur système

## Contact

**Cardoso Nettoyages Sàrl**
Villars-sur-Glâne, Fribourg — Suisse
📞 026 322 32 70
