import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { getSuggestedUsers, SuggestedUser } from '../api/client';
import UserProfileModal from './UserProfileModal';

export default function PlayersScreen() {
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<SuggestedUser | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const list = await getSuggestedUsers();
        if (mounted) setUsers(list);
      } catch (e) {
        // noop, fallback handled in client
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const openProfile = (user: SuggestedUser) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const closeProfile = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  const renderItem = ({ item }: { item: SuggestedUser }) => (
    <View style={styles.card}>
      {item.avatar_url ? (
        <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.placeholder]} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.username}>@{item.username}</Text>
        {item.bio ? <Text style={styles.bio}>{item.bio}</Text> : null}
      </View>
      <TouchableOpacity style={styles.viewBtn} onPress={() => openProfile(item)}>
        <Text style={styles.viewText}>View</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suggested Players</Text>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 16 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 8 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
      <UserProfileModal visible={modalVisible} user={selectedUser} onClose={closeProfile} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: '#eee' },
  placeholder: { backgroundColor: '#ddd' },
  username: { fontSize: 16, fontWeight: '500' },
  bio: { marginTop: 4, fontSize: 12, color: '#6b7280' },
  viewBtn: { backgroundColor: '#111827', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  viewText: { color: 'white', fontWeight: '600' },
});