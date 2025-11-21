import api from './client';

export type LoginResponse = { token: string; user: { id: string; username?: string } };

export async function loginDev(username: string): Promise<LoginResponse> {
  const { data } = await api.post('/auth/login', { username });
  return data;
}

// OTP Verify (Supabase-backed). Returns session tokens; caller decides how to store.
export type VerifyOtpResponse = {
  user: { id: string; phone?: string };
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
};
export async function verifyOtp(phone: string, token: string, deviceId?: string): Promise<VerifyOtpResponse> {
  const { data } = await api.post('/auth/verify', { phone, token, deviceId });
  return data;
}

export type StartMatchResponse = { matchId: string; serverSeed: string };
export async function startMatch(): Promise<StartMatchResponse> {
  const { data } = await api.post('/match/start');
  return data;
}

export type EndMatchResponse = { reward: number; wallet: any };
export async function endMatch(matchId: string, payload: { winner?: string; score?: number; rewards: number }): Promise<EndMatchResponse> {
  const { data } = await api.post('/match/end', { matchId, ...payload });
  return data;
}

// Matches list (returns user matches; may include opponent info when available)
export type MatchListItem = { id: string; opponent_id?: string; status?: string; created_at?: string };
export async function listMatches(): Promise<MatchListItem[]> {
  try {
    const { data } = await api.get('/match/list');
    return data.matches ?? [];
  } catch (e) {
    // Fallback to empty list if endpoint is not available yet
    return [];
  }
}

export type FeedPost = {
  id: string;
  user_id: string;
  content?: string;
  created_at?: string;
  likes?: number;
};
export async function fetchFeed(): Promise<FeedPost[]> {
  const { data } = await api.get('/feed');
  return data.posts ?? [];
}

export async function fetchProfile(userId: string): Promise<any> {
  const { data } = await api.get(`/profile/${userId}`);
  return data.profile;
}

export async function updateProfile(payload: { display_name?: string; bio?: string; avatar_url?: string }): Promise<any> {
  const { data } = await api.post('/profile/update', payload);
  return data.profile;
}

export async function fetchWallet(): Promise<any> {
  const { data } = await api.get('/wallet');
  return data.wallet;
}

export type WalletTx = { id: string; type: string; amount_chips?: number; amount_diamonds?: number; source?: string; created_at?: string };
export async function fetchWalletHistory(): Promise<WalletTx[]> {
  const { data } = await api.get('/wallet/history');
  return data.transactions ?? [];
}

// Tournaments
export type Tournament = { id: string; name: string; game: string; rule?: string; slots?: number; url?: string };
export async function getTournaments(): Promise<Tournament[]> {
  const { data } = await api.get('/tournaments');
  return data.tournaments ?? [];
}

export async function joinTournament(tournamentId: string): Promise<{ joined: boolean }>{
  const { data } = await api.post('/tournaments/join', { tournamentId });
  return { joined: !!data.joined };
}

export type LeaderboardRow = { rank: number; user_id: string; points: number };
export async function getLeaderboard(tournamentId: string): Promise<LeaderboardRow[]>{
  const { data } = await api.get(`/tournaments/${encodeURIComponent(tournamentId)}/leaderboard`);
  return data.leaderboard ?? [];
}

export type TournamentRule = { key: string; name: string; description?: string };
export async function getTournamentRules(): Promise<TournamentRule[]> {
  const { data } = await api.get('/tournaments/rules');
  return data.rules ?? [];
}

// Games Hub
export type GameItem = { key: string; name: string; url: string; icon?: string; category?: string };
export async function getGames(): Promise<GameItem[]> {
  const { data } = await api.get('/games');
  return data.games ?? [];
}

// Admin: manage games (Phase-1 simple POSTs)
export async function adminAddGame(game: { key: string; name: string; url: string; icon?: string; category?: string }): Promise<{ ok: boolean }>{
  const { data } = await api.post('/admin/games/add', game);
  return { ok: !!data.ok };
}

export async function adminRemoveGame(key: string): Promise<{ removed: number }>{
  const { data } = await api.post('/admin/games/remove', { key });
  return { removed: data.removed ?? 0 };
}

// Posts
export type CreatePostPayload = { content: string };
export async function createPost(payload: CreatePostPayload): Promise<any> {
  const { data } = await api.post('/post', payload);
  return data.post;
}

export async function likePost(postId: string): Promise<{ liked: boolean }> {
  const { data } = await api.post(`/post/${postId}/like`);
  return { liked: !!data.liked };
}

export async function commentPost(postId: string, content: string): Promise<any> {
  const { data } = await api.post(`/post/${postId}/comment`, { content });
  return data.comment;
}