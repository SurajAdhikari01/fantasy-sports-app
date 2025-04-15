import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Platform,
  FlatList,
  TouchableWithoutFeedback,
  Alert,
  StatusBar,
  StyleSheet,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "../config/axios";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

// --- API Call (remains the same) ---
const addUpcomingMatchApi = async (matchData) => {
  console.log("Submitting Upcoming Match:", matchData);
  try {
    const response = await api.post("/upcoming/addmatches", matchData);
    if (response.data && response.data.success !== false) {
      return {
        success: true,
        message: response.data?.message || "Match added successfully!",
        data: response.data?.data,
      };
    } else {
      return {
        success: false,
        message: response.data?.message || "Failed to add match.",
      };
    }
  } catch (error) {
    console.error(
      "Add Upcoming Match API Error:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "An error occurred while adding the match.",
    };
  }
};
// --- End API Call ---

const CreateFixtureScreen = () => {
  // --- Get Tournament Data from Params (remains the same) ---
  const { tournament: tournamentParam } = useLocalSearchParams();
  const router = useRouter();
  const [tournament, setTournament] = useState(null);
  const [franchises, setFranchises] = useState([]);

  useEffect(() => {
    try {
      const parsedTournament = tournamentParam
        ? JSON.parse(tournamentParam)
        : null;
      if (
        parsedTournament &&
        parsedTournament._id &&
        Array.isArray(parsedTournament.franchises)
      ) {
        setTournament(parsedTournament);
        setFranchises(parsedTournament.franchises);
        if (parsedTournament.franchises.length === 0) {
          setInfoMessage(
            "This tournament has no teams available for selection."
          );
        }
      } else {
        setError("Invalid or missing tournament data.");
        Alert.alert(
          "Error",
          "Could not load tournament data. Please go back and try again.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    } catch (e) {
      console.error("Error parsing tournament data:", e);
      setError("Failed to parse tournament data.");
      Alert.alert(
        "Error",
        "Could not load tournament data. Please go back and try again.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    }
  }, [tournamentParam]);
  // --- End Tournament Data Handling ---

  // State for form inputs
  const [selectedTeamAId, setSelectedTeamAId] = useState("");
  const [selectedTeamBId, setSelectedTeamBId] = useState("");
  const [matchDate, setMatchDate] = useState(new Date());
  const [matchTime, setMatchTime] = useState(new Date());
  const [matchStage, setMatchStage] = useState("");
  const [matchNumber, setMatchNumber] = useState("");

  // State for Custom Pickers
  const [isTeamAListVisible, setIsTeamAListVisible] = useState(false);
  const [isTeamBListVisible, setIsTeamBListVisible] = useState(false);

  // State for DateTimePickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateTimePickerMode, setDateTimePickerMode] = useState("date");

  // State for UI feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  // --- DateTimePicker Handlers (Updated) ---
  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }

    if (event.type === "dismissed") {
      return; // User cancelled the picker
    }

    if (selectedDate) {
      if (dateTimePickerMode === "date") {
        // Only update the date part, keep time the same
        const newDate = new Date(selectedDate);
        newDate.setHours(matchTime.getHours(), matchTime.getMinutes(), 0, 0);
        setMatchDate(newDate);

        // For iOS, continue to time selection
        if (Platform.OS === "ios") {
          setDateTimePickerMode("time");
        }
      } else {
        // Only update the time part, keep date the same
        const newTime = new Date(matchDate);
        newTime.setHours(
          selectedDate.getHours(),
          selectedDate.getMinutes(),
          0,
          0
        );
        setMatchTime(newTime);
        setShowTimePicker(false);
      }
    }
  };

  const showDatepicker = () => {
    dismissAllPickers();
    setDateTimePickerMode("date");
    setShowDatePicker(true);
    setError(null);
  };

  const showTimepicker = () => {
    dismissAllPickers();
    setDateTimePickerMode("time");
    setShowTimePicker(true);
    setError(null);
  };

  // --- Custom Picker Logic ---
  const dismissAllPickers = () => {
    setIsTeamAListVisible(false);
    setIsTeamBListVisible(false);
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const toggleTeamAList = () => {
    if (franchises.length > 0) {
      const currentlyVisible = isTeamAListVisible;
      dismissAllPickers();
      setIsTeamAListVisible(!currentlyVisible);
    }
  };

  const toggleTeamBList = () => {
    if (franchises.length > 0) {
      const currentlyVisible = isTeamBListVisible;
      dismissAllPickers();
      setIsTeamBListVisible(!currentlyVisible);
    }
  };

  const handleTeamASelect = (teamId) => {
    if (teamId !== selectedTeamAId) {
      setSelectedTeamAId(teamId || "");
      setError(null);
    }
    dismissAllPickers();
  };

  const handleTeamBSelect = (teamId) => {
    if (teamId !== selectedTeamBId) {
      setSelectedTeamBId(teamId || "");
      setError(null);
    }
    dismissAllPickers();
  };

  const getSelectedTeamAName = () => {
    if (!selectedTeamAId) return "-- Select Team A --";
    const f = franchises.find((f) => f._id === selectedTeamAId);
    return f?.name || "-- Select Team A --";
  };

  const getSelectedTeamBName = () => {
    if (!selectedTeamBId) return "-- Select Team B --";
    const f = franchises.find((f) => f._id === selectedTeamBId);
    return f?.name || "-- Select Team B --";
  };

  const renderDropdownItem = ({ item }, onSelect, isSelectedCheck) => {
    const isSelected = isSelectedCheck(item._id);
    return (
      <TouchableOpacity
        style={[styles.modalItem, isSelected && styles.modalItemSelected]}
        onPress={() => onSelect(item._id)}
      >
        <Text
          style={[
            styles.modalItemText,
            isSelected && styles.modalItemSelectedText,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDropdownList = (isVisible, data, renderItemFunc, keyPrefix) => {
    if (!isVisible || data.length === 0) return null;
    return (
      <View style={[styles.dropdownContainer, { zIndex: 1000 }]}>
        <FlatList
          data={data}
          renderItem={renderItemFunc}
          keyExtractor={(item) => `${keyPrefix}-${item._id}`}
          nestedScrollEnabled={true}
        />
      </View>
    );
  };

  // --- Form Submission (Updated with Alert) ---
  const handleCreateFixture = async () => {
    // Validations
    if (!matchNumber.trim() || parseInt(matchNumber, 10) <= 0) {
      setError(
        "Please enter a valid Match Number (must be a positive number)."
      );
      setMatchNumber("");
      return;
    }
    const numMatchNumber = parseInt(matchNumber, 10);

    if (!selectedTeamAId || !selectedTeamBId) {
      setError("Please select both teams.");
      return;
    }
    if (selectedTeamAId === selectedTeamBId) {
      setError("Team A and Team B cannot be the same.");
      return;
    }
    if (!matchStage.trim()) {
      setError("Please enter the match stage (e.g., Final, Group A).");
      return;
    }

    setIsSubmitting(true);
    setError(null); // Clear error before submitting

    // Combine Date and Time
    const combinedDateTime = new Date(
      matchDate.getFullYear(),
      matchDate.getMonth(),
      matchDate.getDate(),
      matchTime.getHours(),
      matchTime.getMinutes(),
      0
    );
    const formattedMatchDate = combinedDateTime.toISOString();

    const teamAName = getSelectedTeamAName().replace(
      "-- Select Team A --",
      "Team A"
    );
    const teamBName = getSelectedTeamBName().replace(
      "-- Select Team B --",
      "Team B"
    );
    const formattedMatchName = `${teamAName} vs ${teamBName} - ${matchStage.trim()}`;

    const matchDataPayload = {
      tournamentId: tournament?._id,
      matchNumber: numMatchNumber,
      matchName: formattedMatchName,
      matchDate: formattedMatchDate,
      tournamentId: tournament?._id,
      teamAId: selectedTeamAId,
      teamBId: selectedTeamBId,
    };

    try {
      const response = await addUpcomingMatchApi(matchDataPayload);

      if (response.success) {
        // Reset form fields FIRST
        setMatchNumber("");
        setSelectedTeamAId("");
        setSelectedTeamBId("");
        setMatchStage("");
        const now = new Date();
        setMatchDate(now);
        setMatchTime(now);
        setError(null);

        // Show Alert confirming success
        Alert.alert(
          "Success",
          response.message || "Match added successfully!",
          [
            {
              text: "Go Back",
              onPress: () => router.back(),
              style: "cancel",
            },
            {
              text: "Add Another",
              onPress: () => {
                /* Form is reset, do nothing */
              },
              style: "default",
            },
          ],
          { cancelable: false }
        );
      } else {
        setError(response.message || "Failed to add match.");
      }
    } catch (err) {
      console.error("Create Fixture Submit Error:", err);
      setError(
        err.message || "An unexpected error occurred during submission."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Input Field Renderer ---
  const renderInput = (
    label,
    value,
    placeholder,
    keyboardType = "default",
    editable = true,
    isTouchable = false,
    onPress = null,
    onChangeText = null
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      {isTouchable ? (
        <TouchableOpacity
          onPress={onPress}
          disabled={!editable}
          style={[styles.touchableInput, !editable && styles.disabledInput]}
        >
          <Text
            style={[
              styles.touchableInputText,
              !editable && styles.disabledText,
            ]}
          >
            {value}
          </Text>
          <Ionicons
            name={label === "Date" ? "calendar-outline" : "time-outline"}
            size={20}
            color="#9ca3af"
          />
        </TouchableOpacity>
      ) : (
        <TextInput
          style={[styles.textInput, !editable && styles.disabledInput]}
          placeholder={placeholder}
          placeholderTextColor="#888"
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={keyboardType}
        />
      )}
    </View>
  );

  // --- Main Render ---
  if (!tournament && error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.errorButton}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!tournament) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#fb923c" />
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={dismissAllPickers}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={28} color="#fb923c" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text
                style={styles.headerTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Add Match
              </Text>
              <Text
                style={styles.headerSubtitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {tournament.name}
              </Text>
            </View>
            <View style={{ width: 28 }} />
          </View>

          {/* Main Form Area */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Match Details</Text>

            {/* Info Message */}
            {infoMessage && franchises.length === 0 && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>{infoMessage}</Text>
              </View>
            )}

            {/* Match Number Input */}
            {renderInput(
              "Match Number",
              matchNumber,
              "Enter match number (e.g., 1)",
              "numeric",
              !isSubmitting,
              false,
              null,
              (text) => {
                const numericText = text.replace(/[^0-9]/g, "");
                setMatchNumber(numericText);
                setError(null);
              }
            )}

            {/* Team A Picker */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Team A</Text>
              <TouchableOpacity
                style={[
                  styles.touchableInput,
                  isTeamAListVisible && styles.activeDropdown,
                  franchises.length === 0 && styles.disabledInput,
                ]}
                onPress={toggleTeamAList}
                disabled={franchises.length === 0 || isSubmitting}
              >
                <Text
                  style={[
                    styles.touchableInputText,
                    !selectedTeamAId && styles.placeholderText,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {getSelectedTeamAName()}
                </Text>
                <Ionicons
                  name={isTeamAListVisible ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={franchises.length === 0 ? "#6b7280" : "#d1d5db"}
                />
              </TouchableOpacity>
              {renderDropdownList(
                isTeamAListVisible,
                franchises.filter((f) => f._id !== selectedTeamBId),
                (props) =>
                  renderDropdownItem(
                    props,
                    handleTeamASelect,
                    (id) => id === selectedTeamAId
                  ),
                "a"
              )}
            </View>

            {/* Team B Picker */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Team B</Text>
              <TouchableOpacity
                style={[
                  styles.touchableInput,
                  isTeamBListVisible && styles.activeDropdown,
                  franchises.length === 0 && styles.disabledInput,
                ]}
                onPress={toggleTeamBList}
                disabled={franchises.length === 0 || isSubmitting}
              >
                <Text
                  style={[
                    styles.touchableInputText,
                    !selectedTeamBId && styles.placeholderText,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {getSelectedTeamBName()}
                </Text>
                <Ionicons
                  name={isTeamBListVisible ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={franchises.length === 0 ? "#6b7280" : "#d1d5db"}
                />
              </TouchableOpacity>
              {renderDropdownList(
                isTeamBListVisible,
                franchises.filter((f) => f._id !== selectedTeamAId),
                (props) =>
                  renderDropdownItem(
                    props,
                    handleTeamBSelect,
                    (id) => id === selectedTeamBId
                  ),
                "b"
              )}
            </View>

            {/* Match Stage Input */}
            {renderInput(
              "Match Stage",
              matchStage,
              "e.g., Final, Group A, Semi-Final 1",
              "default",
              !isSubmitting,
              false,
              null,
              (text) => {
                setMatchStage(text);
                setError(null);
              }
            )}

            {/* Date and Time Pickers */}
            <View style={styles.rowContainer}>
              <View style={[styles.flex1, { marginRight: 8 }]}>
                {renderInput(
                  "Date",
                  matchDate.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }),
                  "",
                  undefined,
                  !isSubmitting,
                  true,
                  showDatepicker
                )}
              </View>
              <View style={[styles.flex1, { marginLeft: 8 }]}>
                {renderInput(
                  "Time",
                  matchTime.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }),
                  "",
                  undefined,
                  !isSubmitting,
                  true,
                  showTimepicker
                )}
              </View>
            </View>

            {/* Submit Button and Feedback */}
            <View style={styles.submitContainer}>
              {error && !isSubmitting && (
                <Text style={styles.errorMessageText}>{error}</Text>
              )}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (isSubmitting || franchises.length === 0) &&
                    styles.disabledButton,
                ]}
                onPress={handleCreateFixture}
                disabled={isSubmitting || franchises.length === 0}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>Add Match</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* DateTimePicker Implementation */}
          {showDatePicker && Platform.OS === "android" && (
            <DateTimePicker
              testID="datePicker"
              value={dateTimePickerMode === "date" ? matchDate : matchTime}
              mode={dateTimePickerMode}
              is24Hour={true}
              display="default"
              onChange={onDateChange}
            />
          )}

          {showTimePicker && Platform.OS === "android" && (
            <DateTimePicker
              testID="timePicker"
              value={matchTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onDateChange}
            />
          )}

          {/* For iOS, we use a Modal approach for better UX */}
          {Platform.OS === "ios" && (showDatePicker || showTimePicker) && (
            <Modal
              transparent={true}
              animationType="fade"
              visible={showDatePicker || showTimePicker}
              onRequestClose={() => {
                setShowDatePicker(false);
                setShowTimePicker(false);
              }}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContentContainer}>
                  <View style={styles.modalContent}>
                    <View style={styles.pickerHeader}>
                      <TouchableOpacity
                        onPress={() => {
                          setShowDatePicker(false);
                          setShowTimePicker(false);
                        }}
                        style={styles.pickerButton}
                      >
                        <Text style={styles.pickerCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <Text style={styles.pickerTitle}>
                        {dateTimePickerMode === "date"
                          ? "Select Date"
                          : "Select Time"}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          if (dateTimePickerMode === "date") {
                            setDateTimePickerMode("time");
                          } else {
                            setShowDatePicker(false);
                            setShowTimePicker(false);
                          }
                        }}
                        style={styles.pickerButton}
                      >
                        <Text style={styles.pickerDoneText}>
                          {dateTimePickerMode === "date" ? "Next" : "Done"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <DateTimePicker
                      testID={
                        dateTimePickerMode === "date"
                          ? "datePicker"
                          : "timePicker"
                      }
                      value={
                        dateTimePickerMode === "date" ? matchDate : matchTime
                      }
                      mode={dateTimePickerMode}
                      is24Hour={false}
                      display="spinner"
                      onChange={onDateChange}
                      style={styles.iosPicker}
                      textColor="white"
                    />
                  </View>
                </View>
              </View>
            </Modal>
          )}
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark background
  },
  scrollContent: {
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    padding: 8,
    position: "absolute",
    left: 0,
    top: 12,
    zIndex: 10,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#fb923c", // Orange
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  formContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#222", // Slightly lighter than background
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fb923c", // Orange
    marginBottom: 12,
  },
  infoContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "rgba(146, 64, 14, 0.3)", // Dark amber
    borderWidth: 1,
    borderColor: "#92400e", // Amber 800
    borderRadius: 8,
  },
  infoText: {
    color: "#fcd34d", // Amber 300
    textAlign: "center",
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: "#d1d5db", // Gray 300
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#333",
    color: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    fontSize: 16,
  },
  touchableInput: {
    backgroundColor: "#333",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    minHeight: 50,
  },
  touchableInputText: {
    color: "white",
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  placeholderText: {
    color: "#888",
  },
  disabledInput: {
    backgroundColor: "#2a2a2a",
    borderColor: "#333",
  },
  disabledText: {
    color: "#666",
  },
  activeDropdown: {
    borderColor: "#fb923c", // Orange
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: -1,
    backgroundColor: "#333",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#444",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    overflow: "hidden",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  flex1: {
    flex: 1,
  },
  submitContainer: {
    marginTop: 20,
  },
  errorMessageText: {
    color: "#f87171", // Red 400
    textAlign: "center",
    marginBottom: 12,
    fontSize: 14,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fb923c", // Orange
  },
  disabledButton: {
    backgroundColor: "#444",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorContainer: {
    padding: 16,
    backgroundColor: "rgba(220, 38, 38, 0.3)", // Dark red
    borderWidth: 1,
    borderColor: "#b91c1c", // Red 700
    borderRadius: 8,
    alignItems: "center",
  },
  errorText: {
    color: "#fca5a5", // Red 300
    textAlign: "center",
    marginBottom: 16,
  },
  errorButton: {
    backgroundColor: "#b91c1c", // Red 700
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  errorButtonText: {
    color: "white",
    fontWeight: "600",
  },

  // Modal and Picker styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContentContainer: {
    width: "90%",
    maxHeight: "70%",
  },
  modalContent: {
    backgroundColor: "#3a3a3a",
    borderRadius: 10,
    overflow: "hidden",
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#555555",
  },
  modalItemSelected: {
    backgroundColor: "#555555",
  },
  modalItemText: {
    fontSize: 16,
    color: "white",
  },
  modalItemSelectedText: {
    fontWeight: "bold",
    color: "white",
  },
  modalEmptyText: {
    fontSize: 15,
    color: "#a0aec0",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
    fontStyle: "italic",
  },

  // iOS Picker specific styles
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#555555",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#444444",
  },
  pickerTitle: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  pickerButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pickerCancelText: {
    color: "#f87171", // Red tint
    fontSize: 16,
  },
  pickerDoneText: {
    color: "#fb923c", // Orange
    fontSize: 16,
    fontWeight: "600",
  },
  iosPicker: {
    height: 200,
  },
});

export default CreateFixtureScreen;
