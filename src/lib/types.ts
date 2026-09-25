export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "admin" | "utilisateur";
};

export type Player = {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
};

export type Match = {
  id: string;
  team_type: "premiere" | "reserve";
  opponent: string;
  match_date: string;
  opponent_logo: string | null;
  score_chalosse: number | null;
  score_adversaire: number | null;
};

export type MatchStat = {
  match_id: string;
  player_id: string;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
};
