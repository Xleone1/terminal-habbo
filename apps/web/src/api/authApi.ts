import { apiCall } from './client';
import { User } from '../store/authStore';

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  return apiCall<LoginResponse>('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function register(
  username: string,
  password: string
): Promise<RegisterResponse> {
  return apiCall<RegisterResponse>('/api/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function getMe(token: string): Promise<{ user: User }> {
  return apiCall<{ user: User }>('/api/me', {}, token);
}

export async function logout(token: string): Promise<{ message: string }> {
  return apiCall<{ message: string }>('/api/logout', { method: 'POST' }, token);
}

export async function refreshToken(token: string): Promise<LoginResponse> {
  return apiCall<LoginResponse>('/api/refresh-token', { method: 'POST' }, token);
}
