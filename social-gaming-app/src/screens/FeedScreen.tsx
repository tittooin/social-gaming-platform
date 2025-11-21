import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { getFeed, likePost } from '../api/client';
import CreatePostModal from './CreatePostModal';

type FeedItem = {
  id: string;
  user_id?: string;
  username?: string;
  text: string;
  likes?: number;
  comments?: number;
  likedByUser?: boolean;
};

export default function FeedScreen() {
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const PAGE_SIZE = 10;

  const fetchPage = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const data = await getFeed(pageNum, PAGE_SIZE);
      const list: FeedItem[] = Array.isArray(data) ? data : data?.items || [];
      if (pageNum === 1) {
        setPosts(list);
      } else {
        setPosts((prev) => {
          const map = new Map(prev.map((p) => [p.id, p]));
          for (const it of list) map.set(it.id, { ...map.get(it.id), ...it } as FeedItem);
          return Array.from(map.values());
        });
      }
      setHasMore(list.length >= PAGE_SIZE);
    } catch (e) {
      console.log('Feed error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchPage(1);
  };

  const loadMore = async () => {
    if (loading || !hasMore) return;
    const next = page + 1;
    setPage(next);
    await fetchPage(next);
  };

  const toggleLike = async (item: FeedItem) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === item.id
          ? { ...p, likedByUser: !p.likedByUser, likes: (p.likes || 0) + (p.likedByUser ? -1 : 1) }
          : p
      )
    );
    try {
      await likePost(item.id);
    } catch (e) {
      // revert on failure
      setPosts((prev) =>
        prev.map((p) =>
          p.id === item.id
            ? { ...p, likedByUser: !p.likedByUser, likes: (p.likes || 0) + (p.likedByUser ? -1 : 1) }
            : p
        )
      );
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const renderItem = ({ item }: { item: FeedItem }) => (
    <View style={styles.post}>
      <Text style={styles.username}>{item.username || 'User'}</Text>
      <Text style={styles.text}>{item.text}</Text>
      <View style={styles.metaRow}>
        <TouchableOpacity onPress={() => toggleLike(item)} style={styles.likeBtn}>
          <Text>{item.likedByUser ? 'Unlike' : 'Like'}</Text>
        </TouchableOpacity>
        <Text style={styles.meta}>Likes: {item.likes ?? 0}</Text>
        <Text style={styles.meta}>Comments: {item.comments ?? 0}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Feed</Text>
        <TouchableOpacity onPress={() => setShowCreate(true)} style={styles.newPostBtn}>
          <Text style={styles.newPostText}>New Post</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loading ? <ActivityIndicator style={{ marginVertical: 12 }} /> : null}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
      <CreatePostModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onPosted={(newItem) => {
          setShowCreate(false);
          setPosts((prev) => [newItem, ...prev]);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold' },
  newPostBtn: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, backgroundColor: '#fafafa' },
  newPostText: { fontWeight: 'bold' },
  post: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#fff' },
  username: { fontWeight: 'bold', marginBottom: 4 },
  text: { marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  meta: { color: '#666' },
  likeBtn: { paddingVertical: 4, paddingHorizontal: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginRight: 8 },
});