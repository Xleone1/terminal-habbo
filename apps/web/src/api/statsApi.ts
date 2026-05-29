import { apiCall } from './client';
import { User } from '../store/authStore';

export interface Statistics {
  stats: {
    total_users: number;
    total_admins: number;
    players_online: number;
    total_rooms: number;
    active_rooms: number;
  };
  recent_users: User[];
  timestamp: string;
}

export async function getStats(): Promise<Statistics> {
  return apiCall<Statistics>('/api/stats');
}
