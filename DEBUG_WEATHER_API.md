# 🔧 Guide de dépannage API Météo

## Problèmes courants avec les nouvelles clés API OpenWeatherMap

### 1. **Délai d'activation** ⏰
Les nouvelles clés API peuvent prendre **jusqu'à 2 heures** pour être activées.

**Solution** : Attendez et réessayez plus tard.

### 2. **Vérification de la clé API** 🔑

**Étapes à suivre** :

1. **Vérifiez votre fichier `.env`** :
```bash
VITE_OPENWEATHER_API_KEY=votre_cle_complete_ici
```

2. **Testez directement dans le navigateur** :
```
https://api.openweathermap.org/data/2.5/weather?q=Quebec&appid=VOTRE_CLE_API
```

3. **Vérifiez dans la console** :
   - Ouvrez les DevTools (F12)
   - Regardez les logs avec les emojis 🌤️📡✅❌

### 3. **Problèmes de compte** 👤

**Vérifiez sur OpenWeatherMap** :
- Compte bien activé (email de confirmation)
- Plan gratuit bien sélectionné
- Clé API visible dans votre profil

### 4. **Test rapide** 🧪

**Testez avec curl** :
```bash
curl "https://api.openweathermap.org/data/2.5/weather?q=Quebec&appid=VOTRE_CLE_API"
```

**Réponses possibles** :
- ✅ **200** : Données JSON → Clé valide
- ❌ **401** : `{"cod":401,"message":"Invalid API key"}` → Clé invalide
- ❌ **429** : Limite de requêtes dépassée

### 5. **Solutions temporaires** 🔄

En attendant l'activation, le dashboard utilise automatiquement des **données mockées** réalistes.

### 6. **Variables d'environnement** 📁

**Vérifiez que le fichier `.env` est** :
- À la racine du projet
- Pas dans `.gitignore` (mais ne le commitez jamais !)
- Bien formaté (pas d'espaces autour du `=`)

**Redémarrez le serveur** après modification :
```bash
pnpm dev
```

### 7. **Logs de débogage** 📊

Avec les nouveaux logs, vous verrez :
- 🌤️ Tentative de connexion
- 📡 URL de requête (clé masquée)
- ✅ Succès des requêtes
- ❌ Détails des erreurs
- 🔄 Fallback vers données mockées

Ces logs vous aideront à identifier exactement où ça bloque ! 