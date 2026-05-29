const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.xcleone.me';

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.entries(options.headers as Record<string, string>).forEach(([k, v]) => {
      headers[k] = v;
    });
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Error: ${response.status}`);
  }

  return response.json();
}
