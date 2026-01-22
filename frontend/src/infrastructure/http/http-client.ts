import { UnauthorizedException, ValidationException, NotFoundException } from '@/core/domain/exceptions';
import { API_CONFIG } from '@/shared/constants';
import { getSession } from 'next-auth/react';

export interface HttpClientOptions {
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

class HttpClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultTimeout = API_CONFIG.TIMEOUT;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    method: string,
    options?: HttpClientOptions
  ): Promise<HttpResponse<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      options?.timeout || this.defaultTimeout
    );

    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = {
        ...this.defaultHeaders,
        ...options?.headers,
      };

      // Ajouter le token d'authentification Keycloak depuis la session NextAuth
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const config: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (options?.body && method !== 'GET') {
        config.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, config);

      // Gérer les erreurs HTTP
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();

      return {
        data: data as T,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = 'Une erreur est survenue';
    let errorDetails: unknown;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      errorDetails = errorData;
    } catch {
      // Si le parsing JSON échoue, utiliser le message par défaut
    }

    switch (response.status) {
      case 401:
        throw new UnauthorizedException(errorMessage);
      case 404:
        throw new NotFoundException('Resource', '');
      case 400:
      case 422:
        throw new ValidationException(errorMessage, errorDetails);
      case 403:
        throw new UnauthorizedException(errorMessage);
      case 500:
      case 502:
      case 503:
        // Erreurs serveur - inclure le message pour le debugging
        throw new Error(`Erreur serveur: ${errorMessage}`);
      default:
        throw new Error(errorMessage);
    }
  }

  /**
   * Récupère le token d'authentification depuis la session NextAuth
   */
  private async getAuthToken(): Promise<string | null> {
    if (typeof window === 'undefined') {
      // Côté serveur, on ne peut pas utiliser getSession de cette manière
      return null;
    }

    try {
      const session = await getSession();
      return (session as any)?.accessToken || null;
    } catch {
      return null;
    }
  }

  /**
   * @deprecated Utiliser NextAuth pour gérer les tokens
   */
  setAuthToken(token: string): void {
    console.warn('setAuthToken is deprecated. Use NextAuth for token management.');
  }

  /**
   * @deprecated Utiliser NextAuth pour gérer les tokens
   */
  clearAuthToken(): void {
    console.warn('clearAuthToken is deprecated. Use NextAuth for token management.');
  }

  async get<T>(endpoint: string, options?: HttpClientOptions): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, 'GET', options);
  }

  async post<T>(endpoint: string, body?: unknown, options?: HttpClientOptions): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, 'POST', { ...options, body });
  }

  async put<T>(endpoint: string, body?: unknown, options?: HttpClientOptions): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, 'PUT', { ...options, body });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: HttpClientOptions): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', { ...options, body });
  }

  async delete<T>(endpoint: string, options?: HttpClientOptions): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', options);
  }
}

// Instance singleton du client HTTP
export const httpClient = new HttpClient();

