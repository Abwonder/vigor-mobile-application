import { Stack } from 'expo-router';

export default function SpecialistPatientsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen name="medical-record" />
      <Stack.Screen name="medication-form" />
    </Stack>
  );
}
