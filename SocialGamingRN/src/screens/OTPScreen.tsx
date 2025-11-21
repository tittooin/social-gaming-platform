import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { verifyOtp } from '../api/endpoints';
import { useAuth } from '../state/auth';

export default function OTPScreen() {
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const login = useAuth((s) => s.login);

  const onVerify = async () => {
    try {
      if (!phone || !token) {
        Alert.alert('OTP', 'Enter phone and OTP');
        return;
      }
      const res = await verifyOtp(phone.trim(), token.trim());
      // Use access_token as bearer for backend
      login(res.access_token, { id: res.user.id, name: res.user.phone || undefined });
      Alert.alert('OTP', 'Verified successfully');
    } catch (e: any) {
      Alert.alert('Verify failed', e?.response?.data?.error || e.message || 'Unknown error');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>OTP Login</Text>
      <TextInput
        placeholder="Phone (+E.164)"
        value={phone}
        onChangeText={setPhone}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 }}
      />
      <TextInput
        placeholder="OTP Token"
        value={token}
        onChangeText={setToken}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 }}
      />
      <Button title="Verify" onPress={onVerify} />
    </View>
  );
}