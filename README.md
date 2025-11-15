# 🌸 Lunarium - Planificateur de Cycle Menstruel

Application web moderne de planification de cycle menstruel avec intégration Google Calendar et synchronisation des tâches.

## ✨ Fonctionnalités

- 🔄 **Vue Cycle** - Visualisation circulaire de votre cycle avec phases lunaires
- 📅 **Vue Mensuelle** - Calendrier mensuel avec informations de phase
- 🌅 **Données Solaires** - Lever et coucher du soleil intégrés
- 🌙 **Phases Lunaires** - Calcul et affichage des phases lunaires
- 📊 **Historique** - Suivi de l'historique de vos cycles
- 🔗 **Google Calendar** - Synchronisation bidirectionnelle avec Google Calendar
- ✅ **Google Tasks** - Gestion de vos tâches Google
- 🎨 **Couleurs** - Code couleur par calendrier Google
- 📱 **Responsive** - Fonctionne sur tous les appareils

## 🚀 Démarrage Rapide

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

### Build Production

```bash
npm run build
npm run preview
```

## 📚 Documentation

- [README_STRUCTURE.md](./README_STRUCTURE.md) - Structure détaillée du projet
- [README_DEPLOIEMENT.md](./README_DEPLOIEMENT.md) - Guide de déploiement Netlify
- [MIGRATION.md](./MIGRATION.md) - Historique de la migration modulaire
- [GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md) - Configuration Google API

## 🛠️ Technologies

- **React 18** - Framework UI
- **Vite 5** - Build tool et dev server
- **Tailwind CSS** - Styling
- **Google Calendar API v3** - Synchronisation calendrier
- **Google Tasks API v1** - Gestion des tâches
- **Open-Meteo API** - Données solaires

## 📦 Architecture

Application modulaire avec 40+ fichiers organisés en :

- `src/components/` - Composants réutilisables (modals, sidebar, icons)
- `src/views/` - Vues principales (MonthView, CycleView)
- `src/utils/` - Fonctions utilitaires (dates, cycles, soleil, lune)
- `src/config/` - Configuration et constantes

Voir [README_STRUCTURE.md](./README_STRUCTURE.md) pour plus de détails.

## 🔧 Configuration

1. Créer un projet Google Cloud Platform
2. Activer Google Calendar API et Google Tasks API
3. Créer des credentials OAuth 2.0
4. Ajouter vos clés dans `src/config/constants.js`

Voir [GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md) pour les instructions détaillées.

## 📄 Licence

Projet personnel - Sophie Bijjani
