import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, Button, Alert } from 'react-native';
import { fetchWallet, fetchWalletHistory, WalletTx } from '../api/endpoints';

export default function WalletScreen() {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [txs, setTxs] = useState<WalletTx[]>([]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const w = await fetchWallet();
        setWallet(w);
        const history = await fetchWalletHistory();
        setTxs(history);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const balance = (wallet?.earned_chips ?? 0) + (wallet?.purchased_chips ?? 0);
  const onAddMoney = () => {
    Alert.alert(
      'Add Money',
      'Stub: integrate RazorPay/Cashfree in Phase-2',
    );
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {loading ? (
        <ActivityIndicator />
      ) : wallet ? (
        <View>
          <Text style={{ fontSize: 20, fontWeight: '600' }}>Wallet</Text>
          <Text style={{ marginTop: 8 }}>Balance: {balance}</Text>
          <Text style={{ marginTop: 4 }}>Earned Chips: {wallet.earned_chips ?? 0}</Text>
          <Text style={{ marginTop: 4 }}>Purchased Chips: {wallet.purchased_chips ?? 0}</Text>
          <Text style={{ marginTop: 4 }}>Diamonds: {wallet.diamonds ?? 0}</Text>
          <View style={{ marginTop: 12 }}>
            <Button title="Add Money" onPress={onAddMoney} />
          </View>
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontWeight: '600' }}>History</Text>
            <FlatList
              data={txs}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={{ padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginTop: 8 }}>
                  <Text>{item.type} • {item.source || 'N/A'}</Text>
                  <Text style={{ marginTop: 4 }}>Chips: {item.amount_chips ?? 0} | Diamonds: {item.amount_diamonds ?? 0}</Text>
                  <Text style={{ marginTop: 4, color: '#666' }}>{item.created_at}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={{ marginTop: 8 }}>No transactions</Text>}
            />
          </View>
        </View>
      ) : (
        <Text>No wallet</Text>
      )}
    </View>
  );
}