import React, { useState, useEffect } from "react";
import {
  ScrollView,
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // Correct import for Picker
import { styled } from "nativewind";
import { useRouter, useLocalSearchParams } from "expo-router";
import api from "../config/axios";

// Styling container with NativeWind
const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function AddMatchDetail() {
  const { tournament: tournamentParam } = useLocalSearchParams();
  const tournament = JSON.parse(tournamentParam || "{}");
  const router = useRouter();

  const [selectedFranchise, setSelectedFranchise] = useState("");
  const [players, setPlayers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [matchDetails, setMatchDetails] = useState({
    matchNumber: "",
    matchName: "",
    playersPlayedTeam1: [],
    playersPlayedTeam2: [],
    score: "",
    goalsScoredBy: [],
    cardsObtained: {
      yellow: [],
      red: [],
    },
    penaltiesMissed: [],
    tournament_id: tournament._id,
    ownGoals: [],
    penaltySaves: [],
  });

  const fetchPlayers = async (tournamentId, franchiseId) => {
    try {
      console.log("Fetching players...", tournamentId, franchiseId);
      const response = await api.get(
        `/players/${tournamentId}/franchises/${franchiseId}/players`
      );
      if (response.data && response.data.players) {
        setPlayers(response.data.players);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
      Alert.alert("Error", "Failed to fetch players. Please try again.");
    }
  };

  const handleFranchiseSelect = (franchiseId) => {
    setSelectedFranchise(franchiseId);
    console.log(tournament);
    fetchPlayers(tournament._id, franchiseId);
    setShowForm(true);
  };

  const handleInputChange = (name, value) => {
    setMatchDetails({ ...matchDetails, [name]: value });
  };

  const handleSave = async () => {
    try {
      const response = await api.post("/matchDetails/add", matchDetails);
      if (response.data && response.data.success) {
        Alert.alert("Success", "Match details added successfully!");
        router.back();
      } else {
        Alert.alert("Error", "Failed to add match details. Please try again.");
      }
    } catch (error) {
      console.error("Error adding match details:", error);
      Alert.alert("Error", "Failed to add match details. Please try again.");
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-gray-900 p-4">
      <StyledView className="w-full flex-row justify-between items-center mb-6">
        <StyledText className="text-white text-xl font-bold px-4 pt-4">
          Add Match Details
        </StyledText>
      </StyledView>
      <ScrollView className="mt-6">
        {!showForm ? (
          <StyledView className="w-full mb-4">
            <StyledText className="text-white mb-2">Franchise</StyledText>
            <StyledView className="bg-gray-800 rounded-lg">
              <Picker
                selectedValue={selectedFranchise}
                onValueChange={(itemValue) => handleFranchiseSelect(itemValue)}
                style={{ color: "white" }}
                itemStyle={{ color: "white" }}
              >
                <Picker.Item
                  style={styles.pickerItem}
                  label="Select a franchise..."
                  value=""
                />
                {tournament?.franchises?.map((franchise) => (
                  <Picker.Item
                    style={styles.pickerItem}
                    key={franchise._id}
                    label={franchise.name}
                    value={franchise._id}
                  />
                ))}
              </Picker>
            </StyledView>
          </StyledView>
        ) : (
          <StyledView
            className="mb-4 p-6 bg-gray-800 rounded-lg"
            style={{ marginHorizontal: 16 }}
          >
            <StyledText className="text-white text-lg font-bold mb-2">
              Match Information
            </StyledText>
            <StyledTextInput
              className="bg-gray-700 text-white p-2 rounded-lg mb-4"
              placeholder="Match Number"
              placeholderTextColor="#888"
              onChangeText={(text) => handleInputChange("matchNumber", text)}
              value={matchDetails.matchNumber}
            />
            <StyledTextInput
              className="bg-gray-700 text-white p-2 rounded-lg mb-4"
              placeholder="Match Name"
              placeholderTextColor="#888"
              onChangeText={(text) => handleInputChange("matchName", text)}
              value={matchDetails.matchName}
            />
            <StyledTextInput
              className="bg-gray-700 text-white p-2 rounded-lg mb-4"
              placeholder="Score (e.g., 2-1)"
              placeholderTextColor="#888"
              onChangeText={(text) => handleInputChange("score", text)}
              value={matchDetails.score}
            />

            {/* Add inputs for players, goals, cards, penalties, etc. */}

            <StyledTouchableOpacity
              className="mt-4 bg-green-500 p-3 rounded-lg"
              onPress={handleSave}
            >
              <StyledText className="text-white text-center font-bold">
                Save
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        )}
      </ScrollView>
    </StyledSafeAreaView>
  );
}

const styles = StyleSheet.create({
  pickerItem: {
    color: "white",
  },
});
