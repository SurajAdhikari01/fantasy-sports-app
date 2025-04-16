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
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
// Removed Picker import
// import { Picker } from "@react-native-picker/picker";
import { styled } from "nativewind";
import { useRouter, useLocalSearchParams } from "expo-router";
import api from "../config/axios"; // Ensure path is correct
import Icon from "react-native-vector-icons/FontAwesome"; // Keep for event icons
// Removed unused navigate import
// import { navigate } from "expo-router/build/global-state/routing";
import { Ionicons } from "@expo/vector-icons"; // Keep for back button
import CustomDropdown from "./customDropdown"; // Ensure path is correct

/*
  This updated version:
  1. Applies consistent dark theme.
  2. Uses CustomDropdown for franchise selection.
  3. Improves styling for inputs, buttons, cards, timeline, and modal.
  4. Adds loading indicators and better error handling.
*/

// Styling container with NativeWind
const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

// Card component to display selected players - Themed
const PlayerCard = ({ playerName }) => (
  <StyledView className="bg-[#4a4a4a] p-2 rounded-md mb-2 mr-2 flex-row items-center border border-gray-600">
    <Icon name="user" size={14} color="#e5e7eb" style={{ marginRight: 6 }} />
    <StyledText className="text-gray-100 text-sm">{playerName}</StyledText>
  </StyledView>
);

// Helper function to get player name by ID
const getPlayerNameById = (playerId, players) => {
  const player = players?.find((p) => p._id === playerId); // Add safe navigation
  return player ? player.name : "Unknown Player";
};

// Event component to display timeline events with icons - Themed
const Event = ({ event, playersTeam1, playersTeam2 }) => {
  // Determine correct player list based on the team involved in the event
  const players = event.team === 1 ? playersTeam1 : playersTeam2;
  const eventPlayerName = getPlayerNameById(event.player, players);
  const assistPlayerName = event.assist
    ? getPlayerNameById(event.assist, players)
    : "";

  let iconName = "";
  let iconColor = "#e5e7eb"; // Default white/light gray
  let eventText = "";
  let cardBg = "bg-[#3a3a3a]"; // Default background

  switch (event.type) {
    case "goal":
      iconName = "soccer-ball-o"; // FontAwesome
      eventText = `Goal: ${eventPlayerName}`;
      if (assistPlayerName) {
        eventText += ` (Assist: ${assistPlayerName})`;
      }
      cardBg = "bg-green-800/60 border border-green-700"; // Greenish tint for goal
      break;
    case "yellowCard":
      iconName = "square"; // FontAwesome
      iconColor = "#facc15"; // Tailwind yellow-400
      eventText = `Yellow Card: ${eventPlayerName}`;
      cardBg = "bg-yellow-800/50 border border-yellow-700";
      break;
    case "redCard":
      iconName = "square"; // FontAwesome
      iconColor = "#ef4444"; // Tailwind red-500
      eventText = `Red Card: ${eventPlayerName}`;
      cardBg = "bg-red-800/50 border border-red-700";
      break;
    case "penaltyMissed":
      iconName = "times-circle"; // FontAwesome
      eventText = `Penalty Missed: ${eventPlayerName}`;
      cardBg = "bg-orange-800/50 border border-orange-700";
      break;
    case "ownGoal":
      iconName = "soccer-ball-o"; // FontAwesome
      iconColor = "#f97316"; // Tailwind orange-500
      eventText = `Own Goal: ${eventPlayerName}`;
      cardBg = "bg-orange-800/60 border border-orange-700";
      break;
    case "penaltySave":
      iconName = "hand-paper-o"; // FontAwesome
      eventText = `Penalty Save: ${eventPlayerName}`;
      cardBg = "bg-cyan-800/60 border border-cyan-700";
      break;
    default:
      iconName = "question-circle"; // FontAwesome
      eventText = `Unknown event: ${event.type}`;
  }

  return (
    <StyledView
      className={`p-2.5 rounded-lg mb-2 ${cardBg} ${
        // Use dynamic background
        event.team === 1 ? "self-start mr-10" : "self-end ml-10"
      } flex-row items-center max-w-[80%]`}
    >
      <Icon
        name={iconName}
        size={18}
        color={iconColor}
        style={{ marginRight: 8 }}
      />
      <StyledText className="text-gray-100 text-sm flex-shrink">
        {eventText}
      </StyledText>
    </StyledView>
  );
};

