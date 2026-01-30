import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthly_price: string;
  yearly_price: string;
  features: string[];
  max_users: number | null;
  is_popular: boolean;
}

export default function SubscriptionPlansScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (data) {
        setPlans(data);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    if (numPrice === 0) return 'Free(Trial)';
    return `₦${numPrice.toLocaleString('en-NG', { maximumFractionDigits: 0 })}/mth`;
  };

  const togglePlanExpansion = (planId: string) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
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
          <ChevronLeft size={24} color="#111827" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {plans.map((plan) => (
          <View key={plan.id} style={styles.planCard}>
            <TouchableOpacity
              style={styles.planHeader}
              onPress={() => togglePlanExpansion(plan.id)}
              activeOpacity={0.7}
            >
              <View style={styles.radioButton}>
                {selectedPlanId === plan.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>

              <View style={styles.planInfo}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planDescription}>{plan.description}</Text>
              </View>

              <View style={styles.planPriceContainer}>
                <Text style={styles.planPrice}>
                  {formatPrice(plan.monthly_price)}
                </Text>
                <ChevronDown
                  size={20}
                  color="#9CA3AF"
                  strokeWidth={2}
                  style={{
                    transform: [
                      {
                        rotate: expandedPlanId === plan.id ? '180deg' : '0deg',
                      },
                    ],
                  }}
                />
              </View>
            </TouchableOpacity>

            {expandedPlanId === plan.id && (
              <View style={styles.planDetails}>
                <Text style={styles.featuresTitle}>Features:</Text>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureBullet} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}

                {plan.max_users && (
                  <Text style={styles.maxUsersText}>
                    Up to {plan.max_users} users
                  </Text>
                )}
                {plan.max_users === null && (
                  <Text style={styles.maxUsersText}>Unlimited users</Text>
                )}

                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setSelectedPlanId(plan.id)}
                >
                  <Text style={styles.selectButtonText}>Select Plan</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 100,
    gap: 16,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0EA5E9',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 20,
  },
  planPriceContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  planDetails: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0EA5E9',
    marginTop: 6,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#374151',
    lineHeight: 20,
  },
  maxUsersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 16,
  },
  selectButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
