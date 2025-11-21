import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { createPost } from '../api/client';

type Props = {
  visible: boolean;
  onClose: () => void;
  onPosted: (item: any) => void;
};

export default function CreatePostModal({ visible, onClose, onPosted }: Props) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    if (!text.trim()) return;
    try {
      setSaving(true);
      const res = await createPost(text.trim());
      const item = res?.post || res;
      onPosted(item);
      setText('');
    } catch (e) {
      console.log('Create post error:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Post</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="What's on your mind?"
          style={styles.input}
          multiline
        />
        <View style={styles.actions}>
          <Button title="Cancel" onPress={onClose} />
          <View style={{ width: 12 }} />
          <Button title={saving ? 'Posting...' : 'Post'} onPress={onSubmit} disabled={saving} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  input: { flexGrow: 1, minHeight: 100, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6 },
  actions: { flexDirection: 'row', marginTop: 16 },
});