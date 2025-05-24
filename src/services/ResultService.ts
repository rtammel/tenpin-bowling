import type { Event } from '@/types/Event';
import { BaseService } from './BaseService';
import type { EventResults, PlayerResults, SquadResults } from '@/types/Results';

export default class EventService extends BaseService {

  constructor() {
    super(import.meta.env.VITE_API_URL + '/results');
  }

  async getResults(): Promise<Event[]> {
    try {
      const response = await this.api.get('/');
      return response.data;
    } catch {
      throw new Error('Could not fetch results.');
    }
  }

  async getEventResultsById(eventId: string): Promise<EventResults> {
    try {
      const response = await this.api.get<EventResults>(`/${eventId}`);
      return response.data;
    } catch {
        throw new Error('Could not fetch event results.');
    }
  }

  async getEventSquadResultsById(squadId: string): Promise<SquadResults> {
    try {
      const response = await this.api.get<SquadResults>(`/squads/${squadId}`);
      return response.data;
    } catch {
        throw new Error('Could not fetch squad results.');
    }
  }

  async getPlayerEventResultsById(eventId: string, playerId: string): Promise<PlayerResults> {
    try {
      const response = await this.api.get<PlayerResults>(`/${eventId}/${playerId}`);
      return response.data;
    } catch {
        throw new Error('Could not fetch player results.');
    }
  }

}
