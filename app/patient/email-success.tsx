import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Award } from 'lucide-react-native';

export default function EmailSuccessScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.replace('/verify-phone');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Award size={48} color="#10B981" strokeWidth={2.5} />
          </View>
        </View>

        <Text style={styles.title}>Email verified successfully</Text>
        <Text style={styles.description}>
          You're all set. Let's complete your account to get started with VigorCare.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 120,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'left',
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    textAlign: 'left',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  continueButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
