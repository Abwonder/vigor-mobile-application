import { Stack } from 'expo-router';

export default function PatientLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="appointments" />
      <Stack.Screen name="audio-consultation" />
      <Stack.Screen name="care" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="consultation" />
      <Stack.Screen name="specialist-info" />
      <Stack.Screen name="support" />
      <Stack.Screen name="symptom-category" />
      <Stack.Screen name="video-consultation" />
    </Stack>
  );
}
