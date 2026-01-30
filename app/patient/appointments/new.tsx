import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ChevronLeft, Info } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';

interface Specialist {
  id: string;
  full_name: string;
  specialty: string;
  photo_url?: string;
}

interface Nurse {
  id: string;
  name: string;
  title: string;
  profile_image_url?: string;
}

export default function NewAppointmentScreen() {
  const router = useRouter();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const [specialistsRes, nursesRes] = await Promise.all([
        supabase
          .from('specialists')
          .select('id, full_name, specialty, photo_url')
          .order('full_name'),
        supabase
          .from('nurses')
          .select('id, name, title, profile_image_url')
          .eq('is_active', true)
          .order('name'),
      ]);

      if (specialistsRes.data) setSpecialists(specialistsRes.data);
      if (nursesRes.data) setNurses(nursesRes.data);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProvider = (
    providerId: string,
    providerType: 'specialist' | 'nurse',
  ) => {
    router.push(
      `/appointments/book?providerId=${providerId}&providerType=${providerType}`,
    );
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
        <Text style={styles.headerTitle}>New Appointment with</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your specialists</Text>
            <TouchableOpacity>
              <Info size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#00D9FF"
              style={styles.loader}
            />
          ) : specialists.length === 0 ? (
            <Text style={styles.emptyText}>No specialists available</Text>
          ) : (
            specialists.map((specialist) => (
              <TouchableOpacity
                key={specialist.id}
                style={styles.providerCard}
                onPress={() =>
                  handleSelectProvider(specialist.id, 'specialist')
                }
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {specialist.full_name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>
                    Dr. {specialist.full_name}
                  </Text>
                  <Text style={styles.providerSpecialty}>
                    {specialist.specialty}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Help in 15 mins</Text>
            <TouchableOpacity>
              <Info size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#00D9FF"
              style={styles.loader}
            />
          ) : nurses.length === 0 ? (
            <Text style={styles.emptyText}>No nurses available</Text>
          ) : (
            nurses.map((nurse) => (
              <TouchableOpacity
                key={nurse.id}
                style={styles.providerCard}
                onPress={() => handleSelectProvider(nurse.id, 'nurse')}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{nurse.name.charAt(0)}</Text>
                </View>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>Nurse {nurse.name}</Text>
                  <Text style={styles.providerSpecialty}>{nurse.title}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0284C7',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  providerSpecialty: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  loader: {
    marginVertical: 32,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 32,
  },
});
