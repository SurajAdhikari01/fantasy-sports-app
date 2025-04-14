import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  teamDataState,
  fetchedPlayersState,
  showPlayerSelectionModalState,
  selectedSectionState,
  franchisesState,
  selectedTournamentState,
  teamIdState,
  viewModeState,
} from './atoms';
import api from '../config/axios';
import PitchView from './PitchView';
import PlayerSelectionModal from './PlayerSelectionModal';
import { AntDesign } from '@expo/vector-icons';

const EditTeam = () => {
  const router = useRouter();
  const teamId = useRecoilValue(teamIdState);
  const selectedTournament = useRecoilValue(selectedTournamentState);
  const [teamData, setTeamData] = useRecoilState(teamDataState);
  const [showPlayerSelectionModal, setShowPlayerSelectionModal] = useRecoilState(showPlayerSelectionModalState('default'));
  const [selectedSection, setSelectedSection] = useRecoilState(selectedSectionState('default'));
  const [franchises] = useRecoilState(franchisesState);
  const [fetchedPlayers, setFetchedPlayers] = useRecoilState(fetchedPlayersState);
  const [viewMode, setViewMode] = useRecoilState(viewModeState);

  // Local states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalPlayerIds, setOriginalPlayerIds] = useState([]);
  const [addedPlayers, setAddedPlayers] = useState([]);
  const [removedPlayers, setRemovedPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);

  // Set the view mode to 'EDIT_TEAM'
  useEffect(() => {
    setViewMode("EDIT_TEAM");
  }, [setViewMode]);

  // Fetch team data when component mounts
  useEffect(() => {
    if (teamId) {
      console.log("Team ID for edit team:", teamId);
      fetchTeamData();
      fetchAllPlayers();
    }
  }, [teamId]);

  // Function to fetch the current team data
  const fetchTeamData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/teams/${teamId}`);

      if (response.data && response.data.success) {
        // Store the original player IDs from the API response
        const currentTeamPlayerIds = response.data.data.latestTeam || [];
        setOriginalPlayerIds(currentTeamPlayerIds);
        console.log(`Fetched original team with ${currentTeamPlayerIds.length} players`);
      } else {
        console.error("Failed to fetch team data", response.data);
        Alert.alert("Error", "Failed to load team data");
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
      Alert.alert("Error", "Failed to load team data");
    }
  };

  // Function to fetch all available players
  const fetchAllPlayers = async () => {
    try {
      if (!selectedTournament) {
        console.error("No tournament ID available");
        return;
      }

      const response = await api.get(`/players/${selectedTournament}/players`);

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const allPlayers = response.data.data.map(player => ({
          ...player,
          franchise: player.franchise || { name: "Free Agent" }
        }));

        setFetchedPlayers(allPlayers);
        console.log(`Fetched ${allPlayers.length} players for tournament`);

        // Once we have all players, process the team data
        if (originalPlayerIds.length > 0) {
          processTeamData(originalPlayerIds, allPlayers);
        }
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Process team data once we have both original IDs and all players
  useEffect(() => {
    if (originalPlayerIds.length > 0 && fetchedPlayers.length > 0) {
      processTeamData(originalPlayerIds, fetchedPlayers);
    }
  }, [originalPlayerIds, fetchedPlayers]);

  // Function to process team data and organize by positions
  const processTeamData = (playerIds, allPlayers) => {
    // Map IDs to full player objects
    const teamPlayers = playerIds.map(id =>
      allPlayers.find(player => player._id === id) || {
        _id: id,
        name: "Unknown Player",
        playerType: "midfielder" // Default position if not found
      }
    );

    // Organize by position for PitchView
    const organizedData = {
      goalkeepers: [],
      defenders: [],
      midfielders: [],
      forwards: []
    };

    teamPlayers.forEach(player => {
      if (!player) return;

      const playerType = player.playerType?.toLowerCase() || '';

      if (playerType.includes('goalkeeper') || playerType.includes('goalie')) {
        organizedData.goalkeepers.push(player);
      } else if (playerType.includes('defender') || playerType.includes('defence')) {
        organizedData.defenders.push(player);
      } else if (playerType.includes('midfielder') || playerType.includes('midfield')) {
        organizedData.midfielders.push(player);
      } else if (playerType.includes('forward') || playerType.includes('striker') || playerType.includes('attack')) {
        organizedData.forwards.push(player);
      } else {
        // Default to midfielders if position unknown
        organizedData.midfielders.push(player);
      }
    });

    setTeamData(organizedData);
    console.log("Team data categorized by positions");
  };

  // Handler for opening player selection
  const handleOpenPlayerSelection = (section, positionId, coordinates) => {
    // Get current team player IDs
    const currentTeamPlayerIds = Object.values(teamData)
      .flat()
      .map(player => player._id);

    // Filter available players
    const availablePlayers = fetchedPlayers.filter(player => {
      // Skip if player is already in team
      if (currentTeamPlayerIds.includes(player._id)) return false;

      // Filter by section if provided
      if (section) {
        const playerType = player.playerType?.toLowerCase() || '';
        if (section === 'goalkeepers' &&
          !(playerType.includes('goalkeeper') || playerType.includes('goalie')))
          return false;
        if (section === 'defenders' &&
          !(playerType.includes('defender') || playerType.includes('defence')))
          return false;
        if (section === 'midfielders' &&
          !(playerType.includes('midfielder') || playerType.includes('midfield')))
          return false;
        if (section === 'forwards' &&
          !(playerType.includes('forward') || playerType.includes('striker') || playerType.includes('attack')))
          return false;
      }

      return true;
    });

    setFilteredPlayers(availablePlayers);
    setSelectedSection(section);
    setShowPlayerSelectionModal(true);
  };

  // Handler for adding a player
  const handleAddPlayer = (player) => {
    // Determine which section the player belongs to
    const playerType = player.playerType?.toLowerCase() || '';
    let targetSection = 'midfielders'; // Default section

    if (playerType.includes('goalkeeper') || playerType.includes('goalie')) {
      targetSection = 'goalkeepers';
    } else if (playerType.includes('defender') || playerType.includes('defence')) {
      targetSection = 'defenders';
    } else if (playerType.includes('midfielder') || playerType.includes('midfield')) {
      targetSection = 'midfielders';
    } else if (playerType.includes('forward') || playerType.includes('striker') || playerType.includes('attack')) {
      targetSection = 'forwards';
    }

    // Add player to team data
    setTeamData(prev => ({
      ...prev,
      [targetSection]: [...(prev[targetSection] || []), player]
    }));

    // Track added player ID
    if (!originalPlayerIds.includes(player._id)) {
      setAddedPlayers(prev => {
        if (!prev.includes(player._id)) {
          return [...prev, player._id];
        }
        return prev;
      });
    } else {
      // If player was previously removed, remove from removedPlayers
      setRemovedPlayers(prev => prev.filter(id => id !== player._id));
    }

    setShowPlayerSelectionModal(false);
  };

  // Handler for removing a player
  const handleRemovePlayer = (player, skipAlert = false) => {
    const removeAction = () => {
      // Remove player from team data
      setTeamData(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(section => {
          newData[section] = newData[section].filter(p => p._id !== player._id);
        });
        return newData;
      });

      // Track removed player ID
      if (originalPlayerIds.includes(player._id)) {
        setRemovedPlayers(prev => {
          if (!prev.includes(player._id)) {
            return [...prev, player._id];
          }
          return prev;
        });
      } else {
        // If player was just added, remove from addedPlayers
        setAddedPlayers(prev => prev.filter(id => id !== player._id));
      }
    };

    if (skipAlert) {
      removeAction();
    } else {
      Alert.alert(
        "Remove Player",
        "Are you sure you want to remove this player?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", onPress: removeAction }
        ],
        { cancelable: true }
      );
    }
  };

  // Handler for saving changes
  const handleSaveChanges = async () => {
    if (addedPlayers.length === 0 && removedPlayers.length === 0) {
      Alert.alert("No Changes", "You haven't made any changes to your team.");
      return;
    }

    try {
      setIsSaving(true);

      // Prepare payload for API
      const payload = {
        addPlayers: addedPlayers,
        removePlayers: removedPlayers
      };

      console.log("Saving team changes:", payload);

      // Make API call
      const response = await api.put(`/teams/${teamId}`, payload);

      if (response.data && response.data.success) {
        Alert.alert("Success", "Team updated successfully!");
        router.back();
      } else {
        Alert.alert("Error", response.data?.message || "Failed to update team");
      }
    } catch (error) {
      console.error('Error saving team:', error);
      Alert.alert("Error", "Failed to update team. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handler for canceling edit
  const handleCancel = () => {
    if (addedPlayers.length > 0 || removedPlayers.length > 0) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        [
          { text: "No", style: "cancel" },
          { text: "Yes", onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#111827", justifyContent: "center", alignItems: "center" }}>
        <StatusBar barStyle="light-content" backgroundColor="#111827" />
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ color: "white", marginTop: 12, fontSize: 16 }}>Loading team data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111827" }}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)'
      }}>
        <TouchableOpacity
          onPress={handleCancel}
          style={{
            padding: 8,
            borderRadius: 20,
            backgroundColor: "rgba(55, 65, 81, 0.8)"
          }}
        >
          <AntDesign name="arrowleft" size={22} color="white" />
        </TouchableOpacity>

        <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>Edit Team</Text>

        <TouchableOpacity
          onPress={handleSaveChanges}
          disabled={addedPlayers.length === 0 && removedPlayers.length === 0 || isSaving}
          style={{
            padding: 10,
            borderRadius: 8,
            backgroundColor: (addedPlayers.length > 0 || removedPlayers.length > 0) && !isSaving
              ? "#10B981"
              : "rgba(16, 185, 129, 0.5)"
          }}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "bold" }}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Changes Summary */}
      {(addedPlayers.length > 0 || removedPlayers.length > 0) && (
        <View style={{
          margin: 16,
          padding: 12,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: 8
        }}>
          <Text style={{ color: "white", fontWeight: "bold", marginBottom: 4 }}>Pending Changes:</Text>

          {addedPlayers.length > 0 && (
            <Text style={{ color: "#10B981", fontSize: 14 }}>
              • Added {addedPlayers.length} player{addedPlayers.length !== 1 ? 's' : ''}
            </Text>
          )}

          {removedPlayers.length > 0 && (
            <Text style={{ color: "#EF4444", fontSize: 14 }}>
              • Removed {removedPlayers.length} player{removedPlayers.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      )}

      {/* Team View */}
      <View style={{ flex: 1, padding: 8 }}>
        <PitchView
          teamData={teamData}
          handleOpenPlayerSelection={handleOpenPlayerSelection}
          handleRemovePlayer={handleRemovePlayer}
        />
      </View>

      {/* Add Player Button */}
      <View style={{ padding: 16 }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#3B82F6",
            borderRadius: 8,
            padding: 16,
            alignItems: "center"
          }}
          onPress={() => handleOpenPlayerSelection(null)}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Add Player</Text>
        </TouchableOpacity>
      </View>

      {/* Player Selection Modal */}
      <PlayerSelectionModal
        visible={showPlayerSelectionModal}
        onClose={() => setShowPlayerSelectionModal(false)}
        onSelectPlayer={handleAddPlayer}
        availablePlayers={filteredPlayers}
        section={selectedSection}
        franchises={franchises}
      />
    </SafeAreaView>
  );
};

export default EditTeam;