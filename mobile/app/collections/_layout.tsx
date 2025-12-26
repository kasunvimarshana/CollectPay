import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

export default function CollectionsLayout() {
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
      <Stack.Screen name="[id]" options={{ title: 'Collection Details' }} />
      <Stack.Screen name="new" options={{ title: 'New Collection' }} />
    </Stack>
  );
}
