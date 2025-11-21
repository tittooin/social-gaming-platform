import React from 'react';
import { View, Text, Button, StyleSheet, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../api/client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../App';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = React.useState('player1');

  const handleLogin = async () => {
    const data = await login(username);
    const token = data?.token;
    if (token) {
      navigation.replace('MainTabs' as any);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Social Gaming</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="username"
        style={styles.input}
      />
      <Button title="Login (dev)" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, marginBottom: 16 },
  input: { width: '80%', borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 12 },
});