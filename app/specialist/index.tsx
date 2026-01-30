import { useEffect } from 'react';
import { View, StyleSheet, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to Welcome screen after 2 seconds
    const timer = setTimeout(() => {
      router.replace('/specialist/auth/welcome');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Image
        source={require('../../assets/vigor-logo.jpeg')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primary, // Vigor Blue
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150, // Adjustable based on actual image size
    height: 150,
  },
});
