import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import {
  User,
  FileText,
  CreditCard,
  Heart,
  Activity,
  HelpCircle,
  Settings,
  ChevronRight,
  Plus,
} from 'lucide-react-native';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_photo_url?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name, email, profile_photo_url')
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          setProfile(data);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!profile) return '';
    const firstInitial = profile.first_name?.[0] || '';
    const lastInitial = profile.last_name?.[0] || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const getFullName = () => {
    if (!profile) return '';
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  };

  const getProfileCompletion = () => {
    if (!profile) return 0;
    let completed = 0;
    const fields = 5;
    if (profile.first_name) completed++;
    if (profile.last_name) completed++;
    if (profile.email) completed++;
    if (profile.profile_photo_url) completed++;
    completed++;
    return Math.round((completed / fields) * 100);
  };

  const menuItems = [
    {
      icon: User,
      title: 'Profile Info',
      subtitle: 'Update name, DOB, gender, contact, emerge...',
      route: '/profile/profile-info',
      color: '#0EA5E9',
    },
    {
      icon: FileText,
      title: 'Subscription',
      subtitle: 'View plan, renewal date, invoices, upgrade/do...',
      route: '/subscription',
      color: '#0EA5E9',
    },
    {
      icon: Heart,
      title: 'Sponsor',
      subtitle: 'See sponsor info, coverage, link/unlink spons...',
      route: '/sponsors',
      color: '#0EA5E9',
    },
    {
      icon: Activity,
      title: 'Health Devices (Coming Soon)',
      subtitle: 'Connect wearables and medical devices...',
      route: null,
      color: '#0EA5E9',
    },
    {
      icon: HelpCircle,
      title: 'Support',
      subtitle: 'Access FAQs, contact support, live chat optio...',
      route: '/support',
      color: '#0EA5E9',
    },
    {
      icon: Settings,
      title: 'Settings',
      subtitle: '',
      route: '/settings',
      color: '#0EA5E9',
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Profile</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {profile?.profile_photo_url ? (
            <Image
              source={{ uri: profile.profile_photo_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getInitials()}</Text>
            </View>
          )}
        </View>

        <Text style={styles.userName}>{getFullName()}</Text>
        <Text style={styles.profileCompletion}>
          Profile {getProfileCompletion()}% Complete
        </Text>

        <TouchableOpacity style={styles.emergencyButton}>
          <Plus size={20} color="#0EA5E9" strokeWidth={2.5} />
          <Text style={styles.emergencyButtonText}>Add Emergency Contact</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => item.route && router.push(item.route as any)}
            disabled={!item.route}
          >
            <View style={styles.menuIconContainer}>
              <item.icon size={24} color={item.color} strokeWidth={2} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              {item.subtitle ? (
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              ) : null}
            </View>
            <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: '#F3F4F6',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarInitials: {
    fontSize: 40,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  profileCompletion: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 20,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#E0F2FE',
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  menuContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
  },
});
