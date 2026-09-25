# FC Chalosse ⚽

C’est l’application du club **FC Chalosse**.

Tu peux regarder les matchs, l’effectif, les notes et les stats.

---

## Utiliser le site (le plus simple)

### 1. Ouvre le site

Clique ici :

👉 **https://chalosse-fc.vercel.app**

### 2. Crée ton compte

1. Clique sur **Créer un compte** (ou va sur Inscription).
2. Écris ton **prénom**.
3. Écris ton **nom**.
4. Écris ton **e-mail**.
5. Choisis un **mot de passe** (au moins **6** lettres ou chiffres).
6. Clique sur **Créer mon compte**.

✅ Tu es connecté tout de suite. Pas besoin de vérifier un e-mail.

### 3. Connecte-toi plus tard

1. Ouvre le site.
2. Clique sur **Connexion**.
3. Écris ton e-mail.
4. Écris ton mot de passe.
5. Clique sur **Se connecter**.

### 4. Mot de passe oublié ?

1. Sur la page Connexion, clique sur **Mot de passe oublié ?**
2. Écris ton e-mail.
3. Clique sur **Envoyer le lien**.
4. Ouvre ton e-mail et suis le lien.

---

## Que faire dans l’app ?

En bas (téléphone) ou en haut (ordinateur), tu as des boutons :

| Bouton | À quoi ça sert |
|--------|----------------|
| **Club** | Page d’accueil, matchs proches |
| **Matchs** | Calendrier de tous les matchs |
| **Effectif** | Liste des joueurs |
| **Stats** | Buts, passes, notes, cartons |
| **Notes** | Classement « Homme du match » |
| **Aide** | Petit guide |
| **Admin** | Réservé au staff (voir plus bas) |

### Noter un match

1. Va dans **Matchs**.
2. Clique sur un match.
3. Donne une note de **0** à **10** à chaque joueur.
4. Clique sur **Valider mes notes**.

### Quitter

Clique sur **Quitter** en haut à droite.

---

## Si tu es admin (staff)

Le **premier** compte créé sur le projet est **admin**.

Avec Admin tu peux :

1. **Ajouter un joueur**
2. **Créer un match**
3. **Faire la composition** (qui joue)
4. **Saisir les stats** (buts, passes, cartons)
5. **Mettre le score** d’un match
6. **Gérer les comptes**

Ordre simple pour un match :

1. Créer le match  
2. Faire la composition  
3. Jouer le match  
4. Mettre le score  
5. Saisir les stats  
6. Les joueurs notent l’équipe  

---

## Installer le projet chez toi (optionnel)

Tu veux le code sur ton ordinateur ? Suis ces étapes.

### Étape A — Préparer l’ordinateur

1. Installe **Node.js** : https://nodejs.org (bouton LTS).
2. Installe **Git** : https://git-scm.com

### Étape B — Récupérer le code

Ouvre un terminal et tape :

```bash
git clone https://github.com/galaxie44/chalosse-fc.git
cd chalosse-fc
npm install
```

### Étape C — Les clés secrètes

1. Crée un fichier nommé `.env.local` à la racine du projet.
2. Mets dedans (avec **tes** vraies clés Supabase) :

```env
NEXT_PUBLIC_SUPABASE_URL=https://TON-PROJET.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TA_CLE_ANON
```

Tu trouves ces clés sur https://supabase.com → ton projet → **Settings** → **API**.

### Étape D — Lancer

```bash
npm run dev
```

Puis ouvre : http://localhost:3000

---

## Site déjà en ligne

Pas besoin d’installer quoi que ce soit pour jouer :

👉 **https://chalosse-fc.vercel.app**

---

## Besoin d’aide ?

Dans l’app, clique sur le bouton **?** en bas à droite.
