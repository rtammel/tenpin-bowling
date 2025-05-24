import type { Event } from '@/types/Event';
import type { Squad } from '@/types/Squad';
import type { User } from '@/types/User';
import type { Stats } from '@/types/Stats';

export interface EventData {
  event: Event | null;
  squads: Squad[];
  users: User[];
  stats: Stats;
}
