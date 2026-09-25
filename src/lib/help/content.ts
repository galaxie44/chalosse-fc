export type HelpRole = "invite" | "utilisateur" | "admin";

export type HelpTopic = {
  id: string;
  question: string;
  roles: HelpRole[];
  answer: string;
};

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: "guest-start",
    question: "Comment accéder au site ?",
    roles: ["invite"],
    answer: `## Connexion

1. Saisissez votre **e-mail** et votre **mot de passe**.
2. Cliquez sur **Se connecter**.

Pas encore de compte ? Allez sur [S'inscrire](/inscription).

Le mot de passe doit faire **au moins 6 caractères**.

Mot de passe oublié ? [Demandez un e-mail de récupération](/mdp-oublie).`,
  },
  {
    id: "guest-signup",
    question: "Comment créer un compte ?",
    roles: ["invite"],
    answer: `## Inscription

Renseignez :

- prénom
- nom
- e-mail
- mot de passe (6 caractères minimum)

Puis validez : vous êtes connecté tout de suite.

→ [Page d'inscription](/inscription)`,
  },
  {
    id: "guest-what",
    question: "À quoi sert FC Chalosse ?",
    roles: ["invite"],
    answer: `## Le club en ligne

Une fois connecté, vous pourrez :

- consulter l'**effectif** et le **calendrier**
- voir les **stats** de saison
- **noter** les joueurs après un match

Les administrateurs gèrent aussi les matchs, les compos et les comptes.`,
  },
  {
    id: "nav-home",
    question: "Où suis-je ? Comment naviguer ?",
    roles: ["utilisateur", "admin"],
    answer: `## Accueil

Le bandeau **FC Chalosse** mène aux pages du club :

- [Effectif](/effectif) — liste des joueurs
- [Calendrier](/calendrier) — matchs Première & Réserve
- [Stats saison](/stats) — buts, passes, notes
- [Homme du match](/classement) — moyennes des notes
- [Aide](/aide) — guide écrit

Sur l'accueil, cliquez sur un match **À l'affiche** pour ouvrir la feuille et les notes.`,
  },
  {
    id: "rate",
    question: "Comment noter un joueur ?",
    roles: ["utilisateur", "admin"],
    answer: `## Noter un match

1. Ouvrez le [calendrier](/calendrier) ou un match **À l'affiche**.
2. Onglet **Noter**.
3. Notez chaque joueur de la compo **de 0 à 10** (ex. \`7,5\`).
4. Validez **mes notes**.

Vous pouvez modifier vos notes plus tard. L'onglet **Classement** affiche les moyennes du match.

> Seuls les joueurs **dans la composition** peuvent être notés.`,
  },
  {
    id: "stats-user",
    question: "Où voir les statistiques ?",
    roles: ["utilisateur", "admin"],
    answer: `## Stats

- [Stats saison](/stats) : matchs joués, buts, passes, cartons, moyenne.
- [Homme du match](/classement) : classement des moyennes sur toute la saison.

Les stats d'un match sont saisies par un **admin** après la rencontre.`,
  },
  {
    id: "calendar-user",
    question: "Comment lire le calendrier ?",
    roles: ["utilisateur", "admin"],
    answer: `## Calendrier

Deux listes : **Équipe Première** et **Équipe Réserve**.

- **VS** = score pas encore saisi
- **3 - 1** = résultat

Cliquez une carte pour le détail et les notes.

→ [Ouvrir le calendrier](/calendrier)`,
  },
  {
    id: "squad-user",
    question: "Où trouver l'effectif ?",
    roles: ["utilisateur", "admin"],
    answer: `## Effectif

La page [Effectif](/effectif) liste les joueurs (nom + poste), triés par nom.

C'est l'effectif **sportif**, distinct des comptes de connexion.`,
  },
  {
    id: "session",
    question: "Comment me déconnecter ?",
    roles: ["utilisateur", "admin"],
    answer: `## Session

En bas de l'écran : votre e-mail et le bouton rouge **Quitter**.

Vous revenez alors à [la connexion](/connexion).`,
  },
  {
    id: "admin-overview",
    question: "Que puis-je faire en admin ?",
    roles: ["admin"],
    answer: `## Espace administrateur

Sur l'accueil, le bouton **Administration** ouvre le [tableau de bord admin](/admin) :

- [Joueur](/admin/joueur) — ajouter un joueur
- [Match](/admin/match) — créer un match
- [Compos](/admin/compos) — feuille de match
- [Stats](/admin/stats) — buts / cartons
- [Comptes](/admin/comptes) — comptes de l'application

Vous pouvez aussi **modifier le score** (crayon) et **supprimer** un match dans le calendrier.`,
  },
  {
    id: "admin-compo",
    question: "Comment poser une composition ?",
    roles: ["admin"],
    answer: `## Composition

1. Allez sur [Compos](/admin/compos).
2. Choisissez un match **Première** *ou* **Réserve**.
3. Cochez les joueurs (30 max.).
4. **Valider la composition**.

Sans compo, personne ne peut noter le match, et les stats ne peuvent pas être saisies.`,
  },
  {
    id: "admin-stats",
    question: "Comment saisir buts et cartons ?",
    roles: ["admin"],
    answer: `## Stats d'un match

1. Posez d'abord la [composition](/admin/compos).
2. Ouvrez [Saisir stats](/admin/stats).
3. Choisissez le match.
4. Renseignez ⚽ buts, 🎯 passes, 🟨, 🟥.
5. Enregistrez : vous arrivez sur [Stats saison](/stats).`,
  },
  {
    id: "admin-accounts",
    question: "Quelle est la différence joueur / compte ?",
    roles: ["admin"],
    answer: `## Deux listes

- **Effectif** : fiches sportives (ajout via [Joueur](/admin/joueur)), sans connexion.
- **Comptes** : personnes inscrites à l'app ([Comptes](/admin/comptes)).

Un compte **utilisateur** note les matchs. Un compte **admin** gère le club.

Vous ne pouvez pas supprimer **votre** propre compte.`,
  },
];

export function topicsFor(role: HelpRole) {
  return HELP_TOPICS.filter((t) => t.roles.includes(role));
}

export function welcomeMarkdown(role: HelpRole, firstName?: string) {
  if (role === "invite") {
    return `Bonjour.

Je suis l'**assistant FC Chalosse**. Choisissez une question ci-dessous pour vous aider à vous connecter ou à comprendre le site.`;
  }
  if (role === "admin") {
    return `Bonjour${firstName ? ` **${firstName}**` : ""}.

Vous êtes connecté en **administrateur**. Je peux vous guider dans la navigation du club **et** dans les outils de gestion (matchs, compos, stats, comptes).`;
  }
  return `Bonjour${firstName ? ` **${firstName}**` : ""}.

Vous êtes connecté en **utilisateur**. Choisissez une question pour trouver une page, noter un match ou lire les stats.`;
}
