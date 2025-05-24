export interface Squad {
  squad_id: number;
  squad_name: string;
  squad_date_time: string;
  entry_price: number;
  reentry_price: number;
  max_players: number;
  registered_players: number;
}

interface Player {
  id: number;
  fullname: string;
  gender: string;
  country: string;
  clubname: string;
}

export interface SquadData {
  event_id: number;
  event_name: string;
  image_url: string;
  squadId: number;
  squadName: string;
  squads: Squad[];
  players: Player[];
}
