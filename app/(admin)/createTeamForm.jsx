import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "../context/AuthContext";
import api from "../config/axios";

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);

const AdminForm = () => {
  const router = useRouter();
  const { userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [sport, setSport] = useState("Cricket");
  const [tournamentName, setTournamentName] = useState("");
  const [registrationLimit, setRegistrationLimit] = useState("5k");
  const [openSport, setOpenSport] = useState(false);
  const [openLimit, setOpenLimit] = useState(false);
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

  // Dropdown options
  const sports = [
    { label: "Cricket", value: "Cricket" },
    { label: "Football", value: "Football" },
  ];
  const limits = [
    { label: "5k", value: "5k" },
    { label: "10k", value: "10k" },
    { label: "15k", value: "15k" },
    { label: "20k", value: "20k" },
  ];

  const validateForm = () => {
    if (!tournamentName.trim()) {
      Alert.alert("Error", "Tournament name is required");
      return false;
    }
    if (!rules.trim()) {
      Alert.alert("Error", "Rules are required");
      return false;
    }
    if (!playerLimitPerTeam || isNaN(parseInt(playerLimitPerTeam))) {
      Alert.alert("Error", "Valid player limit per team is required");
      return false;
    }
    if (!knockoutStart || !semifinalStart || !finalStart) {
      Alert.alert("Error", "All tournament dates are required");
      return false;
    }

    // Validate dates are in future and in correct order
    const currentDate = new Date();
    const knockoutDate = new Date(knockoutStart);
    const semifinalDate = new Date(semifinalStart);
    const finalDate = new Date(finalStart);

    if (knockoutDate <= currentDate) {
      Alert.alert("Error", "Knockout date must be in the future");
      return false;
    }
    if (semifinalDate <= knockoutDate) {
      Alert.alert("Error", "Semifinal date must be after knockout date");
      return false;
    }
    if (finalDate <= semifinalDate) {
      Alert.alert("Error", "Final date must be after semifinal date");
      return false;
    }

    // Validate franchises
    for (const franchise of franchises) {
      if (!franchise.name.trim() || !franchise.location.trim()) {
        Alert.alert("Error", "All franchise details are required");
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
      Alert.alert("Error", "At least two franchises are required.");
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) {
        Alert.alert("Error", "Authentication token not found");
        router.replace("/(auth)/signin");
        return;
      }

      const currentUTCDate = new Date().toISOString();
      const registrationLimitNumber = parseInt(
        registrationLimit.replace("k", "000"),
        10
      );

      const tournamentData = {
        name: tournamentName,
        rules,
        registrationLimits: registrationLimitNumber,
        playerLimitPerTeam: parseInt(playerLimitPerTeam, 10),
        knockoutStart: new Date(knockoutStart).toISOString(),
        semifinalStart: new Date(semifinalStart).toISOString(),
        finalStart: new Date(finalStart).toISOString(),
        franchises,
        sport,
      };
      console.log("Tournament data:", tournamentData);

      const response = await api.post("/tournaments/new", tournamentData);

      Alert.alert("Success", "Tournament created successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Failed to create tournament:", error);

      if (error.response?.status === 401) {
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please login again.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(auth)/signin"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          error.response?.data?.message || "Failed to create tournament"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const showDatePicker = (field) => {
    setCurrentDateField(field);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
    setCurrentDateField(null);
  };

  const handleConfirm = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    const currentDate = new Date();

    // Validate the selected date
    if (date < currentDate) {
      Alert.alert("Invalid Date", "Please select a future date");
      return;
    }

    switch (currentDateField) {
      case "knockoutStart":
        setKnockoutStart(formattedDate);
        break;
      case "semifinalStart":
        if (!knockoutStart) {
          Alert.alert("Error", "Please select knockout date first");
          return;
        }
        if (date <= new Date(knockoutStart)) {
          Alert.alert(
            "Invalid Date",
            "Semifinal date must be after knockout date"
          );
          return;
        }
        setSemifinalStart(formattedDate);
        break;
      case "finalStart":
        if (!semifinalStart) {
          Alert.alert("Error", "Please select semifinal date first");
          return;
        }
        if (date <= new Date(semifinalStart)) {
          Alert.alert(
            "Invalid Date",
            "Final date must be after semifinal date"
          );
          return;
        }
        setFinalStart(formattedDate);
        break;
    }
    hideDatePicker();
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-gray-900 p-4">
      <StyledView className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <StyledText className="text-lg text-white ml-2">Admin Form</StyledText>
      </StyledView>

      <StyledScrollView>
        <StyledText className="text-lg text-white mb-2">
          Select Sport
        </StyledText>
        <DropDownPicker
          open={openSport}
          value={sport}
          items={sports}
          setOpen={setOpenSport}
          setValue={setSport}
          setItems={setSport}
          placeholder="Select a sport"
          placeholderStyle={{ color: "#888" }}
          containerStyle={{ width: "100%", marginBottom: 16 }}
          style={{ backgroundColor: "#333", borderColor: "#444" }}
          dropDownStyle={{ backgroundColor: "#333" }}
          labelStyle={{ color: "#fff" }}
          arrowColor="#fff"
        />

        <StyledText className="text-lg text-white mb-2">
          Tournament Name
        </StyledText>
        <StyledTextInput
          className="h-10 border border-gray-600 w-full px-2 mb-2 rounded-lg bg-gray-800 text-white"
          placeholder="Enter Tournament Name"
          placeholderTextColor="#888"
          value={tournamentName}
          onChangeText={(text) => setTournamentName(text)}
        />

        <StyledText className="text-lg text-white mb-2">
          Registration Limit
        </StyledText>
        <DropDownPicker
          open={openLimit}
          value={registrationLimit}
          items={limits}
          setOpen={setOpenLimit}
          setValue={setRegistrationLimit}
          setItems={setRegistrationLimit}
          placeholder="Select a limit"
          placeholderStyle={{ color: "#888" }}
          containerStyle={{ width: "100%", marginBottom: 16 }}
          style={{ backgroundColor: "#333", borderColor: "#444" }}
          dropDownStyle={{ backgroundColor: "#333" }}
          labelStyle={{ color: "#fff" }}
          arrowColor="#fff"
        />

        <StyledText className="text-lg text-white mb-2">Rules</StyledText>
        <StyledTextInput
          className="h-10 border border-gray-600 w-full px-2 mb-2 rounded-lg bg-gray-800 text-white"
          placeholder="Enter Rules"
          placeholderTextColor="#888"
          value={rules}
          onChangeText={(text) => setRules(text)}
        />

        <StyledText className="text-lg text-white mb-2">
          Player Limit Per Team
        </StyledText>
        <StyledTextInput
          className="h-10 border border-gray-600 w-full px-2 mb-2 rounded-lg bg-gray-800 text-white"
          placeholder="Enter Player Limit Per Team"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={playerLimitPerTeam}
          onChangeText={(text) => setPlayerLimitPerTeam(text)}
        />

        <StyledText className="text-lg text-white mb-2">
          Knockout Start Date
        </StyledText>
        <TouchableOpacity onPress={() => showDatePicker("knockoutStart")}>
          <StyledTextInput
            className="h-10 border border-gray-600 w-full px-2 mb-2 rounded-lg bg-gray-800 text-white"
            placeholder="Select Knockout Start Date"
            placeholderTextColor="#888"
            value={knockoutStart}
            editable={false}
            pointerEvents="none"
          />
        </TouchableOpacity>

        <StyledText className="text-lg text-white mb-2">
          Semifinal Start Date
        </StyledText>
        <TouchableOpacity onPress={() => showDatePicker("semifinalStart")}>
          <StyledTextInput
            className="h-10 border border-gray-600 w-full px-2 mb-2 rounded-lg bg-gray-800 text-white"
            placeholder="Select Semifinal Start Date"
            placeholderTextColor="#888"
            value={semifinalStart}
            editable={false}
            pointerEvents="none"
          />
        </TouchableOpacity>

        <StyledText className="text-lg text-white mb-2">
          Final Start Date
        </StyledText>
        <TouchableOpacity onPress={() => showDatePicker("finalStart")}>
          <StyledTextInput
            className="h-10 border border-gray-600 w-full px-2 mb-2 rounded-lg bg-gray-800 text-white"
            placeholder="Select Final Start Date"
            placeholderTextColor="#888"
            value={finalStart}
            editable={false}
            pointerEvents="none"
          />
        </TouchableOpacity>

        {franchises.map((franchise, index) => (
          <View key={index} className="mb-4">
            <StyledText className="text-lg text-white mb-2">
              Franchise {index + 1} Name
            </StyledText>
            <StyledTextInput
              className="h-10 border border-gray-600 w-full px-2 mb-2 rounded-lg bg-gray-800 text-white"
              placeholder="Enter Franchise Name"
              placeholderTextColor="#888"
              value={franchise.name}
              onChangeText={(text) =>
                handleFranchiseChange(index, "name", text)
              }
            />

            <StyledText className="text-lg text-white mb-2">
              Franchise {index + 1} Location
            </StyledText>
            <StyledTextInput
              className="h-10 border border-gray-600 w-full px-2 mb-2 rounded-lg bg-gray-800 text-white"
              placeholder="Enter Franchise Location"
              placeholderTextColor="#888"
              value={franchise.location}
              onChangeText={(text) =>
                handleFranchiseChange(index, "location", text)
              }
            />

            {index >= 2 && (
              <StyledTouchableOpacity
                className="bg-red-600 py-2 px-4 rounded-lg mt-2 flex-row items-center justify-center"
                onPress={() => removeFranchise(index)}
              >
                <Ionicons name="remove-circle" size={24} color="white" />
                <StyledText className="text-white text-lg font-bold ml-2">
                  Remove
                </StyledText>
              </StyledTouchableOpacity>
            )}
          </View>
        ))}

        <StyledTouchableOpacity
          className="bg-green-600 py-2 px-4 rounded-lg mt-4 flex-row items-center justify-center"
          onPress={addFranchise}
        >
          <Ionicons name="add" size={24} color="white" />
          <StyledText className="text-white text-lg font-bold ml-2">
            Add Franchise
          </StyledText>
        </StyledTouchableOpacity>

        <StyledTouchableOpacity
          className="bg-blue-600 py-3 px-8 rounded-lg mt-4 flex-row items-center justify-center"
          onPress={handleSubmit}
        >
          <StyledText className="text-white text-lg font-bold ml-2">
            Create
          </StyledText>
        </StyledTouchableOpacity>
      </StyledScrollView>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </StyledSafeAreaView>
  );
};

export default AdminForm;
