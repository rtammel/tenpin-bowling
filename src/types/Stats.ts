export interface Stats {
  total_registrations: number;
  total_players: number;
  countries: {
    user_country: string;
    user_count: number;
  }[];
}
