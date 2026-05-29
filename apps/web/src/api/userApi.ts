import { apiCall } from './client';

export interface Room {
  id: number;
  name: string;
  description: string | null;
  capacity: number;
  current_users: number;
  is_public: boolean;
  created_at: string;
}

export interface InventoryItem {
  id: number;
  item: {
    id: number;
    name: string;
    description: string | null;
    type: string;
  };
  quantity: number;
}

export async function getUserProfile(token: string): Promise<any> {
  return apiCall('/api/user/profile', {}, token);
}

export async function getUserInventory(token: string): Promise<{ inventory: InventoryItem[] }> {
  return apiCall<{ inventory: InventoryItem[] }>('/api/user/inventory', {}, token);
}

export async function getUserRooms(token: string): Promise<{ rooms: Room[] }> {
  return apiCall<{ rooms: Room[] }>('/api/user/rooms', {}, token);
}
