import { Stack } from 'expo-router';

export default function CareLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="care-team" />
      <Stack.Screen name="documents" />
      <Stack.Screen name="health-record" />
      <Stack.Screen name="medications" />
      <Stack.Screen name="tests" />
    </Stack>
  );
}
