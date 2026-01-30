import { Stack } from 'expo-router';

export default function SymptomCategoryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[category]" />
    </Stack>
  );
}
