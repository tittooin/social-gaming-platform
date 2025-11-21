import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../state/auth';

type Props = { children: React.ReactNode };

export default function AuthGate({ children }: Props) {
  const { token, initializing, hydrate } = useAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <>{children}</>;
}