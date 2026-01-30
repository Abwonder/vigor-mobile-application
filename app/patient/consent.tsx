import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, CheckCircle2, Circle } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import SubscriptionModal from '../components/SubscriptionModal';

export default function ConsentScreen() {
  const router = useRouter();
  const { role, photo } = useLocalSearchParams<{
    role?: string;
    photo?: string;
  }>();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [userId, setUserId] = useState<string>('');

  const handleFinish = async () => {
    if (!agreed) return;

    setLoading(true);
    setError('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError('User not found. Please try again.');
        return;
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          role: role || 'service_user',
          consent_agreed: true,
          consent_agreed_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        setError('Failed to save consent. Please try again.');
        return;
      }

      setUserId(user.id);
      setShowSubscriptionModal(true);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSubscriptionModal = () => {
    setShowSubscriptionModal(false);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={styles.progressSegment} />
          <View style={styles.progressSegment} />
          <View style={styles.progressSegment} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Telehealth Informed Consent</Text>

        <Text style={styles.subtitle}>
          By checking the box below, I confirm that:
        </Text>

        <View style={styles.bulletList}>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              I have read and understood VigorCare's Telehealth Consent, Terms
              of Use, and Privacy Policy.
            </Text>
          </View>

          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              I understand that telehealth involves the use of electronic
              communications to share my medical information with healthcare
              providers for the purpose of diagnosis, treatment, and follow-up.
            </Text>
          </View>

          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              I agree to receive care through VigorCare's telehealth services
              and consent to the collection, use, and storage of my personal and
              medical information as described in the policies.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAgreed(!agreed)}
        >
          {agreed ? (
            <CheckCircle2 size={24} color="#0EA5E9" strokeWidth={2.5} />
          ) : (
            <Circle size={24} color="#D1D5DB" strokeWidth={2} />
          )}
          <Text style={styles.checkboxText}>
            I have read, understood, and agree to the{' '}
            <Text style={styles.link}>Telehealth Consent</Text>,{' '}
            <Text style={styles.link}>Terms of Use</Text>, and{' '}
            <Text style={styles.link}>Privacy Policy</Text>.
          </Text>
        </TouchableOpacity>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.finishButton, agreed && styles.finishButtonActive]}
          onPress={handleFinish}
          disabled={!agreed || loading}
        >
          {loading ? (
            <ActivityIndicator color={agreed ? '#FFFFFF' : '#9CA3AF'} />
          ) : (
            <Text
              style={[
                styles.finishButtonText,
                agreed && styles.finishButtonTextActive,
              ]}
            >
              Start Using VigorCare
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={handleCloseSubscriptionModal}
        userId={userId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginBottom: 16,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: '#0EA5E9',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 16,
  },
  bulletList: {
    gap: 16,
    marginBottom: 24,
  },
  bulletItem: {
    flexDirection: 'row',
    gap: 8,
  },
  bullet: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  checkboxContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  link: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  finishButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  finishButtonActive: {
    backgroundColor: '#0EA5E9',
  },
  finishButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  finishButtonTextActive: {
    color: '#FFFFFF',
  },
});
