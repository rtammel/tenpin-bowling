import type { SquadData } from '@/types/Squad';
import { BaseService } from './BaseService';

export default class SquadService extends BaseService {

  constructor() {
    super(import.meta.env.VITE_API_URL + '/squads');
  }

  async getSquadById(squadId: string): Promise<SquadData> {
    try {
      const response = await this.api.get(`/${squadId}`);
      return response.data;
    } catch {
      throw new Error('Could not fetch squad.');
    }
  }
}
