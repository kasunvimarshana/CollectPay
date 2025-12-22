import React, { useEffect } from 'react';
import { View, Text } from 'react-native';

export type SnackbarType = 'success' | 'error' | 'info';

interface Props {
  visible: boolean;
  message: string;
  type?: SnackbarType;
  onDismiss?: () => void;
  durationMs?: number;
}

export default function Snackbar({ visible, message, type = 'info', onDismiss, durationMs = 3000 }: Props) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onDismiss && onDismiss(), durationMs);
    return () => clearTimeout(t);
  }, [visible, durationMs, onDismiss]);

  if (!visible) return null;

  const bg = type === 'success' ? '#0a7d26' : type === 'error' ? '#b00020' : '#333';

  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 20, alignItems: 'center', zIndex: 1000 }}>
      <View style={{ backgroundColor: bg, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4 }}>
        <Text style={{ color: '#fff' }}>{message}</Text>
      </View>
    </View>
  );
}
