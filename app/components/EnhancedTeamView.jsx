import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, SafeAreaView, Alert, Dimensions, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  sportState,
  teamDataState,
  filterRoleState,
  sortByState,
  selectedPlayerState,
  showPlayerStatsState,
  showPlayerSelectionModalState,
  selectedSectionState,
  filteredAvailablePlayersState,
  totalPlayersState,
  teamValueState,
  franchisesState,
  selectedTournamentState,
  fetchedPlayersState,
  selectedFranchiseState,
} from './atoms';
import api from '../config/axios';
import PitchView from './PitchView';
import HighlightedPlayerInfo from './HighlightedPlayerInfo';
import ActionButtons from './ActionButtons';
import PlayerSelectionModal from './PlayerSelectionModal';
import FilterModal from './FilterModal';
import { SPORT_CONFIGS } from './sportConfigs';

const EnhancedTeamView = () => {
  const navigation = useNavigation();
  const [sport, setSport] = useRecoilState(sportState);
  const [teamData, setTeamData] = useRecoilState(teamDataState);
  const [filterRole, setFilterRole] = useRecoilState(filterRoleState);
  const [sortBy, setSortBy] = useRecoilState(sortByState('default'));
  const [selectedPlayer, setSelectedPlayer] = useRecoilState(selectedPlayerState('default'));
  const [showPlayerStats, setShowPlayerStats] = useRecoilState(showPlayerStatsState('default'));
  const [showPlayerSelectionModal, setShowPlayerSelectionModal] = useRecoilState(showPlayerSelectionModalState('default'));
  const [selectedSection, setSelectedSection] = useRecoilState(selectedSectionState('default'));
  const [franchises, setFranchises] = useRecoilState(franchisesState);
  const [selectedTournament, setSelectedTournament] = useRecoilState(selectedTournamentState);
  const [fetchedPlayers, setFetchedPlayers] = useRecoilState(fetchedPlayersState);
  const [selectedFranchise, setSelectedFranchise] = useRecoilState(selectedFranchiseState);

  const filteredAvailablePlayers = useRecoilValue(filteredAvailablePlayersState);
  const totalPlayers = useRecoilValue(totalPlayersState);
  const teamValue = useRecoilValue(teamValueState);
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingPlayers, setIsFetchingPlayers] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({ position: '', price: '', franchise: '' });

  // Function to create initial team data based on the sport type
  const createInitialTeamData = useCallback((sportType) => {
    const data = {};
    Object.keys(SPORT_CONFIGS[sportType].sections).forEach((sectionKey) => {
      data[sectionKey] = [];
    });
    return data;
  }, []);

  // Effect to update team data when the sport changes
  useEffect(() => {
    console.log(`Sport changed: ${sport}`);
    setTeamData(createInitialTeamData(sport));
  }, [sport, createInitialTeamData, setTeamData]);

  // Effect to fetch franchises when the component mounts
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchFranchises = async () => {
      try {
        const tournamentId = "67908e4177daf7d0fef42b85"; //hardcoded for dev

        if (!isMounted) return;

        const response = await api.get(`/tournaments/franchises/${tournamentId}`, {
          signal: abortController.signal
        });

        if (!isMounted) return;

        if (response.data.success && Array.isArray(response.data.message)) {
          setFranchises(response.data.message);
        }
      } catch (err) {
        if (err.name === 'CanceledError') {
          console.log('Request canceled');
          return;
        }
        console.error('Fetch Error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFranchises();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [setFranchises, selectedTournament]);

  // Update the fetchPlayers function to handle 'all'
  const fetchPlayers = useCallback(async (franchiseId) => {
    try {
      setIsFetchingPlayers(true);
      const tournamentId = "67908e4177daf7d0fef42b85";
      let url;

      if (franchiseId === 'all') {
        url = `/players/${tournamentId}/players`;

      } else {
        url = `/players/${tournamentId}/franchises/${franchiseId}/players`;
      }

      const response = await api.get(url);

      if (response.data.success) {
        // Ensure franchise data is properly populated
        const playersWithFranchises = response.data.data.map(player => ({
          ...player,
          franchise: player.franchise || { name: "Free Agent" }
        }));

        setFetchedPlayers(playersWithFranchises);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch players');
    } finally {
      setIsFetchingPlayers(false);
    }
  }, [setFetchedPlayers, selectedTournament]);

  // Function to validate the team configuration
  const validateTeam = useCallback(() => {
    const errors = [];
    const config = SPORT_CONFIGS[sport];

    if (totalPlayers !== config.maxPlayers) {
      errors.push(`Team must have exactly ${config.maxPlayers} players`);
    }

    Object.entries(config.sections).forEach(([section, { min, max }]) => {
      const count = teamData[section]?.length || 0;
      if (count < min) {
        errors.push(`Need at least ${min} ${section}`);
      }
      if (count > max) {
        errors.push(`Cannot have more than ${max} ${section}`);
      }
    });

    if (parseFloat(teamValue) > config.maxTeamValue) {
      errors.push(`Team value cannot exceed $${config.maxTeamValue}M`);
    }

    return errors;
  }, [sport, teamData, totalPlayers, teamValue]);

  // Function to handle player selection
  const handlePlayerPress = useCallback((player) => {
    setSelectedPlayer(player);
    setShowPlayerStats(true);
  }, [setSelectedPlayer, setShowPlayerStats]);

  
  // Function to add a player to the team
  const addPlayer = useCallback(
    (player) => {
      const config = SPORT_CONFIGS[sport];
      let targetSection = selectedSection;

      // If no section selected, determine from playerType
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

        // Existing validation checks
        if (currentTotalPlayers >= config.maxPlayers) {
          Alert.alert("Team Full", `Maximum ${config.maxPlayers} players allowed.`);
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
    [selectedSection, sport, setTeamData, setShowPlayerSelectionModal, setSelectedSection]
  );

  const removePlayer = useCallback((playerToRemove) => {
    console.log("Removing player:", playerToRemove);
    setTeamData((prev) => {
      const newData = { ...prev };
      Object.keys(newData).forEach((section) => {
        newData[section] = newData[section].filter(
          (p) => p._id !== playerToRemove._id
        );
      });
      console.log("Updated team data:", newData);
      return newData;
    });
  }, [setTeamData]);

  // Function to handle player removal with confirmation
  const handleRemovePlayer = useCallback((player) => {
    console.log("Handle remove player:", player);
    Alert.alert(
      "Remove Player",
      "Are you sure you want to remove this player?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", onPress: () => removePlayer(player) }
      ]
    );
  }, [removePlayer]);

  // Function to handle the next action (e.g., saving the team)
  const handleNext = useCallback(async () => {
    // const errors = validateTeam();
    console.log('next clicked');
    // if (errors.length > 0) {
    //   Alert.alert("Invalid Team", errors.join("\n"), [{ text: "OK" }]);
    //   return;
    // }

    try {
      const players = Object.values(teamData).flat().map(player => player._id);
      const teamName = "Sulav";  // Use the user's name or another appropriate value
      const budget = parseFloat(teamValue);
      const tournamentId = "67908e4177daf7d0fef42b85";  // hardcoded for dev
      console.log('Team creation :', players, teamName);

      const response = await api.post('/teams/create', {
        name: teamName,
        players,
        budget,
        tournamentId
      });
      console.log('Team creation response:', response.data);

      if (response.data.success) {
        Alert.alert("Success", "Team created successfully!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to create team. Please try again.");
      }
    } catch (error) {
      console.error("Error creating team:", error);
      Alert.alert("Error", "An error occurred while creating the team. Please try again.");
    }
  }, [validateTeam, teamData, teamValue, navigation]);

  // Function to open the player selection modal
  const handleOpenPlayerSelection = useCallback((section) => {
    // console.log('Selected section:', section);
    if (SPORT_CONFIGS[sport].sections[section]) {
      setSelectedSection(section);
      setShowPlayerSelectionModal(true);
    } else {
      console.error('Invalid section selected:', section);
    }
  }, [sport, setSelectedSection, setShowPlayerSelectionModal]);

  // Function to apply filters
  const handleApplyFilters = (filters) => {
    setFilters(filters);
    setShowPlayerSelectionModal(true);
  };

  if (isLoading || isFetchingPlayers) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#1F2937", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "white" }}>Loading data...</Text>
      </SafeAreaView>
    );
  }

  // Component to select a franchise
  // In EnhancedTeamView component

  // Update the FranchiseSelector component
  const FranchiseSelector = () => (
    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
      <Text style={{ color: "#9CA3AF", fontSize: 16, marginBottom: 8 }}>Select Franchise</Text>
      <Picker
        selectedValue={selectedFranchise?._id || 'all'}
        style={{ height: 50, width: screenWidth - 32, color: "#FFFFFF" }}
        onValueChange={(itemValue) => {
          if (itemValue === 'all') {
            setSelectedFranchise(null);
            fetchPlayers('all'); // Fetch all players
          } else {
            const selected = franchises.find(f => f._id === itemValue);
            setSelectedFranchise(selected);
            fetchPlayers(itemValue);
          }
        }}
      >
        <Picker.Item label="All Franchises" value="all" />
        {franchises.map((franchise) => (
          <Picker.Item key={franchise._id} label={franchise.name} value={franchise._id} />
        ))}
      </Picker>
    </View>
  );

  // Dummy data for header box
  const deadline = "Sat 25 Jan 19:15";
  const playersSelected = `${totalPlayers} / ${SPORT_CONFIGS[sport].maxPlayers}`;
  const budget = `$${SPORT_CONFIGS[sport].maxTeamValue}M`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1F2937" }}>
      {/* Header Section */}
      <View style={{ padding: 12, backgroundColor: "#111827", borderRadius: 8, margin: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ color: "#10B981", fontSize: 18, fontWeight: "bold" }}>KO matches</Text>
          <Text style={{ color: "#9CA3AF", fontSize: 14 }}>Deadline: <Text style={{ color: "#FFFFFF" }}>{deadline}</Text></Text>
        </View>
        <View>
          <Text style={{ color: parseFloat(teamValue) > 100 ? "#EF4444" : "#10B981", fontSize: 20, fontWeight: "bold", textAlign: 'right' }}>
            ${parseFloat(teamValue) > 100 ? `-${(parseFloat(teamValue) - 100).toFixed(2)}` : teamValue}M
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 12, textAlign: 'right' }}>
            Team Value ({totalPlayers}/{SPORT_CONFIGS[sport].maxPlayers})
          </Text>
          {parseFloat(teamValue) > 100 && (
            <Text style={{ color: "#EF4444", fontSize: 10, textAlign: 'right' }}>Exceeds budget</Text>
          )}
        </View>
      </View>

      <FranchiseSelector />

      {/* Main Content */}
      <View style={{ flex: 1, position: "relative", height: screenHeight * 0.75, paddingBottom: 80 }}>
        {/* Pitch View Container */}
        <View style={{ flex: 1, paddingTop: 8, paddingBottom: 4 }}>
          <PitchView teamData={teamData} handlePlayerPress={handlePlayerPress} handleOpenPlayerSelection={handleOpenPlayerSelection} handleRemovePlayer={handleRemovePlayer} />
        </View>

        {/* Action Buttons Container */}
        <View style={{ left: 0, right: 0 }}>
          <ActionButtons handleNext={handleNext} setShowPlayerSelectionModal={() => setFilterModalVisible(true)} />
        </View>
      </View>

      {/* Modals */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={handleApplyFilters}
        franchises={franchises}
      />

      <HighlightedPlayerInfo
        player={selectedPlayer}
        visible={showPlayerStats}
        onClose={() => {
          setShowPlayerStats(false);
          setSelectedPlayer(null);
        }}
      />

      <PlayerSelectionModal
        visible={showPlayerSelectionModal}
        onClose={() => setShowPlayerSelectionModal(false)}
        onSelectPlayer={addPlayer}
        availablePlayers={filteredAvailablePlayers}
        section={selectedSection}
        franchiseName={selectedFranchise?.name || "All Franchises"}
      />
    </SafeAreaView>
  );
};

export default EnhancedTeamView;