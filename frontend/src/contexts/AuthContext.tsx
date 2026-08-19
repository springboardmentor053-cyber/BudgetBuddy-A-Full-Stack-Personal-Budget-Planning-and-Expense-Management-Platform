import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axios';

interface AuthContextType {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<any>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        try {
          const res = await api.get('/api/auth/profile/');
          setUser(res.data);
        } catch {
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await api.post('/api/auth/login/', {
      username: identifier,
      password: password,
    });

    const { access, refresh, user: userData } = res.data;

    if (access) {
      localStorage.setItem('access_token', access);
      localStorage.setItem('budgetbuddy_token', access);
      setToken(access);
    }
    if (refresh) {
      localStorage.setItem('refresh_token', refresh);
    }

    if (userData) {
      setUser(userData);
    } else {
      try {
        const profileRes = await api.get('/api/auth/profile/');
        setUser(profileRes.data);
      } catch {
        setUser({ username: identifier });
      }
    }

    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('budgetbuddy_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}