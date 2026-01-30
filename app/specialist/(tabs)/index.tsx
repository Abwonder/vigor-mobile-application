import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import {
  Video,
  Calendar as CalendarIcon,
  ChevronRight,
} from 'lucide-react-native';
import { Colors } from '../../../constants/Colors';
import DashboardHeader from '../../../components/specialist/DashboardHeader';
import QuickActions from '../../../components/specialist/QuickActions';
import PaymentMethodOverlay from '../../../components/specialist/PaymentMethodOverlay';

export default function Dashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [paymentOverlayVisible, setPaymentOverlayVisible] = useState(false);

  useEffect(() => {
    // Show payment overlay on first load (simulated)
    const timer = setTimeout(() => {
      setPaymentOverlayVisible(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleOnline = () => setIsOnline(!isOnline);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <DashboardHeader userName="Dr. Amilia" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Banner */}
        <View style={isOnline ? styles.onlineBanner : styles.offlineBanner}>
          <View style={styles.bannerTextContainer}>
            {isOnline ? (
              <>
                <Text style={styles.bannerStatusText}>
                  Been online - 01hr : 10min
                </Text>
                <Text style={styles.bannerMainText}>
                  Next consult in 30 mins
                </Text>
              </>
            ) : (
              <Text style={styles.offlineText}>
                Tap Go Online to start receiving patient requests.
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={isOnline ? styles.goOfflineButton : styles.goOnlineButton}
            onPress={toggleOnline}
          >
            <Text style={isOnline ? styles.goOfflineText : styles.goOnlineText}>
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Text>
          </TouchableOpacity>
        </View>

        <QuickActions />

        {/* Sections */}
        <Section title="Upcoming appointment">
          <AppointmentCard
            name="Sonya Queen"
            type="Follow-up"
            description="Persistent headaches, and fever."
            date="17th sept"
            time="10:30am · 25mins"
            hasConsultation={false} // Simulated empty state if false
          />
        </Section>

        <Section title="Current Patients">
          <PatientCard
            name="Sonya Queen"
            condition="Hypertension"
            isEmpty={!isOnline} // Simulated empty state
          />
        </Section>

        <Section title="Long-term Care">
          <PatientCard
            name="Sonya Queen"
            condition="Hypertension"
            isEmpty={true} // Always empty for now
          />
        </Section>
      </ScrollView>

      <PaymentMethodOverlay
        visible={paymentOverlayVisible}
        onClose={() => setPaymentOverlayVisible(false)}
        onSelect={(method) => {
          console.log('Selected:', method);
          setPaymentOverlayVisible(false);
        }}
        onSkip={() => setPaymentOverlayVisible(false)}
      />
    </SafeAreaView>
  );
}

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const AppointmentCard = ({
  name,
  type,
  description,
  date,
  time,
  hasConsultation = true,
}: any) => {
  if (!hasConsultation) {
    return (
      <View style={styles.emptyCard}>
        <CalendarIcon color="#C7C7CC" size={48} />
        <Text style={styles.emptyText}>
          You don't have any consultations scheduled.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/100?u=sonya' }}
          style={styles.patientThumb}
        />
        <Text style={styles.patientName}>{name}</Text>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Confirmed</Text>
        </View>
      </View>
      <Text style={styles.appointmentType}>{type}</Text>
      <Text style={styles.appointmentDesc}>{description}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <CalendarIcon size={14} color="#8E8E93" />
          <Text style={styles.footerText}>{date}</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerText}>| {time}</Text>
        </View>
        <View style={[styles.footerItem, { marginLeft: 'auto' }]}>
          <Video size={14} color="#8E8E93" />
          <Text style={styles.footerText}>Video / Audio Call</Text>
        </View>
      </View>
    </View>
  );
};

const PatientCard = ({ name, condition, isEmpty }: any) => {
  if (isEmpty) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconPlaceholder} />
        <Text style={styles.emptyText}>
          You're not treating any patients right now.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.patientRow}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/100?u=sonya' }}
          style={styles.patientThumb}
        />
        <View style={styles.patientInfo}>
          <Text style={styles.patientNameLarge}>{name}</Text>
          <Text style={styles.conditionText}>{condition}</Text>
        </View>
        <ChevronRight color="#C7C7CC" size={20} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  onlineBanner: {
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundGradient: 'linear-gradient(90deg, #00D09E 0%, #0099FF 100%)', // Simulated gradient
    backgroundColor: Colors.light.primary,
  },
  offlineBanner: {
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerStatusText: {
    color: '#FFFFFFCC',
    fontSize: 12,
  },
  bannerMainText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  offlineText: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 20,
    width: '70%',
  },
  goOnlineButton: {
    backgroundColor: '#00D09E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  goOnlineText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  goOfflineButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  goOfflineText: {
    color: '#1C1C1E',
    fontWeight: '700',
    fontSize: 14,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientThumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  patientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
  },
  appointmentType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  appointmentDesc: {
    fontSize: 14,
    color: '#48484A',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
    gap: 8,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  patientNameLarge: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  conditionText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 12,
    maxWidth: '80%',
  },
  emptyIconPlaceholder: {
    width: 48,
    height: 24,
    backgroundColor: '#C7C7CC',
    borderRadius: 4,
    opacity: 0.5,
  },
});
