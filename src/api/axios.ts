import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  // Use relative path so it works with both Vite Proxy (dev) and Nginx Reverse Proxy (prod)
  baseURL: '', 
  withCredentials: true, // Crucial for sending/receiving httpOnly cookies
});

// Request Interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

import { toast } from 'sonner';

// Response Interceptor for handling 401 and refreshing token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Only attempt refresh if the request failed with 401 and it hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/refresh') {
      originalRequest._retry = true;
      try {
        // Silently call refresh endpoint (cookie will be sent automatically)
        const response = await axios.post('/api/auth/refresh', {}, {
          withCredentials: true
        });
        
        const { accessToken } = response.data;
        
        // Extract role from JWT (simple decoding of base64 payload)
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const role = payload.role;

        // Update Zustand store
        useAuthStore.getState().setAuth(accessToken, role);

        // Update the failed request and retry it
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (e.g., cookie expired). Clear auth state.
        useAuthStore.getState().clearAuth();
        window.location.replace('/login'); // Force clear history and redirect
        return Promise.reject(refreshError);
      }
    }
    
    // Global Error Handling with Sonner
    if (error.response && error.response.status !== 401) {
      const errorMsg = error.response.data?.detail || error.response.data?.message || 'Ha ocurrido un error inesperado';
      toast.error('Error en el sistema', {
        description: errorMsg,
      });
    } else if (!error.response) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor',
      });
    }

    return Promise.reject(error);
  }
);

export default api;
