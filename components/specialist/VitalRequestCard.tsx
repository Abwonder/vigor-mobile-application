import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Thermometer } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

interface VitalRequestCardProps {
  onPress: () => void;
}

const VitalRequestCard: React.FC<VitalRequestCardProps> = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <View style={styles.iconCircle}>
          <Thermometer color="#0099FF" size={32} />
          <View style={styles.tempBadge}>
            <Text style={styles.tempText}>C°</Text>
          </View>
        </View>
      </View>

      <Text style={styles.title}>Doctor requested your vitals</Text>
      <Text style={styles.subtitle}>
        Please enter your latest readings (BP, temperature, sugar, weight).
      </Text>

      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <LinearGradient
          colors={["#00E5FF", "#0099FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Share Vitals Now</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginVertical: 12,
    marginHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrapper: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  tempBadge: {
    position: "absolute",
    top: 5,
    left: 5,
    backgroundColor: "#00D09E",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  tempText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  button: {
    height: 48,
    paddingHorizontal: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default VitalRequestCard;
