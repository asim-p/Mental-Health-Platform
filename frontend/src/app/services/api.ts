const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const token = this.getToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
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
    register: (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
      role?: 'PATIENT' | 'THERAPIST';
      therapistData?: Record<string, unknown>;
    }) => this.request<ApiResponse<AuthData>>('/auth/register', { method: 'POST', body: data }),

    login: (data: { email: string; password: string }) =>
      this.request<ApiResponse<AuthData>>('/auth/login', { method: 'POST', body: data }),

    logout: () => this.request<ApiResponse<null>>('/auth/logout', { method: 'POST' }),

    me: () => this.request<ApiResponse<{ user: User }>>('/auth/me'),

    refresh: (refreshToken: string) =>
      this.request<ApiResponse<{ accessToken: string }>>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      }),
  };

  users = {
    getProfile: () => this.request<ApiResponse<{ user: User }>>('/users/profile'),

    updateProfile: (data: Partial<User & { profileData: Record<string, unknown> }>) =>
      this.request<ApiResponse<null>>('/users/profile', { method: 'PATCH', body: data }),

    getPatients: () => this.request<ApiResponse<User[]>>('/users/patients'),

    getTherapists: () => this.request<ApiResponse<User[]>>('/users/therapists'),

    verifyTherapist: (id: string, action: 'APPROVE' | 'REJECT') =>
      this.request<ApiResponse<null>>(`/users/therapists/${id}/verify`, {
        method: 'PATCH',
        body: { action },
      }),
  };

  therapists = {
    getAll: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return this.request<ApiResponse<{ therapists: Therapist[]; pagination: Pagination }>>(
        `/therapists${query}`
      );
    },

    getById: (id: string) => this.request<ApiResponse<Therapist>>(`/therapists/${id}`),

    getAvailability: (id: string, date?: string) => {
      const query = date ? `?date=${date}` : '';
      return this.request<ApiResponse<{ availability: Availability[]; bookedSlots: string[] }>>(
        `/therapists/${id}/availability${query}`
      );
    },

    updateProfile: (data: Partial<TherapistProfile>) =>
      this.request<ApiResponse<Therapist>>('/therapists/profile', { method: 'PATCH', body: data }),

    updateAvailability: (availability: AvailabilitySlot[]) =>
      this.request<ApiResponse<Availability[]>>('/therapists/availability', {
        method: 'PATCH',
        body: { availability },
      }),
  };

  appointments = {
    getAll: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return this.request<ApiResponse<Appointment[]>>(`/appointments${query}`);
    },

    getById: (id: string) => this.request<ApiResponse<Appointment>>(`/appointments/${id}`),

    create: (data: {
      therapistId: string;
      scheduledAt: string;
      notes?: string;
      aiPrediction?: string;
    }) => this.request<ApiResponse<Appointment>>('/appointments', { method: 'POST', body: data }),

    confirm: (id: string) =>
      this.request<ApiResponse<Appointment>>(`/appointments/${id}/confirm`, { method: 'PATCH' }),

    complete: (id: string) =>
      this.request<ApiResponse<Appointment>>(`/appointments/${id}/complete`, { method: 'PATCH' }),

    cancel: (id: string, reason?: string) =>
      this.request<ApiResponse<Appointment>>(`/appointments/${id}/cancel`, {
        method: 'PATCH',
        body: { reason },
      }),

    review: (id: string, rating: number, comment?: string) =>
      this.request<ApiResponse<Review>>(`/appointments/${id}/review`, {
        method: 'POST',
        body: { rating, comment },
      }),
  };

  screening = {
    predict: (text: string) =>
      this.request<ApiResponse<ScreeningResult>>('/screening/predict', {
        method: 'POST',
        body: { text },
      }),

    getHistory: () => this.request<ApiResponse<ScreeningResult[]>>('/screening/history'),

    getRecommendations: (params?: {
      category?: string;
      budget?: string;
      gender?: string;
      language?: string;
    }) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return this.request<ApiResponse<Therapist[]>>(`/screening/recommendations${query}`);
    },
  };

  chat = {
    getMessages: (appointmentId: string) =>
      this.request<ApiResponse<ChatMessage[]>>(`/chat/${appointmentId}`),

    sendMessage: (appointmentId: string, content: string) =>
      this.request<ApiResponse<ChatMessage>>(`/chat/${appointmentId}`, {
        method: 'POST',
        body: { content },
      }),

    markAsRead: (messageId: string) =>
      this.request<ApiResponse<ChatMessage>>(`/chat/${messageId}/read`, { method: 'PATCH' }),
  };

  payments = {
    initiate: (appointmentId: string) =>
      this.request<ApiResponse<{ paymentUrl: string; params: Record<string, string> }>>(
        '/payments/initiate',
        { method: 'POST', body: { appointmentId } }
      ),

    verify: (data: Record<string, string>) =>
      this.request<ApiResponse<null>>('/payments/verify', { method: 'POST', body: data }),

    getByAppointment: (appointmentId: string) =>
      this.request<ApiResponse<Payment>>(`/payments/${appointmentId}`),

    refund: (appointmentId: string) =>
      this.request<ApiResponse<null>>(`/payments/refund/${appointmentId}`, { method: 'POST' }),
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'PATIENT' | 'THERAPIST' | 'ADMIN';
  profile?: PatientProfile | TherapistProfile;
}

export interface PatientProfile {
  id: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  preferredLanguage: string;
  lastScreeningAt?: string;
}

export interface TherapistProfile {
  id: string;
  specialization: string[];
  qualifications: string[];
  yearsOfExperience: number;
  bio?: string;
  hourlyRate: number;
  gender?: string;
  languages: string[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  verificationStatus: string;
  user?: User;
}

export interface Therapist extends TherapistProfile {
  user: User;
  availability: Availability[];
}

export interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  therapistId: string;
  scheduledAt: string;
  duration: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  zoomMeetingUrl?: string;
  zoomJoinUrl?: string;
  notes?: string;
  aiPrediction?: string;
  patient: { user: User };
  therapist: { user: User; userId: string };
  payment?: Payment;
  chatMessages?: ChatMessage[];
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  esewaRefId?: string;
}

export interface ChatMessage {
  id: string;
  appointmentId: string;
  senderType: 'PATIENT' | 'THERAPIST';
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  therapistId: string;
  patientId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ScreeningResult {
  id: string;
  inputText: string;
  predictedCategory: string;
  confidence: number;
  recommendedSpecializations: string[];
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const api = new ApiService();
