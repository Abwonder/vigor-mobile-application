import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Plus, Calendar as CalendarIcon } from 'lucide-react-native';
import {
  DaySelector,
  AppointmentCard,
} from '../../../components/specialist/ScheduleComponents';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const tabs = ['Confirmed', 'Pending', 'Missed', 'Cancelled'];

export default function ScheduleScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Confirmed');
  const [selectedDate, setSelectedDate] = useState('03');

  const days = [
    { day: 'Sun', date: '31' },
    { day: 'Mon', date: '01' },
    { day: 'Tue', date: '02' },
    { day: 'Wed', date: '03', active: true },
    { day: 'Thu', date: '04' },
    { day: 'Fri', date: '05' },
    { day: 'Sat', date: '06' },
  ];

  const appointments = [
    {
      patient: {
        name: 'Dr. Cythia Ofori',
        role: 'Patient',
        avatar:
          'https://images.unsplash.com/photo-1559839734-2b71f153678c?q=80&w=200&h=200&auto=format&fit=crop',
      },
      type: 'General Consultation',
      description: 'Persistent headaches, dizziness',
      time: 'Wed, Sept 17 | 10:30 – 11:00 AM',
      callType: 'Video / Audio Call',
      status: 'Confirmed' as const,
    },
    {
      patient: {
        name: 'Dr. Cythia Ofori',
        role: 'Patient',
        avatar:
          'https://images.unsplash.com/photo-1559839734-2b71f153678c?q=80&w=200&h=200&auto=format&fit=crop',
      },
      type: 'Follow-up',
      description: 'Persistent headaches, dizziness',
      time: 'Wed, Sept 17 | 10:30 – 11:00 AM',
      callType: 'Video / Audio Call',
      status: 'Confirmed' as const,
    },
    {
      patient: {
        name: 'Dr. Cythia Ofori',
        role: 'Patient',
        avatar:
          'https://images.unsplash.com/photo-1559839734-2b71f153678c?q=80&w=200&h=200&auto=format&fit=crop',
      },
      type: 'Test Review',
      description: 'Persistent headaches, dizziness',
      time: 'Wed, Sept 17 | 10:30 – 11:00 AM',
      callType: 'Video / Audio Call',
      status: 'Confirmed' as const,
    },
    {
      patient: {
        name: 'Dr. Cythia Ofori',
        role: 'Cardiologist',
        avatar:
          'https://images.unsplash.com/photo-1559839734-2b71f153678c?q=80&w=200&h=200&auto=format&fit=crop',
      },
      type: 'Test Review',
      description: 'Persistent headaches, dizziness',
      time: 'Wed, Sept 17 | 10:30 – 11:00 AM',
      callType: 'Video / Audio Call',
      status: 'Confirmed' as const,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>3rd, Sept</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => router.push('/schedule/schedule-consultation')}
            style={styles.headerIcon}
          >
            <Plus color="#1C1C1E" size={28} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <CalendarIcon color="#1C1C1E" size={28} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar / Week Selector */}
        <DaySelector days={days} onSelect={setSelectedDate} />

        {/* Tab Switcher */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Appointment List */}
        <View style={styles.appointmentList}>
          {appointments.map((app, i) => (
            <AppointmentCard key={i} {...app} />
          ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#495057',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  headerIcon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  activeTab: {
    backgroundColor: '#EBF5FF',
    borderColor: '#007AFF',
  },
  tabText: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  appointmentList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
});
