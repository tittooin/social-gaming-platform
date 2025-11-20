import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables are missing - check .env');
}

export function getServiceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

export function getAnonClientWithToken(token) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export async function sendPhoneOtp(phone) {
  const supabase = getServiceClient();
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
  return data;
}

export async function verifyPhoneOtp({ phone, token }) {
  const supabase = getServiceClient();
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  if (error) throw error;
  return data; // contains session, user
}

export async function getUserFromToken(token) {
  const client = getAnonClientWithToken(token);
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  return data?.user || null;
}