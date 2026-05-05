const API_BASE = '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number>;
}

async function fetchJson<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = API_BASE + endpoint;
  if (params) {
    const searchParams = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    );
    url += `?${searchParams}`;
  }

  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...fetchOptions, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth
export const auth = {
  login: (email: string, password: string) =>
    fetchJson<{ token: string; id: number; firstName: string; role: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    }),

  registerDoctor: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    fetchJson<{ message: string; id: number }>('/auth/register/doctor', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }),

  registerPatient: (data: {
    firstName: string; lastName: string; email: string; password: string; phone?: string; address?: string;
  }) =>
    fetchJson<{ message: string; id: number }>('/auth/register/patient', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }),
};

// Patients
export const patients = {
  getAll: () => fetchJson<Patient[]>('/patients'),
  getById: (id: number) => fetchJson<Patient>(`/patients/${id}`),
  getProfileByUser: (userId: number) =>
    fetchJson<{ id: number; fullName: string }>(`/patients/profile/${userId}`),
  register: (data: {
    firstName: string; lastName: string; email: string; password: string; phone?: string; address?: string; doctorId?: number;
  }) =>
    fetchJson<{ message: string; userId: number }>('/patients/register', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }),
  update: (id: number, data: Record<string, string>) =>
    fetchJson<Patient>(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
  deactivate: (id: number) =>
    fetchJson<{ message: string }>(`/patients/${id}`, { method: 'DELETE' }),
};

// Users
export const users = {
  getAll: () => fetchJson<User[]>('/users'),
  getByRole: (role: string) => fetchJson<User[]>(`/users/role/${role}`),
  getById: (id: number) => fetchJson<User>(`/users/${id}`),
  update: (id: number, data: Record<string, string>) =>
    fetchJson<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
  delete: (id: number) => fetchJson<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),
};

// Doctors
export const doctors = {
  getAll: () => fetchJson<Doctor[]>('/doctors'),
  getById: (id: number) => fetchJson<Doctor>(`/doctors/${id}`),
  update: (id: number, data: Record<string, string>) =>
    fetchJson<Doctor>(`/doctors/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
};

// Treatments
export const treatments = {
  getAll: () => fetchJson<Treatment[]>('/treatments'),
  getActive: () => fetchJson<Treatment[]>('/treatments/active'),
  getById: (id: number) => fetchJson<Treatment>(`/treatments/${id}`),
  getByPatient: (patientId: number) => fetchJson<Treatment[]>(`/treatments/patient/${patientId}`),
  create: (data: { fkPatientId: number; fkRadioisotopeId: number; fkSmartwatchId?: number; room: number; initialDose: number }) =>
    fetchJson<Treatment>('/treatments', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
  end: (id: number) =>
    fetchJson<Treatment>(`/treatments/${id}/end`, { method: 'POST' }),
};

// Smartwatches
export const smartwatches = {
  getAll: () => fetchJson<SmartwatchResponse[]>('/smartwatches'),
  getById: (id: number) => fetchJson<SmartwatchResponse>(`/smartwatches/${id}`),
  getByPatient: (patientId: number) => fetchJson<SmartwatchResponse[]>(`/smartwatches/patient/${patientId}`),
  create: (data: { fkPatientId: number; imei: string; macAddress: string; model: string }) =>
    fetchJson<SmartwatchResponse>('/smartwatches', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
  deactivate: (id: number) => fetchJson<{ message: string }>(`/smartwatches/${id}`, { method: 'DELETE' }),
};

// Watch/Smartwatch Data
export const watch = {
  getLatest: (patientId: number) => fetchJson<WatchMetrics>(`/watch/patient/${patientId}/latest`),
  getMetrics: (imei: string) => fetchJson<WatchMetrics[]>(`/watch/${imei}/metrics`),
};

// Health Metrics
export const healthMetrics = {
  getByPatient: (patientId: number, days?: number) =>
    fetchJson<HealthMetricsResponse[]>(`/health-metrics/patient/${patientId}`, { params: days ? { days } : undefined }),
  getLatest: (patientId: number) => fetchJson<HealthMetricsResponse>(`/health-metrics/patient/${patientId}/latest`),
  getByTreatment: (treatmentId: number) =>
    fetchJson<HealthMetricsResponse[]>(`/health-metrics/treatment/${treatmentId}`),
};

// Radiation Logs
export const radiationLogs = {
  getByPatient: (patientId: number, days?: number) =>
    fetchJson<RadiationLogResponse[]>(`/radiation-logs/patient/${patientId}`, { params: days ? { days } : undefined }),
  getByTreatment: (treatmentId: number) =>
    fetchJson<RadiationLogResponse[]>(`/radiation-logs/treatment/${treatmentId}`),
};

// Alerts
export const alerts = {
  getAll: () => fetchJson<Alert[]>('/alerts'),
  getPending: () => fetchJson<Alert[]>('/alerts/pending'),
  getByPatient: (patientId: number) => fetchJson<Alert[]>(`/alerts/patient/${patientId}`),
  resolve: (id: number) => fetchJson<Alert>(`/alerts/${id}/resolve`, { method: 'PUT' }),
};

// Messages
export const messages = {
  getByPatient: (patientId: number) => fetchJson<MessageResponse[]>(`/messages/patient/${patientId}`),
  send: (data: { fkPatientId: number; messageText: string }) =>
    fetchJson<MessageResponse>('/messages', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
  markRead: (id: number) => fetchJson<MessageResponse>(`/messages/${id}/read`, { method: 'PUT' }),
};

// Game Sessions
export const games = {
  getByPatient: (patientId: number) => fetchJson<GameSessionResponse[]>(`/games/patient/${patientId}`),
  create: (data: { fkPatientId: number; score: number; levelReached: number }) =>
    fetchJson<GameSessionResponse>('/games', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
};

// Settings
export const settings = {
  getByPatient: (patientId: number) => fetchJson<SettingsResponse>(`/settings/patient/${patientId}`),
  update: (patientId: number, data: Record<string, string | boolean>) =>
    fetchJson<SettingsResponse>(`/settings/patient/${patientId}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
};

// WebSocket chat — use WS /ws/chat and WS /ws/rix endpoints
export const chat = {
  getWsUrl: () => {
    const wsHost = typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'localhost:8080' : 'api.raddix.pro';
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return { chat: `${protocol}//${wsHost}/ws/chat`, rix: `${protocol}//${wsHost}/ws/rix` };
  },
};

// OAuth clients / API credentials
export const oauthClients = {
  getAll: () => fetchJson<OAuthClient[]>('/oauth-clients'),
  create: (data: { clientId: string; clientSecret: string; clientName: string; grantType: string; scopes: string }) =>
    fetchJson<OAuthClient>('/oauth-clients', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }),
  createToken: (data: { grantType: string; clientId: string; clientSecret: string; scope: string }) =>
    fetchJson<TokenResponse>('/auth/token', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }),
};

