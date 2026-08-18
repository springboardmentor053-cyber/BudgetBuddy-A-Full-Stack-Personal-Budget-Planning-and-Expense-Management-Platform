import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/api/auth/profile/');
        setUser(response.data as User);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('budgetbuddy_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('budgetbuddy_username');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    void restoreSession();
  }, []);

  const login = async (identifier: string, password: string) => {
    const response = await api.post<AuthResponse>('/api/auth/login/', {
      // The backend intentionally accepts this conventional SimpleJWT key
      // as either a username or an email address.
      username: identifier.trim(),
      password,
    });
    const { access, refresh, user: userData } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('budgetbuddy_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('budgetbuddy_username', userData.username);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const register = async (userData: RegisterData) => {
    await api.post('/api/auth/register/', userData);
    await login(userData.username, userData.password);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('budgetbuddy_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('budgetbuddy_username');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({ user, loading, isAuthenticated, login, register, logout }),
    [user, loading, isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
