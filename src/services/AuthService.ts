import { BaseService } from './BaseService';
import router from '@/router';
import type { User } from '@/types/User';

export default class AuthService extends BaseService {

  constructor() {
    super(import.meta.env.VITE_API_URL + '/auth');
  }

  async register(credentials: { firstName: string; lastName: string; gender: string; email: string; password: string }): Promise<User | null> {
    try {
      const response = await this.api.post('/register', credentials);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      return null;
    }
  }

  async login(credentials: { email: string; password: string }) {
    try {
      return await this.api.post('/login', credentials);
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/logout');
    } catch {
      throw new Error('Logout failed');
    } finally {
      router.push('/events');
    }
  }

  async refreshToken() {
    try {
      const { data } = await this.api.post('/refresh');
      return data.isAuthenticated;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }
}
