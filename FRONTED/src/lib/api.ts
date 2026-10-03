import { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class CustomApiError extends Error {
  public statusCode: number;
  public errors?: Record<string, string | string[]>;

  constructor(message: string, statusCode: number, errors?: Record<string, string | string[]>) {
    super(message);
    this.name = 'CustomApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// Token management in browser localStorage
export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
};

export const removeStoredToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
};

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { body, params, headers = {}, ...customConfig } = options;

  // Build query string if params are provided
  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const reqHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  // Attach token if available
  const token = getStoredToken();
  if (token && !reqHeaders['Authorization']) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData vs JSON
  let processedBody: BodyInit | null | undefined = undefined;

  if (body instanceof FormData) {
    // DO NOT set Content-Type header when body is FormData; browser sets it with boundary automatically
    delete reqHeaders['Content-Type'];
    processedBody = body;
  } else if (body !== undefined && body !== null) {
    reqHeaders['Content-Type'] = 'application/json';
    processedBody = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers: reqHeaders,
      body: processedBody,
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      // Handle expired or invalid token
      if (response.status === 401 && typeof window !== 'undefined') {
        // If not already on auth page, we can clear token
        if (!window.location.pathname.startsWith('/auth')) {
          removeStoredToken();
        }
      }

      const errorMessage = data?.message || getDefaultErrorMessage(response.status);
      throw new CustomApiError(errorMessage, response.status, data?.errors);
    }

    return data as ApiResponse<T>;
  } catch (error) {
    if (error instanceof CustomApiError) {
      throw error;
    }
    // Network or parse error
    throw new CustomApiError(
      'Unable to connect to the blog server. Please ensure the backend is running.',
      0
    );
  }
}

function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request data. Please check your input.';
    case 401:
      return 'Session expired or unauthenticated. Please log in.';
    case 403:
      return 'Access denied. You do not have permission for this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'Conflict: Record already exists.';
    case 422:
      return 'Unprocessable entity. Validation failed.';
    case 429:
      return 'Too many requests. Please try again shortly.';
    case 500:
    default:
      return 'An unexpected server error occurred. Please try again later.';
  }
}
