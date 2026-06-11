(function () {
  const BASE_URL = window.API_URL || 'http://localhost:4000/api';

  async function refreshToken() {
    const rt = localStorage.getItem('refreshToken');
    if (!rt) throw new Error('No refresh token');
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });
    const data = await res.json();
    if (!data.success) throw new Error('Refresh failed');
    localStorage.setItem('accessToken', data.data.accessToken);
    return data.data.accessToken;
  }

  async function request(method, endpoint, body, params) {
    let url = `${BASE_URL}${endpoint}`;
    if (method === 'GET' && params) {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.append(k, v); });
      const str = qs.toString();
      if (str) url += '?' + str;
    }
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    const token = localStorage.getItem('accessToken');
    if (token) opts.headers.Authorization = `Bearer ${token}`;
    if (body && method !== 'GET') opts.body = JSON.stringify(body);

    let res = await fetch(url, opts);
    if (res.status === 401) {
      try {
        await refreshToken();
        opts.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`;
        res = await fetch(url, opts);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
        throw new Error('Sesión expirada');
      }
    }
    const data = await res.json();
    if (!data.success) {
      const err = new Error(data.message || 'Error en la solicitud');
      err.errors = data.errors;
      err.status = res.status;
      throw err;
    }
    return data;
  }

  window.api = {
    get: (e, p) => request('GET', e, null, p),
    post: (e, b) => request('POST', e, b),
    put: (e, b) => request('PUT', e, b),
    patch: (e, b) => request('PATCH', e, b),
    del: (e) => request('DELETE', e),
  };
})();
