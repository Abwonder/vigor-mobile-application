import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { ChevronLeft, X, Plus, Search } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

interface SelectedSymptom {
  id: string;
  name: string;
  category?: string;
  isCustom?: boolean;
}

export default function SymptomReviewScreen() {
  const router = useRouter();
  const [selectedSymptoms, setSelectedSymptoms] = useState<SelectedSymptom[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddSymptom, setShowAddSymptom] = useState(false);
  const [customSymptomName, setCustomSymptomName] = useState('');
  const [allSymptoms, setAllSymptoms] = useState<any[]>([]);
  const [filteredSymptoms, setFilteredSymptoms] = useState<any[]>([]);

  useEffect(() => {
    loadSelectedSymptoms();
    loadAllSymptoms();
  }, []);

  useEffect(() => {
    if (customSymptomName.trim()) {
      const filtered = allSymptoms.filter(
        (symptom) =>
          symptom.name
            .toLowerCase()
            .includes(customSymptomName.toLowerCase()) &&
          !selectedSymptoms.some((s) => s.id === symptom.id),
      );
      setFilteredSymptoms(filtered);
    } else {
      setFilteredSymptoms([]);
    }
  }, [customSymptomName, allSymptoms, selectedSymptoms]);

  const loadAllSymptoms = async () => {
    const { data } = await supabase
      .from('symptoms_catalog')
      .select('*')
      .order('name', { ascending: true });

    if (data) {
      setAllSymptoms(data);
    }
  };

  const loadSelectedSymptoms = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      const { data } = await supabase
        .from('user_symptoms')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (data) {
        const symptoms = data.map((item) => ({
          id: item.symptom_id || item.id,
          name: item.symptom_name,
          category: item.category,
          isCustom: item.is_custom || false,
        }));
        setSelectedSymptoms(symptoms);
      }
    } catch (error) {
      console.error('Error loading symptoms:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeSymptom = async (symptomId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_symptoms')
        .delete()
        .eq('user_id', user.id)
        .eq('symptom_id', symptomId);

      setSelectedSymptoms((prev) => prev.filter((s) => s.id !== symptomId));
    } catch (error) {
      console.error('Error removing symptom:', error);
    }
  };

  const addSymptomFromCatalog = async (symptom: any) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_symptoms').insert({
        user_id: user.id,
        symptom_id: symptom.id,
        symptom_name: symptom.name,
        category: symptom.category,
        status: 'active',
        is_custom: false,
      });

      setSelectedSymptoms((prev) => [
        ...prev,
        {
          id: symptom.id,
          name: symptom.name,
          category: symptom.category,
          isCustom: false,
        },
      ]);

      setCustomSymptomName('');
      setShowAddSymptom(false);
    } catch (error) {
      console.error('Error adding symptom:', error);
    }
  };

  const addCustomSymptom = async () => {
    if (!customSymptomName.trim()) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const customId = `custom_${Date.now()}`;

      await supabase.from('user_symptoms').insert({
        user_id: user.id,
        symptom_id: customId,
        symptom_name: customSymptomName.trim(),
        category: 'Custom',
        status: 'active',
        is_custom: true,
      });

      setSelectedSymptoms((prev) => [
        ...prev,
        {
          id: customId,
          name: customSymptomName.trim(),
          category: 'Custom',
          isCustom: true,
        },
      ]);

      setCustomSymptomName('');
      setShowAddSymptom(false);
    } catch (error) {
      console.error('Error adding custom symptom:', error);
    }
  };

  const handleConfirm = async () => {
    if (selectedSymptoms.length === 0) {
      Alert.alert(
        'No Symptoms',
        'Please select at least one symptom to continue.',
      );
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const symptomNames = selectedSymptoms.map((s) => s.name).join(', ');

      const { data: session, error } = await supabase
        .from('triage_sessions')
        .insert({
          user_id: user.id,
          symptom_id: selectedSymptoms[0].id,
          symptom_name: symptomNames,
          all_symptoms: selectedSymptoms.map((s) => s.name),
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/triage-waiting?sessionId=${session.id}`);
    } catch (error) {
      console.error('Error creating session:', error);
      Alert.alert('Error', 'Failed to proceed. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Symptoms</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          Selected Symptoms ({selectedSymptoms.length})
        </Text>
        <Text style={styles.subtitle}>
          Review and manage your symptoms before proceeding
        </Text>

        <View style={styles.symptomsContainer}>
          {selectedSymptoms.map((symptom) => (
            <View key={symptom.id} style={styles.symptomCard}>
              <View style={styles.symptomInfo}>
                <Text style={styles.symptomName}>{symptom.name}</Text>
                {symptom.category && (
                  <Text style={styles.symptomCategory}>{symptom.category}</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => removeSymptom(symptom.id)}
                style={styles.removeButton}
              >
                <X size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}

          {selectedSymptoms.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No symptoms selected yet
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Add symptoms using the button below
              </Text>
            </View>
          )}
        </View>

        {showAddSymptom && (
          <View style={styles.addSymptomSection}>
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Search size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search or type symptom name"
                  placeholderTextColor="#9CA3AF"
                  value={customSymptomName}
                  onChangeText={setCustomSymptomName}
                  autoFocus={true}
                />
              </View>
            </View>

            {filteredSymptoms.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {filteredSymptoms.slice(0, 5).map((symptom) => (
                  <TouchableOpacity
                    key={symptom.id}
                    style={styles.suggestionItem}
                    onPress={() => addSymptomFromCatalog(symptom)}
                  >
                    <Text style={styles.suggestionText}>{symptom.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {customSymptomName.trim() && filteredSymptoms.length === 0 && (
              <TouchableOpacity
                style={styles.addCustomButton}
                onPress={addCustomSymptom}
              >
                <Plus size={20} color="#0EA5E9" />
                <Text style={styles.addCustomText}>
                  Add "{customSymptomName}"
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {!showAddSymptom && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddSymptom(true)}
          >
            <Plus size={20} color="#0EA5E9" />
            <Text style={styles.addButtonText}>Add More Symptoms</Text>
          </TouchableOpacity>
        )}

        {showAddSymptom && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setShowAddSymptom(false);
              setCustomSymptomName('');
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.push('/find-care')}
        >
          <Text style={styles.browseButtonText}>Browse by Category</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (submitting || selectedSymptoms.length === 0) &&
              styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={submitting || selectedSymptoms.length === 0}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmButtonText}>
              Continue to Assessment ({selectedSymptoms.length})
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 24,
    marginHorizontal: 20,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 8,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  symptomsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  symptomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  symptomInfo: {
    flex: 1,
  },
  symptomName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  symptomCategory: {
    fontSize: 14,
    color: '#6B7280',
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  addSymptomSection: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    padding: 0,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionText: {
    fontSize: 15,
    color: '#111827',
  },
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0EA5E9',
    borderStyle: 'dashed',
  },
  addCustomText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0EA5E9',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0EA5E9',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  cancelButton: {
    marginTop: 12,
    marginHorizontal: 20,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  browseButton: {
    marginTop: 12,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  browseButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  confirmButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
