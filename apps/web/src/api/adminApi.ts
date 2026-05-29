import { apiCall } from './client';
import { User } from '../store/authStore';
import { Room } from './userApi';

export async function getAdminUsers(token: string): Promise<{ users: User[] }> {
  return apiCall<{ users: User[] }>('/api/admin/users', {}, token);
}

export async function deleteUser(token: string, userId: number): Promise<{ message: string }> {
  return apiCall<{ message: string }>(`/api/admin/users/${userId}`, { method: 'DELETE' }, token);
}

export async function toggleUserRole(
  token: string,
  userId: number
): Promise<{ message: string; user: User }> {
  return apiCall<{ message: string; user: User }>(
    `/api/admin/users/${userId}/toggle-role`,
    { method: 'POST' },
    token
  );
}

export async function getAdminRooms(token: string): Promise<{ rooms: Room[] }> {
  return apiCall<{ rooms: Room[] }>('/api/admin/rooms', {}, token);
}

export interface CreateRoomPayload {
  name: string;
  description?: string;
  capacity: number;
  is_public?: boolean;
}

export async function createRoom(
  token: string,
  payload: CreateRoomPayload
): Promise<{ message: string; room: Room }> {
  return apiCall<{ message: string; room: Room }>(
    '/api/admin/rooms',
    { method: 'POST', body: JSON.stringify(payload) },
    token
  );
}

export async function updateRoom(
  token: string,
  roomId: number,
  payload: Partial<CreateRoomPayload>
): Promise<{ message: string; room: Room }> {
  return apiCall<{ message: string; room: Room }>(
    `/api/admin/rooms/${roomId}`,
    { method: 'PUT', body: JSON.stringify(payload) },
    token
  );
}

export async function deleteRoom(token: string, roomId: number): Promise<{ message: string }> {
  return apiCall<{ message: string }>(`/api/admin/rooms/${roomId}`, { method: 'DELETE' }, token);
}

export interface Item {
  id: number;
  name: string;
  description: string | null;
  type: string;
  price: number;
}

export async function getAdminItems(token: string): Promise<{ items: Item[] }> {
  return apiCall<{ items: Item[] }>('/api/admin/items', {}, token);
}

export async function createItem(token: string, payload: { name: string; description?: string; type: string; price: number }): Promise<{ message: string; item: Item }> {
  return apiCall<{ message: string; item: Item }>(
    '/api/admin/items',
    { method: 'POST', body: JSON.stringify(payload) },
    token
  );
}

export async function addInventoryItem(
  token: string,
  payload: { user_id: number; item_id: number; quantity: number }
): Promise<{ message: string }> {
  return apiCall<{ message: string }>(
    '/api/admin/inventory/add',
    { method: 'POST', body: JSON.stringify(payload) },
    token
  );
}
