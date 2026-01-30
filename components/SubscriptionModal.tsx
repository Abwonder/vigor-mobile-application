import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { X, ChevronDown, ChevronUp, Check } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  is_popular: boolean;
  features: string[];
  max_users: number | null;
  display_order: number;
}

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

export default function SubscriptionModal({
  visible,
  onClose,
  userId,
}: SubscriptionModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'monthly',
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (visible) {
      fetchPlans();
    }
  }, [visible]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    const price =
      billingCycle === 'monthly' ? plan.monthly_price : plan.yearly_price;
    if (price === 0) return 'Free(Trial)';
    return `₦${price.toLocaleString()}/mth`;
  };

  const toggleExpanded = (planId: string) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  const handleProceedToPayment = () => {
    if (!selectedPlanId) return;
    const selectedPlan = plans.find((p) => p.id === selectedPlanId);
    router.push({
      pathname: '/patient/payment-method',
      params: {
        planId: selectedPlanId,
        planName: selectedPlan?.name,
        billingCycle,
        amount:
          billingCycle === 'monthly'
            ? selectedPlan?.monthly_price
            : selectedPlan?.yearly_price,
      },
    });
  };

  const handleSponsorPayment = () => {
    if (!selectedPlanId) return;
    router.push({
      pathname: '/patient/sponsor-payment',
      params: {
        planId: selectedPlanId,
        billingCycle,
      },
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Subscription Packages</Text>
              <Text style={styles.subtitle}>
                Flexible options for individuals, families, and sponsors.
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.billingToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                billingCycle === 'monthly' && styles.toggleButtonActive,
              ]}
              onPress={() => setBillingCycle('monthly')}
            >
              <Text
                style={[
                  styles.toggleText,
                  billingCycle === 'monthly' && styles.toggleTextActive,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                billingCycle === 'yearly' && styles.toggleButtonActive,
              ]}
              onPress={() => setBillingCycle('yearly')}
            >
              <Text
                style={[
                  styles.toggleText,
                  billingCycle === 'yearly' && styles.toggleTextActive,
                ]}
              >
                Yearly <Text style={styles.discountText}>20% off</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : (
            <ScrollView
              style={styles.plansContainer}
              showsVerticalScrollIndicator={false}
            >
              {plans.map((plan) => {
                const isExpanded = expandedPlanId === plan.id;
                const isSelected = selectedPlanId === plan.id;

                return (
                  <View key={plan.id} style={styles.planWrapper}>
                    <Pressable
                      style={[
                        styles.planCard,
                        isSelected && styles.planCardSelected,
                        plan.is_popular && styles.planCardPopular,
                      ]}
                      onPress={() => setSelectedPlanId(plan.id)}
                    >
                      <View style={styles.planHeader}>
                        <View style={styles.radioButton}>
                          {isSelected && (
                            <View style={styles.radioButtonInner} />
                          )}
                        </View>
                        <View style={styles.planInfo}>
                          <Text style={styles.planName}>{plan.name}</Text>
                          <Text style={styles.planDescription}>
                            {plan.description}
                          </Text>
                        </View>
                        <View style={styles.planPriceContainer}>
                          <Text style={styles.planPrice}>{getPrice(plan)}</Text>
                          {plan.features.length > 0 && (
                            <TouchableOpacity
                              onPress={() => toggleExpanded(plan.id)}
                              style={styles.expandButton}
                            >
                              {isExpanded ? (
                                <ChevronUp size={20} color="#666" />
                              ) : (
                                <ChevronDown size={20} color="#666" />
                              )}
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>

                      {isExpanded && plan.features.length > 0 && (
                        <View style={styles.featuresContainer}>
                          {plan.features.map((feature, index) => (
                            <View key={index} style={styles.featureRow}>
                              <Check size={16} color="#007AFF" />
                              <Text style={styles.featureText}>{feature}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                !selectedPlanId && styles.buttonDisabled,
              ]}
              onPress={handleProceedToPayment}
              disabled={!selectedPlanId}
            >
              <Text style={styles.primaryButtonText}>Proceed to payment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                !selectedPlanId && styles.buttonDisabled,
              ]}
              onPress={handleSponsorPayment}
              disabled={!selectedPlanId}
            >
              <Text style={styles.secondaryButtonText}>
                Use sponsor payment
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 4,
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 24,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#FFF',
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#000',
  },
  discountText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plansContainer: {
    paddingHorizontal: 24,
    maxHeight: 400,
  },
  planWrapper: {
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  planCardPopular: {
    borderColor: '#FF9500',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  planInfo: {
    flex: 1,
    marginRight: 12,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  planPriceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  expandButton: {
    padding: 4,
  },
  featuresContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    marginLeft: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 13,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
