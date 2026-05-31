const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  token = null;

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  async request(endpoint, options = {}) {
    const { method = 'GET', body, headers = {} } = options;

    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const token = this.getToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  auth = {
    register: (data) => this.request('/auth/register', { method: 'POST', body: data }),
    login: (data) => this.request('/auth/login', { method: 'POST', body: data }),
    logout: () => this.request('/auth/logout', { method: 'POST' }),
    me: () => this.request('/auth/me'),
    refresh: (refreshToken) => this.request('/auth/refresh', { method: 'POST', body: { refreshToken } }),
  };

  users = {
    getProfile: () => this.request('/users/profile'),
    updateProfile: (data) => this.request('/users/profile', { method: 'PATCH', body: data }),
    getPatients: () => this.request('/users/patients'),
    getTherapists: () => this.request('/users/therapists'),
    verifyTherapist: (id, action) => this.request(`/users/therapists/${id}/verify`, { method: 'PATCH', body: { action } }),
    deleteUser: (id) => this.request(`/users/${id}`, { method: 'DELETE' }),
  };

  admin = {
    getStats: () => this.request('/admin/stats'),
  };

  therapists = {
    getAll: (params) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return this.request(`/therapists${query}`);
    },
    getById: (id) => this.request(`/therapists/${id}`),
    getAvailability: (id, date) => {
      const query = date ? `?date=${date}` : '';
      return this.request(`/therapists/${id}/availability${query}`);
    },
    updateProfile: (data) => this.request('/therapists/profile', { method: 'PATCH', body: data }),
    updateAvailability: (availability) => this.request('/therapists/availability', { method: 'PATCH', body: { availability } }),
  };

  appointments = {
    getAll: (params) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return this.request(`/appointments${query}`);
    },
    getById: (id) => this.request(`/appointments/${id}`),
    create: (data) => this.request('/appointments', { method: 'POST', body: data }),
    confirm: (id) => this.request(`/appointments/${id}/confirm`, { method: 'PATCH' }),
    complete: (id) => this.request(`/appointments/${id}/complete`, { method: 'PATCH' }),
    saveNote: (id, therapistNote) => this.request(`/appointments/${id}/note`, { method: 'PATCH', body: { therapistNote } }),
    cancel: (id, reason) => this.request(`/appointments/${id}/cancel`, { method: 'PATCH', body: { reason } }),
  };

  screening = {
    predict: (text) => this.request('/screening/predict', { method: 'POST', body: { text } }),
    getHistory: () => this.request('/screening/history'),
    getRecommendations: (params) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return this.request(`/screening/recommendations${query}`);
    },
  };

  chat = {
    getMessages: (appointmentId) => this.request(`/chat/${appointmentId}`),
    sendMessage: (appointmentId, content) => this.request(`/chat/${appointmentId}`, { method: 'POST', body: { content } }),
    markAsRead: (messageId) => this.request(`/chat/${messageId}/read`, { method: 'PATCH' }),
  };

  notifications = {
    getAll: () => this.request('/notifications'),
    markAsRead: (id) => this.request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllAsRead: () => this.request('/notifications/read-all', { method: 'PATCH' }),
    delete: (id) => this.request(`/notifications/${id}`, { method: 'DELETE' }),
  };

  payments = {
    initiate: (appointmentId) => this.request('/payments/initiate', { method: 'POST', body: { appointmentId } }),
    verify: (data) => this.request('/payments/verify', { method: 'POST', body: data }),
    getByAppointment: (appointmentId) => this.request(`/payments/${appointmentId}`),
    refund: (appointmentId) => this.request(`/payments/refund/${appointmentId}`, { method: 'POST' }),
  };
}

export const api = new ApiService();
