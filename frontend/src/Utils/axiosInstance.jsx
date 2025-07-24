import axios from 'axios';
import { BASE_URL } from './baseUrl';

const axiosInstance = axios.create({
  baseURL: BASE_URL, // adjust as needed
  withCredentials: true, // to send refreshToken cookie
});

// Request interceptor to attach access token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to refresh token on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and this is the first retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        
        const res = await axiosInstance.get(`${BASE_URL}/refresh-token`, { withCredentials: true });
        const newToken = res.data.token;
        sessionStorage.setItem('token', newToken);

        // Update header and retry original request
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error("Token refresh failed", err);
        sessionStorage.removeItem('token');
        // window.location.href = '/home';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
