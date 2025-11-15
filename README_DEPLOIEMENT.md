# 🚀 Guide de Déploiement - Lunarium

## ✅ Configuration Netlify (Recommandé)

### Déploiement automatique depuis GitHub

Avec le fichier `netlify.toml` créé, votre workflow est maintenant :

```bash
# 1. Faire vos modifications dans src/
# 2. Tester localement (optionnel)
npm run dev    # Ouvre http://localhost:3000

# 3. Commit et push comme d'habitude
git add .
git commit -m "Mes modifications"
git push

# 4. Netlify va automatiquement :
#    - Détecter le push
#    - Installer les dépendances (npm install)
#    - Créer le build (npm run build)
#    - Déployer le dossier dist/
#    - Votre site est à jour ! 🎉
```

### Configuration Netlify (première fois)

Si ce n'est pas déjà fait, dans Netlify :

1. **Build command :** `npm run build`
2. **Publish directory :** `dist`
3. **Node version :** 18 ou supérieur

Le fichier `netlify.toml` configure tout automatiquement !

---

## 🔄 Workflow Complet

### Méthode 1 : Push sur GitHub (recommandé pour vous)

```bash
# Modifier vos fichiers dans src/
# Par exemple : src/components/modals/ConfigModal.jsx

git add .
git commit -m "Modification de ConfigModal"
git push

# Attendre 1-2 minutes
# → Netlify build automatiquement
# → Rafraîchir lunarium.netlify.app (ou votre URL)
```

### Méthode 2 : Tester en local avant (optionnel)

```bash
# Installer les dépendances (une seule fois)
npm install

# Lancer le serveur de développement
npm run dev

# Ouvre automatiquement http://localhost:3000
# Hot reload : les changements s'affichent instantanément
```

---

## 📁 Structure du Projet

```
CyclePlanner/
├── src/                    ← VOS FICHIERS À MODIFIER
│   ├── components/
│   ├── views/
│   ├── utils/
│   └── App.jsx
├── dist/                   ← BUILD GÉNÉRÉ (ne pas modifier)
├── index.html.backup       ← ANCIEN FICHIER (backup)
├── index.html              ← NOUVEAU TEMPLATE
├── package.json
├── vite.config.js
└── netlify.toml           ← CONFIG NETLIFY

```

---

## 🛠️ Commandes Utiles

```bash
# Développement local (optionnel)
npm run dev              # Serveur dev avec hot reload

# Build de production
npm run build            # Créer dist/ pour déploiement

# Prévisualiser le build
npm run preview          # Tester le build localement

# Voir les modifications
git status               # Fichiers modifiés
git diff                 # Voir les changements
```

---

## 🔍 Différences Ancien vs Nouveau

### ❌ Ancien Système

```
index.html (4425 lignes)
    ↓
GitHub
    ↓
Netlify affiche directement
```

**Problèmes :**
- Fichier énorme difficile à maintenir
- Impossible de réutiliser du code
- Pas de modules
- Difficile de débugger

### ✅ Nouveau Système

```
src/ (35+ fichiers modulaires)
    ↓
npm run build (automatique sur Netlify)
    ↓
dist/ (fichiers optimisés)
    ↓
Netlify affiche dist/
```

**Avantages :**
- Code organisé et maintenable
- Facile de modifier une fonctionnalité
- Build optimisé (plus rapide)
- Hot reload en développement

---

## 🚨 Important

### ✅ À FAIRE
- Modifier les fichiers dans `src/`
- Commit et push sur GitHub
- Netlify build automatiquement

### ❌ NE PAS FAIRE
- Ne pas modifier les fichiers dans `dist/` (écrasés à chaque build)
- Ne pas supprimer `index.html.backup` (backup de l'ancien code)
- Ne pas supprimer `node_modules/` du `.gitignore`

---

## 🐛 Problèmes Courants

### Mon site affiche "Page not found"

**Solution :** Le fichier `netlify.toml` est configuré pour rediriger vers index.html.
Vérifiez dans Netlify que :
- Build command : `npm run build`
- Publish directory : `dist`

### Le build échoue sur Netlify

**Vérifier :**
```bash
# En local, tester :
npm install
npm run build

# Si ça marche en local, ça devrait marcher sur Netlify
```

### Je veux voir mes changements immédiatement

**Option 1 :** Tester en local
```bash
npm run dev
# Ouvre localhost:3000
# Les changements s'affichent instantanément !
```

**Option 2 :** Attendre le build Netlify (1-2 min après push)

---

## 🎯 Exemple de Workflow

```bash
# Lundi : Modifier la couleur d'une phase
# Éditer : src/utils/cycleUtils.js ligne 15
# Changer : color: '#882c45' → color: '#990000'

git add src/utils/cycleUtils.js
git commit -m "Changer couleur menstruation"
git push

# Attendre 1-2 minutes
# Rafraîchir lunarium.netlify.app
# ✅ La nouvelle couleur est visible !
```

---

## 💡 Conseils

### Pour développer confortablement

1. **Utiliser npm run dev** pour tester rapidement
2. **Commit régulièrement** pour ne pas perdre votre travail
3. **Tester le build** avant de push si changement important

### Pour modifier une vue

- **Vue circulaire :** `src/views/CycleView.jsx`
- **Vue mensuelle :** `src/views/MonthView.jsx`
- **Modals :** `src/components/modals/`
- **Couleurs/phases :** `src/utils/cycleUtils.js`

---

**Vous pouvez maintenant commit/push et votre site se mettra à jour automatiquement ! 🎉**