export default function AddMatchDetail() {
  const { tournament: tournamentParam } = useLocalSearchParams();
  let tournament = {};
  try {
    tournament = tournamentParam ? JSON.parse(tournamentParam) : {};
  } catch (e) {
    console.error("Error parsing tournament data:", e);
    Alert.alert("Error", "Invalid tournament data received.");
  }
  const router = useRouter();

  // Franchise state
  const [selectedFranchise1, setSelectedFranchise1] = useState(null);
  const [selectedFranchise2, setSelectedFranchise2] = useState(null);
  const [franchiseName1, setFranchiseName1] = useState("");
  const [franchiseName2, setFranchiseName2] = useState("");

  // Player state
  const [playersFranchise1, setPlayersFranchise1] = useState([]);
  const [playersFranchise2, setPlayersFranchise2] = useState([]);
  const [loadingPlayers1, setLoadingPlayers1] = useState(false);
  const [loadingPlayers2, setLoadingPlayers2] = useState(false);

  // UI state
  const [showForm, setShowForm] = useState(false); // Controls view: selection vs form

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1:Event, 2:Team, 3:Player, 4:Assist
  const [modalEventType, setModalEventType] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null); // 1 or 2
  const [selectedGoalScorer, setSelectedGoalScorer] = useState(null);

  // Match details state
  const [matchDetails, setMatchDetails] = useState({
    matchNumber: "",
    matchName: "",
    playersPlayedTeam1: [],
    playersPlayedTeam2: [],
    score: "0 - 0",
    // Aggregated fields below are calculated on save
    goalsScoredBy: [],
    cardsObtained: { yellow: [], red: [] },
    penaltiesMissed: [],
    ownGoals: [],
    penaltySaves: [],
    events: [], // Main timeline of events
    tournament_id: tournament?._id || null,
  });

  // In-game player tracking state
  const [inGameTeam1, setInGameTeam1] = useState([]);
  const [inGameTeam2, setInGameTeam2] = useState([]);

  // --- Effects ---
  useEffect(() => {
    if (selectedFranchise1 && tournament?._id) {
      fetchPlayers(
        selectedFranchise1,
        setPlayersFranchise1,
        setLoadingPlayers1
      );
      const fran = tournament.franchises?.find(
        (f) => f._id === selectedFranchise1
      );
      setFranchiseName1(fran?.name || "Team 1");
    } else {
      setPlayersFranchise1([]);
      setFranchiseName1("");
    }
  }, [selectedFranchise1, tournament?._id]);

  useEffect(() => {
    if (selectedFranchise2 && tournament?._id) {
      fetchPlayers(
        selectedFranchise2,
        setPlayersFranchise2,
        setLoadingPlayers2
      );
      const fran = tournament.franchises?.find(
        (f) => f._id === selectedFranchise2
      );
      setFranchiseName2(fran?.name || "Team 2");
    } else {
      setPlayersFranchise2([]);
      setFranchiseName2("");
    }
  }, [selectedFranchise2, tournament?._id]);

  // Update score whenever events change
  useEffect(() => {
    const newScore = calculateScore();
    // Prevent unnecessary re-renders if score hasn't changed
    if (newScore !== matchDetails.score) {
      setMatchDetails((prev) => ({ ...prev, score: newScore }));
    }
  }, [matchDetails.events]);

  // --- Data Fetching ---
  const fetchPlayers = async (franchiseId, setPlayers, setLoading) => {
    if (!tournament?._id || !franchiseId) return;
    setLoading(true);
    try {
      const response = await api.get(
        `/players/${tournament._id}/franchises/${franchiseId}/players`
      );
      if (response.data && Array.isArray(response.data.data)) {
        setPlayers(response.data.data);
      } else {
        setPlayers([]);
        console.warn(
          "No players data received or data is not an array:",
          response.data
        );
      }
    } catch (error) {
      console.error(
        `Error fetching players for franchise ${franchiseId}:`,
        error
      );
      Alert.alert(
        "Fetch Error",
        `Failed to load players for ${franchiseId}. Please try again.`
      );
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Navigation & UI Control ---
  const handleFranchiseSelectContinue = () => {
    if (selectedFranchise1 && selectedFranchise2) {
      if (selectedFranchise1 === selectedFranchise2) {
        Alert.alert(
          "Selection Error",
          "Please select two different franchises."
        );
        return;
      }
      // Reset details when entering form (important if user goes back and selects different teams)
      setMatchDetails((prev) => ({
        matchNumber: "",
        matchName: "",
        playersPlayedTeam1: [],
        playersPlayedTeam2: [],
        score: "0 - 0",
        events: [],
        tournament_id: tournament?._id || null,
        // Keep other calculated fields empty, they'll be rebuilt on save
        goalsScoredBy: [],
        cardsObtained: { yellow: [], red: [] },
        penaltiesMissed: [],
        ownGoals: [],
        penaltySaves: [],
      }));
      setInGameTeam1([]);
      setInGameTeam2([]);
      setShowForm(true); // Show the main form
    } else {
      Alert.alert(
        "Selection Missing",
        "Please select both competing franchises."
      );
    }
  };

  const handleBack = () => {
    if (showForm) {
      // Go back from form to franchise selection
      Alert.alert(
        "Go Back?",
        "Going back will clear current match details. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes, Go Back",
            style: "destructive",
            onPress: () => {
              setShowForm(false);
              // Optionally clear selections, or keep them for quick re-entry
              // setSelectedFranchise1(null);
              // setSelectedFranchise2(null);
            },
          },
        ]
      );
    } else {
      // Go back from franchise selection
      router.back();
    }
  };

  // --- Form Input Handling ---
  const handleInputChange = (name, value) => {
    setMatchDetails((prevDetails) => ({
      ...prevDetails,
      [name]: name === "matchNumber" ? value.replace(/[^0-9]/g, "") : value, // Allow only numbers for matchNumber
    }));
  };

  // --- Modal Logic ---
  const handleModalOpen = (actionType, team = null) => {
    setModalEventType(actionType);
    setSelectedTeam(team);
    setSelectedGoalScorer(null); // Reset temp state

    if (actionType.startsWith("playersPlayed")) {
      setModalStep(3); // Go direct to player selection for roster add
    } else {
      setModalStep(1); // Start event flow at step 1
    }
    setShowModal(true);
  };

  const handleEventSelect = (eventType) => {
    setModalEventType(eventType);
    setModalStep(2); // Go to Select Team
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setModalStep(3); // Go to Select Player
  };

  const handlePlayerSelect = (playerId) => {
    if (
      modalEventType === "playersPlayedTeam1" ||
      modalEventType === "playersPlayedTeam2"
    ) {
      setMatchDetails((prevDetails) => ({
        ...prevDetails,
        [modalEventType]: [...prevDetails[modalEventType], playerId],
      }));
      if (selectedTeam === 1) setInGameTeam1((prev) => [...prev, playerId]);
      else setInGameTeam2((prev) => [...prev, playerId]);
      setShowModal(false);
    } else if (modalEventType === "goal") {
      if (modalStep === 3) {
        // Selecting scorer
        setSelectedGoalScorer(playerId);
        setModalStep(4); // Go to select assister
      } else if (modalStep === 4) {
        // Selecting assister
        addEvent({
          type: "goal",
          player: selectedGoalScorer,
          assist: playerId,
          team: selectedTeam,
        });
        setShowModal(false);
      }
    } else if (modalEventType === "redCard") {
      addEvent({ type: "redCard", player: playerId, team: selectedTeam });
      // Remove from in-game list
      if (selectedTeam === 1)
        setInGameTeam1((prev) => prev.filter((id) => id !== playerId));
      else setInGameTeam2((prev) => prev.filter((id) => id !== playerId));
      setShowModal(false);
    } else {
      // Other single-player events
      addEvent({ type: modalEventType, player: playerId, team: selectedTeam });
      setShowModal(false);
    }
  };

  const handleSkipAssist = () => {
    if (modalEventType === "goal" && modalStep === 4 && selectedGoalScorer) {
      addEvent({
        type: "goal",
        player: selectedGoalScorer,
        assist: null,
        team: selectedTeam,
      });
      setShowModal(false);
    }
  };

  // Helper to add event and update state
  const addEvent = (newEvent) => {
    setMatchDetails((prevDetails) => ({
      ...prevDetails,
      events: [...prevDetails.events, newEvent],
    }));
  };

  // --- Score Calculation ---
  const calculateScore = () => {
    let team1Score = 0;
    let team2Score = 0;
    matchDetails.events.forEach((e) => {
      if (e.type === "goal") {
        if (e.team === 1) team1Score++;
        else if (e.team === 2) team2Score++;
      } else if (e.type === "ownGoal") {
        if (e.team === 1) team2Score++; // Own goal by Team 1 benefits Team 2
        else if (e.team === 2) team1Score++; // Own goal by Team 2 benefits Team 1
      }
    });
    return `${team1Score} - ${team2Score}`;
  };

  // --- Save Logic ---
  const handleSave = async () => {
    // --- Validation ---
    if (!matchDetails.matchNumber || !matchDetails.matchName.trim()) {
      Alert.alert(
        "Validation Error",
        "Please enter both Match Number and Match Name."
      );
      return;
    }
    if (
      matchDetails.playersPlayedTeam1.length === 0 ||
      matchDetails.playersPlayedTeam2.length === 0
    ) {
      Alert.alert(
        "Validation Error",
        "Please add players to both teams before saving."
      );
      return;
    }
    if (!matchDetails.tournament_id) {
      Alert.alert(
        "Save Error",
        "Tournament ID is missing. Cannot save match details."
      );
      return;
    }
    // --- End Validation ---

    // Calculate aggregated data just before saving
    const finalScore = calculateScore();
    const aggregatedGoals = matchDetails.events
      .filter((e) => e.type === "goal")
      .reduce((acc, e) => {
        const existing = acc.find((g) => g.player === e.player);
        if (existing) {
          existing.goals += 1;
          if (e.assist) existing.assists.push(e.assist);
        } else {
          acc.push({
            player: e.player,
            goals: 1,
            assists: e.assist ? [e.assist] : [],
          });
        }
        return acc;
      }, []);

    const finalMatchDetails = {
      ...matchDetails,
      score: finalScore,
      goalsScoredBy: aggregatedGoals,
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
      "Saving final match details:",
      JSON.stringify(finalMatchDetails, null, 2)
    );

    try {
      // Add loading indicator for save operation if needed
      const response = await api.post("/matchDetails/add", finalMatchDetails);
      if (response.data && response.data.success) {
        Alert.alert("Success", "Match details saved successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        throw new Error(
          response.data?.message || "Failed to save match details."
        );
      }
    } catch (error) {
      console.error(
        "Error saving match details:",
        error.response?.data || error.message || error
      );
      let errorMessage = "Failed to save match details. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert("Save Error", errorMessage);
    }
  };

  // --- Player List Filtering for Modals ---
  const getAvailablePlayersForRoster = (team) => {
    const players = team === 1 ? playersFranchise1 : playersFranchise2;
    const roster =
      team === 1
        ? matchDetails.playersPlayedTeam1
        : matchDetails.playersPlayedTeam2;
    return players.filter((p) => !roster.includes(p._id));
  };

  const getInGamePlayersForEvents = (team) => {
    const players = team === 1 ? playersFranchise1 : playersFranchise2;
    const inGameList = team === 1 ? inGameTeam1 : inGameTeam2;
    return players.filter((p) => inGameList.includes(p._id));
  };

  const getAvailableAssisters = (team, scorerId) => {
    const inGamePlayers = getInGamePlayersForEvents(team);
    return inGamePlayers.filter((p) => p._id !== scorerId);
  };

  // --- Dropdown Options ---
  const franchiseOptions =
    tournament?.franchises?.map((f) => ({
      label: f.name,
      value: f._id,
    })) || [];

  const franchiseOptions1 = franchiseOptions;
  const franchiseOptions2 = franchiseOptions.filter(
    (option) => option.value !== selectedFranchise1
  );

  // --- Render ---
  return (
    // Use consistent dark background
    <StyledSafeAreaView className="flex-1 bg-[#2a2a2a]">
      {/* Header */}
      <StyledView className="flex-row items-center px-4 py-4 mr-8 border-b border-gray-700/60">
        <TouchableOpacity onPress={handleBack} className="mr-3 p-1">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <StyledText className="text-xl text-white font-semibold">
          {showForm
            ? `Match: ${franchiseName1 || "T1"} vs ${franchiseName2 || "T2"}`
            : "Select Teams"}
        </StyledText>
      </StyledView>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Step 1: Franchise Selection */}
        {!showForm ? (
          <StyledView className="p-4 pt-6">
            <StyledText className="text-lg text-gray-300 font-medium mb-5 text-center">
              Select the two competing franchises.
            </StyledText>
            {/* Franchise 1 Dropdown */}
            <StyledView className="mb-5">
              <CustomDropdown
                label="Franchise 1 *"
                options={franchiseOptions1}
                selectedValue={selectedFranchise1}
                onValueChange={(value) => {
                  if (value === selectedFranchise2) {
                    Alert.alert(
                      "Selection Error",
                      "Cannot select the same franchise for both teams."
                    );
                  } else {
                    setSelectedFranchise1(value);
                  }
                }}
                placeholder="-- Select Team 1 --"
              />
              {loadingPlayers1 && (
                <ActivityIndicator color="#e5e7eb" style={{ marginTop: 5 }} />
              )}
            </StyledView>

            {/* Franchise 2 Dropdown */}
            <StyledView className="mb-6">
              <CustomDropdown
                label="Franchise 2 *"
                options={franchiseOptions2} // Filtered options
                selectedValue={selectedFranchise2}
                onValueChange={(value) => {
                  if (value === selectedFranchise1) {
                    Alert.alert(
                      "Selection Error",
                      "Cannot select the same franchise for both teams."
                    );
                  } else {
                    setSelectedFranchise2(value);
                  }
                }}
                placeholder="-- Select Team 2 --"
                disabled={!selectedFranchise1} // Disable until Team 1 selected
              />
              {loadingPlayers2 && (
                <ActivityIndicator color="#e5e7eb" style={{ marginTop: 5 }} />
              )}
            </StyledView>

            {/* Continue Button */}
            <StyledTouchableOpacity
              className={`py-3.5 rounded-lg ${
                selectedFranchise1 && selectedFranchise2
                  ? "bg-blue-600 shadow-md"
                  : "bg-gray-600"
              }`}
              onPress={handleFranchiseSelectContinue}
              disabled={
                !selectedFranchise1 ||
                !selectedFranchise2 ||
                loadingPlayers1 ||
                loadingPlayers2
              } // Disable while loading players
            >
              <StyledText className="text-white text-center font-bold text-base">
                Continue to Match Details
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        ) : (
          /* Step 2: Match Details Form */
          <StyledView className="p-4">
            {/* Match Info Section */}
            <StyledView className="mb-5 p-4 bg-[#3a3a3a] rounded-xl border border-gray-700">
              <StyledText className="text-white text-lg font-semibold mb-4">
                Match Information
              </StyledText>
              {/* Match Number */}
              <StyledView className="mb-3">
                <StyledText className="text-gray-300 mb-1 ml-1 text-sm">
                  Match Number *
                </StyledText>
                <StyledTextInput
                  className="bg-[#4a4a4a] text-white p-2.5 rounded-md border border-gray-600"
                  placeholder="e.g., 15"
                  placeholderTextColor="#777"
                  keyboardType="number-pad"
                  onChangeText={(text) =>
                    handleInputChange("matchNumber", text)
                  }
                  value={matchDetails.matchNumber.toString()}
                />
              </StyledView>
              {/* Match Name */}
              <StyledView className="mb-3">
                <StyledText className="text-gray-300 mb-1 ml-1 text-sm">
                  Match Name
                </StyledText>
                <StyledTextInput
                  className="bg-[#4a4a4a] text-white p-2.5 rounded-md border border-gray-600"
                  placeholder="e.g., Qualifier 1, Final"
                  placeholderTextColor="#777"
                  onChangeText={(text) => handleInputChange("matchName", text)}
                  value={matchDetails.matchName}
                />
              </StyledView>
              {/* Score Display */}
              <StyledView>
                <StyledText className="text-gray-300 mb-1 ml-1 text-sm">
                  Current Score
                </StyledText>
                <StyledView className="bg-[#4a4a4a] p-3 rounded-md border border-gray-600">
                  <StyledText className="text-white text-lg font-semibold text-center">
                    {franchiseName1 || "Team 1"} {matchDetails.score}{" "}
                    {franchiseName2 || "Team 2"}
                  </StyledText>
                </StyledView>
              </StyledView>
            </StyledView>

            {/* Team Rosters Section */}
            <StyledView className="mb-5 p-4 bg-[#3a3a3a] rounded-xl border border-gray-700">
              <StyledText className="text-white text-lg font-semibold mb-4">
                Team Rosters
              </StyledText>
              {/* Team 1 Roster */}
              <StyledView className="mb-4">
                <StyledText className="text-gray-200 font-medium mb-2">
                  {franchiseName1 || "Team 1"} Players
                </StyledText>
                <StyledView className="flex-row flex-wrap mb-2 min-h-[30px]">
                  {matchDetails.playersPlayedTeam1.length > 0 ? (
                    matchDetails.playersPlayedTeam1.map((playerId) => (
                      <PlayerCard
                        key={`t1-${playerId}`}
                        playerName={getPlayerNameById(
                          playerId,
                          playersFranchise1
                        )}
                      />
                    ))
                  ) : (
                    <StyledText className="text-gray-400 italic text-sm">
                      No players added yet.
                    </StyledText>
                  )}
                </StyledView>
                <StyledTouchableOpacity
                  className="bg-blue-600/80 p-2 rounded-md border border-blue-500 flex-row items-center justify-center"
                  onPress={() => handleModalOpen("playersPlayedTeam1", 1)}
                >
                  <Ionicons
                    name="add-outline"
                    size={18}
                    color="white"
                    style={{ marginRight: 5 }}
                  />
                  <StyledText className="text-white text-center font-medium text-sm">
                    Add Player to {franchiseName1 || "Team 1"}
                  </StyledText>
                </StyledTouchableOpacity>
              </StyledView>
              {/* Team 2 Roster */}
              <StyledView>
                <StyledText className="text-gray-200 font-medium mb-2">
                  {franchiseName2 || "Team 2"} Players
                </StyledText>
                <StyledView className="flex-row flex-wrap mb-2 min-h-[30px]">
                  {matchDetails.playersPlayedTeam2.length > 0 ? (
                    matchDetails.playersPlayedTeam2.map((playerId) => (
                      <PlayerCard
                        key={`t2-${playerId}`}
                        playerName={getPlayerNameById(
                          playerId,
                          playersFranchise2
                        )}
                      />
                    ))
                  ) : (
                    <StyledText className="text-gray-400 italic text-sm">
                      No players added yet.
                    </StyledText>
                  )}
                </StyledView>
                <StyledTouchableOpacity
                  className="bg-blue-600/80 p-2 rounded-md border border-blue-500 flex-row items-center justify-center"
                  onPress={() => handleModalOpen("playersPlayedTeam2", 2)}
                >
                  <Ionicons
                    name="add-outline"
                    size={18}
                    color="white"
                    style={{ marginRight: 5 }}
                  />
                  <StyledText className="text-white text-center font-medium text-sm">
                    Add Player to {franchiseName2 || "Team 2"}
                  </StyledText>
                </StyledTouchableOpacity>
              </StyledView>
            </StyledView>

            {/* Events Timeline Section */}
            <StyledView className="mb-5 p-4 bg-[#3a3a3a] rounded-xl border border-gray-700">
              <StyledText className="text-white text-lg font-semibold mb-4">
                Match Events Timeline
              </StyledText>
              {/* Add Event Button */}
              <StyledTouchableOpacity
                className={`bg-teal-600 p-3 rounded-lg mb-4 flex-row items-center justify-center shadow ${
                  matchDetails.playersPlayedTeam1.length === 0 ||
                  matchDetails.playersPlayedTeam2.length === 0
                    ? "opacity-50"
                    : ""
                }`}
                onPress={() => handleModalOpen("event", null)} // 'event' signifies starting the event flow
                disabled={
                  matchDetails.playersPlayedTeam1.length === 0 ||
                  matchDetails.playersPlayedTeam2.length === 0
                } // Disable if no players added
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <StyledText className="text-white text-center font-bold">
                  Add Match Event
                </StyledText>
              </StyledTouchableOpacity>
              {/* Timeline Display */}
              <StyledView className="mt-2 min-h-[50px]">
                {matchDetails.events.length > 0 ? (
                  matchDetails.events.map((event, index) => (
                    <Event
                      key={`${event.type}-${event.player}-${index}`} // More robust key
                      event={event}
                      playersTeam1={playersFranchise1} // Pass both player lists
                      playersTeam2={playersFranchise2}
                    />
                  ))
                ) : (
                  <StyledText className="text-gray-400 italic text-center mt-2">
                    No events recorded yet.
                  </StyledText>
                )}
              </StyledView>
            </StyledView>

            {/* Save Button */}
            <StyledTouchableOpacity
              className="bg-green-600 p-4 rounded-xl flex-row items-center justify-center shadow-lg" // More prominent save button
              onPress={handleSave}
            >
              <Ionicons
                name="save-outline"
                size={22}
                color="white"
                style={{ marginRight: 8 }}
              />
              <StyledText className="text-white text-center font-bold text-lg">
                Save Match Details
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        )}
      </ScrollView>

      {/* --- Modal for Selecting Events, Teams, Players --- Themed --- */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade" // Use fade for consistency
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay} // Dark overlay
          activeOpacity={1}
          onPressOut={() => setShowModal(false)} // Close on touching outside
        >
          {/* Use themed container */}
          <View
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true}
          >
            {/* Step 1: Select Event Type */}
            {modalStep === 1 && (
              <>
                <Text style={styles.modalTitle}>Select Event Type</Text>
                <FlatList
                  data={[
                    // Use FlatList for scrollable options
                    { key: "goal", label: "Goal" },
                    { key: "yellowCard", label: "Yellow Card" },
                    { key: "redCard", label: "Red Card" },
                    { key: "penaltyMissed", label: "Penalty Missed" },
                    { key: "ownGoal", label: "Own Goal" },
                    { key: "penaltySave", label: "Penalty Save" },
                  ]}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => handleEventSelect(item.key)}
                    >
                      <Text style={styles.modalItemText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.key}
                />
              </>
            )}

            {/* Step 2: Select Team */}
            {modalStep === 2 && (
              <>
                <Text style={styles.modalTitle}>Select Team for Event</Text>
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleTeamSelect(1)}
                >
                  <Text style={styles.modalItemText}>
                    {franchiseName1 || "Team 1"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleTeamSelect(2)}
                >
                  <Text style={styles.modalItemText}>
                    {franchiseName2 || "Team 2"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Step 3/4: Select Player(s) */}
            {(modalStep === 3 || modalStep === 4) && (
              <View style={{ flexGrow: 1 }}>
                <Text style={styles.modalTitle}>
                  {modalEventType.startsWith("playersPlayed")
                    ? `Select Player for ${
                        selectedTeam === 1
                          ? franchiseName1 || "Team 1"
                          : franchiseName2 || "Team 2"
                      }`
                    : modalEventType === "goal" && modalStep === 3
                    ? `Select Goal Scorer (${
                        selectedTeam === 1
                          ? franchiseName1 || "Team 1"
                          : franchiseName2 || "Team 2"
                      })`
                    : modalEventType === "goal" && modalStep === 4
                    ? `Select Assister (Optional - ${
                        selectedTeam === 1
                          ? franchiseName1 || "Team 1"
                          : franchiseName2 || "Team 2"
                      })`
                    : `Select Player (${
                        selectedTeam === 1
                          ? franchiseName1 || "Team 1"
                          : franchiseName2 || "Team 2"
                      })`}
                </Text>
                {/* Optional "Skip Assist" button */}
                {modalEventType === "goal" && modalStep === 4 && (
                  <TouchableOpacity
                    style={[styles.modalItem, styles.skipButton]} // Special style for skip
                    onPress={handleSkipAssist}
                  >
                    <Text style={[styles.modalItemText, styles.skipButtonText]}>
                      No Assist / Skip
                    </Text>
                  </TouchableOpacity>
                )}
                {/* Player List */}
                <FlatList
                  // Determine data source based on context
                  data={
                    modalEventType.startsWith("playersPlayed")
                      ? getAvailablePlayersForRoster(selectedTeam)
                      : modalEventType === "goal" && modalStep === 3
                      ? getInGamePlayersForEvents(selectedTeam)
                      : modalEventType === "goal" && modalStep === 4
                      ? getAvailableAssisters(selectedTeam, selectedGoalScorer)
                      : getInGamePlayersForEvents(selectedTeam) // Default: in-game players for other events
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
                  ListEmptyComponent={
                    <Text style={styles.modalEmptyText}>
                      No eligible players found.
                    </Text>
                  }
                />
              </View>
            )}

            {/* Close/Cancel Button */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </StyledSafeAreaView>
  );
}

// --- Themed Styles for Modal ---
const styles = StyleSheet.create({
  scrollViewContent: {
    paddingBottom: 40, // Ensure space at bottom
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)", // Darker overlay
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#3a3a3a", // Dark background for modal content
    borderRadius: 12, // More rounded corners
    padding: 0, // Remove padding here, add to sections
    maxHeight: "80%", // Limit height
    overflow: "hidden", // Clip content
    borderWidth: 1,
    borderColor: "#555", // Subtle border
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e5e7eb", // Light text
    marginBottom: 15,
    marginTop: 15, // Add top margin
    textAlign: "center",
    paddingHorizontal: 20,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#555555", // Darker separator
  },
  modalItemText: {
    fontSize: 16,
    color: "#e5e7eb", // Light text
  },
  skipButton: {
    backgroundColor: "#4a4a4a", // Slightly different bg for skip
  },
  skipButtonText: {
    fontStyle: "italic",
    color: "#a0aec0", // Grayer text for skip
  },
  modalEmptyText: {
    fontSize: 15,
    color: "#9ca3af", // text-gray-400
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
    fontStyle: "italic",
  },
  modalCloseButton: {
    marginTop: 10, // Reduce space needed if list is long
    paddingVertical: 12,
    backgroundColor: "#ef4444", // Red for cancel
    borderTopWidth: 1, // Separator line above button
    borderTopColor: "#555555",
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
