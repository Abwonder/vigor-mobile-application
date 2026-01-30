import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import {
  ChevronLeft,
  Plus,
  AlertCircle,
  Heart,
  Activity,
  Syringe,
  Thermometer,
  FileText,
  Users,
  Home,
} from 'lucide-react-native';

interface UserProfile {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone_number: string;
}

interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: string;
  recorded_date: string;
}

interface Condition {
  id: string;
  condition: string;
  diagnosis_date: string;
  status: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescriber: string;
  status: string;
}

interface Surgery {
  id: string;
  procedure: string;
  surgery_date: string;
  hospital: string;
  surgeon: string;
}

interface FamilyHistory {
  id: string;
  relation: string;
  condition: string;
  age_of_onset: number | null;
}

interface SocialHistory {
  smoking_status: string;
  alcohol_use: string;
  exercise_frequency: string;
  occupation: string;
}

interface Immunization {
  id: string;
  vaccine: string;
  date_administered: string;
  administered_by: string;
}

interface Vital {
  id: string;
  measurement_date: string;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  temperature: number | null;
  weight: number | null;
  height: number | null;
  bmi: number | null;
}

interface LabResult {
  id: string;
  test_name: string;
  test_date: string;
  value: string;
  unit: string;
  status: string;
}

export default function HealthRecordScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [familyHistory, setFamilyHistory] = useState<FamilyHistory[]>([]);
  const [socialHistory, setSocialHistory] = useState<SocialHistory | null>(
    null,
  );
  const [immunizations, setImmunizations] = useState<Immunization[]>([]);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);

  useEffect(() => {
    loadHealthRecord();
  }, []);

  const loadHealthRecord = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      await Promise.all([
        loadProfile(user.id),
        loadAllergies(user.id),
        loadConditions(user.id),
        loadMedications(user.id),
        loadSurgeries(user.id),
        loadFamilyHistory(user.id),
        loadSocialHistory(user.id),
        loadImmunizations(user.id),
        loadVitals(user.id),
        loadLabResults(user.id),
      ]);
    } catch (error) {
      console.error('Error loading health record:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (data) setProfile(data);
  };

  const loadAllergies = async (userId: string) => {
    const { data } = await supabase
      .from('allergies')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_date', { ascending: false });
    if (data) setAllergies(data);
  };

  const loadConditions = async (userId: string) => {
    const { data } = await supabase
      .from('conditions')
      .select('*')
      .eq('user_id', userId)
      .order('diagnosis_date', { ascending: false });
    if (data) setConditions(data);
  };

  const loadMedications = async (userId: string) => {
    const { data } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });
    if (data) setMedications(data);
  };

  const loadSurgeries = async (userId: string) => {
    const { data } = await supabase
      .from('surgical_history')
      .select('*')
      .eq('user_id', userId)
      .order('surgery_date', { ascending: false });
    if (data) setSurgeries(data);
  };

  const loadFamilyHistory = async (userId: string) => {
    const { data } = await supabase
      .from('family_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setFamilyHistory(data);
  };

  const loadSocialHistory = async (userId: string) => {
    const { data } = await supabase
      .from('social_history')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (data) setSocialHistory(data);
  };

  const loadImmunizations = async (userId: string) => {
    const { data } = await supabase
      .from('immunizations')
      .select('*')
      .eq('user_id', userId)
      .order('date_administered', { ascending: false });
    if (data) setImmunizations(data);
  };

  const loadVitals = async (userId: string) => {
    const { data } = await supabase
      .from('vitals')
      .select('*')
      .eq('user_id', userId)
      .order('measurement_date', { ascending: false })
      .limit(5);
    if (data) setVitals(data);
  };

  const loadLabResults = async (userId: string) => {
    const { data } = await supabase
      .from('lab_results')
      .select('*')
      .eq('user_id', userId)
      .order('test_date', { ascending: false })
      .limit(10);
    if (data) setLabResults(data);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Record</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {profile && (
          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>Patient Profile</Text>
            <View style={styles.profileCard}>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Name:</Text>
                <Text style={styles.profileValue}>
                  {profile.first_name} {profile.last_name}
                </Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Date of Birth:</Text>
                <Text style={styles.profileValue}>
                  {profile.date_of_birth
                    ? new Date(profile.date_of_birth).toLocaleDateString()
                    : 'N/A'}
                </Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Gender:</Text>
                <Text style={styles.profileValue}>
                  {profile.gender || 'N/A'}
                </Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Phone:</Text>
                <Text style={styles.profileValue}>
                  {profile.phone_number || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <AlertCircle size={20} color="#FF6B6B" />
              <Text style={styles.sectionTitle}>Allergies</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/care/allergies/add')}
            >
              <Plus size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {allergies.length === 0 ? (
            <Text style={styles.emptyText}>No allergies recorded</Text>
          ) : (
            allergies.map((allergy) => (
              <View key={allergy.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordTitle}>{allergy.allergen}</Text>
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: getSeverityColor(allergy.severity) },
                    ]}
                  >
                    <Text style={styles.severityText}>{allergy.severity}</Text>
                  </View>
                </View>
                <Text style={styles.recordDetail}>
                  Reaction: {allergy.reaction}
                </Text>
                <Text style={styles.recordDate}>
                  Recorded:{' '}
                  {new Date(allergy.recorded_date).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Heart size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Conditions / Diagnoses</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/care/conditions/add')}
            >
              <Plus size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {conditions.length === 0 ? (
            <Text style={styles.emptyText}>No conditions recorded</Text>
          ) : (
            conditions.map((condition) => (
              <View key={condition.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordTitle}>{condition.condition}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(condition.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{condition.status}</Text>
                  </View>
                </View>
                <Text style={styles.recordDate}>
                  Diagnosed:{' '}
                  {new Date(condition.diagnosis_date).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Activity size={20} color="#9C27B0" />
              <Text style={styles.sectionTitle}>Medications</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/care/medications/add')}
            >
              <Plus size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {medications.length === 0 ? (
            <Text style={styles.emptyText}>No medications recorded</Text>
          ) : (
            medications.map((med) => (
              <View key={med.id} style={styles.recordCard}>
                <Text style={styles.recordTitle}>{med.name}</Text>
                <Text style={styles.recordDetail}>
                  {med.dosage} - {med.frequency}
                </Text>
                <Text style={styles.recordDetail}>
                  Prescribed by: {med.prescriber}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(med.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{med.status}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <FileText size={20} color="#FF9800" />
              <Text style={styles.sectionTitle}>Past Surgical History</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/care/surgeries/add')}
            >
              <Plus size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {surgeries.length === 0 ? (
            <Text style={styles.emptyText}>No surgeries recorded</Text>
          ) : (
            surgeries.map((surgery) => (
              <View key={surgery.id} style={styles.recordCard}>
                <Text style={styles.recordTitle}>{surgery.procedure}</Text>
                <Text style={styles.recordDetail}>
                  Hospital: {surgery.hospital}
                </Text>
                <Text style={styles.recordDetail}>
                  Surgeon: {surgery.surgeon}
                </Text>
                <Text style={styles.recordDate}>
                  Date: {new Date(surgery.surgery_date).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Users size={20} color="#2196F3" />
              <Text style={styles.sectionTitle}>Family History</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/care/family-history/add')}
            >
              <Plus size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {familyHistory.length === 0 ? (
            <Text style={styles.emptyText}>No family history recorded</Text>
          ) : (
            familyHistory.map((item) => (
              <View key={item.id} style={styles.recordCard}>
                <Text style={styles.recordTitle}>
                  {item.relation}: {item.condition}
                </Text>
                {item.age_of_onset && (
                  <Text style={styles.recordDetail}>
                    Age of onset: {item.age_of_onset}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>

        {socialHistory && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Home size={20} color="#FF5722" />
                <Text style={styles.sectionTitle}>Social History</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/care/social-history/edit')}
              >
                <Plus size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.recordCard}>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Smoking:</Text>
                <Text style={styles.profileValue}>
                  {socialHistory.smoking_status}
                </Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Alcohol:</Text>
                <Text style={styles.profileValue}>
                  {socialHistory.alcohol_use}
                </Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Exercise:</Text>
                <Text style={styles.profileValue}>
                  {socialHistory.exercise_frequency || 'N/A'}
                </Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Occupation:</Text>
                <Text style={styles.profileValue}>
                  {socialHistory.occupation || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Syringe size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Immunizations</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/care/immunizations/add')}
            >
              <Plus size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {immunizations.length === 0 ? (
            <Text style={styles.emptyText}>No immunizations recorded</Text>
          ) : (
            immunizations.map((imm) => (
              <View key={imm.id} style={styles.recordCard}>
                <Text style={styles.recordTitle}>{imm.vaccine}</Text>
                <Text style={styles.recordDetail}>
                  Administered by: {imm.administered_by}
                </Text>
                <Text style={styles.recordDate}>
                  Date: {new Date(imm.date_administered).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Thermometer size={20} color="#03A9F4" />
              <Text style={styles.sectionTitle}>Vitals</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/care/vitals/add')}>
              <Plus size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {vitals.length === 0 ? (
            <Text style={styles.emptyText}>No vitals recorded</Text>
          ) : (
            vitals.map((vital) => (
              <View key={vital.id} style={styles.recordCard}>
                <Text style={styles.recordDate}>
                  {new Date(vital.measurement_date).toLocaleDateString()}
                </Text>
                <View style={styles.vitalsGrid}>
                  {vital.blood_pressure_systolic &&
                    vital.blood_pressure_diastolic && (
                      <Text style={styles.vitalItem}>
                        BP: {vital.blood_pressure_systolic}/
                        {vital.blood_pressure_diastolic}
                      </Text>
                    )}
                  {vital.heart_rate && (
                    <Text style={styles.vitalItem}>HR: {vital.heart_rate}</Text>
                  )}
                  {vital.temperature && (
                    <Text style={styles.vitalItem}>
                      Temp: {vital.temperature}°
                    </Text>
                  )}
                  {vital.weight && (
                    <Text style={styles.vitalItem}>
                      Weight: {vital.weight} kg
                    </Text>
                  )}
                  {vital.bmi && (
                    <Text style={styles.vitalItem}>BMI: {vital.bmi}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <FileText size={20} color="#673AB7" />
              <Text style={styles.sectionTitle}>Lab Results</Text>
            </View>
          </View>
          {labResults.length === 0 ? (
            <Text style={styles.emptyText}>No lab results</Text>
          ) : (
            labResults.map((result) => (
              <View key={result.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordTitle}>{result.test_name}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getLabStatusColor(result.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{result.status}</Text>
                  </View>
                </View>
                <Text style={styles.recordDetail}>
                  Value: {result.value} {result.unit}
                </Text>
                <Text style={styles.recordDate}>
                  Date: {new Date(result.test_date).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'severe':
      return '#FFEBEE';
    case 'moderate':
      return '#FFF3E0';
    case 'mild':
      return '#E8F5E9';
    default:
      return '#F5F5F5';
  }
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return '#E8F5E9';
    case 'resolved':
      return '#E3F2FD';
    case 'chronic':
      return '#FFF3E0';
    default:
      return '#F5F5F5';
  }
}

function getLabStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'normal':
      return '#E8F5E9';
    case 'abnormal':
      return '#FFF3E0';
    case 'critical':
      return '#FFEBEE';
    default:
      return '#F5F5F5';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileSection: {
    marginBottom: 24,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  profileValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    textAlign: 'center',
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  recordDetail: {
    fontSize: 14,
    color: '#666',
  },
  recordDate: {
    fontSize: 13,
    color: '#999',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vitalItem: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
