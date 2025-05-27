# Configuration locale pour Ben-Bot

Ce fichier contient des instructions pour configurer Ben-Bot localement et le déployer en toute sécurité.

## 🔧 Configuration locale

### Créer un fichier de configuration local (pour le développement)

1. Créez un fichier `js/firebase-config.local.js` avec votre vraie clé API :

```javascript
const firebaseConfig = {
    apiKey: "VOTRE_VRAIE_CLE_API_ICI",
    authDomain: "ma-cherie-af625.firebaseapp.com",
    databaseURL: "https://ma-cherie-af625-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ma-cherie-af625",
    storageBucket: "ma-cherie-af625.firebasestorage.app",
    messagingSenderId: "405191992200",
    appId: "1:405191992200:web:8b9eda534715074c75d03d",
    measurementId: "G-F94RGQPDBT"
};
```

2. Modifiez temporairement vos fichiers HTML pour utiliser le fichier local :
   - Remplacez `js/firebase-config.js` par `js/firebase-config.local.js`

3. **IMPORTANT** : N'oubliez pas de reverter ces changements avant de commit !

## 🚀 Déploiement sécurisé

### GitHub Secrets configuré

✅ **FIREBASAPI** : Votre clé API Firebase est stockée en sécurité dans les secrets GitHub.

### Workflow de déploiement

Le workflow GitHub Actions (`.github/workflows/deploy.yml`) :

1. **Injection sécurisée** : Remplace automatiquement `{{FIREBASE_API_KEY}}` par votre vraie clé API
2. **Validation** : Vérifie que tous les remplacements ont fonctionné
3. **Déploiement** : Publie sur GitHub Pages uniquement après validation
4. **Sécurité** : Exécute des vérifications pour s'assurer qu'aucune clé n'est exposée

### Fichiers sécurisés

- `ben-bot.html` : ✅ Utilise `{{FIREBASE_API_KEY}}`
- `ben-bot-historique.html` : ✅ Utilise `{{FIREBASE_API_KEY}}`
- `js/firebase-config.js` : ✅ Utilise `{{FIREBASE_API_KEY}}`

## 🔒 Sécurité

### Ce qui est protégé

- ✅ Clés API Firebase stockées dans GitHub Secrets
- ✅ Placeholders dans le code source
- ✅ Injection automatique lors du déploiement
- ✅ Vérifications de sécurité automatiques
- ✅ `.gitignore` mis à jour

### Fichiers à ne jamais commit

- `js/firebase-config.local.js` (ajouté au .gitignore)
- Tout fichier contenant de vraies clés API

## 📋 Instructions de déploiement

1. **Push vers GitHub** : Le code avec les placeholders
2. **GitHub Actions** : Se déclenche automatiquement
3. **Injection sécurisée** : Les clés API sont injectées
4. **Déploiement** : Publication sur GitHub Pages
5. **Vérification** : Validation que tout fonctionne

## 🛠️ Commandes utiles

### Test local
```bash
# Démarrer un serveur local
python -m http.server 8000
# ou
npx serve .
```

### Vérifier la sécurité
```bash
# Chercher des clés potentiellement exposées
grep -r "AIzaSy" . --exclude-dir=.git --exclude-dir=.github
```

## 🔍 Résolution de problèmes

### Si le déploiement échoue :

1. Vérifiez que le secret `FIREBASAPI` est bien configuré dans GitHub
2. Assurez-vous que tous les fichiers utilisent `{{FIREBASE_API_KEY}}`
3. Consultez les logs du workflow GitHub Actions

### Si l'application ne fonctionne pas :

1. Vérifiez la console du navigateur pour des erreurs
2. Assurez-vous que les placeholders ont été remplacés
3. Testez la connexion Firebase

## 📝 Notes importantes

- **Jamais** de vraies clés API dans le code source
- **Toujours** utiliser les placeholders `{{FIREBASE_API_KEY}}`
- **Vérifier** que `.gitignore` protège les fichiers sensibles
- **Tester** le déploiement sur une branche de test d'abord
