import type { Profile } from './User';

export interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
}
