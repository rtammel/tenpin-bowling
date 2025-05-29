import { BaseService } from './BaseService';
import type { Event } from '@/types/Event';

export default class RegistrationService extends BaseService {

  constructor() {
    super(import.meta.env.VITE_API_URL + '/register');
  }

  async getEventDataById(eventId: string): Promise<Event> {
    try {
      const response = await this.api.get<Event>(`/${eventId}`);
      return response.data;
    } catch {
      throw new Error("Could not fetch event data.");
      
    }
  }

  async registerForEvent(squadIds: number[]): Promise<{ message: string }> {
    try {
      const response = await this.api.post('/', { squadIds });
      return response.data;
    } catch (error) {
      console.error('Error registering for event:', error);
      throw new Error("Registration failed.");
    }
  }

}
