import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { ChevronLeft, Phone, Video, ChevronDown } from "lucide-react-native";
import { useRouter } from "expo-router";

interface ChatHeaderProps {
  name: string;
  role: string;
  avatar: string;
  onPhonePress?: () => void;
  onVideoPress?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  role,
  avatar,
  onPhonePress,
  onVideoPress,
}) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeft color="#1C1C1E" size={28} />
      </TouchableOpacity>

      <View style={styles.userInfo}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.role}>{role}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onPhonePress}>
          <Phone color="#1C1C1E" size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onVideoPress}>
          <Video color="#1C1C1E" size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <ChevronDown color="#8E8E93" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  backButton: {
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  role: {
    fontSize: 12,
    color: "#8E8E93",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
});

export default ChatHeader;
