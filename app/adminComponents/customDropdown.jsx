import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { styled } from "nativewind";
import Icon from "react-native-vector-icons/FontAwesome";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);

const CustomDropdown = ({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder = "Select...",
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedLabel =
    options?.find((option) => option.value === selectedValue)?.label ||
    placeholder;

  const handleSelect = (value) => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <StyledView className="w-full mb-4">
      {label && (
        <StyledText className="text-white mb-2 ml-1">{label}</StyledText>
      )}

      {/* Dropdown Button - Updated background */}
      <StyledTouchableOpacity
        className={`bg-[#3a3a3a] rounded-lg border border-gray-700 p-3 flex-row justify-between items-center ${
          // Using #3a3a3a here
          disabled ? "opacity-50" : ""
        }`}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <StyledText
          className={`text-base ${
            selectedValue ? "text-white" : "text-gray-400"
          }`}
        >
          {selectedLabel}
        </StyledText>
        <Icon name="chevron-down" size={16} color="white" />
      </StyledTouchableOpacity>

      {/* Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <StyledTouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <StyledSafeAreaView style={styles.modalContentContainer}>
            <StyledView
              style={styles.modalContent} // Styles updated below
              onStartShouldSetResponder={() => true}
            >
              <StyledText style={styles.modalTitle}>
                {label || placeholder}
              </StyledText>
              <FlatList
                data={options}
                keyExtractor={(item) => item.value.toString()}
                renderItem={({ item }) => (
                  <StyledTouchableOpacity
                    style={[
                      styles.modalItem, // Styles updated below
                      selectedValue === item.value && styles.modalItemSelected, // Styles updated below
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <StyledText
                      style={[
                        styles.modalItemText, // Styles updated below
                        selectedValue === item.value &&
                          styles.modalItemSelectedText,
                      ]}
                    >
                      {item.label}
                    </StyledText>
                  </StyledTouchableOpacity>
                )}
                ListEmptyComponent={
                  <StyledText style={styles.modalEmptyText}>
                    No options available.
                  </StyledText>
                }
              />
            </StyledView>
          </StyledSafeAreaView>
        </StyledTouchableOpacity>
      </Modal>
    </StyledView>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)", // Slightly darker overlay for more contrast
    justifyContent: "center",
    alignItems: "center",
  },
  modalContentContainer: {
    width: "90%",
    maxHeight: "70%",
  },
  modalContent: {
    backgroundColor: "#3a3a3a", // Match the new theme background
    borderRadius: 10,
    paddingVertical: 10, // Adjust padding
    paddingHorizontal: 0, // Remove horizontal padding here, add in items
    overflow: "hidden",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10, // Reduced margin
    marginTop: 5, // Added top margin
    textAlign: "center",
    paddingHorizontal: 15, // Add padding back for title
  },
  modalItem: {
    paddingVertical: 15, // Increased vertical padding
    paddingHorizontal: 15, // Added horizontal padding here
    borderBottomWidth: 1,
    borderBottomColor: "#555555", // Slightly lighter gray for separator
  },
  modalItemSelected: {
    backgroundColor: "#555555", // Use the separator color for selected bg
  },
  modalItemText: {
    fontSize: 16,
    color: "white",
  },
  modalItemSelectedText: {
    fontWeight: "bold", // Keep bold for selected text
    color: "white", // Ensure selected text is white
  },
  modalEmptyText: {
    fontSize: 15,
    color: "#a0aec0", // text-gray-400 equivalent
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20, // Added bottom margin
    fontStyle: "italic",
  },
});

export default CustomDropdown;
