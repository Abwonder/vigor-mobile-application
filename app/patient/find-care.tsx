import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  Search,
  ChevronLeft,
  Thermometer,
  Pill,
  Activity,
  Wind,
  Brain,
  User,
  Users,
  Baby,
  Shield,
  Heart,
  ShoppingCart,
  Plus,
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import {
  StartTriageModal,
  AssigningModal,
  ConditionPreviewModal,
} from '../components/TriageModals';

const CONDITION_CATEGORIES = [
  {
    id: 'general',
    title: 'General Symptoms',
    description: 'Fever, tiredness,\nheadache, body\npain',
    icon: Thermometer,
    color: '#007AFF',
  },
  {
    id: 'respiratory',
    title: 'Respiratory & Chest',
    description: 'Cough,\nbreathing\ntrouble, chest...',
    icon: Wind,
    color: '#00D4D4',
  },
  {
    id: 'stomach',
    title: 'Stomach & Digestion',
    description: 'Stomach pain,\ndiarrhea,\nconstipation, na...',
    icon: Activity,
    color: '#FF9500',
  },
  {
    id: 'skin',
    title: 'Skin & Allergies',
    description: 'Rash, acne,\neczema, itching,\nswelling',
    icon: Pill,
    color: '#FF2D55',
  },
  {
    id: 'mental',
    title: 'Mental & Emotional Health',
    description: 'Anxiety, low\nmood, stress,\npoor sleep',
    icon: Brain,
    color: '#00C7BE',
  },
  {
    id: 'womens',
    title: "Women's Health",
    description: 'Period pain,\npregnancy,\nmenopause, infe...',
    icon: User,
    color: '#5856D6',
  },
  {
    id: 'mens',
    title: "Men's Health",
    description: 'Performance\nissues, prostate,\nurine problems,...',
    icon: Users,
    color: '#007AFF',
  },
  {
    id: 'childrens',
    title: "Children's Health",
    description: 'Fever, cough,\nsore throat,\nrashes, growth i...',
    icon: Baby,
    color: '#00D4D4',
  },
  {
    id: 'std',
    title: 'STD/STI',
    description: 'HIV, syphilis,\ngonorrhea,\nchlamydia, herp...',
    icon: Shield,
    color: '#00C7BE',
  },
  {
    id: 'condition',
    title: 'Condition Management',
    description: 'Diabetes,\nhypertension,\nsickle cell, canc...',
    icon: Heart,
    color: '#00C7BE',
  },
];

