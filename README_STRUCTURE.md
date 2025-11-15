# Lunarium - Structure Modulaire

## 🎯 Vue d'ensemble

Ce projet a été modularisé pour améliorer la maintenabilité et faciliter les modifications futures. La structure suit les meilleures pratiques React modernes avec Vite comme outil de build.

## 📁 Structure des dossiers

```
CyclePlanner/
├── src/
│   ├── components/           # Composants réutilisables
│   │   ├── icons/           # Composants d'icônes SVG
│   │   │   ├── GoogleIcon.jsx
│   │   │   ├── PlusIcon.jsx
│   │   │   ├── EditIcon.jsx
│   │   │   ├── TrashIcon.jsx
│   │   │   ├── SyncIcon.jsx
│   │   │   ├── SettingsIcon.jsx
│   │   │   ├── XIcon.jsx
│   │   │   └── index.js     # Export centralisé
│   │   ├── modals/          # Composants modaux
│   │   │   ├── ConfigModal.jsx
│   │   │   ├── CreateEventModal.jsx
│   │   │   ├── CreateTaskModal.jsx
│   │   │   ├── EditEventModal.jsx
│   │   │   └── EditTaskModal.jsx
│   │   ├── sidebar/         # Composants de la barre latérale
│   │   │   ├── GoogleCalendarSync.jsx
│   │   │   ├── GoogleTasks.jsx
│   │   │   └── TasksSidebar.jsx
│   │   └── Toast.jsx        # Notifications toast
│   │
│   ├── views/               # Composants de vue principale
│   │   ├── MonthView.jsx    # Vue calendrier mensuel
│   │   └── CycleView.jsx    # Vue circulaire du cycle
│   │
│   ├── utils/               # Fonctions utilitaires
│   │   ├── sunUtils.js      # Gestion lever/coucher soleil
│   │   ├── moonUtils.js     # Calculs phases lunaires
│   │   ├── cycleUtils.js    # Calculs cycle menstruel
│   │   ├── colorUtils.js    # Utilitaires couleurs
│   │   └── dateUtils.js     # Utilitaires dates
│   │
│   ├── config/              # Configuration et constantes
│   │   └── constants.js     # Constantes globales
│   │
│   ├── App.jsx              # Composant principal
│   ├── main.jsx             # Point d'entrée de l'application
│   └── styles.css           # Styles globaux
│
├── public/                  # Fichiers statiques
├── index.html               # Template HTML
├── package.json             # Dépendances npm
├── vite.config.js           # Configuration Vite
└── README_STRUCTURE.md      # Ce fichier

```

## 🗂️ Organisation des composants

### **Components** (`src/components/`)

#### Icons (`icons/`)
- Composants SVG réutilisables
- Export centralisé via `index.js`
- Utilisation: `import { GoogleIcon, PlusIcon } from './components/icons'`

#### Modals (`modals/`)
- **ConfigModal**: Configuration du cycle menstruel et historique
- **CreateEventModal**: Création d'événements Google Calendar
- **CreateTaskModal**: Création de tâches Google Tasks
- **EditEventModal**: Modification d'événements
- **EditTaskModal**: Modification de tâches

#### Sidebar (`sidebar/`)
- **GoogleCalendarSync**: Authentification et sync Google Calendar
- **GoogleTasks**: Gestion des tâches Google Tasks
- **TasksSidebar**: Barre latérale d'affichage des tâches

#### Toast
- Composant de notifications toast

### **Views** (`src/views/`)
- **MonthView**: Vue calendrier mensuel avec grille
- **CycleView**: Vue circulaire du cycle menstruel (à créer)

### **Utils** (`src/utils/`)
Fonctions utilitaires organisées par domaine:
- **sunUtils**: API Open-Meteo pour lever/coucher du soleil
- **moonUtils**: Calculs des phases lunaires
- **cycleUtils**: Logique du cycle menstruel et phases
- **colorUtils**: Gestion des couleurs et contrastes
- **dateUtils**: Formatage et manipulation de dates

### **Config** (`src/config/`)
- **constants.js**: Configuration Google API, constantes globales

## 🚀 Commandes de développement

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Build pour la production
npm run build

# Prévisualiser le build
npm run preview
```

## 🔧 Technologies utilisées

- **React 18** - Bibliothèque UI
- **Vite 5** - Build tool moderne et rapide
- **Tailwind CSS** - Framework CSS utilitaire (via CDN)
- **Google Calendar API** - Synchronisation calendrier
- **Google Tasks API** - Gestion des tâches
- **Open-Meteo API** - Données solaires

## 📝 Conventions de code

### Nommage des fichiers
- Composants React: `PascalCase.jsx`
- Utilitaires: `camelCase.js`
- Constantes: `constants.js`

### Organisation des imports
```javascript
// 1. Imports React
import { useState, useEffect } from 'react';

// 2. Imports de bibliothèques tierces

// 3. Imports de composants locaux
import { GoogleIcon } from './components/icons';

// 4. Imports d'utilitaires
import { formatDate } from './utils/dateUtils';

// 5. Imports de constantes
import { GOOGLE_CLIENT_ID } from './config/constants';
```

### Structure d'un composant
```javascript
// 1. Imports
import { useState } from 'react';

// 2. Définition du composant
export default function MonComposant({ prop1, prop2 }) {
  // 3. Hooks
  const [state, setState] = useState(null);

  // 4. Fonctions helpers
  const handleClick = () => {
    // ...
  };

  // 5. Rendu
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

## 🎨 Personnalisation

### Modifier les couleurs du cycle
Éditez `src/utils/cycleUtils.js`, fonction `getPhaseInfo()`

### Ajouter une nouvelle phase
1. Modifiez `cycleUtils.js`
2. Ajoutez la logique de calcul
3. Définissez les couleurs

### Modifier la localisation
Éditez `src/config/constants.js`, objet `LOCATION`

## 🔐 Configuration Google API

Les clés API sont dans `src/config/constants.js`:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_API_KEY`

Voir `GOOGLE_CLOUD_SETUP.md` pour les instructions de configuration.

## 📚 Ressources

- [Documentation React](https://react.dev/)
- [Documentation Vite](https://vitejs.dev/)
- [Google Calendar API](https://developers.google.com/calendar/api)
- [Google Tasks API](https://developers.google.com/tasks)
- [Open-Meteo API](https://open-meteo.com/)

## 🤝 Contribution

Pour contribuer au projet:
1. Créez une branche: `git checkout -b feature/ma-fonctionnalite`
2. Committez vos changements: `git commit -m 'Ajout de ma fonctionnalité'`
3. Pushez: `git push origin feature/ma-fonctionnalite`
4. Créez une Pull Request

## 📄 Licence

Ce projet est privé et propriétaire.

---

**Dernière mise à jour:** 2025-11-15
**Version:** 2.0.0 (Structure modulaire)
