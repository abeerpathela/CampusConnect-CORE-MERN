import axios from 'axios';
import { DATA_SEED_VERSION, STORAGE_KEYS } from '../utils/constants';
import {
  INITIAL_CLUBS,
  INITIAL_EVENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_REGISTRATIONS,
} from '../data/initialData';

function storedClubsNeedReseed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLUBS);
    if (!raw) return true;
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored) || stored.length !== INITIAL_CLUBS.length) return true;
    const officialNames = new Set(INITIAL_CLUBS.map((club) => club.name));
    const officialIds = new Set(INITIAL_CLUBS.map((club) => club._id));
    return stored.some((club) => !officialIds.has(club._id) || !officialNames.has(club.name));
  } catch {
    return true;
  }
}

// Seed localStorage from initialData. Re-seed when the version changes or stale club names remain.
export function initMockStorage() {
  const storedVersion = localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
  const versionMismatch = storedVersion !== DATA_SEED_VERSION;
  const reseedClubs = versionMismatch || storedClubsNeedReseed();
  const reseedAll = versionMismatch;

  if (reseedClubs) {
    localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(INITIAL_CLUBS));
  }
  if (reseedAll || !localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
  }
  if (reseedAll || !localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
  }
  if (reseedAll || !localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(INITIAL_REGISTRATIONS));
  }

  localStorage.setItem(STORAGE_KEYS.DATA_VERSION, DATA_SEED_VERSION);
}

// Initialize immediately
initMockStorage();

// Axios Base Client
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 2500,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRoute =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Helper methods for localStorage CRUD operations
export const storageHelper = {
  get: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error', e);
    }
  },
};

export default api;
