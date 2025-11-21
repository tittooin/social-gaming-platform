import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, layout, isWeb } from './theme';

const items = [
  { key: 'Feed' },
  { key: 'Play' },
  { key: 'Wallet' },
  { key: 'Profile' },
  { key: 'Players' },
  { key: 'Lobby' },
];

export default function HeaderBar() {
  const nav = useNavigation<any>();
  if (!isWeb) return null;
  return (
    <View style={styles.wrap}>
      <View style={styles.inner}>
        <Text style={styles.brand}>Social Gaming</Text>
        <View style={styles.nav}>
          {items.map((it) => (
            <TouchableOpacity
              key={it.key}
              style={styles.link}
              onPress={() => nav.navigate('MainTabs', { screen: it.key })}
            >
              <Text style={styles.linkText}>{it.key}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primaryBlue,
  },
  inner: {
    maxWidth: layout.maxWidth,
    width: '100%',
    marginHorizontal: 'auto' as any,
    paddingVertical: 12,
    paddingHorizontal: layout.padding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { color: '#fff', fontWeight: '700', fontSize: 18 },
  nav: { flexDirection: 'row', gap: 12 },
  link: {
    backgroundColor: colors.blueMid,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  linkText: { color: '#fff', fontWeight: '600' },
});