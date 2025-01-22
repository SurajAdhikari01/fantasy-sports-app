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
import Icon from "react-native-vector-icons/FontAwesome";

// Styling container with NativeWind
const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

// Card component to display selected players
const PlayerCard = ({ playerName }) => (
  <StyledView className="bg-gray-700 p-2 rounded-lg mb-2">
    <StyledText className="text-white">{playerName}</StyledText>
  </StyledView>
);

// Helper function to get player name by ID
const getPlayerNameById = (playerId, players) => {
  const player = players.find((player) => player._id === playerId);
  return player ? player.name : "";
};

// Event component to display timeline events with icons
const Event = ({ event, players, team }) => (
  <StyledView
    className={`bg-gray-800 p-2 rounded-lg mb-2 ${
      team === 1 ? "self-start" : "self-end"
    } flex-row items-center`}
  >
    <Icon
      name={
        event.type === "goal"
          ? "soccer-ball-o"
          : event.type === "yellowCard"
          ? "square"
          : event.type === "redCard"
          ? "square"
          : event.type === "penaltyMissed"
          ? "times-circle"
          : event.type === "ownGoal"
          ? "soccer-ball-o"
          : event.type === "penaltySave"
          ? "hand-paper-o"
          : ""
      }
      size={20}
      color={
        event.type === "goal"
          ? "white"
          : event.type === "yellowCard"
          ? "yellow"
          : event.type === "redCard"
          ? "red"
          : event.type === "penaltyMissed"
          ? "white"
          : event.type === "ownGoal"
          ? "white"
          : event.type === "penaltySave"
          ? "white"
          : "white"
      }
      style={{ marginRight: 10 }}
    />
    <StyledText className="text-white">
      {event.type === "goal" &&
        `Goal by ${getPlayerNameById(event.player, players)}` +
          (event.assist
            ? ` (Assist by ${getPlayerNameById(event.assist, players)})`
            : "")}
      {event.type === "yellowCard" &&
        `Yellow Card for ${getPlayerNameById(event.player, players)}`}
      {event.type === "redCard" &&
        `Red Card for ${getPlayerNameById(event.player, players)}`}
      {event.type === "penaltyMissed" &&
        `Penalty Missed by ${getPlayerNameById(event.player, players)}`}
      {event.type === "ownGoal" &&
        `Own Goal by ${getPlayerNameById(event.player, players)}`}
      {event.type === "penaltySave" &&
        `Penalty Save by ${getPlayerNameById(event.player, players)}`}
    </StyledText>
  </StyledView>
);

