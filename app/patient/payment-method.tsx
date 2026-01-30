import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ChevronRight, X } from 'lucide-react-native';

export default function PaymentMethod() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { planId, planName, billingCycle, amount } = params;

  const displayAmount = parseFloat(amount as string).toLocaleString();

  const handlePaymentMethodSelect = (method: string) => {
    switch (method) {
      case 'card':
        router.push({
          pathname: '/payment',
          params: { planId, billingCycle, amount },
        });
        break;
      case 'bank':
        router.push({
          pathname: '/bank-payment',
          params: { planId, billingCycle, amount },
        });
        break;
      case 'insurance':
        router.push({
          pathname: '/insurance-payment',
          params: { planId, billingCycle, amount },
        });
        break;
      case 'sponsor':
        router.push({
          pathname: '/sponsor-payment',
          params: { planId, billingCycle },
        });
        break;
    }
  };

  const PaymentMethodIcon = () => (
    <View style={styles.methodIcon}>
      <View style={styles.iconPerson1}>
        <View style={styles.iconHead} />
        <View style={styles.iconBody} />
      </View>
      <View style={styles.iconConnection}>
        <View style={styles.iconDot} />
        <View style={styles.iconDot} />
        <View style={styles.iconDot} />
      </View>
      <View style={styles.iconPerson2}>
        <View style={styles.iconHead} />
        <View style={styles.iconBody} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Choose payment method</Text>
          <Text style={styles.headerSubtitle}>Choose how you'd like to pay for your care.</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color="#999" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.planInfo}>
          <View style={styles.checkmark}>
            <View style={styles.checkmarkInner} />
          </View>
          <Text style={styles.planName}>{planName}</Text>
          <Text style={styles.planAmount}>₦{displayAmount}/mth</Text>
        </View>

        <View style={styles.methodsList}>
          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => handlePaymentMethodSelect('card')}
          >
            <PaymentMethodIcon />
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Pay with Card</Text>
              <Text style={styles.methodDescription}>
                Secure payment with Visa, MasterCard, or Verve.
              </Text>
            </View>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => handlePaymentMethodSelect('bank')}
          >
            <PaymentMethodIcon />
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Bank Transfer / USSD</Text>
              <Text style={styles.methodDescription}>
                Send money directly from your bank or mobile app.
              </Text>
            </View>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => handlePaymentMethodSelect('insurance')}
          >
            <PaymentMethodIcon />
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Insurance / HMO</Text>
              <Text style={styles.methodDescription}>
                Use your insurance plan to cover part or all of the cost.
              </Text>
            </View>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.sponsorButton}
          onPress={() => handlePaymentMethodSelect('sponsor')}
        >
          <Text style={styles.sponsorButtonText}>Use sponsor payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    padding: 8,
    marginTop: 4,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  closeButton: {
    padding: 8,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmarkInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFF',
  },
  planName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  planAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  methodsList: {
    gap: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#00C6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    flexDirection: 'row',
  },
  iconPerson1: {
    alignItems: 'center',
    marginRight: 4,
  },
  iconPerson2: {
    alignItems: 'center',
    marginLeft: 4,
  },
  iconHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
    marginBottom: 2,
  },
  iconBody: {
    width: 10,
    height: 12,
    backgroundColor: '#FFF',
    borderRadius: 2,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  iconConnection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  iconDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFF',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  sponsorButton: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  sponsorButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
