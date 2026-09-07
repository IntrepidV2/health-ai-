import { Capacitor } from '@capacitor/core';

// Determine the correct backend API base URL
export function getApiBaseUrl(): string {
  // Check if custom server URL was configured by user
  const savedUrl = localStorage.getItem('pulsera_server_url');
  if (savedUrl && savedUrl.trim()) {
    return savedUrl.trim().replace(/\/+$/, '');
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }

  // Capacitor on Android: default to your computer's local Wi-Fi IP so phones can connect directly
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    return 'http://192.168.1.36:5001';
  }

  // Web browser default
  return 'http://localhost:5001';
}

export function setApiBaseUrl(url: string) {
  if (url && url.trim()) {
    localStorage.setItem('pulsera_server_url', url.trim().replace(/\/+$/, ''));
  } else {
    localStorage.removeItem('pulsera_server_url');
  }
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('pulsera_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('pulsera_token', token);
    } else {
      localStorage.removeItem('pulsera_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('pulsera_token');
    }
    return this.token;
  }

  private getHeaders(contentType: string | null = 'application/json'): HeadersInit {
    const headers: Record<string, string> = {};
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async get<T>(path: string): Promise<T> {
    const url = `${getApiBaseUrl()}${path}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `GET ${path} failed with status ${res.status}`);
    }

    return res.json();
  }

  async post<T>(path: string, body: any): Promise<T> {
    const url = `${getApiBaseUrl()}${path}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `POST ${path} failed with status ${res.status}`);
    }

    return res.json();
  }

  async delete<T>(path: string): Promise<T> {
    const url = `${getApiBaseUrl()}${path}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `DELETE ${path} failed with status ${res.status}`);
    }

    return res.json();
  }

  async upload<T>(path: string, file: File): Promise<T> {
    const url = `${getApiBaseUrl()}${path}`;
    const formData = new FormData();
    formData.append('file', file);

    const headers = this.getHeaders(null); // Don't set Content-Type so browser sets boundary multipart

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Upload failed with status ${res.status}`);
    }

    return res.json();
  }
}

export const apiClient = new ApiClient();
