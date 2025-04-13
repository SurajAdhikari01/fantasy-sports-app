import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  StyleSheet, // Import StyleSheet
} from "react-native";
// Removed DropDownPicker import
// import DropDownPicker from "react-native-dropdown-picker";
import { styled } from "nativewind";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"; // Added MaterialCommunityIcons
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "../context/AuthContext"; // Ensure path is correct
import api from "../config/axios"; // Ensure path is correct
import CustomDropdown from "./customDropdown"; // *** Import CustomDropdown *** (Adjust path if needed)

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);

const AdminForm = () => {
  const router = useRouter();
  // const { userData } = useAuth(); // Not currently used, can remove if not needed
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [sport, setSport] = useState(null); // Use null for initial dropdown state
  const [tournamentName, setTournamentName] = useState("");
  const [registrationLimit, setRegistrationLimit] = useState(null); // Use null for initial dropdown state
  // Removed openSport and openLimit states as CustomDropdown manages its own visibility
  const [rules, setRules] = useState("");
  const [playerLimitPerTeam, setPlayerLimitPerTeam] = useState("");
  const [knockoutStart, setKnockoutStart] = useState("");
  const [semifinalStart, setSemifinalStart] = useState("");
  const [finalStart, setFinalStart] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [currentDateField, setCurrentDateField] = useState(null);
  const [franchises, setFranchises] = useState([
    { name: "", location: "" },
    { name: "", location: "" },
  ]);

  // Dropdown options for CustomDropdown
  const sportsOptions = [
    { label: "Cricket", value: "Cricket" },
    { label: "Football", value: "Football" },
    // Add other sports if needed
  ];
  const limitOptions = [
    { label: "5,000", value: "5k" }, // Display formatted label
    { label: "10,000", value: "10k" },
    { label: "15,000", value: "15k" },
    { label: "20,000", value: "20k" },
  ];

  const validateForm = () => {
    if (!sport) {
      Alert.alert("Validation Error", "Please select a sport");
      return false;
    }
    if (!tournamentName.trim()) {
      Alert.alert("Validation Error", "Tournament name is required");
      return false;
    }
    if (!registrationLimit) {
      Alert.alert("Validation Error", "Please select a registration limit");
      return false;
    }
    if (!rules.trim()) {
      Alert.alert("Validation Error", "Tournament rules are required");
      return false;
    }
    const playerLimitNum = parseInt(playerLimitPerTeam);
    if (isNaN(playerLimitNum) || playerLimitNum <= 0) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid player limit per team (must be > 0)"
      );
      return false;
    }
    if (!knockoutStart || !semifinalStart || !finalStart) {
      Alert.alert(
        "Validation Error",
        "All tournament stage start dates are required"
      );
      return false;
    }

    // Dates are already validated during selection in handleConfirm,
    // but double-check order here in case state was manipulated otherwise.
    const knockoutDate = new Date(knockoutStart);
    const semifinalDate = new Date(semifinalStart);
    const finalDate = new Date(finalStart);

    if (semifinalDate <= knockoutDate) {
      Alert.alert(
        "Validation Error",
        "Semifinal date must be after knockout date"
      );
      return false;
    }
    if (finalDate <= semifinalDate) {
      Alert.alert(
        "Validation Error",
        "Final date must be after semifinal date"
      );
      return false;
    }

    // Validate franchises
    for (let i = 0; i < franchises.length; i++) {
      const franchise = franchises[i];
      if (!franchise.name.trim()) {
        Alert.alert(
          "Validation Error",
          `Please enter a name for Franchise ${i + 1}`
        );
        return false;
      }
      if (!franchise.location.trim()) {
        Alert.alert(
          "Validation Error",
          `Please enter a location for Franchise ${i + 1}`
        );
        return false;
      }
    }

    return true;
  };

  const handleFranchiseChange = (index, field, value) => {
    const newFranchises = [...franchises];
    newFranchises[index][field] = value;
    setFranchises(newFranchises);
  };

  const addFranchise = () => {
    setFranchises([...franchises, { name: "", location: "" }]);
  };

  const removeFranchise = (index) => {
    if (franchises.length > 2) {
      const newFranchises = franchises.filter((_, i) => i !== index);
      setFranchises(newFranchises);
    } else {
      Alert.alert(
        "Minimum Required",
        "At least two franchises are needed for a tournament."
      );
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Token fetching might be better handled by axios interceptors if setup
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) {
        Alert.alert(
          "Authentication Error",
          "You are not logged in. Please login again.",
          [{ text: "OK", onPress: () => router.replace("/(auth)/signin") }]
        );
        setIsSubmitting(false);
        return;
      }

      const registrationLimitNumber = parseInt(
        registrationLimit.replace("k", "000"),
        10
      );

      const tournamentData = {
        name: tournamentName.trim(),
        rules: rules.trim(),
        registrationLimits: registrationLimitNumber,
        playerLimitPerTeam: parseInt(playerLimitPerTeam, 10),
        // Ensure dates are sent in a consistent format (ISO string is good)
        knockoutStart: new Date(knockoutStart).toISOString(),
        semifinalStart: new Date(semifinalStart).toISOString(),
        finalStart: new Date(finalStart).toISOString(),
        // Filter out empty franchise entries just in case, though validation should prevent this
        franchises: franchises
          .filter((f) => f.name.trim() && f.location.trim())
          .map((f) => ({
            name: f.name.trim(),
            location: f.location.trim(),
          })),
        sport,
      };

      console.log(
        "Submitting Tournament Data:",
        JSON.stringify(tournamentData, null, 2)
      );

      // Assuming 'api' has interceptor to add Authorization header with token
      const response = await api.post("/tournaments/new", tournamentData);

      // Check for successful status codes
      if (response.status === 201 || response.status === 200) {
        Alert.alert("Success", "Tournament created successfully!", [
          { text: "OK", onPress: () => router.back() }, // Navigate back on success
        ]);
      } else {
        // Handle non-2xx success codes if applicable, or treat as error
        throw new Error(
          response.data?.message ||
            `Server responded with status ${response.status}`
        );
      }
    } catch (error) {
      console.error(
        "Error creating tournament:",
        error.response?.data || error.message || error
      );
      let message =
        "Failed to create tournament. Please check your input and try again.";
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      // Handle specific errors like 401 (Unauthorized) if interceptor doesn't handle redirection
      if (error.response?.status === 401) {
        message = "Your session may have expired. Please login again.";
        // Optionally redirect to login
        // router.replace("/(auth)/signin");
      }
      Alert.alert("Creation Failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Date Picker Logic ---
  const showDatePicker = (field) => {
    setCurrentDateField(field);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
    setCurrentDateField(null);
  };

  const handleConfirm = (date) => {
    // Ensure date is not in the past (consider start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight for comparison

    if (date < today) {
      Alert.alert("Invalid Date", "Please select today or a future date.");
      hideDatePicker(); // Hide picker after showing alert
      return;
    }

    const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD

    // Validate sequence
    switch (currentDateField) {
      case "knockoutStart":
        // Reset subsequent dates if knockout changes
        setSemifinalStart("");
        setFinalStart("");
        setKnockoutStart(formattedDate);
        break;
      case "semifinalStart":
        if (!knockoutStart) {
          Alert.alert(
            "Sequence Error",
            "Please select the Knockout Start Date first."
          );
          hideDatePicker();
          return;
        }
        if (date <= new Date(knockoutStart)) {
          Alert.alert(
            "Invalid Date",
            "Semifinal date must be after the Knockout Start Date."
          );
          hideDatePicker();
          return;
        }
        // Reset final date if semi changes
        setFinalStart("");
        setSemifinalStart(formattedDate);
        break;
      case "finalStart":
        if (!semifinalStart) {
          Alert.alert(
            "Sequence Error",
            "Please select the Semifinal Start Date first."
          );
          hideDatePicker();
          return;
        }
        if (date <= new Date(semifinalStart)) {
          Alert.alert(
            "Invalid Date",
            "Final date must be after the Semifinal Start Date."
          );
          hideDatePicker();
          return;
        }
        setFinalStart(formattedDate);
        break;
    }
    hideDatePicker(); // Hide picker on successful selection
  };

  // Format date for display
  const displayDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        // Example format: Jan 1, 2024
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC", // Ensure consistency regardless of local timezone
      });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    // Use bg-[#2a2a2a] for the main background
    <StyledSafeAreaView className="flex-1 bg-[#2a2a2a]">
      {/* Header */}
      <StyledView className="flex-row items-center p-4 border-b border-gray-700/60">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <StyledText className="text-xl text-white font-semibold">
          Create New Tournament
        </StyledText>
      </StyledView>

      <StyledScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Sport Dropdown */}
        <StyledView className="mb-5">
          <CustomDropdown
            label="Select Sport *"
            options={sportsOptions}
            selectedValue={sport}
            onValueChange={setSport} // Directly pass setter
            placeholder="-- Choose Sport --"
            disabled={isSubmitting}
          />
        </StyledView>

        {/* Tournament Name */}
        <StyledView className="mb-5">
          <StyledText className="text-white mb-2 ml-1">
            Tournament Name *
          </StyledText>
          <StyledTextInput
            className="bg-[#3a3a3a] text-white p-3 rounded-lg border border-gray-700"
            placeholder="Enter Tournament Name"
            placeholderTextColor="#888"
            value={tournamentName}
            onChangeText={setTournamentName}
            editable={!isSubmitting}
          />
        </StyledView>

        {/* Registration Limit Dropdown */}
        <StyledView className="mb-5">
          <CustomDropdown
            label="Registration Limit *"
            options={limitOptions}
            selectedValue={registrationLimit}
            onValueChange={setRegistrationLimit}
            placeholder="-- Select Max Registrations --"
            disabled={isSubmitting}
          />
        </StyledView>

        {/* Rules */}
        <StyledView className="mb-5">
          <StyledText className="text-white mb-2 ml-1">Rules *</StyledText>
          <StyledTextInput
            className="bg-[#3a3a3a] text-white p-3 rounded-lg border border-gray-700 min-h-[80px]" // Increased height for multiline
            placeholder="Enter Tournament Rules"
            placeholderTextColor="#888"
            value={rules}
            onChangeText={setRules}
            multiline={true}
            textAlignVertical="top" // Align text top for multiline
            editable={!isSubmitting}
          />
        </StyledView>

        {/* Player Limit */}
        <StyledView className="mb-5">
          <StyledText className="text-white mb-2 ml-1">
            Player Limit Per Team *
          </StyledText>
          <StyledTextInput
            className="bg-[#3a3a3a] text-white p-3 rounded-lg border border-gray-700"
            placeholder="e.g., 11"
            placeholderTextColor="#888"
            keyboardType="number-pad" // Use number-pad for integers
            value={playerLimitPerTeam}
            onChangeText={(text) =>
              setPlayerLimitPerTeam(text.replace(/[^0-9]/g, ""))
            } // Allow only numbers
            editable={!isSubmitting}
          />
        </StyledView>

        {/* Date Inputs */}
        <StyledView className="mb-3 space-y-4">
          {/* Knockout Date */}
          <StyledView>
            <StyledText className="text-white mb-2 ml-1">
              Knockout Start Date *
            </StyledText>
            <StyledTouchableOpacity
              className="bg-[#3a3a3a] p-3 rounded-lg border border-gray-700 flex-row justify-between items-center"
              onPress={() => showDatePicker("knockoutStart")}
              disabled={isSubmitting}
            >
              <StyledText
                className={knockoutStart ? "text-white" : "text-gray-500"}
              >
                {knockoutStart ? displayDate(knockoutStart) : "Select Date"}
              </StyledText>
              <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
            </StyledTouchableOpacity>
          </StyledView>

          {/* Semifinal Date */}
          <StyledView>
            <StyledText className="text-white mb-2 ml-1">
              Semifinal Start Date *
            </StyledText>
            <StyledTouchableOpacity
              className={`bg-[#3a3a3a] p-3 rounded-lg border border-gray-700 flex-row justify-between items-center ${
                !knockoutStart ? "opacity-50" : ""
              }`}
              onPress={() => showDatePicker("semifinalStart")}
              disabled={isSubmitting || !knockoutStart} // Disable if knockout not set
            >
              <StyledText
                className={semifinalStart ? "text-white" : "text-gray-500"}
              >
                {semifinalStart ? displayDate(semifinalStart) : "Select Date"}
              </StyledText>
              <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
            </StyledTouchableOpacity>
          </StyledView>

          {/* Final Date */}
          <StyledView>
            <StyledText className="text-white mb-2 ml-1">
              Final Start Date *
            </StyledText>
            <StyledTouchableOpacity
              className={`bg-[#3a3a3a] p-3 rounded-lg border border-gray-700 flex-row justify-between items-center ${
                !semifinalStart ? "opacity-50" : ""
              }`}
              onPress={() => showDatePicker("finalStart")}
              disabled={isSubmitting || !semifinalStart} // Disable if semifinal not set
            >
              <StyledText
                className={finalStart ? "text-white" : "text-gray-500"}
              >
                {finalStart ? displayDate(finalStart) : "Select Date"}
              </StyledText>
              <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>

        {/* Franchises Section */}
        <StyledView className="mt-6 border-t border-gray-700/60 pt-5">
          <StyledText className="text-lg font-semibold text-gray-300 mb-4 ml-1">
            Franchises (Min. 2)
          </StyledText>
          {franchises.map((franchise, index) => (
            <StyledView
              key={index}
              className="mb-5 p-4 bg-[#3a3a3a] rounded-lg border border-gray-700 relative"
            >
              <StyledText className="text-base font-medium text-white mb-3">
                Franchise {index + 1}
              </StyledText>
              {/* Franchise Name */}
              <StyledView className="mb-3">
                <StyledText className="text-sm text-gray-400 mb-1 ml-1">
                  Name *
                </StyledText>
                <StyledTextInput
                  className="bg-[#4a4a4a] text-white p-2.5 rounded-md border border-gray-600" // Slightly different bg for inputs within card
                  placeholder={`Enter Name for Franchise ${index + 1}`}
                  placeholderTextColor="#777"
                  value={franchise.name}
                  onChangeText={(text) =>
                    handleFranchiseChange(index, "name", text)
                  }
                  editable={!isSubmitting}
                />
              </StyledView>
              {/* Franchise Location */}
              <StyledView>
                <StyledText className="text-sm text-gray-400 mb-1 ml-1">
                  Location *
                </StyledText>
                <StyledTextInput
                  className="bg-[#4a4a4a] text-white p-2.5 rounded-md border border-gray-600"
                  placeholder={`Enter Location for Franchise ${index + 1}`}
                  placeholderTextColor="#777"
                  value={franchise.location}
                  onChangeText={(text) =>
                    handleFranchiseChange(index, "location", text)
                  }
                  editable={!isSubmitting}
                />
              </StyledView>

              {/* Remove Button (Positioned absolutely) */}
              {franchises.length > 2 && ( // Only show if more than 2 franchises exist
                <StyledTouchableOpacity
                  style={styles.removeButton} // Use StyleSheet for absolute positioning
                  onPress={() => removeFranchise(index)}
                  disabled={isSubmitting}
                >
                  <Ionicons name="close-circle" size={26} color="#ef4444" />
                  {/* Red close icon */}
                </StyledTouchableOpacity>
              )}
            </StyledView>
          ))}

          {/* Add Franchise Button */}
          <StyledTouchableOpacity
            className="bg-green-600/80 py-2.5 px-4 rounded-lg mt-2 flex-row items-center justify-center border border-green-500"
            onPress={addFranchise}
            disabled={isSubmitting}
          >
            <Ionicons name="add-outline" size={22} color="white" />
            <StyledText className="text-white font-semibold ml-1.5">
              Add Another Franchise
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>

        {/* Submit Button */}
        <StyledTouchableOpacity
          className={`py-4 px-8 rounded-lg mt-8 flex-row items-center justify-center ${
            isSubmitting ? "bg-gray-600" : "bg-blue-600 shadow-md"
          }`}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="creation"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <StyledText className="text-white text-lg font-bold">
                Create Tournament
              </StyledText>
            </>
          )}
        </StyledTouchableOpacity>
      </StyledScrollView>

      {/* Date Time Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        minimumDate={new Date()} // Set minimum date to today
        // Optional: Style the modal (iOS only)
        // customConfirmButtonIOS={(props) => <Button title="Confirm" color="#007AFF" {...props} />}
        // customCancelButtonIOS={(props) => <Button title="Cancel" color="#ef4444" {...props} />}
      />
    </StyledSafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 16, // Use padding on the scroll view content
    paddingBottom: 50, // Extra padding at the bottom
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4, // Add padding for easier touch target
    // backgroundColor: 'rgba(0,0,0,0.1)', // Optional subtle background
    borderRadius: 15,
  },
});

export default AdminForm;
