import { Stack } from 'expo-router';

export default function SpecialistAuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="create-account" />
      <Stack.Screen name="access-code" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="email-verified" />
    </Stack>
  );
}
