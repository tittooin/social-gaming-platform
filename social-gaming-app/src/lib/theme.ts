import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';

export const colors = {
  // Blue look & feel
  primaryBlue: '#1e3a8a', // deep blue
  blueLight: '#e0e7ff',   // light indigo-ish
  blueMid: '#3b82f6',     // bright blue accents

  // Allowed accents
  accentGreen: '#10b981', // success
  accentRed: '#ef4444',   // danger

  // Neutrals
  background: '#ffffff',
  text: '#0f172a',
  mutedText: '#6b7280',
  cardBg: '#f1f5f9',
};

export const layout = {
  maxWidth: 1200,
  padding: 16,
};

export const cardStyles = {
  container: {
    backgroundColor: colors.blueLight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  sub: {
    marginTop: 6,
    color: colors.mutedText,
    fontSize: 12,
  },
  action: {
    marginTop: 10,
    backgroundColor: colors.accentGreen,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600' as const,
  },
};