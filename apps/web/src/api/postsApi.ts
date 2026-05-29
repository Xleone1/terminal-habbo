import { apiCall } from './client';

export interface Post {
  id: number;
  type: 'news' | 'community';
  title: string | null;
  content: string;
  excerpt: string | null;
  author: string;
  published_at: string;
  created_at: string;
}

export async function getPosts(): Promise<{ posts: Post[] }> {
  return apiCall<{ posts: Post[] }>('/api/posts');
}

export interface CreatePostPayload {
  type: 'news' | 'community';
  title?: string;
  content: string;
  excerpt?: string;
  author: string;
}

export async function getAdminPosts(token: string): Promise<{ posts: Post[] }> {
  return apiCall<{ posts: Post[] }>('/api/admin/posts', {}, token);
}

export async function createPost(token: string, payload: CreatePostPayload): Promise<{ message: string; post: Post }> {
  return apiCall<{ message: string; post: Post }>(
    '/api/admin/posts',
    { method: 'POST', body: JSON.stringify(payload) },
    token
  );
}

export async function updatePost(token: string, postId: number, payload: Partial<CreatePostPayload>): Promise<{ message: string; post: Post }> {
  return apiCall<{ message: string; post: Post }>(
    `/api/admin/posts/${postId}`,
    { method: 'PUT', body: JSON.stringify(payload) },
    token
  );
}

export async function deletePost(token: string, postId: number): Promise<{ message: string }> {
  return apiCall<{ message: string }>(`/api/admin/posts/${postId}`, { method: 'DELETE' }, token);
}
