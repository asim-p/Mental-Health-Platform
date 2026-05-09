import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User, AuthData } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: 'PATIENT' | 'THERAPIST';
    therapistData?: Record<string, unknown>;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await api.auth.me();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      }
    } catch {
      setUser(null);
      api.setToken(null);
    }
  };

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.auth.login({ email, password });
    if (response.success && response.data) {
      api.setToken(response.data.accessToken);
      setUser(response.data.user);
    } else {
      throw new Error('Login failed');
    }
  };

  const register = async (data: Parameters<typeof api.auth.register>[0]) => {
    const response = await api.auth.register(data);
    if (response.success && response.data) {
      api.setToken(response.data.accessToken);
      setUser(response.data.user);
    } else {
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
