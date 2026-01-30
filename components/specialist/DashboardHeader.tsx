import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

interface DashboardHeaderProps {
  userName: string;
  userAvatar?: any;
  onNotificationPress?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  userAvatar,
  onNotificationPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Image
          source={userAvatar || require('../../assets/vigor-logo.jpeg')} // Fallback to logo or a default avatar
          style={styles.avatar}
        />
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>Hi, {userName}</Text>
          <Text style={styles.question}>How do you feel today?</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={onNotificationPress}
      >
        <Bell color="#8E8E93" size={24} fill="#F2F2F7" />
        <View style={styles.badgePlaceholder} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
  },
  textContainer: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 14,
    color: '#8E8E93',
  },
  question: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 2,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgePlaceholder: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});

export default DashboardHeader;