export default function AddMatchDetail() {
  const { tournament: tournamentParam } = useLocalSearchParams();
  const tournament = JSON.parse(tournamentParam || "{}");
  const router = useRouter();

  const [selectedFranchise1, setSelectedFranchise1] = useState("");
  const [selectedFranchise2, setSelectedFranchise2] = useState("");
  const [playersFranchise1, setPlayersFranchise1] = useState([]);
  const [playersFranchise2, setPlayersFranchise2] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [modalEventType, setModalEventType] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedGoalScorer, setSelectedGoalScorer] = useState(null);
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
    events: [],
  });

  useEffect(() => {
    if (selectedFranchise1) {
      fetchPlayers(selectedFranchise1, setPlayersFranchise1);
    }
  }, [selectedFranchise1]);

  useEffect(() => {
    if (selectedFranchise2) {
      fetchPlayers(selectedFranchise2, setPlayersFranchise2);
    }
  }, [selectedFranchise2]);

  const fetchPlayers = async (franchiseId, setPlayers) => {
    try {
      const response = await api.get(
        `/players/${tournament._id}/franchises/${franchiseId}/players`
      );
      if (response.data && response.data.data) {
        setPlayers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
      Alert.alert("Error", "Failed to fetch players. Please try again.");
    }
  };

  const handleFranchiseSelect = () => {
    if (selectedFranchise1 && selectedFranchise2) {
      setShowForm(true);
    }
  };

  const handleInputChange = (name, value) => {
    setMatchDetails((prevDetails) => ({
      ...prevDetails,
      [name]: name === "matchNumber" ? parseInt(value) : value,
    }));
  };

  const handleModalOpen = (field, team) => {
    setModalEventType(field);
    setSelectedTeam(team);
    setModalStep(field.startsWith("playersPlayed") ? 3 : 1);
    setShowModal(true);
  };

  const handleEventSelect = (eventType) => {
    setModalEventType(eventType);
    setModalStep(2);
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setModalStep(3);
  };

  const handlePlayerSelect = (playerId) => {
    if (modalEventType.startsWith("playersPlayed")) {
      setMatchDetails((prevDetails) => ({
        ...prevDetails,
        [modalEventType]: [...prevDetails[modalEventType], playerId],
      }));
    } else if (modalEventType === "goal") {
      if (modalStep === 3) {
        setSelectedGoalScorer(playerId);
        setModalStep(4);
      } else if (modalStep === 4) {
        const event = {
          type: modalEventType,
          player: selectedGoalScorer,
          team: selectedTeam,
          assist: playerId,
        };
        setMatchDetails((prevDetails) => ({
          ...prevDetails,
          events: [...prevDetails.events, event],
        }));
        setShowModal(false);
      }
    } else {
      const event = {
        type: modalEventType,
        player: playerId,
        team: selectedTeam,
      };
      setMatchDetails((prevDetails) => ({
        ...prevDetails,
        events: [...prevDetails.events, event],
      }));
      setShowModal(false);
    }
  };

  const calculateScore = () => {
    const team1Goals = matchDetails.events.filter(
      (event) => event.type === "goal" && event.team === 1
    ).length;
    const team2Goals = matchDetails.events.filter(
      (event) => event.type === "goal" && event.team === 2
    ).length;
    const team1OwnGoals = matchDetails.events.filter(
      (event) => event.type === "ownGoal" && event.team === 1
    ).length;
    const team2OwnGoals = matchDetails.events.filter(
      (event) => event.type === "ownGoal" && event.team === 2
    ).length;
    return `${team1Goals + team2OwnGoals}-${team2Goals + team1OwnGoals}`;
  };

  const handleSave = async () => {
    try {
      const updatedMatchDetails = {
        ...matchDetails,
        score: calculateScore(),
        goalsScoredBy: matchDetails.events
          .filter((event) => event.type === "goal")
          .map((event) => ({
            player: event.player,
            goals: 1,
            assists: event.assist ? [event.assist] : [],
          })),
        cardsObtained: {
          yellow: matchDetails.events
            .filter((event) => event.type === "yellowCard")
            .map((event) => event.player),
          red: matchDetails.events
            .filter((event) => event.type === "redCard")
            .map((event) => event.player),
        },
        penaltiesMissed: matchDetails.events
          .filter((event) => event.type === "penaltyMissed")
          .map((event) => event.player),
        ownGoals: matchDetails.events
          .filter((event) => event.type === "ownGoal")
          .map((event) => event.player),
        penaltySaves: matchDetails.events
          .filter((event) => event.type === "penaltySave")
          .map((event) => event.player),
      };

      console.log(
        "Saving match details:",
        JSON.stringify(updatedMatchDetails, null, 2)
      );

      const response = await api.post("/matchDetails/add", updatedMatchDetails);

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
          <StyledView>
            <StyledView className="w-full mb-4">
              <StyledText className="text-white mb-2">Franchise 1</StyledText>
              <StyledView className="bg-gray-800 rounded-lg">
                <Picker
                  selectedValue={selectedFranchise1}
                  onValueChange={(itemValue) =>
                    setSelectedFranchise1(itemValue)
                  }
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
            <StyledView className="w-full mb-4">
              <StyledText className="text-white mb-2">Franchise 2</StyledText>
              <StyledView className="bg-gray-800 rounded-lg">
                <Picker
                  selectedValue={selectedFranchise2}
                  onValueChange={(itemValue) =>
                    setSelectedFranchise2(itemValue)
                  }
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
            <StyledTouchableOpacity
              className="bg-blue-500 p-2 rounded-lg mb-4"
              onPress={handleFranchiseSelect}
            >
              <StyledText className="text-white text-center">
                Continue
              </StyledText>
            </StyledTouchableOpacity>
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
            <StyledText className="text-white mb-2">Score</StyledText>
            <StyledText className="bg-gray-700 text-white p-2 rounded-lg mb-4">
              {calculateScore()}
            </StyledText>

            <StyledText className="text-white mb-2">
              Players Played Team 1
            </StyledText>
            {matchDetails.playersPlayedTeam1.map((playerId, index) => (
              <StyledView key={index} className="mb-4">
                <PlayerCard
                  playerName={getPlayerNameById(playerId, playersFranchise1)}
                />
              </StyledView>
            ))}
            <StyledTouchableOpacity
              className="bg-blue-500 p-2 rounded-lg mb-4"
              onPress={() => handleModalOpen("playersPlayedTeam1", 1)}
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
                <PlayerCard
                  playerName={getPlayerNameById(playerId, playersFranchise2)}
                />
              </StyledView>
            ))}
            <StyledTouchableOpacity
              className="bg-blue-500 p-2 rounded-lg mb-4"
              onPress={() => handleModalOpen("playersPlayedTeam2", 2)}
            >
              <StyledText className="text-white text-center">
                Add Player to Team 2
              </StyledText>
            </StyledTouchableOpacity>

            <StyledText className="text-white mb-2">Match Events</StyledText>
            <StyledTouchableOpacity
              className="bg-blue-500 p-2 rounded-lg mb-4"
              onPress={() => handleModalOpen("events", null)}
            >
              <StyledText className="text-white text-center">
                Add Event
              </StyledText>
            </StyledTouchableOpacity>

            <StyledText className="text-white mb-2">Timeline</StyledText>
            {matchDetails.events.map((event, index) => (
              <Event
                key={index}
                event={event}
                players={
                  event.team === 1 ? playersFranchise1 : playersFranchise2
                }
                team={event.team}
              />
            ))}
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
            {modalStep === 1 && (
              <>
                <Text style={styles.modalTitle}>Select Event Type</Text>
                <StyledTouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleEventSelect("goal")}
                >
                  <Text style={styles.modalItemText}>Goal</Text>
                </StyledTouchableOpacity>
                <StyledTouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleEventSelect("yellowCard")}
                >
                  <Text style={styles.modalItemText}>Yellow Card</Text>
                </StyledTouchableOpacity>
                <StyledTouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleEventSelect("redCard")}
                >
                  <Text style={styles.modalItemText}>Red Card</Text>
                </StyledTouchableOpacity>
                <StyledTouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleEventSelect("penaltyMissed")}
                >
                  <Text style={styles.modalItemText}>Penalty Missed</Text>
                </StyledTouchableOpacity>
                <StyledTouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleEventSelect("ownGoal")}
                >
                  <Text style={styles.modalItemText}>Own Goal</Text>
                </StyledTouchableOpacity>
                <StyledTouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleEventSelect("penaltySave")}
                >
                  <Text style={styles.modalItemText}>Penalty Save</Text>
                </StyledTouchableOpacity>
              </>
            )}
            {modalStep === 2 && (
              <>
                <Text style={styles.modalTitle}>Select Team</Text>
                <StyledTouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleTeamSelect(1)}
                >
                  <Text style={styles.modalItemText}>Team 1</Text>
                </StyledTouchableOpacity>
                <StyledTouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleTeamSelect(2)}
                >
                  <Text style={styles.modalItemText}>Team 2</Text>
                </StyledTouchableOpacity>
              </>
            )}
            {modalStep === 3 && (
              <>
                <Text style={styles.modalTitle}>Select Goal Scorer</Text>
                <FlatList
                  data={
                    selectedTeam === 1 ? playersFranchise1 : playersFranchise2
                  }
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
              </>
            )}
            {modalStep === 4 && (
              <>
                <Text style={styles.modalTitle}>Select Assister</Text>
                <FlatList
                  data={
                    selectedTeam === 1 ? playersFranchise1 : playersFranchise2
                  }
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
              </>
            )}
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
});
