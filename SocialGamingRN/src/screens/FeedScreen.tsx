import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, Button, TextInput, Alert } from 'react-native';
import { fetchFeed, FeedPost, likePost, commentPost, createPost } from '../api/endpoints';

export default function FeedScreen() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchFeed();
      setPosts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onLike = async (postId: string) => {
    try {
      await likePost(postId);
      await load();
    } catch (e: any) {
      Alert.alert('Like failed', e?.response?.data?.error || e.message || 'Unknown error');
    }
  };

  const onComment = async (postId: string) => {
    try {
      const text = (comments[postId] || '').trim();
      if (!text) {
        Alert.alert('Comment', 'Please enter a comment');
        return;
      }
      await commentPost(postId, text);
      setComments((prev) => ({ ...prev, [postId]: '' }));
      await load();
    } catch (e: any) {
      Alert.alert('Comment failed', e?.response?.data?.error || e.message || 'Unknown error');
    }
  };

  const getCount = (item: any, fields: string[]): number => {
    for (const f of fields) {
      const v = item?.[f];
      if (v === undefined || v === null) continue;
      if (typeof v === 'number') return v;
      if (Array.isArray(v)) return v.length;
      if (typeof v === 'object' && typeof v.count === 'number') return v.count;
      if (typeof v === 'string' && !isNaN(Number(v))) return Number(v);
    }
    return 0;
  };

  const onCreatePost = async () => {
    const content = newPost.trim();
    if (!content) {
      Alert.alert('Post', 'Please enter some content');
      return;
    }
    try {
      setPosting(true);
      await createPost({ content });
      setNewPost('');
      await load();
    } catch (e: any) {
      Alert.alert('Create post failed', e?.response?.data?.error || e.message || 'Unknown error');
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={(
          <View style={{ padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8 }}>
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>Create Post</Text>
            <TextInput
              placeholder="What's on your mind?"
              value={newPost}
              onChangeText={setNewPost}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 }}
            />
            <View style={{ marginTop: 10 }}>
              <Button title={posting ? 'Posting...' : 'Post'} onPress={onCreatePost} disabled={posting} />
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={{ padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8 }}>
            <Text style={{ fontWeight: '600' }}>Post #{item.id.slice(0, 8)}</Text>
            {item.content ? <Text style={{ marginTop: 4 }}>{item.content}</Text> : null}
            {item.created_at ? <Text style={{ marginTop: 4, color: '#666' }}>{item.created_at}</Text> : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, justifyContent: 'space-between' }}>
              <Button
                title={`Like (${getCount(item, ['likes', 'like_count', 'likes_count', 'total_likes'])})`}
                onPress={() => onLike(item.id)}
              />
              <Text style={{ color: '#666' }}>
                Comments: {getCount(item, ['comments', 'comment_count', 'comments_count', 'total_comments'])}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <TextInput
                placeholder="Write a comment"
                value={comments[item.id] || ''}
                onChangeText={(t) => setComments((prev) => ({ ...prev, [item.id]: t }))}
                style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginRight: 8 }}
              />
              <Button title="Send" onPress={() => onComment(item.id)} />
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: 'center', marginTop: 24 }}>
              <Text>No posts yet</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}