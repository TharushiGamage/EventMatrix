import { createContext, useState, useEffect, useContext } from 'react';
import { authService, profileService } from '../services/userApi';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const stored = localStorage.getItem('uems_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          const decoded = jwtDecode(parsed.token);
          if (decoded.exp * 1000 > Date.now()) {
            // Token is valid, fetch full profile to ensure all fields are loaded
            try {
              const profileRes = await profileService.getProfile();
              const profileData = profileRes.data || profileRes;
              const mergedUser = { ...parsed, ...profileData };
              setUser(mergedUser);
              localStorage.setItem('uems_user', JSON.stringify(mergedUser));
            } catch (err) {
              // If profile fetch fails, use stored data
              setUser(parsed);
            }
          } else {
            localStorage.removeItem('uems_user');
          }
        }
      } catch (e) {
        localStorage.removeItem('uems_user');
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (credentials) => {
    setError(null);
    const data = await authService.login(credentials);
    const loginUser = data.data;
    
    // Fetch full profile to ensure all fields (studentId, phone, etc.) are loaded
    try {
      const profileRes = await profileService.getProfile();
      const profileData = profileRes.data || profileRes;
      const mergedUser = { ...loginUser, ...profileData };
      setUser(mergedUser);
      return { ...data, data: mergedUser };
    } catch (err) {
      // If profile fetch fails, use login data as fallback
      setUser(loginUser);
      return data;
    }
  };

  const register = async (userData, options = {}) => {
    const { persistSession = true } = options;
    setError(null);
    const data = await authService.register(userData, { persistSession });
    if (persistSession) {
      const registeredUser = data.data;
      
      // Fetch full profile to ensure all fields are loaded
      try {
        const profileRes = await profileService.getProfile();
        const profileData = profileRes.data || profileRes;
        const mergedUser = { ...registeredUser, ...profileData };
        setUser(mergedUser);
        return { ...data, data: mergedUser };
      } catch (err) {
        // If profile fetch fails, use registration data as fallback
        setUser(registeredUser);
        return data;
      }
    }
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