// System settings
export const systemSettings = {
  get: () => fetchJson<SystemSettingsResponse>('/system-settings'),
  update: (data: SystemSettingsResponse) =>
    fetchJson<SystemSettingsResponse>('/system-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }),
  testSmtp: (email: string) =>
    fetchJson<{ sent: boolean; message?: string }>('/system-settings/smtp/test', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' },
    }),
};

// Isotopes
export const isotopes = {
  getAll: () => fetchJson<Isotope[]>('/isotopes'),
  getById: (id: number) => fetchJson<Isotope>(`/isotopes/${id}`),
};

// Dashboard
export const dashboard = {
  getStats: () => fetchJson<DashboardStats>('/dashboard/stats'),
};

// File Upload
export const files = {
  upload: async (file: File): Promise<{ url: string; filename: string; originalName: string; size: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },
};

// Types
export interface User {
  id: number; firstName: string; lastName: string; email: string; role: string;
  phone?: string; licenseNumber?: string; specialty?: string; createdAt?: string;
}

export interface Doctor {
  id: number; firstName: string; lastName: string; email: string; phone?: string; role: string;
  licenseNumber?: string; specialty?: string; createdAt?: string;
}

export interface Patient {
  id: number; fullName: string; phone?: string; address?: string; isActive: boolean;
  familyAccessCode?: string; fkUserId?: number; fkDoctorId?: number; createdAt?: string;
}

export interface Treatment {
  id: number; patientId: number; patientName: string; doctorId: number; doctorName: string;
  isotopeId: number; isotopeName: string; room: number; initialDose: number; safetyThreshold: number;
  isolationDays: number; startDate: string; endDate?: string; isActive: boolean; currentRadiation?: number;
}

export interface SmartwatchResponse {
  id: number; imei: string; macAddress: string; model: string; isActive: boolean;
  patientId: number; patientName?: string;
}

export interface WatchMetrics {
  id: number; patientId: number; imei: string; bpm?: number; steps?: number; distance?: number;
  currentRadiation: number; recordedAt: string;
}

export interface HealthMetricsResponse {
  id: number; patientId: number; treatmentId?: number; bpm?: number; steps?: number;
  distance?: number; currentRadiation?: number; recordedAt: string;
}

export interface RadiationLogResponse {
  id: number; patientId: number; treatmentId?: number; radiationLevel: number; timestamp: string;
}

export interface Alert {
  id: number; patientId: number; patientName: string; treatmentId?: number;
  alertType: string; message: string; isResolved: boolean; createdAt: string;
}

export interface MessageResponse {
  id: number; patientId: number; messageText: string; isRead: boolean; sentAt: string;
}

export interface GameSessionResponse {
  id: number; patientId: number; score: number; levelReached: number; playedAt: string;
}

export interface SettingsResponse {
  id: number; patientId: number; unitPreference: string; theme: string;
  notificationsEnabled: boolean; updatedAt: string;
}

export interface OAuthClient {
  id: number; clientId: string; clientSecret: string; clientName: string;
  grantType: string; scopes: string; isActive: boolean; fkUserId?: number;
  createdAt?: string; expiresAt?: string;
}

export interface TokenResponse {
  accessToken: string; tokenType: string; expiresIn: number; scope: string;
  patientId?: number; patientName?: string; familyAccessCode?: string;
}

export interface SystemSettingsResponse {
  smtp?: Record<string, string | boolean>;
  ai?: Record<string, string | boolean>;
  security?: Record<string, string | boolean>;
  organization?: Record<string, string | boolean>;
  notifications?: Record<string, string | boolean>;
  integrations?: Record<string, string | boolean>;
  dataSettings?: Record<string, string | boolean>;
}

export interface Isotope {
  id: number; name: string; symbol: string; type: string; halfLife: number; halfLifeUnit: string;
  biologicalHalfLife?: number;
}

export interface DashboardStats {
  totalPatients: number; totalDoctors: number; activeTreatments: number;
  pendingAlerts: number; totalSmartwatches: number; activeIsotopes: number;
}

export { fetchJson };
