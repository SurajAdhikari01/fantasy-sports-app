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

/*
  This updated version:
  1. Keeps track of players actually selected for the match (so they aren't shown again in selection).
  2. Maintains separate "in-game" arrays for each team to exclude red-carded players from future events.
  3. Filters the player pickers to exclude already-selected players or players who have been sent off.
*/

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
  const player = players.find((p) => p._id === playerId);
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
          : "white"
      }
      style={{ marginRight: 10 }}
    />
    <StyledText className="text-white">
      {event.type === "goal" &&
        `Goal by ${getPlayerNameById(event.player, players)}` +
          (event.assist
            ? ` (Assist: ${getPlayerNameById(event.assist, players)})`
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

  // Franchise picks
  const [selectedFranchise1, setSelectedFranchise1] = useState("");
  const [selectedFranchise2, setSelectedFranchise2] = useState("");

  // Players from each franchise (all possible players)
  const [playersFranchise1, setPlayersFranchise1] = useState([]);
  const [playersFranchise2, setPlayersFranchise2] = useState([]);

  // For showing/hiding steps
  const [showForm, setShowForm] = useState(false);

  // Modal and event management
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [modalEventType, setModalEventType] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedGoalScorer, setSelectedGoalScorer] = useState(null);

  /*
    matchDetails: 
      - playersPlayedTeam1, playersPlayedTeam2: who is on each team's roster
      - events: contains event objects with {type, player, (assist), team}
  */
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
    ownGoals: [],
    penaltySaves: [],
    events: [],
    tournament_id: tournament._id,
  });

  /*
    Keep track of who is currently in the game. After a red card, remove that player 
    from this in-game tracker so they're excluded from further events.
  */
  const [inGameTeam1, setInGameTeam1] = useState([]);
  const [inGameTeam2, setInGameTeam2] = useState([]);

  // Fetch players whenever a franchise is chosen
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

  // Load players from the server
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

  // Move to the main form once both franchises are selected
  const handleFranchiseSelect = () => {
    if (selectedFranchise1 && selectedFranchise2) {
      setShowForm(true);
    } else {
      Alert.alert("Error", "Please select both franchises first.");
    }
  };

  // General input handling
  const handleInputChange = (name, value) => {
    setMatchDetails((prevDetails) => ({
      ...prevDetails,
      [name]: name === "matchNumber" ? parseInt(value) || "" : value,
    }));
  };

  // Open modal to select players or events
  const handleModalOpen = (field, team) => {
    setModalEventType(field);
    setSelectedTeam(team);
    /*
      If we're adding to the "playersPlayedTeamX" array, 
      jump directly to picking from the 3rd step (player list).
    */
    if (field.startsWith("playersPlayed")) {
      setModalStep(3);
    } else {
      // Otherwise, event selection starts at step 1
      setModalStep(1);
    }
    setShowModal(true);
  };

  // Step 1: user picks event type
  const handleEventSelect = (eventType) => {
    setModalEventType(eventType);
    setModalStep(2); // Next step: pick the team
  };

  // Step 2: pick which team triggers the event
  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setModalStep(3); // Next step: pick the player(s)
  };

  /*
    Step 3/4: user picks the player or an assister for certain events.
    We'll do different logic depending on the event type and step.
  */
  const handlePlayerSelect = (playerId) => {
    if (modalEventType.startsWith("playersPlayed")) {
      // Add selected player to the chosen team's "playersPlayedTeamX" array
      setMatchDetails((prevDetails) => ({
        ...prevDetails,
        [modalEventType]: [...prevDetails[modalEventType], playerId],
      }));
      // Also add them to the in-game list for that team
      if (selectedTeam === 1) {
        setInGameTeam1((prev) => [...prev, playerId]);
      } else {
        setInGameTeam2((prev) => [...prev, playerId]);
      }
      setShowModal(false);
    } else if (modalEventType === "goal") {
      // If step is 3, user is choosing the scorer
      if (modalStep === 3) {
        setSelectedGoalScorer(playerId);
        setModalStep(4); // Next step: pick assister
      } else if (modalStep === 4) {
        // Now we have the scorer & assister
        const event = {
          type: modalEventType,
          player: selectedGoalScorer,
          assist: playerId,
          team: selectedTeam,
        };
        setMatchDetails((prevDetails) => ({
          ...prevDetails,
          events: [...prevDetails.events, event],
        }));
        setShowModal(false);
      }
    } else {
      // For any other event types (yellowCard, redCard, etc.)
      const event = {
        type: modalEventType,
        player: playerId,
        team: selectedTeam,
      };

      setMatchDetails((prevDetails) => ({
        ...prevDetails,
        events: [...prevDetails.events, event],
      }));

      // If it's a red card, remove the player from the in-game list
      if (modalEventType === "redCard") {
        if (selectedTeam === 1) {
          setInGameTeam1((prev) => prev.filter((id) => id !== playerId));
        } else {
          setInGameTeam2((prev) => prev.filter((id) => id !== playerId));
        }
      }

      setShowModal(false);
    }
  };

  /*
    Compute the match score from events. 
    Goal for team 1 counts to team1Goals, own goal for team 1 also benefits team1's score, etc.
    Adjusted so that "ownGoal" increments the opposing team's total.
  */
  const calculateScore = () => {
    const team1Goals = matchDetails.events.filter(
      (e) => e.type === "goal" && e.team === 1
    ).length;
    const team2Goals = matchDetails.events.filter(
      (e) => e.type === "goal" && e.team === 2
    ).length;

    const team1OwnGoals = matchDetails.events.filter(
      (e) => e.type === "ownGoal" && e.team === 1
    ).length;
    const team2OwnGoals = matchDetails.events.filter(
      (e) => e.type === "ownGoal" && e.team === 2
    ).length;

    // For own goals, the "team" is the team of the player who made the error,
    // but the score is awarded to the opposing team.
    // So team1's real score is team1Goals + team2OwnGoals (the own goals from the other team).
    // team2's real score is team2Goals + team1OwnGoals.
    return `${team1Goals + team2OwnGoals} - ${team2Goals + team1OwnGoals}`;
  };

  /*
    Save match details to the server. We also compute arrays like
    goalsScoredBy, cardsObtained, etc. from the event list.
  */
  const handleSave = async () => {
    try {
      const updatedMatchDetails = {
        ...matchDetails,
        score: calculateScore(),
        goalsScoredBy: matchDetails.events
          .filter((e) => e.type === "goal")
          .map((e) => ({
            player: e.player,
            goals: 1,
            assists: e.assist ? [e.assist] : [],
          })),
        cardsObtained: {
          yellow: matchDetails.events
            .filter((e) => e.type === "yellowCard")
            .map((e) => e.player),
          red: matchDetails.events
            .filter((e) => e.type === "redCard")
            .map((e) => e.player),
        },
        penaltiesMissed: matchDetails.events
          .filter((e) => e.type === "penaltyMissed")
          .map((e) => e.player),
        ownGoals: matchDetails.events
          .filter((e) => e.type === "ownGoal")
          .map((e) => e.player),
        penaltySaves: matchDetails.events
          .filter((e) => e.type === "penaltySave")
          .map((e) => e.player),
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

  /*
    Filter out already selected players from the display list for adding to the team's roster.
    Filter out already rostered players with red cards from the event pickers, etc.
  */
  const getAvailablePlayersForTeam = (team) => {
    // For the "add player to team" step, we skip players already chosen.
    // For team 1:
    if (team === 1) {
      return playersFranchise1.filter(
        (p) => !matchDetails.playersPlayedTeam1.includes(p._id)
      );
    }
    // For team 2:
    return playersFranchise2.filter(
      (p) => !matchDetails.playersPlayedTeam2.includes(p._id)
    );
  };

  // For events, we only want players who are currently "in game" for that team:
  const getInGamePlayersForTeam = (team) => {
    if (team === 1) {
      return playersFranchise1.filter((p) => inGameTeam1.includes(p._id));
    }
    return playersFranchise2.filter((p) => inGameTeam2.includes(p._id));
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-gray-900 p-4">
      <StyledView className="w-full flex-row justify-between items-center mb-6">
        <StyledText className="text-white text-xl font-bold px-4 pt-4">
          Add Match Details
        </StyledText>
      </StyledView>
      <ScrollView className="mt-6">
        {/* Franchise selection step */}
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
          /* Once both franchises are selected, show the match form */
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
              keyboardType="numeric"
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

            {/* Team 1 roster */}
            <StyledText className="text-white mb-2">
              Players Played (Team 1)
            </StyledText>
            {matchDetails.playersPlayedTeam1.map((playerId) => (
              <PlayerCard
                key={playerId}
                playerName={getPlayerNameById(playerId, playersFranchise1)}
              />
            ))}
            <StyledTouchableOpacity
              className="bg-blue-500 p-2 rounded-lg mb-4"
              onPress={() => handleModalOpen("playersPlayedTeam1", 1)}
            >
              <StyledText className="text-white text-center">
                Add Player to Team 1
              </StyledText>
            </StyledTouchableOpacity>

            {/* Team 2 roster */}
            <StyledText className="text-white mb-2">
              Players Played (Team 2)
            </StyledText>
            {matchDetails.playersPlayedTeam2.map((playerId) => (
              <PlayerCard
                key={playerId}
                playerName={getPlayerNameById(playerId, playersFranchise2)}
              />
            ))}
            <StyledTouchableOpacity
              className="bg-blue-500 p-2 rounded-lg mb-4"
              onPress={() => handleModalOpen("playersPlayedTeam2", 2)}
            >
              <StyledText className="text-white text-center">
                Add Player to Team 2
              </StyledText>
            </StyledTouchableOpacity>

            {/* Events Section */}
            <StyledText className="text-white mb-2">Match Events</StyledText>
            <StyledTouchableOpacity
              className="bg-blue-500 p-2 rounded-lg mb-4"
              onPress={() => handleModalOpen("events", null)}
            >
              <StyledText className="text-white text-center">
                Add Event
              </StyledText>
            </StyledTouchableOpacity>

            {/* Timeline display */}
            <StyledText className="text-white mb-2">Timeline</StyledText>
            {matchDetails.events.map((event, index) => (
              <Event
                key={index}
                event={event}
                // For display, we decide which team's array to use
                players={
                  event.team === 1 ? playersFranchise1 : playersFranchise2
                }
                team={event.team}
              />
            ))}

            {/* Save */}
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

      {/* Modal for selecting events, teams, players */}
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
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleEventSelect("goal")}
                >
                  <Text style={styles.modalItemText}>Goal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleEventSelect("yellowCard")}
                >
                  <Text style={styles.modalItemText}>Yellow Card</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleEventSelect("redCard")}
                >
                  <Text style={styles.modalItemText}>Red Card</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleEventSelect("penaltyMissed")}
                >
                  <Text style={styles.modalItemText}>Penalty Missed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleEventSelect("ownGoal")}
                >
                  <Text style={styles.modalItemText}>Own Goal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleEventSelect("penaltySave")}
                >
                  <Text style={styles.modalItemText}>Penalty Save</Text>
                </TouchableOpacity>
              </>
            )}

            {modalStep === 2 && (
              <>
                <Text style={styles.modalTitle}>Select Team</Text>
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleTeamSelect(1)}
                >
                  <Text style={styles.modalItemText}>Team 1</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleTeamSelect(2)}
                >
                  <Text style={styles.modalItemText}>Team 2</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Step 3 or 4: choose player(s) */}
            {(modalStep === 3 || modalStep === 4) && (
              <>
                {modalEventType.startsWith("playersPlayed") ? (
                  // Step to add roster (show unattached players)
                  <>
                    <Text style={styles.modalTitle}>
                      Select Player for Team {selectedTeam}
                    </Text>
                    <FlatList
                      data={getAvailablePlayersForTeam(selectedTeam)}
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
                ) : modalEventType === "goal" && modalStep === 3 ? (
                  // If picking the goal scorer (in-game players only)
                  <>
                    <Text style={styles.modalTitle}>Select Goal Scorer</Text>
                    <FlatList
                      data={getInGamePlayersForTeam(selectedTeam)}
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
                ) : modalEventType === "goal" && modalStep === 4 ? (
                  // If picking the assisting player (in-game players only)
                  <>
                    <Text style={styles.modalTitle}>Select Assister</Text>
                    <FlatList
                      data={getInGamePlayersForTeam(selectedTeam)}
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
                ) : (
                  // Other event types (yellowCard, redCard, penaltyMissed, etc.) => in-game players
                  <>
                    <Text style={styles.modalTitle}>Select Player</Text>
                    <FlatList
                      data={getInGamePlayersForTeam(selectedTeam)}
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
    // color: "white",
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
    maxHeight: "80%",
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
