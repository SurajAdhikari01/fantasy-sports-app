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
  Modal,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { styled } from "nativewind";
import { useRouter, useLocalSearchParams } from "expo-router";
import api from "../config/axios";

// Styling container with NativeWind
const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

// Card component to display selected players
const PlayerCard = ({ playerName }) => (
  <View style={styles.card}>
    <Text style={styles.cardText}>{playerName}</Text>
  </View>
);

export default function AddMatchDetail() {
  const { tournament: tournamentParam } = useLocalSearchParams();
  const tournament = JSON.parse(tournamentParam || "{}");
  const router = useRouter();

  const [selectedFranchise, setSelectedFranchise] = useState("");
  const [players, setPlayers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalField, setModalField] = useState("");
  const [modalGoalIndex, setModalGoalIndex] = useState(null);
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

  useEffect(() => {
    if (tournament._id && selectedFranchise) {
      fetchPlayers(tournament._id, selectedFranchise);
    }
  }, [selectedFranchise]);

  const fetchPlayers = async (tournamentId, franchiseId) => {
    try {
      const response = await api.get(
        `/players/${tournamentId}/franchises/${franchiseId}/players`
      );
      if (response.data && response.data.data) {
        setPlayers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
      Alert.alert("Error", "Failed to fetch players. Please try again.");
    }
  };

  const handleFranchiseSelect = (franchiseId) => {
    setSelectedFranchise(franchiseId);
    setShowForm(true);
  };

  const handleInputChange = (name, value) => {
    setMatchDetails((prevDetails) => ({
      ...prevDetails,
      [name]: name === "matchNumber" ? parseInt(value) : value,
    }));
  };

  const handleModalOpen = (field, index = null) => {
    setModalField(field);
    setModalGoalIndex(index);
    setShowModal(true);
  };

  const handlePlayerSelect = (playerId) => {
    if (modalField === "goalsScoredBy") {
      setMatchDetails((prevDetails) => ({
        ...prevDetails,
        goalsScoredBy: [
          ...prevDetails.goalsScoredBy,
          { player: playerId, goals: 1, assists: [] }, // Initialize assists as empty array
        ],
      }));
    } else if (modalField === "assists") {
      setMatchDetails((prevDetails) => {
        const updatedGoals = [...prevDetails.goalsScoredBy];
        if (updatedGoals[modalGoalIndex]) {
          // Ensure assists array exists
          if (!updatedGoals[modalGoalIndex].assists) {
            updatedGoals[modalGoalIndex].assists = [];
          }
          // Add the assist
          updatedGoals[modalGoalIndex].assists.push(playerId);
        }
        return {
          ...prevDetails,
          goalsScoredBy: updatedGoals,
        };
      });
    } else if (modalField.startsWith("cardsObtained.")) {
      // Handle nested fields like cardsObtained.yellow and cardsObtained.red
      const [parentField, subField] = modalField.split(".");
      setMatchDetails((prevDetails) => ({
        ...prevDetails,
        [parentField]: {
          ...prevDetails[parentField],
          [subField]: [...(prevDetails[parentField][subField] || []), playerId],
        },
      }));
    } else {
      // Handle top-level fields
      setMatchDetails((prevDetails) => ({
        ...prevDetails,
        [modalField]: [...(prevDetails[modalField] || []), playerId],
      }));
    }
    setShowModal(false);
  };

  const handleGoalsScoredByChange = (index, field, value) => {
    const updatedGoals = [...matchDetails.goalsScoredBy];
    if (updatedGoals[index]) {
      updatedGoals[index] = { ...updatedGoals[index], [field]: value };
    }
    setMatchDetails({ ...matchDetails, goalsScoredBy: updatedGoals });
  };

  const handleAddField = (field, index = null) => {
    handleModalOpen(field, index);
  };

  const handleSave = async () => {
    try {
      // Validate goalsScoredBy data
      const validatedGoals = matchDetails.goalsScoredBy.map((goal) => ({
        ...goal,
        assists: Array.isArray(goal.assists) ? goal.assists : [],
        goals: parseInt(goal.goals) || 0,
      }));

      const dataToSave = {
        ...matchDetails,
        goalsScoredBy: validatedGoals,
      };

      console.log("Saving match details:", JSON.stringify(dataToSave, null, 2));
      const response = await api.post("/matchDetails/add", dataToSave);

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

  // Helper function to get player name by ID
  const getPlayerNameById = (playerId) => {
    const player = players.find((player) => player._id === playerId);
    return player ? player.name : "";
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
              value={matchDetails.matchNumber.toString()}
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

            <StyledText className="text-white mb-2">
              Players Played Team 1
            </StyledText>
            {matchDetails.playersPlayedTeam1.map((playerId, index) => (
              <StyledView key={index} className="mb-4">
                <PlayerCard playerName={getPlayerNameById(playerId)} />
              </StyledView>
            ))}
            <StyledTouchableOpacity
              className="bg-blue-500 p-2 rounded-lg mb-4"
              onPress={() => handleAddField("playersPlayedTeam1")}
            >
              <StyledText className="text-white text-center">
                Add Player to Team 1
              </StyledText>
            </StyledTouchableOpacity>

            <StyledText className="text-white mb-2">
              Players Played Team 2
            </StyledText>
            {matchDetails.playersPlayedTeam2.map((playerId, index) => (
              <StyledView key={index} className="mb-4">
                <PlayerCard playerName={getPlayerNameById(playerId)} />
              </StyledView>
            ))}
            <StyledTouchableOpacity
              className="bg-blue-500 p-2 rounded-lg mb-4"
              onPress={() => handleAddField("playersPlayedTeam2")}
            >
              <StyledText className="text-white text-center">
                Add Player to Team 2
              </StyledText>
            </StyledTouchableOpacity>

            <StyledText className="text-white mb-2">Goals Scored By</StyledText>
            {matchDetails.goalsScoredBy.map((goal, index) => (
              <StyledView key={index} className="mb-4">
                <PlayerCard playerName={getPlayerNameById(goal.player)} />
                <StyledTextInput
                  className="bg-gray-700 text-white p-2 rounded-lg mb-2"
                  placeholder="Goals"
                  placeholderTextColor="#888"
                  onChangeText={(text) =>
                    handleGoalsScoredByChange(index, "goals", parseInt(text))
                  }
                  value={goal.goals?.toString()}
                />
                <StyledText className="text-white mb-2">Assists</StyledText>
                {Array.isArray(goal.assists) &&
                  goal.assists.map((assistId, assistIndex) => (
                    <PlayerCard
                      key={assistIndex}
                      playerName={getPlayerNameById(assistId)}
                    />
                  ))}
                <StyledTouchableOpacity
                  className="bg-blue-500 p-2 rounded-lg mb-4"
                  onPress={() => handleAddField("assists", index)}
                >
                  <StyledText className="text-white text-center">
                    Add Assist
                  </StyledText>
                </StyledTouchableOpacity>
              </StyledView>
            ))}
            <StyledTouchableOpacity
              className="bg-blue-500 p-2 rounded-lg mb-4"
              onPress={() => handleAddField("goalsScoredBy")}
            >
              <StyledText className="text-white text-center">
                Add Goal
              </StyledText>
            </StyledTouchableOpacity>

            <StyledText className="text-white mb-2">Yellow Cards</StyledText>
            {matchDetails.cardsObtained.yellow.map((playerId, index) => (
              <StyledView key={index} className="mb-4">
                <PlayerCard playerName={getPlayerNameById(playerId)} />
              </StyledView>
            ))}
            <StyledTouchableOpacity
              className="bg-blue-500 p-2 rounded-lg mb-4"
              onPress={() => handleAddField("cardsObtained.yellow")}
            >
              <StyledText className="text-white text-center">
                Add Yellow Card
              </StyledText>
            </StyledTouchableOpacity>

            <StyledText className="text-white mb-2">Red Cards</StyledText>
            {matchDetails.cardsObtained.red.map((playerId, index) => (
              <StyledView key={index} className="mb-4">
                <PlayerCard playerName={getPlayerNameById(playerId)} />
              </StyledView>
            ))}
            <StyledTouchableOpacity
              className="bg-blue-500 p-2 rounded-lg mb-4"
              onPress={() => handleAddField("cardsObtained.red")}
            >
              <StyledText className="text-white text-center">
                Add Red Card
              </StyledText>
            </StyledTouchableOpacity>

            <StyledText className="text-white mb-2">
              Penalties Missed
            </StyledText>
            {matchDetails.penaltiesMissed.map((playerId, index) => (
              <StyledView key={index} className="mb-4">
                <PlayerCard playerName={getPlayerNameById(playerId)} />
              </StyledView>
            ))}
            <StyledTouchableOpacity
              className="bg-blue-500 p-2 rounded-lg mb-4"
              onPress={() => handleAddField("penaltiesMissed")}
            >
              <StyledText className="text-white text-center">
                Add Penalty Missed
              </StyledText>
            </StyledTouchableOpacity>

            <StyledText className="text-white mb-2">Own Goals</StyledText>
            {matchDetails.ownGoals.map((playerId, index) => (
              <StyledView key={index} className="mb-4">
                <PlayerCard playerName={getPlayerNameById(playerId)} />
              </StyledView>
            ))}
            <StyledTouchableOpacity
              className="bg-blue-500 p-2 rounded-lg mb-4"
              onPress={() => handleAddField("ownGoals")}
            >
              <StyledText className="text-white text-center">
                Add Own Goal
              </StyledText>
            </StyledTouchableOpacity>

            <StyledText className="text-white mb-2">Penalty Saves</StyledText>
            {matchDetails.penaltySaves.map((playerId, index) => (
              <StyledView key={index} className="mb-4">
                <PlayerCard playerName={getPlayerNameById(playerId)} />
              </StyledView>
            ))}
            <StyledTouchableOpacity
              className="bg-blue-500 p-2 rounded-lg mb-4"
              onPress={() => handleAddField("penaltySaves")}
            >
              <StyledText className="text-white text-center">
                Add Penalty Save
              </StyledText>
            </StyledTouchableOpacity>

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

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Player</Text>
            <FlatList
              data={players}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handlePlayerSelect(item._id)}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </StyledSafeAreaView>
  );
}

const styles = StyleSheet.create({
  pickerItem: {
    color: "white",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  modalItemText: {
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardText: {
    color: "white",
    fontSize: 16,
  },
});
