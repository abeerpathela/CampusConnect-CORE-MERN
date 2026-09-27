import api, { storageHelper } from './api';
import { STORAGE_KEYS, DEMO_USERS, USER_ROLES } from '../utils/constants';

export const authService = {
  login: async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      if (res.data && res.data.token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, res.data.token);
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(res.data.user));
        return res.data;
      }
      return res.data;
    } catch (err) {
      // If backend responded with error (e.g. 401 Invalid email or password)
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }
      
      // Fallback only if server completely unreachable (offline demo)
      const { email, role } = credentials;
      let selectedUser;

      if (role === USER_ROLES.ADMIN || email?.toLowerCase().includes('admin')) {
        selectedUser = { ...DEMO_USERS.ADMIN };
      } else {
        selectedUser = {
          ...DEMO_USERS.STUDENT,
          email: email || DEMO_USERS.STUDENT.email,
        };
      }

      const mockToken = `jwt_mock_token_${Date.now()}`;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, mockToken);
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(selectedUser));

      return {
        success: true,
        token: mockToken,
        user: selectedUser,
        message: 'Signed in (Offline Mode)',
      };
    }
  },

  register: async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data && res.data.token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, res.data.token);
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(res.data.user));
        return res.data;
      }
      return res.data;
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }

      // Offline fallback
      const newUser = {
        _id: `usr_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role || USER_ROLES.STUDENT,
        rollNo: userData.rollNo || `231099${Math.floor(1000 + Math.random() * 9000)}`,
        department: userData.department || 'Computer Science & Engineering',
        semester: userData.semester || '1st Semester',
        joinedClubs: [],
        registeredEvents: [],
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      };

      const mockToken = `jwt_mock_token_${Date.now()}`;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, mockToken);
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(newUser));

      return {
        success: true,
        token: mockToken,
        user: newUser,
        message: 'Account created successfully',
      };
    }
  },

  getCurrentUser: async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(res.data));
      }
      return res.data;
    } catch {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return stored ? JSON.parse(stored) : null;
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  },

  updateCurrentUser: (updates) => {
    const current = storageHelper.get(STORAGE_KEYS.AUTH_USER);
    const updated = { ...current, ...updates };
    storageHelper.set(STORAGE_KEYS.AUTH_USER, updated);
    return updated;
  },
};
