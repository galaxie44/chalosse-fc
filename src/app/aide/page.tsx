import { PageIntro } from "@/components/ui/PageBits";

const GUIDES = [
  {
    title: "Connexion",
    text: "Inscrivez-vous avec prénom, nom, e-mail et mot de passe, puis connectez-vous pour accéder au club.",
  },
  {
    title: "Accueil",
    text: "Les matchs les plus proches pour la Première et la Réserve, avec accès rapide aux notes.",
  },
  {
    title: "Calendrier & Effectif",
    text: "Parcourez les rencontres, filtrez à venir / joués, et consultez le groupe par poste.",
  },
  {
    title: "Noter un match",
    text: "Ouvrez un match avec composition, notez de 0 à 10, validez. Le classement se met à jour.",
  },
  {
    title: "Statistiques",
    text: "Buts, passes, cartons et moyenne de note par joueur sur la saison.",
  },
  {
    title: "Administration",
    text: "Réservé au staff : joueurs, matchs, compositions, stats match et comptes.",
  },
] as const;

export default function AidePage() {
  return (
    <main>
      <PageIntro
        kicker="Club"
        title="Guide"
        subtitle="Les essentiels pour utiliser FC Chalosse."
      />
      <div className="guide-list">
        {GUIDES.map((g) => (
          <article key={g.title}>
            <h2>{g.title}</h2>
            <p>{g.text}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
