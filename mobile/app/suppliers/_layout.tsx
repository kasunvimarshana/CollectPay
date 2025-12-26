import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

export default function SuppliersLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary[500],
        },
        headerTintColor: colors.text.inverse,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen name="[id]" options={{ title: 'Supplier Details' }} />
      <Stack.Screen name="new" options={{ title: 'New Supplier' }} />
    </Stack>
  );
}
