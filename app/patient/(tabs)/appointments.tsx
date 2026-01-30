import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Calendar, Plus, Search } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';

type AppointmentFilter = 'upcoming' | 'pending' | 'completed' | 'cancelled';

interface Appointment {
  id: string;
  specialist_id?: string;
  nurse_id?: string;
  provider_type: string;
  consultation_type: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  mode: string;
  reason?: string;
  status: string;
  provider_name?: string;
  provider_specialty?: string;
  provider_photo?: string;
}

export default function AppointmentsScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] =
    useState<AppointmentFilter>('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, [selectedFilter]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('appointments')
        .select(
          `
          *,
          specialists:specialist_id(full_name, specialty, photo_url),
          nurses:nurse_id(name, title, profile_image_url)
        `,
        )
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      const statusMap = {
        upcoming: ['confirmed'],
        pending: ['pending'],
        completed: ['completed'],
        cancelled: ['cancelled', 'missed'],
      };

      const statuses = statusMap[selectedFilter];
      query = query.in('status', statuses);

      const { data, error } = await query;

      if (error) throw error;

      const formattedAppointments =
        data?.map((apt: any) => ({
          ...apt,
          provider_name:
            apt.provider_type === 'specialist'
              ? apt.specialists?.full_name
              : apt.nurses?.name,
          provider_specialty:
            apt.provider_type === 'specialist'
              ? apt.specialists?.specialty
              : apt.nurses?.title,
          provider_photo:
            apt.provider_type === 'specialist'
              ? apt.specialists?.photo_url
              : apt.nurses?.profile_image_url,
        })) || [];

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filters: { key: AppointmentFilter; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled / Missed' },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const j = day % 10;
    const k = day % 100;
    let suffix = 'th';
    if (j === 1 && k !== 11) suffix = 'st';
    else if (j === 2 && k !== 12) suffix = 'nd';
    else if (j === 3 && k !== 13) suffix = 'rd';
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes}${ampm}`;
  };

  const getSectionTitle = (date: string) => {
    const appointmentDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate.getTime() === today.getTime()) return 'Today';
    if (appointmentDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
    if (appointmentDate < today) return 'Past';

    const thisWeekEnd = new Date(today);
    thisWeekEnd.setDate(thisWeekEnd.getDate() + 7);
    if (appointmentDate <= thisWeekEnd) return 'Later this Week';

    return 'Upcoming';
  };

  const renderAppointmentCard = (appointment: Appointment) => {
    const statusColor =
      {
        pending: '#F59E0B',
        confirmed: '#10B981',
        completed: '#6B7280',
        cancelled: '#EF4444',
        missed: '#EF4444',
      }[appointment.status] || '#6B7280';

    return (
      <TouchableOpacity
        key={appointment.id}
        style={styles.appointmentCard}
        onPress={() => router.push(`/appointments/${appointment.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.providerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {appointment.provider_name?.charAt(0) || 'D'}
              </Text>
            </View>
            <View style={styles.providerDetails}>
              <Text style={styles.providerName}>
                {appointment.provider_name}
              </Text>
              <Text style={styles.providerSpecialty}>
                {appointment.provider_specialty}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}15` },
            ]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {appointment.status.charAt(0).toUpperCase() +
                appointment.status.slice(1)}
            </Text>
          </View>
        </View>

        <Text style={styles.consultationType}>
          {appointment.consultation_type}
        </Text>
        {appointment.reason && (
          <Text style={styles.reason} numberOfLines={1}>
            {appointment.reason}
          </Text>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.footerText}>
              {formatDate(appointment.appointment_date)}
            </Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.footerItem}>
            <Text style={styles.footerText}>
              {formatTime(appointment.appointment_time)} ·{' '}
              {appointment.duration_minutes}mins
            </Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.footerItem}>
            <Text style={styles.footerText}>
              {appointment.mode === 'video'
                ? 'Video / Audio Call'
                : appointment.mode.charAt(0).toUpperCase() +
                  appointment.mode.slice(1)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const groupedAppointments = appointments.reduce(
    (groups, appointment) => {
      const section = getSectionTitle(appointment.appointment_date);
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(appointment);
      return groups;
    },
    {} as Record<string, Appointment[]>,
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Appointments</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/appointments/new')}
          >
            <Plus size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Search size={24} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === filter.key && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Calendar size={80} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>You don't have any</Text>
          <Text style={styles.emptySubtitle}>appointments scheduled</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {Object.entries(groupedAppointments).map(
            ([section, sectionAppointments]) => (
              <View key={section} style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {section} -{' '}
                  {formatDate(sectionAppointments[0].appointment_date)}
                </Text>
                {sectionAppointments.map(renderAppointmentCard)}
              </View>
            ),
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingBottom: 16,
    maxHeight: 60,
  },
  filterChip: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#00D9FF15',
    borderColor: '#00D9FF',
  },
  filterChipText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#00D9FF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0284C7',
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  providerSpecialty: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  consultationType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  reason: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: '#E5E7EB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#9CA3AF',
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
