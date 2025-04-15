// teamActions.js
import { useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import api from '../config/axios';
import { SPORT_CONFIGS } from './sportConfigs';
import { useAuth } from "../context/AuthContext";

// Hook that encapsulates all the core team management logic
export function useTeamActions({
  tournamentId,
  sport,
  teamData,
  setTeamData,
  setFetchedPlayers,
  totalPlayers,
  playerLimit,
  teamValue,
  setIsFetchingPlayers,
  setShowPlayerSelectionModal,
  setSelectedSection,
  fetchedPlayers,
  setFilteredPlayers,
  onSubmit,
  isEditMode,
  setIsLoading,
  router,
}) {

  const { userData } = useAuth();
  const username = userData?.username;

  // Handle franchise change
  const handleFranchiseChange = useCallback(
    async (franchiseId) => {
      try {
        setIsFetchingPlayers(true);
        let url;
        if (!franchiseId || franchiseId === '' || franchiseId === 'all') {
          url = `/players/${tournamentId}/players`;
        } else {
          url = `/players/${tournamentId}/franchises/${franchiseId}/players`;
        }
        const response = await api.get(url);
        if (response.data.success && Array.isArray(response.data.data)) {
          setFetchedPlayers(response.data.data);
        } else {
          setFetchedPlayers([]);
        }
      } catch (error) {
        console.error('Error fetching franchise players:', error);
        Alert.alert('Error', 'Failed to fetch franchise players');
      } finally {
        setIsFetchingPlayers(false);
      }
    },
    [tournamentId, setFetchedPlayers, setIsFetchingPlayers]
  );

  // Validate the team
  const validateTeam = useCallback(() => {
    const errors = [];
    const config = SPORT_CONFIGS[sport];
    if (totalPlayers !== playerLimit) {
      errors.push(`Team must have exactly ${playerLimit} players`);
    }
    Object.entries(config.sections).forEach(([section, { min, max }]) => {
      const count = teamData[section]?.length || 0;
      if (count < min) errors.push(`Need at least ${min} ${section}`);
      if (count > max) errors.push(`Cannot have more than ${max} ${section}`);
    });
    if (parseFloat(teamValue) > config.maxTeamValue) {
      errors.push(`Team value cannot exceed $${config.maxTeamValue}M`);
    }
    return errors;
  }, [sport, teamData, totalPlayers, playerLimit, teamValue]);

  // Add player to team
  const addPlayer = useCallback(
    (player) => {
      const config = SPORT_CONFIGS[sport];
      let targetSection = player.section || null;
      if (!targetSection) {
        targetSection = Object.keys(config.sections).find(section =>
          config.sections[section].playerTypes.includes(player.playerType.toLowerCase())
        );
      }
      if (!targetSection || !config.sections[targetSection]) {
        Alert.alert("Error", `No valid section found for ${player.playerType}`);
        return;
      }
      setTeamData((prevTeamData) => {
        const currentSectionPlayers = prevTeamData[targetSection] || [];
        const currentTotalPlayers = Object.values(prevTeamData).flat().length;
        const currentTeamValue = Object.values(prevTeamData)
          .flat()
          .reduce((sum, p) => sum + p.price, 0);
        if (currentTotalPlayers >= playerLimit) {
          Alert.alert("Team Full", `Maximum ${playerLimit} players allowed.`);
          return prevTeamData;
        }
        if (currentSectionPlayers.length >= config.sections[targetSection].max) {
          Alert.alert("Section Full", `Maximum ${config.sections[targetSection].max} in ${targetSection}`);
          return prevTeamData;
        }
        if (currentTeamValue + player.price > config.maxTeamValue) {
          Alert.alert("Budget Exceeded", `Exceeds $${config.maxTeamValue}M`);
          return prevTeamData;
        }
        return {
          ...prevTeamData,
          [targetSection]: [...currentSectionPlayers, player],
        };
      });
      setSelectedSection(null);
      setShowPlayerSelectionModal(false);
    },
    [sport, setTeamData, setShowPlayerSelectionModal, setSelectedSection, playerLimit]
  );

  // Remove player from team
  const removePlayer = useCallback(
    (playerToRemove) => {
      setTeamData((prev) => {
        const newData = { ...prev };
        Object.keys(newData).forEach((section) => {
          newData[section] = newData[section].filter(
            (p) => p._id !== playerToRemove._id
          );
        });
        return newData;
      });
    },
    [setTeamData]
  );

  // Remove player with optional alert
  const handleRemovePlayer = useCallback(
    (player, skipAlert = false) => {
      if (skipAlert) {
        removePlayer(player);
      } else {
        Alert.alert(
          "Remove Player",
          "Are you sure you want to remove this player?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Remove", onPress: () => removePlayer(player) }
          ],
          { cancelable: true }
        );
      }
    },
    [removePlayer]
  );

  // Handle team submission
  const handleNext = useCallback(async () => {
    const errors = validateTeam();
    if (errors.length > 0) {
      Alert.alert("Invalid Team", errors.join("\n"), [{ text: "OK" }]);
      return;
    }
    if (isEditMode && onSubmit) {
      onSubmit(teamData);
      return;
    }
    if (!tournamentId) {
      Alert.alert("Error", "Tournament ID is missing. Please select a valid tournament.");
      return;
    }
    try {
      const players = Object.values(teamData)
        .flat()
        .map(player => player._id)
        .filter(id => id);
      if (players.length === 0) {
        Alert.alert("Error", "No valid players found in the team.");
        return;
      }
      const teamName = username;
      console.log("teamName", teamName);
      const budget = parseFloat(teamValue);
      const payload = {
        name: teamName,
        players,
        budget,
        tournamentId,
        metadata: {
          sport,
          formation: Object.keys(teamData).reduce((acc, section) => {
            acc[section] = teamData[section].length;
            return acc;
          }, {})
        }
      };
      setIsLoading(true);
      const headers = { 'Content-Type': 'application/json' };
      const response = await api.post(`/teams/create`, payload, { headers });
      if (response.data.success) {
        Alert.alert("Success", "Team created successfully!");
        if (router && typeof router.push === 'function') {
          router.push("home");
        }
      } else {
        Alert.alert("Error", response.data.message || "Failed to create team");
      }
    } catch (error) {
      if (error.response) {
        const { data } = error.response;
        Alert.alert(
          "Error",
          data?.message || "An error occurred while creating the team",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Error",
          "Network request failed. Please check your connection.",
          [{ text: "OK" }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    validateTeam,
    teamData,
    teamValue,
    tournamentId,
    isEditMode,
    onSubmit,
    sport,
    setIsLoading,
    router,
  ]);

  // Open player selection modal with filtered players
  const handleOpenPlayerSelection = useCallback(
    (section) => {
      const addedPlayerIds = Object.values(teamData)
        .flat()
        .map((player) => player._id);
      const filtered = fetchedPlayers.filter((player) => {
        if (!player?.playerType) return false;
        if (addedPlayerIds.includes(player._id)) return false;
        if (section === "goalkeepers") return player.playerType.toLowerCase().includes("goalkeeper");
        if (section === "defenders") return player.playerType.toLowerCase().includes("defender");
        if (section === "midfielders") return player.playerType.toLowerCase().includes("midfielder");
        if (section === "forwards") return player.playerType.toLowerCase().includes("forward");
        return false;
      }) || [];
      setFilteredPlayers(filtered);
      setSelectedSection(section);
      setShowPlayerSelectionModal(true);
    },
    [teamData, fetchedPlayers, setFilteredPlayers, setSelectedSection, setShowPlayerSelectionModal]
  );

  return {
    handleFranchiseChange,
    validateTeam,
    addPlayer,
    removePlayer,
    handleRemovePlayer,
    handleNext,
    handleOpenPlayerSelection,
  };
}