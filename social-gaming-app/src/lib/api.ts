import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = 'http://localhost:4002';

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

export async function loginDev(username: string) {
  const res = await api.post('/auth/login', { username });
  const token = res.data?.token;
  if (token) await AsyncStorage.setItem('auth_token', token);
  return res.data;
}