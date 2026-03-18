import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/userApi';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('uems_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        const decoded = jwtDecode(parsed.token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(parsed);
        } else {
          localStorage.removeItem('uems_user');
        }
      }
    } catch (e) {
      localStorage.removeItem('uems_user');
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    setError(null);
    const data = await authService.login(credentials);
    setUser(data.data);
    return data;
  };

  const register = async (userData) => {
    setError(null);
    const data = await authService.register(userData);
    setUser(data.data);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('uems_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