export default function FindCareScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [filteredSymptoms, setFilteredSymptoms] = useState<any[]>([]);
  const [selectedSymptom, setSelectedSymptom] = useState<any>(null);
  const [showStartTriageModal, setShowStartTriageModal] = useState(false);
  const [showAssigningModal, setShowAssigningModal] = useState(false);
  const [showConditionPreviewModal, setShowConditionPreviewModal] =
    useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [userName, setUserName] = useState('User');
  const [nurseName, setNurseName] = useState('Sophia');
  const [commonConditions, setCommonConditions] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    loadSymptoms();
    loadUserSubscription();
    loadUserAndNurseData();
    loadCommonConditions();
    loadCartCount();
  }, []);

  const loadCartCount = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('user_symptoms')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      setCartCount(count || 0);
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = symptoms.filter((symptom) =>
        symptom.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredSymptoms(filtered);

      if (filtered.length > 0) {
        trackSymptomInteraction(searchQuery, 'search');
      }
    } else {
      setFilteredSymptoms([]);
    }
  }, [searchQuery, symptoms]);

  const loadSymptoms = async () => {
    const { data } = await supabase
      .from('symptoms_catalog')
      .select('*')
      .order('name', { ascending: true });

    if (data) {
      setSymptoms(data);
    }
  };

  const loadUserSubscription = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    setUserSubscription(data);
  };

  const loadUserAndNurseData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('first_name')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.first_name) {
      setUserName(profile.first_name);
    }

    const { data: activeNurse } = await supabase
      .from('nurses')
      .select('name')
      .eq('is_active', true)
      .maybeSingle();

    if (activeNurse?.name) {
      setNurseName(activeNurse.name);
    }
  };

  const loadCommonConditions = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: userConditions } = await supabase.rpc(
          'get_user_common_conditions',
          {
            p_user_id: user.id,
            p_limit: 6,
          },
        );

        if (userConditions && userConditions.length > 0) {
          setCommonConditions(userConditions.map((c: any) => c.symptom_name));
          return;
        }
      }

      const { data: globalConditions } = await supabase.rpc(
        'get_global_common_conditions',
        { p_limit: 6 },
      );

      if (globalConditions) {
        setCommonConditions(globalConditions.map((c: any) => c.symptom_name));
      }
    } catch (error) {
      console.error('Error loading common conditions:', error);
      setCommonConditions([
        'Fever',
        'Headache',
        'Cough',
        'Stomach pain / cramps',
        'Body aches',
        'Common cold / flu',
      ]);
    }
  };

  const trackSymptomInteraction = async (
    symptomName: string,
    interactionType: 'search' | 'triage_start' | 'view',
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_symptom_interactions').insert({
        user_id: user.id,
        symptom_name: symptomName,
        interaction_type: interactionType,
      });

      if (interactionType === 'triage_start') {
        loadCommonConditions();
      }
    } catch (error) {
      console.error('Error tracking symptom interaction:', error);
    }
  };

  const addSymptomToCart = async (symptom: any) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('user_symptoms').insert({
        user_id: user.id,
        symptom_id: symptom.id,
        symptom_name: symptom.name,
        category: symptom.category || 'General',
        status: 'active',
        is_custom: false,
      });

      if (!error) {
        await loadCartCount();
        trackSymptomInteraction(symptom.name, 'view');
      }
    } catch (error) {
      console.error('Error adding symptom to cart:', error);
    }
  };

  const addCustomSymptomToCart = async (symptomName: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const customId = `custom_${Date.now()}`;

      const { error } = await supabase.from('user_symptoms').insert({
        user_id: user.id,
        symptom_id: customId,
        symptom_name: symptomName.trim(),
        category: 'Custom',
        status: 'active',
        is_custom: true,
      });

      if (!error) {
        await loadCartCount();
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Error adding custom symptom:', error);
    }
  };

  const handleSymptomSelect = (symptom: any) => {
    addSymptomToCart(symptom);
  };

  const handleCommonConditionPress = async (conditionName: string) => {
    const symptom = symptoms.find((s) => s.name === conditionName);

    if (symptom) {
      await addSymptomToCart(symptom);
    } else {
      const { data } = await supabase
        .from('symptoms_catalog')
        .select('*')
        .eq('name', conditionName)
        .maybeSingle();

      if (data) {
        await addSymptomToCart(data);
      }
    }
  };

  const handleStartTriageContinue = () => {
    setShowStartTriageModal(false);
    setShowAssigningModal(true);

    setTimeout(() => {
      setShowAssigningModal(false);
      setShowConditionPreviewModal(true);
    }, 2000);
  };

  const handleStartTriage = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      trackSymptomInteraction(selectedSymptom.name, 'triage_start');

      const { data: session, error } = await supabase
        .from('triage_sessions')
        .insert({
          user_id: user.id,
          symptom_id: selectedSymptom.id,
          symptom_name: selectedSymptom.name,
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSessionId(session.id);
      setShowConditionPreviewModal(false);
      router.push(`/triage-question?sessionId=${session.id}`);
    } catch (error) {
      console.error('Error starting triage:', error);
    }
  };

  const handleChangeCondition = () => {
    setShowConditionPreviewModal(false);
    setSelectedSymptom(null);
  };

  const handleCloseStartTriageModal = () => {
    setShowStartTriageModal(false);
    setSelectedSymptom(null);
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
        <Text style={styles.headerTitle}>Find Care</Text>
        <TouchableOpacity
          onPress={() => router.push('/symptom-review')}
          style={styles.cartButton}
        >
          <ShoppingCart size={24} color="#111827" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View
          style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}
        >
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="What's your symptom? (e.g., fever, chest pain)"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={false}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredSymptoms.length > 0 ? (
          <View style={styles.resultsContainer}>
            {filteredSymptoms.slice(0, 5).map((symptom) => (
              <TouchableOpacity
                key={symptom.id}
                style={styles.resultItem}
                onPress={() => handleSymptomSelect(symptom)}
              >
                <Search size={20} color="#6B7280" />
                <Text style={styles.resultText}>{symptom.name}</Text>
                <Plus size={20} color="#0EA5E9" />
              </TouchableOpacity>
            ))}
          </View>
        ) : searchQuery.length > 0 ? (
          <View style={styles.resultsContainer}>
            <TouchableOpacity
              style={styles.addCustomButton}
              onPress={() => addCustomSymptomToCart(searchQuery)}
            >
              <Plus size={20} color="#0EA5E9" />
              <Text style={styles.addCustomText}>Add "{searchQuery}"</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Common conditions</Text>
              <View style={styles.chipsContainer}>
                {commonConditions.map((condition, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.chip}
                    onPress={() => handleCommonConditionPress(condition)}
                  >
                    <Text style={styles.chipText}>{condition}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Condition by Categories</Text>
              <View style={styles.categoriesGrid}>
                {CONDITION_CATEGORIES.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <TouchableOpacity
                      key={category.id}
                      style={styles.categoryCard}
                      onPress={() =>
                        router.push(
                          `/symptom-category/${encodeURIComponent(category.title)}`,
                        )
                      }
                    >
                      <Text style={styles.categoryTitle}>{category.title}</Text>
                      <Text style={styles.categoryDescription}>
                        {category.description}
                      </Text>
                      <View
                        style={[
                          styles.categoryIcon,
                          { backgroundColor: `${category.color}20` },
                        ]}
                      >
                        <IconComponent size={32} color={category.color} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {cartCount > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => router.push('/symptom-review')}
          >
            <ShoppingCart size={20} color="#FFFFFF" />
            <Text style={styles.reviewButtonText}>
              Review Selection ({cartCount})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <StartTriageModal
        visible={showStartTriageModal}
        onClose={handleCloseStartTriageModal}
        onContinue={handleStartTriageContinue}
      />

      <AssigningModal visible={showAssigningModal} />

      {selectedSymptom && (
        <ConditionPreviewModal
          visible={showConditionPreviewModal}
          onClose={() => setShowConditionPreviewModal(false)}
          onStartTriage={handleStartTriage}
          onChangeCondition={handleChangeCondition}
          symptomName={selectedSymptom.name}
          coveragePlan={
            userSubscription?.subscription_plans?.name || 'Ultra Care'
          }
          userName={userName}
          nurseName={nurseName}
        />
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
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchBarFocused: {
    borderColor: '#0EA5E9',
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
    outlineStyle: 'none',
  },
  clearButton: {
    fontSize: 18,
    color: '#9CA3AF',
    paddingHorizontal: 4,
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  resultsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#0EA5E9',
    borderStyle: 'dashed',
    borderRadius: 12,
    margin: 16,
  },
  addCustomText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0EA5E9',
  },
  noResults: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    minHeight: 170,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  categoryIcon: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
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
