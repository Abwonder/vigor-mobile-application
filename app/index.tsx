import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      // Fetch role to redirect correctly
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile?.role === 'specialist' || profile?.role === 'public_health') {
        router.replace('/specialist');
      } else if (profile?.role) {
        router.replace('/patient');
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* 1. THE IMAGE LAYER */}
        <Image
          source={require('../assets/doctor.png')}
          style={styles.image}
          resizeMode="cover"
        />

        {/* 2. THE CONTENT LAYER (The "White Sheet") */}
        <View style={styles.contentContainer}>
          <View style={styles.textWrapper}>
            <Text style={styles.title}>
              Care you can trust,{'\n'}even from afar
            </Text>
            <Text style={styles.description}>
              Book consultations, track medical updates, and stay{'\n'}involved
              no matter where you are.
            </Text>
          </View>

          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              onPress={() => router.push('/select-role')}
              activeOpacity={0.8}
              style={styles.shadowWrapper}
            >
              <LinearGradient
                colors={['#00D4FF', '#0EA5E9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.createAccountButton}
              >
                <Text style={styles.createAccountButtonText}>
                  Create an account
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/login')}
              activeOpacity={0.7}
            >
              <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  image: {
    width: SCREEN_WIDTH,
    height: 400,
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
    minHeight: 400,
  },
  textWrapper: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  buttonWrapper: {
    width: '100%',
    gap: 12,
  },
  shadowWrapper: {
    width: '100%',
  },
  createAccountButton: {
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createAccountButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loginButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
});
