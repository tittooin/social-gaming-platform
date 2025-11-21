import { Platform, ToastAndroid, Alert } from 'react-native';

export function showToast(message: string) {
  if (!message) return;
  if (Platform.OS === 'android') {
    try {
      ToastAndroid.show(String(message), ToastAndroid.SHORT);
    } catch {
      Alert.alert('Notice', String(message));
    }
  } else {
    Alert.alert('Notice', String(message));
  }
}