export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (response.status === 401) {
    localStorage.removeItem('token');
  }

  if (!response.ok) {
    throw new ApiError(
      data.message ?? 'Request failed',
      response.status,
    );
  }

  return data;
}