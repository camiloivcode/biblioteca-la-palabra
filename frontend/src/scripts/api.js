const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_URL;
  }

  _getToken() {
    return localStorage.getItem('accessToken');
  }

  _getHeaders(includeAuth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (includeAuth) {
      const token = this._getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async _handleResponse(response) {
    const data = await response.json();

    if (response.status === 401) {
      // Intentar refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${this.baseUrl}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            localStorage.setItem('accessToken', refreshData.data.accessToken);
            // El usuario deberá reintentar la operación
            throw new Error('Token renovado, reintenta la operación');
          }
        } catch {
          // Falló el refresh, redirigir a login
        }
      }
      localStorage.clear();
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }

    if (!data.success) {
      const error = new Error(data.message || 'Error en la solicitud');
      error.errors = data.errors;
      error.status = response.status;
      throw error;
    }

    return data;
  }

  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v);
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this._getHeaders(),
    });

    return this._handleResponse(response);
  }

  async post(endpoint, body = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify(body),
    });
    return this._handleResponse(response);
  }

  async put(endpoint, body = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this._getHeaders(),
      body: JSON.stringify(body),
    });
    return this._handleResponse(response);
  }

  async patch(endpoint, body = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this._getHeaders(),
      body: JSON.stringify(body),
    });
    return this._handleResponse(response);
  }

  async delete(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this._getHeaders(),
    });
    return this._handleResponse(response);
  }
}

export const api = new ApiClient();
export { API_URL };