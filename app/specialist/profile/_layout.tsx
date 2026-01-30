import { Stack } from 'expo-router';

export default function SpecialistProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profile-info" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="change-photo" />
      <Stack.Screen name="crop-photo" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
