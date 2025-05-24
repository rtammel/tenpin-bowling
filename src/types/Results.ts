export interface GameFrame {
  frame_number: number;
  roll_1: number | null;
  roll_2: number | null;
  roll_3: number | null;
  frame_score: number | null;
  pins_after_roll_1?: number[];
  pins_after_roll_2?: number[];
  pins_after_roll_3?: number[];
  is_split: boolean;
}

export interface Game {
  game_number: number;
  lane_number: number;
  score: number;
  frames: GameFrame[];
}

export interface Standings {
  player_id: number;
  fullname: string;
  country: string;
  total_score: number;
  avg_score: number;
  games: Game[];
}

export interface SquadGames {
  event_id: number;
  squad_id: number;
  squad_name: string;
  squad_datetime: string;
  total_score: number;
  avg_score: number;
  games: Game[];
}

export interface PlayerStats {
  player_id: number;
  fullname: string;
  country: string;
  games_played: number;
  squads_played: number;
  highest_game: number;
  avg_score: number;
}

export interface ScheduleItem {
  squad_id: number;
  squad_name: string;
  squad_datetime: string;
}

export interface EventResults {
  event_id: number;
  event_name: string;
  start_date: string;
  end_date: string;
  location_name: string;
  location_address: string;
  event_country: string;
  image_url: string;
  standings: Standings[];
  players: PlayerStats[];
  schedule: ScheduleItem[];
}

export interface SquadResults {
  squad_id: number;
  squad_name: string;
  event_id: number;
  event_name: string;
  event_start_date: string;
  event_end_date: string;
  location_name: string;
  location_address: string;
  squad_datetime: string;
  players: Standings[];
}

export interface PlayerResults {
  player_id: number;
  fullname: string;
  country: string;
  avg_score: number;
  event_id: number;
  event_name: string;
  event_start_date: string;
  event_end_date: string;
  location_name: string;
  location_address: string;
  squad_games: SquadGames[];
}
