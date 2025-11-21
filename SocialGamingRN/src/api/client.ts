import axios from 'axios';
import Config from 'react-native-config';
import { getItem, KEYS } from '../lib/storage';
import navigationRef from '../navigation/navigation';
import { useAuth } from '../state/auth';

const baseURL = Config.BASE_URL || 'http://localhost:4001';

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = getItem(KEYS.token);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      try {
        // Clear auth state to trigger AuthGate -> Login
        useAuth.getState().logout();
        // Optionally navigate explicitly to Login
        if (navigationRef.isReady()) {
          navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
      } catch {}
    }
    return Promise.reject(err);
  }
);

export default api;