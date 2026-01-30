import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Image, Camera } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

interface PhotoUploadButtonsProps {
  onUpload: () => void;
  onTakePhoto: () => void;
}

export const PhotoUploadButtons = ({
  onUpload,
  onTakePhoto,
}: PhotoUploadButtonsProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={onUpload}
        activeOpacity={0.7}
      >
        <Image size={20} color={Colors.light.primary} />
        <Text style={styles.buttonText}>Upload photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={onTakePhoto}
        activeOpacity={0.7}
      >
        <Camera size={20} color={Colors.light.primary} />
        <Text style={styles.buttonText}>Take photo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    backgroundColor: '#fff',
    gap: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.primary,
  },
});
