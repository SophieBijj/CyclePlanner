# Configuration Google Cloud Console pour Lunarium

## Problème : Erreur 403 avec Google Tasks API

Si vous voyez "Error loading Tasks API: 403", suivez ces étapes :

---

## Étape 1 : Activer l'API Google Tasks

1. Allez sur https://console.cloud.google.com/
2. Sélectionnez votre projet
3. Menu : **APIs & Services** > **Library**
4. Recherchez : **"Google Tasks API"**
5. Cliquez sur **"ENABLE"** (ou vérifiez qu'elle est déjà activée)

---

## Étape 2 : Configurer OAuth Consent Screen

1. Menu : **APIs & Services** > **OAuth consent screen**
2. Cliquez sur **"EDIT APP"**
3. Passez les pages 1 et 2 (App information et App domain)
4. À la page 3 **"Scopes"** :
   - Cliquez sur **"ADD OR REMOVE SCOPES"**
   - Dans la recherche, tapez "calendar"
   - ✅ Cochez : **".../auth/calendar"** (Voir et gérer vos agendas)
   - Dans la recherche, tapez "tasks"
   - ✅ Cochez : **".../auth/tasks"** (Gérer vos tâches)
   - Cliquez **"UPDATE"**
   - Cliquez **"SAVE AND CONTINUE"**
5. Passez la page 4 (Test users)
6. Cliquez **"BACK TO DASHBOARD"**

---

## Étape 3 : Vérifier OAuth 2.0 Client ID

1. Menu : **APIs & Services** > **Credentials**
2. Trouvez votre **OAuth 2.0 Client ID** : `711219272291-i1je9vqn1b4p0asn4fov7bdohoa08q38.apps.googleusercontent.com`
3. Cliquez dessus pour l'ouvrir
4. Vérifiez :

   **Authorized JavaScript origins :**
   ```
   https://lunarium.netlify.app
   ```

   **Authorized redirect URIs :**
   ```
   https://lunarium.netlify.app
   https://lunarium.netlify.app/
   ```

5. Si nécessaire, ajoutez ces URLs et cliquez **"SAVE"**

---

## Étape 4 : Tester sur Lunarium

Après avoir fait ces changements :

1. Allez sur https://lunarium.netlify.app/
2. Ouvrez la console (Cmd + Option + J)
3. Tapez : `localStorage.clear(); location.reload();`
4. Reconnectez-vous avec Google
5. **IMPORTANT** : Lors de l'écran d'autorisation, vous devriez voir :
   - ✅ Voir et gérer vos agendas Google
   - ✅ Gérer vos tâches
6. Autorisez les deux !

---

## Vérification Finale

Dans la console du navigateur, après connexion, tapez :
```javascript
console.log(gapi.client.tasks ? "✅ Tasks API chargée" : "❌ Tasks API non chargée");
```

Si vous voyez "✅", c'est bon ! Sinon, contactez-moi avec le message d'erreur exact.

---

## Notes Importantes

- Les API Keys ne sont PAS utilisées pour Google Tasks (on utilise OAuth 2.0)
- Il peut falloir quelques minutes pour que les changements Google Cloud se propagent
- Si vous êtes en "Testing mode" sur OAuth, assurez-vous que votre email est dans la liste des test users

---

## En Cas de Problème

Si après tout ça vous avez toujours l'erreur 403 :

1. Vérifiez dans Google Cloud Console > APIs & Services > Dashboard
2. Cliquez sur "Google Tasks API"
3. Vérifiez qu'il n'y a pas de restrictions (quotas, etc.)
4. Vérifiez les métriques pour voir si des requêtes arrivent

Si vous voyez "100% erreurs" dans les métriques, c'est normal - ça devrait se résoudre après avoir reconfiguré les scopes et vous être reconnecté.
