import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Phone, Video, Calendar, ArrowRight } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

interface CallSummaryCardProps {
  type: 'missed' | 'completed';
  callMode?: 'audio' | 'video';
  duration?: string;
  time: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar: string;
  nextAvailable?: string;
  onCallAgain: () => void;
  onReschedule: () => void;
}

const CallSummaryCard: React.FC<CallSummaryCardProps> = ({
  type,
  callMode = 'audio',
  duration,
  time,
  doctorName,
  doctorSpecialty,
  doctorAvatar,
  nextAvailable,
  onCallAgain,
  onReschedule,
}) => {
  const isMissed = type === 'missed';
  const isVideo = callMode === 'video';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {isVideo ? (
            <Video color={isMissed ? '#EB5757' : '#1C1C1E'} size={20} />
          ) : (
            <Phone color={isMissed ? '#EB5757' : '#1C1C1E'} size={20} />
          )}
          <Text style={[styles.title, isMissed && styles.missedTitle]}>
            {isMissed ? 'Missed Consultation' : duration}
          </Text>
        </View>
        <Text style={styles.time}>{time}</Text>
      </View>

      <View style={styles.doctorCard}>
        <Image source={{ uri: doctorAvatar }} style={styles.avatar} />
        <View style={styles.doctorInfo}>
          <Text style={styles.name}>{doctorName}</Text>
          <Text style={styles.specialty}>{doctorSpecialty}</Text>
        </View>
      </View>

      {nextAvailable && (
        <Text style={styles.nextAvailable}>
          Next available on {nextAvailable}
        </Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={onCallAgain}>
          <Text style={styles.primaryButtonText}>
            {isMissed ? 'Call again' : 'Consult again'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onReschedule}>
          <Text style={styles.secondaryButtonText}>Reschedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginVertical: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  missedTitle: {
    color: '#EB5757',
  },
  time: {
    fontSize: 12,
    color: '#8E8E93',
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9FB',
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  specialty: {
    fontSize: 13,
    color: '#8E8E93',
  },
  nextAvailable: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: -8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0099FF', // Base color for blue gradient feeling
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0099FF33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0099FF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default CallSummaryCard;
