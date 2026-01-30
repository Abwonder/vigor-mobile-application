import React from 'react';
import { View, Text, StyleSheet, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Colors';
import { Button } from '../../../components/specialist/Button';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Make status bar translucent so image shows behind it */}
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.imageContainer}>
        <Image
          source={require('../../../../assets/doctor.png')}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Content Container - Takes 50% of screen, respects bottom safe area */}
      <SafeAreaView style={styles.contentContainer} edges={['bottom']}>
        <Text style={styles.title}>Welcome to Vigor Providers</Text>
        <Text style={styles.subtitle}>
          Join a trusted network of healthcare professionals improving access to
          care for families at home and abroad.
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Enter Invite Code"
            onPress={() => router.push('/specialist/auth/access-code')}
            variant="primary"
            style={styles.buttonSpacing}
          />
          <Button
            title="Log In"
            onPress={() => router.push('/specialist/auth/login')}
            variant="outline"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  imageContainer: {
    flex: 1, // Takes exactly 50% of screen height
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1, // Takes exactly 50% of screen height
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: Colors.light.background,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textGray,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
  },
  buttonSpacing: {
    marginBottom: 12,
  },
});
