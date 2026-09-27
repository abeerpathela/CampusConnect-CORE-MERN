import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { STORAGE_KEYS, USER_ROLES, DEMO_USERS } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth from localStorage, defaulting to Demo Student for immediate access
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        const defaultStudent = DEMO_USERS.STUDENT;
        const defaultToken = 'jwt_demo_student_token';
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, defaultToken);
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(defaultStudent));
        setToken(defaultToken);
        setUser(defaultStudent);
      }
    } catch (e) {
      console.error('Error restoring auth state', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      setUser(res.user);
      setToken(res.token);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      setUser(res.user);
      setToken(res.token);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const switchDemoRole = async (role) => {
    setLoading(true);
    try {
      const email =
        role === USER_ROLES.ADMIN
          ? 'admin@chitkara.edu.in'
          : 'student@chitkara.edu.in';
      const password = 'password123';

      const res = await authService.login({ email, password, role });
      setUser(res.user);
      setToken(res.token);
      return res;
    } catch {
      // Fallback if backend offline
      const fallbackUser =
        role === USER_ROLES.ADMIN ? DEMO_USERS.ADMIN : DEMO_USERS.STUDENT;
      const mockToken = `jwt_demo_${role}_token`;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, mockToken);
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      setToken(mockToken);
      return { user: fallbackUser, token: mockToken };
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = (updatedData) => {
    const updated = authService.updateCurrentUser(updatedData);
    setUser(updated);
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const isStudent = user?.role === USER_ROLES.STUDENT;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isStudent,
        login,
        register,
        logout,
        switchDemoRole,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
