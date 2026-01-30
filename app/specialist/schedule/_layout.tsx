import { Stack } from 'expo-router';

export default function SpecialistScheduleLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="schedule-consultation" />
    </Stack>
  );
}
