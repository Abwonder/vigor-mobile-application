import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from 'react-native';
import {
  X,
  ChevronRight,
  Landmark,
  CreditCard,
  Wallet,
} from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

interface PaymentMethodOverlayProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (method: string) => void;
  onSkip: () => void;
}

const { height } = Dimensions.get('window');

const PaymentMethodOverlay: React.FC<PaymentMethodOverlayProps> = ({
  visible,
  onClose,
  onSelect,
  onSkip,
}) => {
  const paymentMethods = [
    {
      id: 'bank',
      title: 'Bank Transfer / USSD',
      description: 'Send money directly to your bank or mobile app.',
      icon: <Landmark color="#0099FF" size={32} />,
    },
    {
      id: 'paypal',
      title: 'PayPal',
      description: 'Secure payment with Visa, MasterCard, or Verve.',
      icon: <Wallet color="#625aff" size={32} />, // Using Wallet as a fallback for stylized icon
    },
    {
      id: 'stripe',
      title: 'Stripe / Debit Card',
      description: 'Use your insurance plan to cover part or all of the cost.',
      icon: <CreditCard color="#0099FF" size={32} />,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Set up your payment method</Text>
              <Text style={styles.subtitle}>
                choose how you'd like to receive your earnings.
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color="#C7C7CC" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.methodList}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.methodItem}
                onPress={() => onSelect(method.id)}
              >
                <View style={styles.iconContainer}>{method.icon}</View>
                <View style={styles.methodDetails}>
                  <Text style={styles.methodTitle}>{method.title}</Text>
                  <Text style={styles.methodDescription}>
                    {method.description}
                  </Text>
                </View>
                <ChevronRight color="#C7C7CC" size={20} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.setupLaterButton} onPress={onSkip}>
            <Text style={styles.setupLaterText}>Set up later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: '#F9F9F9',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: height * 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: 24, // To balance the X button
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  methodList: {
    gap: 12,
    marginBottom: 32,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodDetails: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
  setupLaterButton: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#0099FF33',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  setupLaterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0099FF',
  },
});

export default PaymentMethodOverlay;
