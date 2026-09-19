// Centralized API Client Service for Gram Setu

const getBaseUrl = (): string => {
  const meta = import.meta as any;
  const envUrl = meta && meta.env ? meta.env.VITE_API_BASE_URL : undefined;
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
  }
  return '/api';
};

export const API_BASE_URL = getBaseUrl();

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('gs_token');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const urlsToTry = [
    `${API_BASE_URL}${cleanEndpoint}`,
    `http://localhost:5000/api${cleanEndpoint}`
  ];

  let lastError: any = null;

  for (const url of urlsToTry) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        ...options,
        headers,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `HTTP Error ${res.status}`);
      }

      return data as T;
    } catch (err: any) {
      lastError = err;
      console.warn(`[API Failure on ${url}]:`, err.message);
    }
  }

  throw lastError || new Error('सर्वर से संपर्क नहीं हो पा रहा है (Server connection failed)');
}

export const api = {
  get: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body || {}) }),
  put: <T = any>(endpoint: string, body?: any) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body || {}) }),
  patch: <T = any>(endpoint: string, body?: any) => request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body || {}) }),
  delete: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
