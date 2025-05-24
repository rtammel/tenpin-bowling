import { defineStore } from 'pinia';
import AuthService from '@/services/AuthService';
import type { AuthState } from '@/types/AuthState';

const authService = new AuthService();

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
  }),
  persist: true,

  getters: {
    getUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
  },

  actions: {
    async register(credentials: {
      firstName: string
      lastName: string
      gender: string
      email: string
      password: string
    }): Promise<boolean> {
      const user = await authService.register(credentials);
      if (user) {
        this.user = user;
        this.isAuthenticated = true;
        return true;
      }
      return false;
    },

    async login(credentials: { email: string; password: string }): Promise<boolean> {
      const response = await authService.login(credentials);
      if (response) {
        this.user = response.data.user;
        this.isAuthenticated = true;
        return true;
      }
      return false;
    },

    async logout() {
      await authService.logout();
      this.user = null;
      this.isAuthenticated = false;
    },
  },
});
