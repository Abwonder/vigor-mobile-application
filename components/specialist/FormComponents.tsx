import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Pressable,
} from "react-native";
import {
  ChevronDown,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
} from "lucide-react-native";

const { height, width } = Dimensions.get("window");

interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  multiline,
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textArea]}
      placeholder={placeholder}
      placeholderTextColor="#C7C7CC"
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
    />
  </View>
);

interface DropdownProps {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onSelect: (option: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const FormDropdown: React.FC<DropdownProps> = ({
  label,
  placeholder,
  value,
  options,
  onSelect,
  isOpen,
  onToggle,
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TouchableOpacity
      style={[
        styles.input,
        styles.dropdownTrigger,
        isOpen && styles.activeDropdown,
      ]}
      onPress={onToggle}
    >
      <Text style={[styles.inputValue, !value && styles.placeholderText]}>
        {value || placeholder}
      </Text>
      <ChevronDown
        color={isOpen ? "#007AFF" : "#8E8E93"}
        size={20}
        style={isOpen && styles.rotateIcon}
      />
    </TouchableOpacity>

    {isOpen && (
      <View style={styles.dropdownList}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.dropdownOption}
            onPress={() => {
              onSelect(option);
              onToggle();
            }}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>
);

export const DualInput = ({
  label,
  leftValue,
  rightValue,
  leftPlaceholder,
  rightPlaceholder,
  rightOptions,
  onLeftChange,
  onRightSelect,
}: any) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.dualRow}>
        <TextInput
          style={[styles.input, styles.dualLeft]}
          placeholder={leftPlaceholder}
          value={leftValue}
          onChangeText={onLeftChange}
        />
        <TouchableOpacity
          style={[
            styles.input,
            styles.dualRight,
            isDropdownOpen && styles.activeDropdown,
          ]}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Text
            style={[styles.inputValue, !rightValue && styles.placeholderText]}
          >
            {rightValue || rightPlaceholder}
          </Text>
          <ChevronDown color="#8E8E93" size={18} />
        </TouchableOpacity>
      </View>
      {isDropdownOpen && (
        <View style={styles.dropdownListSmall}>
          {rightOptions.map((option: string) => (
            <TouchableOpacity
              key={option}
              style={styles.dropdownOption}
              onPress={() => {
                onRightSelect(option);
                setIsDropdownOpen(false);
              }}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export const CalendarModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  // Simplified calendar UI based on images
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.calendarOverlay}>
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <ChevronRight
              color="#1C1C1E"
              size={20}
              style={{ transform: [{ rotate: "180deg" }] }}
            />
            <Text style={styles.monthTitle}>September 2025</Text>
            <ChevronRight color="#1C1C1E" size={20} />
          </View>

          <View style={styles.weekdays}>
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <Text key={d} style={styles.weekdayText}>
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {/* Empty days for offset if needed */}
            {[null, null].map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayCell} />
            ))}
            {days.map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.dayCell,
                  d === 17 && styles.selectedDayStart,
                  d > 17 && d < 23 && styles.selectedDayRange,
                  d === 23 && styles.selectedDayEnd,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    (d === 17 || d === 23) && styles.selectedDayTabText,
                  ]}
                >
                  {d < 10 ? `0${d}` : d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#48484A",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F2F2F7",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1C1C1E",
    borderWidth: 1,
    borderColor: "transparent",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dropdownTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activeDropdown: {
    borderColor: "#007AFF",
    backgroundColor: "#FFFFFF",
  },
  inputValue: {
    fontSize: 15,
    color: "#1C1C1E",
  },
  placeholderText: {
    color: "#C7C7CC",
  },
  rotateIcon: {
    transform: [{ rotate: "180deg" }],
  },
  dropdownList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    maxHeight: 250,
  },
  dropdownListSmall: {
    position: "absolute",
    top: 85,
    right: 0,
    width: "40%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  dropdownOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  optionText: {
    fontSize: 15,
    color: "#1C1C1E",
  },
  dualRow: {
    flexDirection: "row",
    gap: 12,
  },
  dualLeft: {
    flex: 2,
  },
  dualRight: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  calendarContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "95%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  weekdays: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  weekdayText: {
    width: 40,
    textAlign: "center",
    fontSize: 13,
    color: "#8E8E93",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  dayCell: {
    width: (width * 0.95 - 40) / 7,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  dayText: {
    fontSize: 15,
    color: "#1C1C1E",
  },
  selectedDayStart: {
    backgroundColor: "#007AFF",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  selectedDayEnd: {
    backgroundColor: "#007AFF",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  selectedDayRange: {
    backgroundColor: "#007AFF20",
  },
  selectedDayTabText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  doneButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    alignItems: "center",
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#007AFF",
  },
});
