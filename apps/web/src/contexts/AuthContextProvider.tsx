import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api.service';
import type { AuthUser, LoginResponse } from '../types/auth';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem('user');

    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    const token = localStorage.getItem('token');

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const currentUser = await api<AuthUser>('/auth/me');

      localStorage.setItem('user', JSON.stringify(currentUser));
      setUser(currentUser);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  }

  async function login(email: string, password: string) {
    const data = await api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  useEffect(() => {
    let active = true;

    async function initializeAuth() {
      const token = localStorage.getItem('token');

      if (!token) {
        if (active) {
          setLoading(false);
        }
        return;
      }

      try {
        const currentUser = await api<AuthUser>('/auth/me');

        if (!active) {
          return;
        }

        localStorage.setItem('user', JSON.stringify(currentUser));
        setUser(currentUser);
      } catch {
        if (!active) {
          return;
        }

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      loading,
      login,
      logout,
      refreshUser,
    }),
    [user, loading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}