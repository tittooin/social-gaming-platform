import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, Button, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile, updateProfile } from '../api/client';

export default function ProfileScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('auth_user');
        if (raw) {
          const u = JSON.parse(raw);
          setUserId(u?.id || u?.user_id || null);
          setUsername(u?.username || '');
          // Fetch fresh profile details
          const id = u?.id || u?.user_id;
          if (id) {
            const prof = await getProfile(String(id));
            setBio(prof?.bio || '');
            setAvatarUrl(prof?.avatar_url || '');
          }
        }
      } catch (e) {
        console.log('Profile init error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async () => {
    try {
      setLoading(true);
      const res = await updateProfile({ bio, avatar_url: avatarUrl });
      Alert.alert('Saved', 'Profile updated');
    } catch (e: any) {
      Alert.alert('Error', e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]} />
      )}
      <Text style={styles.username}>{username || 'Anonymous'}</Text>
      <Text style={styles.label}>Bio</Text>
      <TextInput style={styles.input} value={bio} onChangeText={setBio} placeholder="Tell something about you" />
      <Text style={styles.label}>Avatar URL</Text>
      <TextInput style={styles.input} value={avatarUrl} onChangeText={setAvatarUrl} placeholder="https://..." />
      <Button title={loading ? 'Saving...' : 'Save'} onPress={onSave} disabled={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#eee', marginBottom: 12 },
  avatarPlaceholder: { backgroundColor: '#ddd' },
  username: { fontSize: 18, marginBottom: 16 },
  label: { alignSelf: 'flex-start', fontSize: 14, color: '#666', marginTop: 8 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginTop: 6 },
});