# Installer FC Chalosse pour toi

Ce guide te montre comment installer l’application **sur ton compte**, avec **ta** base de données.

Tu auras besoin de :

1. Un compte **GitHub** (gratuit)
2. Un compte **Supabase** (gratuit)
3. Un compte **Vercel** (gratuit)
4. **Node.js** sur ton ordinateur : https://nodejs.org (bouton **LTS**)

⏱️ Temps : environ 20 minutes.

---

## Étape 1 — Récupérer le code

### 1.1 Va sur le projet

Ouvre ce lien :

👉 https://github.com/galaxie44/chalosse-fc

### 1.2 Fais une copie sur ton GitHub

1. Clique sur le bouton **Fork** (en haut à droite).
2. Clique sur **Create fork**.
3. Attends. Tu as maintenant **ton** dépôt.

### 1.3 Télécharge le code sur ton PC

1. Sur **ton** fork, clique sur le bouton vert **Code**.
2. Clique sur **HTTPS**.
3. Clique sur l’icône de copie (à côté de l’URL).
4. Ouvre un terminal (PowerShell ou Invite de commandes).
5. Tape ceci (colle ton URL à la place) :

```bash
git clone https://github.com/TON-PSEUDO/chalosse-fc.git
cd chalosse-fc
npm install
```

✅ Si ça marche, tu as le projet sur ton ordinateur.

---

## Étape 2 — Créer la base de données (Supabase)

### 2.1 Crée un projet Supabase

1. Va sur https://supabase.com
2. Clique sur **Start your project** / **Sign in**
3. Connecte-toi avec **GitHub** (le plus simple)
4. Clique sur **New project**
5. Choisis :
   - **Name** : `chalosse-fc` (ou ce que tu veux)
   - **Database Password** : invente un mot de passe **fort** et note-le
   - **Region** : `Frankfurt` ou `Paris` si dispo
6. Clique sur **Create new project**
7. Attends que le projet soit prêt (barre verte)

### 2.2 Crée les tables

1. Dans le menu de gauche, clique sur **SQL Editor**
2. Clique sur **New query**
3. Ouvre le fichier du projet : `supabase/setup.sql`
4. **Copie tout** le contenu du fichier
5. **Colle** dans l’éditeur SQL de Supabase
6. Clique sur **Run** (ou Ctrl+Entrée)

✅ Tu dois voir un message de succès (plus d’erreur rouge).

### 2.3 Désactive la confirmation e-mail

1. Menu gauche → **Authentication**
2. Clique sur **Providers**
3. Clique sur **Email**
4. Désactive **Confirm email** (mets sur OFF)
5. Clique sur **Save**

### 2.4 Récupère tes 2 clés

1. Menu gauche → **Project Settings** (engrenage)
2. Clique sur **API**
3. Copie et garde :

| Nom | Où c’est écrit |
|-----|----------------|
| URL | **Project URL** |
| Clé | **anon** / **public** (clé longue) |

⚠️ Ne partage jamais la clé **service_role**.

---

## Étape 3 — Fichier secret sur ton PC

1. Dans le dossier `chalosse-fc`, crée un fichier nommé exactement :

```text
.env.local
```

2. Mets dedans (remplace par **tes** valeurs) :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...ta_cle_anon
```

3. Sauvegarde.

---

## Étape 4 — Tester en local

Dans le terminal, toujours dans le dossier du projet :

```bash
npm run dev
```

1. Ouvre http://localhost:3000
2. Clique sur **Créer un compte**
3. Inscris-toi

✅ Le **premier** compte devient **admin** automatiquement.

Si ça marche en local, on met en ligne.

---

## Étape 5 — Mettre en ligne (Vercel)

### 5.1 Crée le projet Vercel

1. Va sur https://vercel.com
2. Connecte-toi avec **GitHub**
3. Clique sur **Add New…** → **Project**
4. Importe **ton** dépôt `chalosse-fc`
5. **Avant** de déployer, clique sur **Environment Variables**
6. Ajoute les 2 variables :

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ton URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ta clé anon |

7. Clique sur **Deploy**
8. Attends la fin
9. Clique sur le lien du site (ex: `https://chalosse-fc-xxxx.vercel.app`)

### 5.2 Relie Supabase à ton site Vercel

1. Retourne sur Supabase → **Authentication** → **URL Configuration**
2. **Site URL** = l’adresse de ton site Vercel  
   Exemple : `https://ton-site.vercel.app`
3. Dans **Redirect URLs**, ajoute :

```text
https://ton-site.vercel.app/**
http://localhost:3000/**
```

4. Clique sur **Save**

✅ Ton app est en ligne avec **ta** base.

---

## Étape 6 — Utiliser l’app

1. Ouvre ton site Vercel
2. Crée ton compte (si ce n’est pas déjà fait)
3. Tu es **admin**
4. Va dans **Admin** :
   - ajoute des joueurs
   - crée un match
   - fais la composition
   - mets le score
   - saisis les stats

Les autres personnes s’inscrivent avec le même lien : elles sont **utilisateurs** (peuvent noter les matchs).

---

## Problèmes fréquents

### « Impossible de créer le compte »

- Vérifie `.env.local` (URL + clé)
- Vérifie que le SQL a bien été exécuté
- Vérifie que **Confirm email** est OFF

### « Page blanche » ou erreur après déploiement

- Sur Vercel → Project → **Settings** → **Environment Variables**
- Vérifie que les 2 variables sont bien là
- Redeploy : **Deployments** → ⋮ → **Redeploy**

### Mot de passe oublié ne marche pas

- Vérifie les **Redirect URLs** dans Supabase (étape 5.2)
- Sur un plan gratuit, l’e-mail peut arriver dans les spams

### Je ne suis pas admin

- Le **premier** compte du projet est admin
- Si tu as raté : dans Supabase → **Table Editor** → `profiles` → change `role` en `admin` pour ton compte

---

## Commandes utiles

```bash
npm install      # installer les paquets
npm run dev      # lancer en local
npm run build    # tester la compilation
```

---

## C’est tout

Tu as maintenant :

1. Ton code sur GitHub  
2. Ta base sur Supabase  
3. Ton site sur Vercel  

Bonne saison ⚽
