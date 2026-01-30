import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';

export type ConsultStatus = 'Active' | 'Pending' | 'Paused' | 'Closed';

interface ConsultItemProps {
  id: string;
  name: string;
  condition: string;
  lastMessage: string;
  time: string;
  status: string;
  avatar: string;
  onPress: () => void;
}

const ConsultItem: React.FC<ConsultItemProps> = ({
  name,
  condition,
  lastMessage,
  time,
  status,
  avatar,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>
            {name} <Text style={styles.condition}>({condition})</Text>
          </Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {lastMessage}
        </Text>
        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{status}</Text>
          {status.includes('Long term') && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>Long term</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  condition: {
    color: '#8E8E93',
    fontWeight: '400',
  },
  time: {
    fontSize: 12,
    color: '#8E8E93',
  },
  lastMessage: {
    fontSize: 14,
    color: '#3A3A3C',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00D09E',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  tag: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});

export default ConsultItem;
