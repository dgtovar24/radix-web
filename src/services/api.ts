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

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...fetchOptions,
    headers,
  });

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
    }),

  registerDoctor: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) =>
    fetchJson<{ message: string; id: number }>('/auth/register/doctor', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  registerPatient: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }) =>
    fetchJson<{ message: string; id: number }>('/auth/register/patient', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Patients
export const patients = {
  getAll: () => fetchJson<Patient[]>('/patients'),

  getById: (id: number) =>
    fetchJson<Patient>(`/patients/${id}`),

  getProfileByUser: (userId: number) =>
    fetchJson<{ id: number; fullName: string }>(`/patients/profile/${userId}`),

  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    doctorId?: number;
  }) =>
    fetchJson<{ message: string; userId: number }>('/patients/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Users
export const users = {
  getAll: () => fetchJson<User[]>('/users'),

  getByRole: (role: string) =>
    fetchJson<User[]>(`/users/role/${role}`),
};

// Treatments
export const treatments = {
  getAll: () => fetchJson<Treatment[]>('/treatments'),

  getActive: () => fetchJson<Treatment[]>('/treatments/active'),

  getById: (id: number) =>
    fetchJson<Treatment>(`/treatments/${id}`),

  getByPatient: (patientId: number) =>
    fetchJson<Treatment[]>(`/treatments/patient/${patientId}`),

  create: (data: {
    fkPatientId: number;
    fkRadioisotopeId: number;
    fkSmartwatchId?: number;
    room: number;
    initialDose: number;
  }) =>
    fetchJson<Treatment>('/treatments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  end: (id: number) =>
    fetchJson<Treatment>(`/treatments/${id}/end`, {
      method: 'POST',
    }),
};

// Watch/Smartwatch
export const watch = {
  getLatest: (patientId: number) =>
    fetchJson<WatchMetrics>(`/watch/patient/${patientId}/latest`),

  getMetrics: (imei: string) =>
    fetchJson<WatchMetrics[]>(`/watch/${imei}/metrics`),
};

// Alerts
export const alerts = {
  getAll: () => fetchJson<Alert[]>('/alerts'),

  getPending: () => fetchJson<Alert[]>('/alerts/pending'),

  getByPatient: (patientId: number) =>
    fetchJson<Alert[]>(`/alerts/patient/${patientId}`),

  resolve: (id: number) =>
    fetchJson<Alert>(`/alerts/${id}/resolve`, {
      method: 'PUT',
    }),
};

// Isotopes
export const isotopes = {
  getAll: () => fetchJson<Isotope[]>('/isotopes'),

  getById: (id: number) =>
    fetchJson<Isotope>(`/isotopes/${id}`),
};

// Dashboard
export const dashboard = {
  getStats: () =>
    fetchJson<DashboardStats>('/dashboard/stats'),
};

// Types
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface Patient {
  id: number;
  fullName: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  familyAccessCode?: string;
  fkUserId?: number;
  fkDoctorId?: number;
  createdAt?: string;
}

export interface Treatment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  isotopeId: number;
  isotopeName: string;
  room: number;
  initialDose: number;
  safetyThreshold: number;
  isolationDays: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  currentRadiation?: number;
}

export interface WatchMetrics {
  id: number;
  patientId: number;
  imei: string;
  bpm?: number;
  steps?: number;
  distance?: number;
  currentRadiation: number;
  recordedAt: string;
}

export interface Alert {
  id: number;
  patientId: number;
  patientName: string;
  treatmentId?: number;
  alertType: string;
  message: string;
  isResolved: boolean;
  createdAt: string;
}

export interface Isotope {
  id: number;
  name: string;
  symbol: string;
  type: string;
  halfLife: number;
  halfLifeUnit: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  activeTreatments: number;
  pendingAlerts: number;
  totalSmartwatches: number;
  activeIsotopes: number;
}

export { fetchJson };