import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
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

  const login = async (email, password) => {
    const response = await api.auth.login({ email, password });
    if (response.success && response.data) {
      api.setToken(response.data.accessToken);
      setUser(response.data.user);
      return response.data.user;
    } else {
      throw new Error('Login failed');
    }
  };

  const register = async (data) => {
    const response = await api.auth.register(data);
    if (response.success && response.data) {
      api.setToken(response.data.accessToken);
      setUser(response.data.user);
      return response.data.user;
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
