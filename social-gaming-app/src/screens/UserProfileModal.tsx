import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { followUser, getFollowersCount, SuggestedUser } from '../api/client';

type Props = {
  visible: boolean;
  user: SuggestedUser | null;
  onClose: () => void;
};

export default function UserProfileModal({ visible, user, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [following, setFollowing] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { count } = await getFollowersCount(user.id);
        if (mounted) setFollowersCount(count);
      } catch (e) {
        // noop
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [user]);

  const toggleFollow = async () => {
    if (!user) return;
    // Optimistic toggle
    setFollowing((prev) => !prev);
    try {
      const res = await followUser(user.id);
      setFollowing(res.following);
      // Adjust followers count heuristically
      setFollowersCount((c) => (res.following ? c + 1 : Math.max(0, c - 1)));
    } catch (e) {
      // revert on failure
      setFollowing((prev) => !prev);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Player Profile</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>Close</Text>
          </TouchableOpacity>
        </View>
        {!user ? (
          <Text style={styles.empty}>No user selected</Text>
        ) : (
          <View style={styles.content}>
            {user.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.placeholder]} />
            )}
            <Text style={styles.username}>@{user.username}</Text>
            {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
            <View style={styles.row}>
              <Text style={styles.statLabel}>Followers:</Text>
              {loading ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text style={styles.statValue}>{followersCount}</Text>
              )}
            </View>
            <TouchableOpacity style={styles.followBtn} onPress={toggleFollow}>
              <Text style={styles.followText}>{following ? 'Unfollow' : 'Follow'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '600' },
  close: { color: '#2563eb', fontSize: 16 },
  empty: { marginTop: 24, fontSize: 16, color: '#555' },
  content: { marginTop: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eee' },
  placeholder: { backgroundColor: '#ddd' },
  username: { marginTop: 12, fontSize: 18, fontWeight: '500' },
  bio: { marginTop: 8, fontSize: 14, color: '#555' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  statLabel: { fontSize: 14, color: '#555' },
  statValue: { marginLeft: 6, fontSize: 14, fontWeight: '500' },
  followBtn: { marginTop: 18, backgroundColor: '#111827', paddingVertical: 10, borderRadius: 8 },
  followText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '600' },
});