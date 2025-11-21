import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '../lib/toast';

// Set this to your PC's LAN IP and backend port.
// Example: 'http://192.168.0.105:4002' (device and PC on same WiFi)
export const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:4002';

let tokenMemory: string | null = null;

export function setTokenInMemory(token: string | null) {
  tokenMemory = token;
}

export function getTokenFromMemory() {
  return tokenMemory;
}

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(async (config) => {
  const token = getTokenFromMemory() || (await AsyncStorage.getItem('auth_token'));
  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    } as any;
  }
  return config;
});

// Soft error handling: show toast on API failures
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg = error?.response?.data?.message || error?.message || 'Request failed';
    showToast(msg);
    return Promise.reject(error);
  }
);

export async function login(username: string) {
  const res = await api.post('/auth/login', { username });
  const token = res.data?.token;
  const user = res.data?.user;
  if (token) {
    setTokenInMemory(token);
    await AsyncStorage.setItem('auth_token', token);
  }
  if (user) {
    await AsyncStorage.setItem('auth_user', JSON.stringify(user));
  }
  return res.data;
}

export async function getProfile(userId: string) {
  const res = await api.get(`/profile/${userId}`);
  return res.data;
}

export async function updateProfile(payload: { bio?: string; avatar_url?: string }) {
  const res = await api.post('/profile/update', payload);
  const user = res.data?.user;
  if (user) {
    await AsyncStorage.setItem('auth_user', JSON.stringify(user));
  }
  return res.data;
}

export async function getWallet() {
  const res = await api.get('/wallet');
  return res.data;
}

export async function getFeed(page: number = 1, limit: number = 10) {
  const res = await api.get('/feed', { params: { page, limit } });
  return res.data;
}

export async function createPost(text: string) {
  const res = await api.post('/post', { text });
  return res.data;
}

export async function likePost(postId: string) {
  const res = await api.post(`/post/${postId}/like`);
  return res.data;
}

export async function commentPost(postId: string, text: string) {
  const res = await api.post(`/post/${postId}/comment`, { text });
  return res.data;
}

// Friends / Follow helpers
export async function followUser(targetUserId: string | number) {
  const res = await api.post('/follow', { target_id: targetUserId });
  return res.data as { following: boolean };
}

export async function getFollowersCount(userId: string | number) {
  const res = await api.get(`/followers/${userId}`);
  const data = res.data as any;
  if (Array.isArray(data)) {
    return { count: data.length } as { count: number };
  }
  if (typeof data?.count === 'number') {
    return { count: data.count } as { count: number };
  }
  return { count: 0 } as { count: number };
}

export type SuggestedUser = {
  id: number | string;
  username: string;
  avatar_url?: string | null;
  bio?: string | null;
};

// Optional suggestions fetch; fallback to static list
export async function getSuggestedUsers(): Promise<SuggestedUser[]> {
  try {
    const res = await api.get('/followers/suggestions');
    const data = res.data as any;
    if (Array.isArray(data)) return data as SuggestedUser[];
    if (Array.isArray(data?.users)) return data.users as SuggestedUser[];
  } catch (e) {
    // ignore and fallback
  }
  return [
    { id: 2, username: 'player2', avatar_url: null },
    { id: 3, username: 'player3', avatar_url: null },
    { id: 4, username: 'player4', avatar_url: null },
    { id: 5, username: 'player5', avatar_url: null },
  ];
}

// Match endpoints
export async function startMatch() {
  const res = await api.post('/match/start');
  return res.data as { matchId: string; serverSeed?: string };
}

export async function endMatch(payload: { matchId: string; clientRoll: number }) {
  const res = await api.post('/match/end', payload);
  return res.data as { serverRoll: number; reward: number; wallet: any };
}