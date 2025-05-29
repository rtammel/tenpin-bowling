import axios from 'axios';
import type { AxiosInstance } from 'axios';
import AuthService from './AuthService';

export class BaseService {
  protected api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = axios.create({
      baseURL,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    });

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 403) {
          try {
            const authService = new AuthService();
            await authService.refreshToken();
            return this.api.request(error.config);
          } catch {
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );
  }
}
