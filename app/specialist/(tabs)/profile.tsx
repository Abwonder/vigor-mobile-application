import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {
  User,
  Wallet,
  CreditCard,
  LifeBuoy,
  Settings,
  Plus,
  ChevronRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ProfileMenuItem } from '../../../components/specialist/ProfileComponents';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Profile</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Info Card */}
        <View style={styles.profileInfoCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1559839734-2b71f153678c?q=80&w=200&h=200&auto=format&fit=crop',
              }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>Sonya Queen</Text>
          <Text style={styles.profileCompletion}>Profile 20% Complete</Text>

          <TouchableOpacity
            style={styles.addExperienceButton}
            onPress={() => router.push('/profile/profile-info')}
          >
            <Plus color="#007AFF" size={20} />
            <Text style={styles.addExperienceText}>Add Experience</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuList}>
          <ProfileMenuItem
            icon={
              <View style={[styles.iconBg, { backgroundColor: '#00E5FF' }]}>
                <User color="#FFFFFF" size={24} />
              </View>
            }
            title="Profile Info"
            subtitle="Update name, DOB, gender, contact, emerge..."
            onPress={() => router.push('/profile/profile-info')}
          />
          <ProfileMenuItem
            icon={
              <View style={[styles.iconBg, { backgroundColor: '#007AFF' }]}>
                <Wallet color="#FFFFFF" size={24} />
              </View>
            }
            title="Earnings & Payouts"
            subtitle="View plan, renewal date, invoices, upgrade/do..."
            onPress={() => {}}
          />
          <ProfileMenuItem
            icon={
              <View style={[styles.iconBg, { backgroundColor: '#00C6FF' }]}>
                <CreditCard color="#FFFFFF" size={24} />
              </View>
            }
            title="Payment Method"
            subtitle="See sponsor info, coverage, link/unlink spons..."
            onPress={() => {}}
          />
          <ProfileMenuItem
            icon={
              <View style={[styles.iconBg, { backgroundColor: '#00FFC6' }]}>
                <LifeBuoy color="#FFFFFF" size={24} />
              </View>
            }
            title="Support"
            subtitle="Access FAQs, contact support, live chat optio..."
            onPress={() => {}}
          />
          <ProfileMenuItem
            icon={
              <View style={[styles.iconBg, { backgroundColor: '#00E5FF' }]}>
                <Settings color="#FFFFFF" size={24} />
              </View>
            }
            title="Settings"
            subtitle="Account security, notifications, language, priv..."
            onPress={() => router.push('/profile/settings')}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8E8E93', // Design shows a subtle gray for "Your Profile"
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileInfoCard: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  profileCompletion: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
  },
  addExperienceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  addExperienceText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  menuList: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  iconBg: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
