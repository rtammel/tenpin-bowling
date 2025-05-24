import type { Event } from '@/types/Event';
import type { EventData } from '@/types/EventData';
import type { Squad } from '@/types/Squad';
import type { PlayerStats } from '@/types/Results';
import { BaseService } from './BaseService';

export default class EventService extends BaseService {

  constructor() {
    super(import.meta.env.VITE_API_URL + '/events');
  }

  async getEvents(): Promise<Event[]> {
    try {
      const response = await this.api.get('/');
      return response.data;
    } catch {
      throw new Error("Could not fetch events.");
    }
  }

  async getEventById(eventId: string): Promise<EventData> {
    try {
      const response = await this.api.get<EventData>(`/${eventId}`);
      return response.data;
    } catch {
      throw new Error("Could not fetch event details.");
    }
  }

  async getEventByIdSquads(eventId: string): Promise<Squad[]> {
    try {
      const response = await this.api.get<Squad[]>(`/${eventId}/squads`);
      return response.data;
    } catch {
      throw new Error("Could not fetch event squads.");
    }
  }

  async getEventByIdPlayers(eventId: string): Promise<PlayerStats[]> {
    try {
      const response = await this.api.get<PlayerStats[]>(`/${eventId}/players`);
      return response.data;
    } catch {
      throw new Error("Could not fetch event players.");
    }
  }

}
