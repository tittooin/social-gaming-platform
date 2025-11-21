import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TextInput, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../state/auth';
import { fetchProfile, updateProfile } from '../api/endpoints';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const user = useAuth((s) => s.user);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [peerId, setPeerId] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const p = await fetchProfile(user.id);
        setProfile(p);
        setDisplayName(p?.display_name || '');
        setBio(p?.bio || '');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user?.id]);

  const onSave = async () => {
    try {
      const updated = await updateProfile({ display_name: displayName, bio });
      setProfile(updated);
      Alert.alert('Profile', 'Saved successfully');
    } catch (e: any) {
      Alert.alert('Save failed', e?.response?.data?.error || e.message || 'Unknown error');
    }
  };

  const onStartDM = () => {
    const p = peerId.trim();
    if (!p) {
      Alert.alert('Direct Message', 'Enter a peer user ID');
      return;
    }
    navigation.navigate('DMChat', { peerId: p });
  };

  if (!user?.id) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>No user</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <Text style={{ fontSize: 20, fontWeight: '600' }}>Profile</Text>
          <Text style={{ marginTop: 8 }}>User ID: {user.id}</Text>
          <Text style={{ marginTop: 4 }}>Username: {user.name || 'N/A'}</Text>
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontWeight: '600' }}>Edit Profile</Text>
            <TextInput
              placeholder="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginTop: 8 }}
            />
            <TextInput
              placeholder="Bio"
              value={bio}
              onChangeText={setBio}
              multiline
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginTop: 8, minHeight: 80 }}
            />
            <View style={{ marginTop: 10 }}>
              <Button title="Save" onPress={onSave} />
            </View>
          </View>
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontWeight: '600' }}>Direct Messages</Text>
            <TextInput
              placeholder="Peer user ID"
              value={peerId}
              onChangeText={setPeerId}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginTop: 8 }}
            />
            <View style={{ marginTop: 10 }}>
              <Button title="Start DM" onPress={onStartDM} />
            </View>
          </View>
          {profile ? (
            <View style={{ marginTop: 16 }}>
              <Text>XP: {profile.xp ?? 0}</Text>
              <Text>Bio: {profile.bio ?? ''}</Text>
            </View>
          ) : (
            <Text style={{ marginTop: 12 }}>No profile data</Text>
          )}
        </>
      )}
    </View>
  );
}