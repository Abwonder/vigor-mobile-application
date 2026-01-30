import { Stack } from 'expo-router';

export default function SpecialistConsultLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen name="audio-call" />
      <Stack.Screen name="video-call" />
      <Stack.Screen name="call-ended" />
    </Stack>
  );
}
