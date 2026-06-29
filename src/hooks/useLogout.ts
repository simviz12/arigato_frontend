import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

export const useLogout = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore(state => state.clearAuth);

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      // Ignore errors on logout
    } finally {
      clearAuth();
      // Replace history to prevent back button from accessing protected pages
      navigate('/login', { replace: true });
    }
  };

  return logout;
};
