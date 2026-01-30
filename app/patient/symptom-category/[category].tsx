import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ShoppingCart } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../../lib/supabase';

interface Symptom {
  id: string;
  name: string;
  category: string;
  description: string;
}

export default function SymptomCategoryScreen() {
  const router = useRouter();
  const { category: rawCategory } = useLocalSearchParams();
  const category =
    typeof rawCategory === 'string' ? decodeURIComponent(rawCategory) : '';
  const [searchQuery, setSearchQuery] = useState('');
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [filteredSymptoms, setFilteredSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (category) {
      loadSymptoms();
      loadUserSymptoms();
    }
  }, [category]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = symptoms.filter((symptom) =>
        symptom.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredSymptoms(filtered);
    } else {
      setFilteredSymptoms(symptoms);
    }
  }, [searchQuery, symptoms]);

  useFocusEffect(
    useCallback(() => {
      loadUserSymptoms();
    }, []),
  );

  const loadSymptoms = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('symptoms_catalog')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });

    if (data) {
      setSymptoms(data);
      setFilteredSymptoms(data);
    }
    setLoading(false);
  };

  const loadUserSymptoms = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_symptoms')
      .select('symptom_id')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (data) {
      setSelectedSymptoms(new Set(data.map((s) => s.symptom_id)));
    }
  };

  const toggleSymptom = async (symptom: Symptom) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const isSelected = selectedSymptoms.has(symptom.id);

    if (isSelected) {
      await supabase
        .from('user_symptoms')
        .delete()
        .eq('user_id', user.id)
        .eq('symptom_id', symptom.id);

      const newSelected = new Set(selectedSymptoms);
      newSelected.delete(symptom.id);
      setSelectedSymptoms(newSelected);
    } else {
      await supabase.from('user_symptoms').insert({
        user_id: user.id,
        symptom_id: symptom.id,
        symptom_name: symptom.name,
        category: symptom.category,
        status: 'active',
      });

      setSelectedSymptoms(new Set([...selectedSymptoms, symptom.id]));
    }
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
        <Text style={styles.headerTitle}>{category}</Text>
        <TouchableOpacity
          onPress={() => router.push('/symptom-review')}
          style={styles.cartButton}
        >
          <ShoppingCart size={24} color="#111827" />
          {selectedSymptoms.size > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{selectedSymptoms.size}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="What's your symptom? (e.g., fever, chest pain)"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filteredSymptoms.map((symptom) => {
            const isSelected = selectedSymptoms.has(symptom.id);

            return (
              <TouchableOpacity
                key={symptom.id}
                style={styles.symptomItem}
                onPress={() => toggleSymptom(symptom)}
              >
                <View style={styles.symptomLeft}>
                  <View
                    style={[
                      styles.radioButton,
                      isSelected && styles.radioButtonSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text
                    style={[
                      styles.symptomName,
                      isSelected && styles.symptomNameSelected,
                    ]}
                  >
                    {symptom.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
          {filteredSymptoms.length === 0 && (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No symptoms found</Text>
            </View>
          )}
        </ScrollView>
      )}

      {selectedSymptoms.size > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => router.push('/symptom-review')}
          >
            <ShoppingCart size={20} color="#FFFFFF" />
            <Text style={styles.reviewButtonText}>
              Review Selection ({selectedSymptoms.size})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: '#6B7280',
  },
  cartButton: {
    position: 'relative',
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },
  clearButton: {
    fontSize: 18,
    color: '#9CA3AF',
    paddingHorizontal: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 16,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  symptomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioButtonSelected: {
    borderColor: '#10B981',
    backgroundColor: '#FFFFFF',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  symptomName: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '400',
  },
  symptomNameSelected: {
    color: '#10B981',
    fontWeight: '500',
  },
  noResults: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#6B7280',
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  reviewButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 50,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  reviewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
