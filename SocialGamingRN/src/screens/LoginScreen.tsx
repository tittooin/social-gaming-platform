import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useAuth } from '../state/auth';
import { loginDev } from '../api/endpoints';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuth((s) => s.login);

  const onLogin = async () => {
    try {
      if (!identifier.trim()) {
        Alert.alert('Login', 'Please enter a username');
        return;
      }
      const { token, user } = await loginDev(identifier.trim());
      login(token, { id: user.id, name: user.username });
    } catch (e: any) {
      Alert.alert('Login failed', e?.response?.data?.error || e.message || 'Unknown error');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Login</Text>
      <TextInput
        placeholder="Email or Phone"
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 }}
      />
      <Button title="Login" onPress={onLogin} />
      <Text style={{ color: '#666' }}>Or proceed with OTP (optional screen)</Text>
    </View>
  );
}