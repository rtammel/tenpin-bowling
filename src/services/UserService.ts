import type { User } from '@/types/User';
import { BaseService } from './BaseService';

export default class UserService extends BaseService {

  constructor() {
    super(import.meta.env.VITE_API_URL + '/users');
  }

  async getProfile(): Promise<User | null> {
    try {
      const response = await this.api.get('/profile');
      return response.data.user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async updateProfile(formatDate: FormData): Promise<User | null> {
    try {
      const response = await this.api.put('/profile', formatDate, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.user;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  async getBookings() {
    try {
      const response = await this.api.get('/bookings');
      return response.data;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return null;
    }
  }

  async getResults() {
    try {
      const response = await this.api.get('/results');
      return response.data.events;
    } catch (error) {
      console.error('Error fetching user results:', error);
      return null;
    }
  }
}
