import type { Squad } from './Squad';

export interface Event {
  event_id: number;
  event_name: string;
  start_date: string;
  end_date: string;
  location_name: string;
  location_address: string;
  latitude?: number;
  longitude?: number;
  country: string;
  image_url: string;
  occupation_rate: number;
  total_registrations: number;
  squads?: Squad[];
  registeredSquads?: [];
}
