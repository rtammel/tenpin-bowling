import type { Squad } from './Squad';

export interface Player {
  player_id: number;
  player_name: string;
  email: string;
  squads: Squad[];
}
