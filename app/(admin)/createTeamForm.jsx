import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

const AdminForm = () => {
  const router = useRouter();
  const [sport, setSport] = useState("Cricket");
  const [tournamentName, setTournamentName] = useState("");
  const [registrationLimit, setRegistrationLimit] = useState("5k");
  const [openSport, setOpenSport] = useState(false);
  const [openLimit, setOpenLimit] = useState(false);

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

  const handleSubmit = () => {
    Alert.alert(
      "Team Created",
      `Sport: ${sport}\nTournament Name: ${tournamentName}\nRegistration Limit: ${registrationLimit}`
    );
    router.back();
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-gray-900 p-4">
      <StyledView className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <StyledText className="text-lg text-white ml-2">Admin Form</StyledText>
      </StyledView>

      <StyledText className="text-lg text-white mb-2">Select Sport</StyledText>
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

      <StyledTouchableOpacity
        className="bg-blue-600 py-3 px-8 rounded-lg mt-4 flex-row items-center justify-center"
        onPress={handleSubmit}
      >
        <StyledText className="text-white text-lg font-bold ml-2">
          Create
        </StyledText>
      </StyledTouchableOpacity>
    </StyledSafeAreaView>
  );
};

export default AdminForm;
