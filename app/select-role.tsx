import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  CheckCircle2,
  Circle,
  Stethoscope,
  Activity,
} from 'lucide-react-native';

type UserRole =
  | 'service_user'
  | 'sponsor'
  | 'specialist'
  | 'public_health'
  | null;

export default function SelectRoleScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  const handleContinue = () => {
    if (!selectedRole) return;

    router.push({
      pathname: '/signup',
      params: { role: selectedRole },
    });
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
        <Text style={styles.headerTitle}>Select user type</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          How should we set up your account?{'\n'}You can always update this
          later.
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedRole === 'service_user' && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedRole('service_user')}
          >
            <View style={styles.optionContent}>
              {selectedRole === 'service_user' ? (
                <CheckCircle2 size={24} color="#0EA5E9" strokeWidth={2.5} />
              ) : (
                <Circle size={24} color="#D1D5DB" strokeWidth={2} />
              )}
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Service User</Text>
                <Text style={styles.optionDescription}>
                  I want to access care for myself.
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedRole === 'sponsor' && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedRole('sponsor')}
          >
            <View style={styles.optionContent}>
              {selectedRole === 'sponsor' ? (
                <CheckCircle2 size={24} color="#0EA5E9" strokeWidth={2.5} />
              ) : (
                <Circle size={24} color="#D1D5DB" strokeWidth={2} />
              )}
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>I'm a Sponsor</Text>
                <Text style={styles.optionDescription}>
                  Caring for someone else
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedRole === 'specialist' && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedRole('specialist')}
          >
            <View style={styles.optionContent}>
              {selectedRole === 'specialist' ? (
                <CheckCircle2 size={24} color="#0EA5E9" strokeWidth={2.5} />
              ) : (
                <Circle size={24} color="#D1D5DB" strokeWidth={2} />
              )}
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Specialist</Text>
                <Text style={styles.optionDescription}>
                  Advanced consultations and treatment.
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedRole === 'public_health' && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedRole('public_health')}
          >
            <View style={styles.optionContent}>
              {selectedRole === 'public_health' ? (
                <CheckCircle2 size={24} color="#0EA5E9" strokeWidth={2.5} />
              ) : (
                <Circle size={24} color="#D1D5DB" strokeWidth={2} />
              )}
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>
                  Public Health Professional
                </Text>
                <Text style={styles.optionDescription}>
                  First-level care & assessments.
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, selectedRole && styles.nextButtonActive]}
          onPress={handleContinue}
          disabled={!selectedRole}
        >
          <Text
            style={[
              styles.nextButtonText,
              selectedRole && styles.nextButtonTextActive,
            ]}
          >
            Next
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 32,
    lineHeight: 32,
  },
  optionsContainer: {
    gap: 16,
    paddingBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0EA5E9',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    backgroundColor: '#F9FAFB',
  },
  nextButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonActive: {
    backgroundColor: '#0EA5E9',
  },
  nextButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonTextActive: {
    color: '#FFFFFF',
  },
});
