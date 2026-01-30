import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="consult" />
      <Stack.Screen name="patients" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
