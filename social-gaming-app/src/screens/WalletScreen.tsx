import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWallet } from '../api/client';

export default function WalletScreen() {
  const [wallet, setWallet] = useState<any>(null);
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const data = await getWallet();
        setWallet(data);
      } catch (e) {
        setWallet({ error: String(e) });
      }
    })();
  }, []);

  const balance = wallet?.balance ?? wallet?.earned_chips ?? wallet?.chips ?? 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Balance</Text>
        <Text style={styles.balance}>{String(balance)}</Text>
      </View>
      <View style={styles.actions}>
        <Button title="Add Cash" onPress={() => {}} />
        <View style={{ width: 12 }} />
        <Button title="Withdraw" onPress={() => {}} />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transactions</Text>
        <Text style={styles.placeholder}>No transactions yet.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 16, marginBottom: 16, backgroundColor: '#fafafa' },
  cardTitle: { fontSize: 16, color: '#666' },
  balance: { fontSize: 28, fontWeight: 'bold', marginTop: 6 },
  actions: { flexDirection: 'row', marginBottom: 16 },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  placeholder: { color: '#666' },
});