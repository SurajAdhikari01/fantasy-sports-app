import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useRecoilState, useRecoilValue } from "recoil";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "nativewind";

import PitchView from "./PitchView"; // Assuming PitchView is already using NativeWind or StyleSheet
import PlayerSelectionModal from "./PlayerSelectionModal"; // Assuming this is also styled
import api from "../config/axios";
import {
  selectedTournamentState,
  teamDataState, // Holds data like { stage1: [players], stage2: [players] }
  teamIdState,
  fetchedPlayersState, // All available players for the tournament
  viewModeState,
} from "./atoms";

// Styled components for NativeWind
const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledActivityIndicator = styled(ActivityIndicator);

const { height: screenHeight } = Dimensions.get("window");

const EditTeam = () => {
  // --- State ---
  const router = useRouter();
  const { teamId: currentTeamId } = useRecoilValue(teamIdState); // Get teamId from Recoil
  const selectedTournament = useRecoilValue(selectedTournamentState);
  const [teamData, setTeamData] = useRecoilState(teamDataState);
  const [fetchedPlayers, setFetchedPlayers] =
    useRecoilState(fetchedPlayersState);
  const [, setViewMode] = useRecoilState(viewModeState); // Only need setViewMode here

  const [currentStage] = useState("knockout"); // Assuming only one stage is editable for now
  const [initialPlayerIds, setInitialPlayerIds] = useState(new Set()); // Store initial players for diffing
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPlayerSelectionModal, setShowPlayerSelectionModal] =
    useState(false);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState(null); // Stores { section, positionId, coordinates }

  // Derived state for players currently in the team for the stage being edited
  const playersInCurrentStage = Array.isArray(teamData[currentStage])
    ? teamData[currentStage]
    : [];

  // --- Effects ---
  useEffect(() => {
    // Set viewMode to EDIT when mounting this screen
    setViewMode("MANAGE_TEAM"); // Or use a specific "EDIT_TEAM" mode if needed

    fetchTeamData();
    fetchAvailablePlayers();

    // Cleanup function to reset viewMode when unmounting
    return () => {
      // Optionally reset viewMode if navigating away means cancelling edit
      // setViewMode("VIEW_TEAM"); // Or keep as is if navigating elsewhere might continue edit later
    };
  }, []); // Run only on mount

  // --- Data Fetching ---
  const fetchTeamData = useCallback(async () => {
    if (!currentTeamId) {
      Alert.alert("Error", "Team ID is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/teams/${currentTeamId}`);
      if (response.data.success && response.data.data?.players) {
        const stagePlayers = response.data.data.players[currentStage] || [];
        const formattedPlayers = stagePlayers.map((p) => ({
          ...p,
          _id: p._id, // Ensure _id exists
          playerType: p.playerType?.toLowerCase().trim() || "unknown", // Ensure type exists and is lowercase
        }));

        // Update teamData state correctly for the current stage
        setTeamData((prev) => ({
          ...prev,
          [currentStage]: formattedPlayers,
        }));
        // Store the initial player IDs for this stage to calculate changes later
        setInitialPlayerIds(new Set(formattedPlayers.map((p) => p._id)));
      } else {
        // Handle case where team or players[currentStage] might be missing
        setTeamData((prev) => ({
          ...prev,
          [currentStage]: [], // Set empty array if no data
        }));
        setInitialPlayerIds(new Set());
        if (!response.data.success)
          Alert.alert(
            "Error",
            response.data.message || "Failed to load team data"
          );
      }
    } catch (error) {
      console.error("Fetch team error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to load team data"
      );
      setTeamData((prev) => ({ ...prev, [currentStage]: [] })); // Ensure stage is array on error
      setInitialPlayerIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [currentTeamId, currentStage, setTeamData]);

  const fetchAvailablePlayers = useCallback(async () => {
    if (!selectedTournament) return; // No tournament selected
    // Avoid refetching if players are already loaded, unless needed
    // if (fetchedPlayers && fetchedPlayers.length > 0) return;

    try {
      const response = await api.get(
        `/players?tournament=${selectedTournament}`
      );
      if (response.data.success) {
        // Ensure players have necessary fields, like _id
        const validatedPlayers = response.data.data
          .filter((p) => p._id)
          .map((p) => ({
            ...p,
            playerType: p.playerType?.toLowerCase().trim() || "unknown",
          }));
        setFetchedPlayers(validatedPlayers);
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to load available players"
        );
        setFetchedPlayers([]); // Set empty on failure
      }
    } catch (error) {
      console.error("Fetch available players error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to load available players"
      );
      setFetchedPlayers([]); // Set empty on error
    }
    // Consider moving setLoading(false) here if this runs after fetchTeamData
  }, [selectedTournament, setFetchedPlayers]);

  // --- Event Handlers ---
  const handleOpenPlayerSelection = (section, positionId, coordinates) => {
    setSelectedSlotInfo({ section, positionId, coordinates }); // Store info about the slot clicked
    setShowPlayerSelectionModal(true);
  };

  const handleAddPlayer = (playerToAdd) => {
    if (!playerToAdd?._id) return; // Safety check

    setTeamData((prev) => {
      const currentPlayers = Array.isArray(prev[currentStage])
        ? prev[currentStage]
        : [];
      // Avoid adding duplicates
      if (currentPlayers.some((p) => p._id === playerToAdd._id)) {
        return prev;
      }
      return {
        ...prev,
        // Add player with formatted type
        [currentStage]: [
          ...currentPlayers,
          {
            ...playerToAdd,
            playerType:
              playerToAdd.playerType?.toLowerCase().trim() || "unknown",
          },
        ],
      };
    });
    setShowPlayerSelectionModal(false); // Close modal after selection
    setSelectedSlotInfo(null); // Reset selected slot info
  };

  const handleRemovePlayer = (playerToRemove) => {
    if (!playerToRemove?._id) return; // Safety check
    const playerIdToRemove = playerToRemove._id;

    setTeamData((prev) => {
      const currentPlayers = Array.isArray(prev[currentStage])
        ? prev[currentStage]
        : [];
      return {
        ...prev,
        [currentStage]: currentPlayers.filter(
          (p) => p._id !== playerIdToRemove
        ),
      };
    });
  };

  const handleReplacePlayer = (playerToReplace) => {
    if (!playerToReplace?._id) return;

    // Find the position info for the player being replaced
    // This requires PitchView's calculated positions or similar logic here
    // For simplicity, let's assume we can find the player's section/type
    const section = playerToReplace.playerType || "midfielder"; // Default if type unknown
    const positionId = `replace-${playerToReplace._id}`; // Placeholder positionId
    const coordinates = undefined; // We don't necessarily know the coordinates here

    // 1. Remove the player
    handleRemovePlayer(playerToReplace);
    // 2. Open the modal to select a replacement for that slot/section
    handleOpenPlayerSelection(section, positionId, coordinates);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    // Calculate changes: players added and removed
    const currentPlayerIds = new Set(playersInCurrentStage.map((p) => p._id));
    const addedPlayers = [];
    const removedPlayers = [];

    currentPlayerIds.forEach((id) => {
      if (!initialPlayerIds.has(id)) {
        addedPlayers.push(id);
      }
    });

    initialPlayerIds.forEach((id) => {
      if (!currentPlayerIds.has(id)) {
        removedPlayers.push(id);
      }
    });

    // Check if there are any changes
    if (addedPlayers.length === 0 && removedPlayers.length === 0) {
      Alert.alert("No Changes", "You haven't made any changes to the team.");
      setIsSaving(false);
      router.back(); // Or stay on the page
      return;
    }

    try {
      const payload = {
        addPlayers: addedPlayers,
        removePlayers: removedPlayers,
        stage: currentStage,
      };

      console.log("Saving payload:", payload); // Debugging

      const response = await api.put(`/teams/${currentTeamId}`, payload);

      if (response.data.success) {
        Alert.alert("Success", "Team updated successfully!");
        // Update initial state to reflect saved changes if staying on screen
        setInitialPlayerIds(currentPlayerIds);
        setViewMode("VIEW_TEAM"); // Set mode back to view
        router.back(); // Go back to the previous screen
      } else {
        Alert.alert("Error", response.data.message || "Failed to update team");
      }
    } catch (error) {
      console.error("Save team error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "An error occurred while saving"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Ask for confirmation if changes were made?
    const currentPlayerIds = new Set(playersInCurrentStage.map((p) => p._id));
    const hasChanged =
      JSON.stringify([...initialPlayerIds].sort()) !==
      JSON.stringify([...currentPlayerIds].sort());

    if (hasChanged) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            onPress: () => {
              setViewMode("VIEW_TEAM"); // Revert view mode
              router.back();
            },
            style: "destructive",
          },
        ]
      );
    } else {
      setViewMode("VIEW_TEAM"); // Revert view mode
      router.back();
    }
  };

  // --- Render Logic ---
  const renderHeader = () => (
    <StyledView className="px-4 py-3 flex-row items-center justify-between border-b border-gray-200 bg-white">
      {/* Use Cancel handler */}
      <StyledTouchableOpacity
        onPress={handleCancel}
        className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
      >
        <Ionicons name="chevron-back" size={24} color="#374151" />
      </StyledTouchableOpacity>

      <StyledText className="text-xl font-bold text-gray-800">
        Edit Team
      </StyledText>

      <StyledTouchableOpacity
        onPress={handleSave}
        disabled={isSaving || loading} // Disable while saving or loading
        className={`px-4 py-2 rounded-lg ${
          isSaving || loading ? "bg-gray-400" : "bg-blue-500 active:bg-blue-600"
        }`}
      >
        {isSaving ? (
          <StyledActivityIndicator size="small" color="#ffffff" />
        ) : (
          <StyledText className="text-white font-medium">Save</StyledText>
        )}
      </StyledTouchableOpacity>
    </StyledView>
  );

  // Calculate available players for the modal, ensuring teamData[currentStage] is checked
  const availablePlayersForModal = fetchedPlayers.filter((p) => {
    const isAlreadyInTeam = playersInCurrentStage.some(
      (tp) => tp._id === p._id
    );
    // We don't need removedPlayers state here, just check current team state
    return !isAlreadyInTeam;
  });

  return (
    <StyledSafeAreaView className="flex-1 bg-gray-50">
      {renderHeader()}

      {loading ? (
        <StyledView className="flex-1 justify-center items-center">
          <StyledActivityIndicator size="large" color="#3B82F6" />
          <StyledText className="mt-2 text-gray-500">
            Loading Team...
          </StyledText>
        </StyledView>
      ) : (
        <StyledScrollView>
          {/* Add Stage Selector or other relevant UI if needed */}
          {/* <StyledText className="text-center text-lg font-semibold my-2">{currentStage.toUpperCase()} Stage</StyledText> */}

          {/* Pitch View Container */}
          <StyledView
            style={{ height: screenHeight * 0.6 }}
            className="bg-green-700 mb-4"
          >
            {/* Ensure teamData passed to PitchView is structured correctly */}
            {/* PitchView expects teamData.all for VIEW_TEAM, or specific arrays for MANAGE_TEAM */}
            {/* Let's pass the players for the current stage directly */}
            <PitchView
              // Pass players for the current stage, PitchView needs adapt to this structure or use teamData directly
              teamData={{ all: playersInCurrentStage }} // Assuming PitchView can handle 'all' in manage mode too
              handleOpenPlayerSelection={handleOpenPlayerSelection}
              handleRemovePlayer={handleRemovePlayer}
              handleReplacePlayer={handleReplacePlayer} // Pass replace handler
              // Pass viewMode or a specific prop like isEditing
              viewMode={"MANAGE_TEAM"} // Explicitly set mode for PitchView
            />
          </StyledView>

          {/* Player List Below Pitch (Optional) */}
          {/* You could add a list of current players here */}
        </StyledScrollView>
      )}

      {/* Player Selection Modal */}
      <PlayerSelectionModal
        visible={showPlayerSelectionModal}
        onClose={() => {
          setShowPlayerSelectionModal(false);
          setSelectedSlotInfo(null); // Reset slot info on close
        }}
        onSelectPlayer={handleAddPlayer}
        availablePlayers={availablePlayersForModal}
        // Pass slot info if needed by the modal for filtering/display
        positionInfo={selectedSlotInfo}
        currentTeamPlayersCount={playersInCurrentStage.length} // Pass current count
        // playerLimit={playerLimit} // Pass limit if available
      />
    </StyledSafeAreaView>
  );
};

export default EditTeam;
