import { Stack } from 'expo-router';

export default function SpecialistOnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="select-user-type" />
      <Stack.Screen name="specialist" />
    </Stack>
  );
}
