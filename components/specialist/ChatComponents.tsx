import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

interface Message {
  id: string;
  text: string;
  sender: 'specialist' | 'patient' | 'system';
  time: string;
}

export const MessageBubble = ({ message }: { message: Message }) => {
  if (message.sender === 'system') {
    return (
      <View style={styles.systemMessageContainer}>
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{message.text}</Text>
        </View>
      </View>
    );
  }

  const isSpecialist = message.sender === 'specialist';

  return (
    <View
      style={[
        styles.bubbleContainer,
        isSpecialist ? styles.specialistContainer : styles.patientContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isSpecialist ? styles.specialistBubble : styles.patientBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isSpecialist ? styles.specialistText : styles.patientText,
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.messageTime,
            isSpecialist ? styles.specialistTime : styles.patientTime,
          ]}
        >
          {message.time}
        </Text>
      </View>
    </View>
  );
};

export const ChatInput = () => {
  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity style={styles.plusButton}>
        <Plus color="#1C1C1E" size={24} />
      </TouchableOpacity>
      <View style={styles.textInputWrapper}>
        <TextInput
          placeholder="Text Message"
          placeholderTextColor="#8E8E93"
          style={styles.textInput}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleContainer: {
    marginVertical: 4,
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  specialistContainer: {
    justifyContent: 'flex-end',
  },
  patientContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  specialistBubble: {
    backgroundColor: '#007AFF', // Standard Blue from design
    borderBottomRightRadius: 4,
  },
  patientBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  specialistText: {
    color: '#FFFFFF',
  },
  patientText: {
    color: '#1C1C1E',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  specialistTime: {
    color: '#FFFFFF99',
  },
  patientTime: {
    color: '#8E8E93',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  systemMessage: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  systemMessageText: {
    color: '#1C1C1E',
    fontSize: 12,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  plusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  textInputWrapper: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  textInput: {
    fontSize: 16,
    color: '#1C1C1E',
  },
});
