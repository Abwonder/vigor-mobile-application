import { Stack } from 'expo-router';

export default function SupportLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="submit-ticket" />
      <Stack.Screen name="category" />
      <Stack.Screen name="faq" />
    </Stack>
  );
}
