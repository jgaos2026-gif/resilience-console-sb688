/**
 * AuthContext.jsx — JWT-based auth, no Base44 dependency
 */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api, setToken, clearToken } from '@/api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,              setUser]              = useState(null);
  const [isAuthenticated,   setIsAuthenticated]   = useState(false);
  const [isLoadingAuth,     setIsLoadingAuth]     = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError,         setAuthError]         = useState(null);

  const checkAuth = useCallback(async () => {
    const token = sessionStorage.getItem('sb688_token');
    if (!token) {
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      return;
    }
    try {
      const data = await api.get('/api/auth/me');
      if (data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        clearToken();
        setIsAuthenticated(false);
      }
    } catch {
      clearToken();
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (username, password) => {
    setAuthError(null);
    try {
      const data = await api.post('/api/auth/login', { username, password });
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      setAuthError({ type: 'login_failed', message: err.message });
      throw err;
    }
  };

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  }, []);

  const navigateToLogin = useCallback(() => {
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings: null,
      login,
      logout,
      navigateToLogin,
      checkAppState: checkAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
