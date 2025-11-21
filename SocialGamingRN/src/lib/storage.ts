import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({ id: 'app-storage' });

export const setItem = (key: string, value: string) => {
  storage.set(key, value);
};

export const getItem = (key: string): string | undefined => {
  const exists = storage.contains(key);
  return exists ? storage.getString(key) ?? undefined : undefined;
};

export const removeItem = (key: string) => {
  storage.delete(key);
};

export const KEYS = {
  token: 'auth_token',
};