import type { Polygon, PolygonData } from '../types';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const fetchWithError = async (url: string, options?: RequestInit): Promise<any> => {
  const response = await fetch(`${baseURL}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  // Handle responses with no content (like DELETE 204)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined;
  }
  
  return response.json();
};

export const polygonApi = {
  getAll: (): Promise<Polygon[]> => fetchWithError('/polygons'),
  
  create: (data: PolygonData): Promise<Polygon> => fetchWithError('/polygons', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  delete: (id: string): Promise<void> => fetchWithError(`/polygons/${id}`, {
    method: 'DELETE'
  })
};

export { ApiError };