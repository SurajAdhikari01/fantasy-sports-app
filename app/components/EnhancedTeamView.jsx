import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Alert,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  ActivityIndicator
} from 'react-native';
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
  teamValueState,
  franchisesState,
  selectedTournamentState,
  playerLimitState,
  fetchedPlayersState,
  selectedFranchiseState,
} from './atoms';
import api from '../config/axios';
import PitchView from './PitchView';
// import HighlightedPlayerInfo from './HighlightedPlayerInfo';
import ActionButtons from './ActionButtons';
import PlayerSelectionModal from './PlayerSelectionModal';
// import FilterModal from './FilterModal';
import { SPORT_CONFIGS } from './sportConfigs';
import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const EnhancedTeamView = () => {
  const [selectedTournament, setSelectedTournament] = useRecoilState(selectedTournamentState);
  const tournamentId = selectedTournament
  const navigation = useNavigation();
  const [sport, setSport] = useRecoilState(sportState);
  const [teamData, setTeamData] = useRecoilState(teamDataState);
  // const [filterRole, setFilterRole] = useRecoilState(filterRoleState);
  const [sortBy, setSortBy] = useRecoilState(sortByState('default'));
  const [selectedPlayer, setSelectedPlayer] = useRecoilState(selectedPlayerState('default'));
  // const [showPlayerStats, setShowPlayerStats] = useRecoilState(showPlayerStatsState('default'));
  const [showPlayerSelectionModal, setShowPlayerSelectionModal] = useRecoilState(showPlayerSelectionModalState('default'));
  const [selectedSection, setSelectedSection] = useRecoilState(selectedSectionState('default'));
  const [franchises, setFranchises] = useRecoilState(franchisesState);
  const [fetchedPlayers, setFetchedPlayers] = useRecoilState(fetchedPlayersState);
  const [selectedFranchise, setSelectedFranchise] = useRecoilState(selectedFranchiseState);
  const [playerLimit, setPlayerLimit] = useRecoilState(playerLimitState);
  const totalPlayers = Object.values(teamData).flat().length;

  const filteredAvailablePlayers = useRecoilValue(filteredAvailablePlayersState);
  const teamValue = useRecoilValue(teamValueState);
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingPlayers, setIsFetchingPlayers] = useState(false);
  // const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({ position: '', price: '', franchise: '' });
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerSlideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Function to handle cancel and go back to tournament selection
  const handleCancel = useCallback(() => {
    Alert.alert(
      "Cancel Team Creation",
      "Are you sure you want to exit? Any unsaved changes will be lost.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            // Reset the selected tournament to return to tournament selection
            setSelectedTournament(null);
            // Clear the team data
            setTeamData(createInitialTeamData(sport));
          }
        }
      ],
      { cancelable: true }
    );
  }, [setSelectedTournament, sport, setTeamData]);

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
    // console.log(`Sport changed: ${sport}`);
    setTeamData(createInitialTeamData(sport));
  }, [sport, createInitialTeamData, setTeamData]);

  // Effect to fetch franchises and players when the component mounts
  // Effect to fetch franchises and players when the component mounts
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchFranchisesAndPlayers = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);

        // Fetch franchises
        const franchisesResponse = await api.get(`/tournaments/franchises/${tournamentId}`, {
          signal: abortController.signal
        });
        console.log("Franchises response:", franchisesResponse.data);

        if (!isMounted) return;

        // Check if data exists and handle the structure we can see in the logs
        if (franchisesResponse.data && franchisesResponse.data.data) {
          // If response has data property (could be the case in some APIs)
          console.log("Raw franchises data (from data property):", franchisesResponse.data.data);
          setFranchises(franchisesResponse.data.data);
          console.log(`Set ${franchisesResponse.data.data.length} franchises from data property`);
        }
        else if (franchisesResponse.data && franchisesResponse.data.success && Array.isArray(franchisesResponse.data.message)) {
          // This matches what we're seeing in the logs - data.success exists and data.message is an array
          console.log("Raw franchises data (from message property):", franchisesResponse.data.message);
          setFranchises(franchisesResponse.data.message);
          console.log(`Set ${franchisesResponse.data.message.length} franchises from message property`);
        }
        else if (Array.isArray(franchisesResponse.data)) {
          // Just in case the response is a direct array
          console.log("Raw franchises data (direct array):", franchisesResponse.data);
          setFranchises(franchisesResponse.data);
          console.log(`Set ${franchisesResponse.data.length} franchises from direct array`);
        }
        else {
          console.warn("Failed to find franchises data in expected format", franchisesResponse.data);
          setFranchises([]); // Set empty array to avoid undefined issues
        }

        // Fetch all players
        console.log(`Fetching all players for tournament: ${tournamentId}`);
        setIsFetchingPlayers(true);
        const playersResponse = await api.get(`/players/${tournamentId}/players`);

        if (!isMounted) return;

        if (playersResponse.data.success && Array.isArray(playersResponse.data.data)) {
          const playersWithFranchises = playersResponse.data.data.map(player => ({
            ...player,
            franchise: player.franchise || { name: "Free Agent" }
          }));

          setFetchedPlayers(playersWithFranchises);
          console.log(`Fetched ${playersWithFranchises.length} players`);
        } else {
          console.warn("Failed to fetch players or received invalid data format");
          setFetchedPlayers([]);
        }
      } catch (err) {
        if (err.name === 'CanceledError') {
          console.log('Request canceled');
          return;
        }
        console.error('Fetch Error:', err);
        setFranchises([]); // Set empty array in case of error
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsFetchingPlayers(false);

          // Start animations when loading is complete
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(headerSlideAnim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start();
        }
      }
    };

    if (tournamentId) {
      fetchFranchisesAndPlayers();
    }

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [tournamentId, setFranchises, setFetchedPlayers, fadeAnim, slideAnim, headerSlideAnim, scaleAnim]);

  // Function to handle franchise selection in the modal
  const handleFranchiseChange = useCallback(async (franchiseId) => {
    try {
      setIsFetchingPlayers(true);

      let url;
      if (!franchiseId || franchiseId === '' || franchiseId === 'all') {
        // Fetch all tournament players
        url = `/players/${tournamentId}/players`;
      } else {
        // Fetch franchise-specific players
        url = `/players/${tournamentId}/franchises/${franchiseId}/players`;
      }

      // Rest of function remains the same...
    } catch (error) {
      console.error('Error fetching franchise players:', error);
      Alert.alert('Error', 'Failed to fetch franchise players');
    } finally {
      setIsFetchingPlayers(false);
    }
  }, [tournamentId, teamData, selectedSection, setFetchedPlayers]);

  // Update the fetchPlayers function to handle 'all'
  // const fetchPlayers = useCallback(async (franchiseId) => {
  //   try {
  //     setIsFetchingPlayers(true);

  //     // Construct the correct API endpoint
  //     let url;
  //     if (franchiseId === 'all') {
  //       url = `/players/${tournamentId}/players`;
  //     } else {
  //       url = `/players/${tournamentId}/franchises/${franchiseId}/players`;
  //     }

  //     // console.log('[Player Fetch] Fetching players from URL:', url);

  //     // Make the API call
  //     const response = await api.get(url);

  //     if (response.data.success) {
  //       // console.log('[Player Fetch] Players fetched successfully:', response.data.data);

  //       // Ensure franchise data is properly populated
  //       const playersWithFranchises = response.data.data.map(player => ({
  //         ...player,
  //         franchise: player.franchise || { name: "Free Agent" }
  //       }));

  //       setFetchedPlayers(playersWithFranchises);

  //       // Log the fetched players with IDs for debugging
  //       // console.log('[Player Fetch] Fetched Players with IDs:', playersWithFranchises.map(p => p._id));
  //     } else {
  //       console.error('[Player Fetch] API responded with failure:', response.data);
  //       Alert.alert('Error', 'Failed to fetch players');
  //     }
  //   } catch (error) {
  //     console.error('[Player Fetch] Network or API Error:', error);
  //     Alert.alert('Error', 'Failed to fetch players');
  //   } finally {
  //     setIsFetchingPlayers(false);
  //   }
  // }, [tournamentId, setFetchedPlayers]);

  // Function to validate the team configuration
  const validateTeam = useCallback(() => {
    const errors = [];
    const config = SPORT_CONFIGS[sport];

    if (totalPlayers !== playerLimit) {
      errors.push(`Team must have exactly ${playerLimit} players`);
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
  // const handlePlayerPress = useCallback((player) => {
  //   setSelectedPlayer(player);
  //   setShowPlayerStats(true);
  // }, [setSelectedPlayer, setShowPlayerStats]);


  // Function to add a player to the team
  const addPlayer = useCallback(
    (player) => {
      const config = SPORT_CONFIGS[sport];
      let targetSection = selectedSection;

      // Determine the section from playerType if not selected
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

        // Validation checks
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

        // Log the player being added
        // console.log('[Player Add] Adding player to teamData:', {
        //   player,
        //   targetSection
        // });

        const updatedTeamData = {
          ...prevTeamData,
          [targetSection]: [...currentSectionPlayers, player],
        };

        // Log updated team data
        // console.log('[Player Add] Updated teamData:', updatedTeamData);

        return updatedTeamData;
      });

      setSelectedSection(null);
      setShowPlayerSelectionModal(false);
    },
    [selectedSection, sport, setTeamData, setShowPlayerSelectionModal, setSelectedSection]
  );

  const removePlayer = useCallback((playerToRemove) => {
    // console.log("Removing player:", playerToRemove);
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
  const handleRemovePlayer = useCallback((player, skipAlert = false) => {
    console.log("Handle remove player:", player);

    if (skipAlert) {
      // Skip the alert and remove player directly
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
  }, [removePlayer]);

  // Function to handle the next action (e.g., saving the team)
  const handleNext = useCallback(async () => {
    // Log initial data
    // console.log('[Team Creation] Initial Data:', {
    //   teamData: JSON.parse(JSON.stringify(teamData)), // Deep clone for safety
    //   teamValue,
    //   tournamentId,
    //   playerLimit,
    //   sport
    // });

    // Validate the team
    const errors = validateTeam();
    // console.log('[Team Creation] Validation Errors:', errors);

    if (errors.length > 0) {
      Alert.alert("Invalid Team", errors.join("\n"), [{ text: "OK" }]);
      return;
    }

    if (!tournamentId) {
      console.error('[Team Creation] tournamentId is undefined. Ensure the selected tournament is set.');
      Alert.alert("Error", "Tournament ID is missing. Please select a valid tournament.");
      return;
    }

    try {
      // Flatten the `teamData` structure and extract only player IDs
      const players = Object.values(teamData)
        .flat() // Flatten all position arrays (defenders, forwards, etc.)
        .map(player => player._id) // Extract just the player IDs
        .filter(id => id); // Ensure no undefined or null IDs exist

      // Log extracted player IDs for debugging
      // console.log('[Team Creation] Extracted Player IDs:', players);

      if (players.length === 0) {
        console.error('[Team Creation] No valid player IDs found in teamData.');
        Alert.alert("Error", "No valid players found in the team.");
        return;
      }

      const teamName = "UserTeam"; // Replace with dynamic name if needed
      const budget = parseFloat(teamValue);

      // Construct payload
      const payload = {
        name: teamName,
        players, // Use the flattened list of player IDs
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

      // Log the payload
      // console.log('[Team Creation] Payload Being Sent:', JSON.stringify(payload, null, 2));

      // Make the API call
      setIsLoading(true);
      const headers = { 'Content-Type': 'application/json' };
      const response = await api.post(`/teams/create`, payload, { headers });

      // console.log('[Team Creation] API Response:', {
      //   status: response.status,
      //   data: response.data,
      //   headers: response.headers
      // });

      if (response.data.success) {
        Alert.alert("Success", "Team created successfully!");
        navigation.navigate("Home");
      } else {
        console.error('[Team Creation] API Error:', response.data);
        Alert.alert("Error", response.data.message || "Failed to create team");
      }
    } catch (error) {
      console.error('[Team Creation] Network or Backend Error:', error);

      // Check if the error is a response from the backend
      if (error.response) {
        const { status, data } = error.response;
        console.error('[Team Creation] Backend Error Response:', status, data);

        // Show the backend error message
        Alert.alert(
          "Error",
          data?.message || "An error occurred while creating the team",
          [{ text: "OK" }]
        );
      } else {
        // Handle generic network errors
        Alert.alert(
          "Error",
          "Network request failed. Please check your connection.",
          [{ text: "OK" }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [validateTeam, teamData, teamValue, tournamentId, navigation, playerLimit, sport]);
  // Function to open the player selection modal
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [modalData, setModalData] = useState(null);
  const openPlayerSelectionModal = (positionId, coordinates) => {
    setModalData({ positionId, coordinates });
    setShowPlayerSelectionModal(true);
  };

  const handleOpenPlayerSelection = (section, positionId, coordinates) => {
    // Get the list of players already added to the team
    const addedPlayerIds = Object.values(teamData)
      .flat()
      .map((player) => player._id);

    // Filter players based on section and exclude already added players
    const filteredPlayers =
      fetchedPlayers.filter((player) => {
        if (!player?.playerType) return false;

        // Exclude players already added to the team
        if (addedPlayerIds.includes(player._id)) {
          return false;
        }

        // Match player type with the section
        if (section === "goalkeepers") {
          return player.playerType.toLowerCase().includes("goalkeeper");
        } else if (section === "defenders") {
          return player.playerType.toLowerCase().includes("defender");
        } else if (section === "midfielders") {
          return player.playerType.toLowerCase().includes("midfielder");
        } else if (section === "forwards") {
          return player.playerType.toLowerCase().includes("forward");
        }
        return false;
      }) || [];

    // Store filtered players in state
    setFilteredPlayers(filteredPlayers);

    // Set selected section for the modal
    setSelectedSection(section);

    // Open the player selection modal
    setShowPlayerSelectionModal(true);
  };

  // Function to apply filters
  // const handleApplyFilters = (filters) => {
  //   const { position, price, franchise } = filters;

  //   const filtered = fetchedPlayers
  //     .filter((player) => player) 
  //     .filter((player) => {
  //       if (position && player.playerType && !player.playerType.toLowerCase().includes(position.toLowerCase())) {
  //         return false;
  //       }
  //       if (price && player.price && player.price > parseFloat(price)) {
  //         return false;
  //       }
  //       if (franchise && player.franchise && player.franchise._id !== franchise) {
  //         return false;
  //       }
  //       return true;
  //     });

  //   setFilteredPlayers(filtered);
  //   setShowPlayerSelectionModal(true);
  // };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#111827", justifyContent: "center", alignItems: "center" }}>
        <StatusBar barStyle="light-content" backgroundColor="#111827" />
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ color: "white", marginTop: 12, fontSize: 16 }}>Loading team data...</Text>
      </SafeAreaView>
    );
  }

  // Dummy data for header box
  const deadline = "Sat 25 Jan 19:15";
  const isOverBudget = parseFloat(teamValue) > SPORT_CONFIGS[sport].maxTeamValue;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111827" }}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* Header Section with Back Button */}
      <Animated.View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.1)',
          transform: [{ translateY: headerSlideAnim }],
          opacity: fadeAnim
        }}
      >
        <TouchableOpacity
          onPress={handleCancel}
          style={{
            padding: 8,
            borderRadius: 20,
            backgroundColor: "rgba(55, 65, 81, 0.8)",
          }}
        >
          <AntDesign name="arrowleft" size={22} color="white" />
        </TouchableOpacity>
        <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>Create Team</Text>
        <TouchableOpacity style={{
          padding: 8,
          borderRadius: 20,
          backgroundColor: "rgba(55, 65, 81, 0.8)",
        }}>
          <AntDesign name="questioncircleo" size={22} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Team Value Section */}
      <Animated.View
        style={{
          margin: 16,
          borderRadius: 12,
          overflow: 'hidden',
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }}
      >
        <LinearGradient
          colors={['#111827', '#1F2937']}
          style={{ borderRadius: 12 }}
        >
          <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                marginBottom: 8
              }}>
                <MaterialIcons name="sports" size={14} color="#10B981" />
                <Text style={{ color: "#10B981", fontSize: 14, fontWeight: "bold", marginLeft: 4 }}>KO matches</Text>
              </View>
              <Text style={{ color: "#9CA3AF", fontSize: 14 }}>
                Deadline: <Text style={{ color: "#FFFFFF", fontWeight: "500" }}>{deadline}</Text>
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{
                fontSize: 24,
                fontWeight: "bold",
                textAlign: 'right',
                color: isOverBudget ? "#EF4444" : "#10B981"
              }}>
                ${isOverBudget ? `-${(parseFloat(teamValue) - 100).toFixed(1)}` : parseFloat(teamValue).toFixed(1)}M
              </Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: "#9CA3AF", fontSize: 12, textAlign: 'right' }}>
                  Team Value ({totalPlayers}/{playerLimit})
                </Text>
                {isOverBudget && (
                  <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 2 }}>Exceeds budget</Text>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Progress Bar */}
      <Animated.View
        style={{
          paddingHorizontal: 16,
          marginBottom: 16,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
          <View
            style={{
              height: '100%',
              width: `${Math.min(100, (totalPlayers / playerLimit) * 100)}%`,
              backgroundColor: totalPlayers === playerLimit ? '#10B981' : '#3B82F6',
              borderRadius: 3
            }}
          />
        </View>
        <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
          {totalPlayers === playerLimit ?
            'Team complete!' :
            `${playerLimit - totalPlayers} more player${playerLimit - totalPlayers !== 1 ? 's' : ''} needed`
          }
        </Text>
      </Animated.View>

      {/* Main Content */}
      <Animated.View
        style={{
          flex: 1,
          position: "relative",
          paddingBottom: 80, // Keep this padding for the navigation bar
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        {/* Pitch View Container */}
        <View style={{ flex: 1, paddingTop: 8, paddingBottom: 4 }}>
          <PitchView
            teamData={teamData}
            // handlePlayerPress={handlePlayerPress}
            handleOpenPlayerSelection={handleOpenPlayerSelection}
            handleRemovePlayer={handleRemovePlayer}
          />
        </View>

        {/* Action Buttons Container */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <ActionButtons
            handleNext={handleNext}
            setShowPlayerSelectionModal={() => {
              // Update filtered players to show all available players
              const addedPlayerIds = Object.values(teamData)
                .flat()
                .map((player) => player._id);

              // Filter out players that are already in the team
              const availablePlayers = fetchedPlayers.filter(
                player => player && !addedPlayerIds.includes(player._id)
              );

              setFilteredPlayers(availablePlayers);
              setSelectedSection(null); // Clear section filter
              setShowPlayerSelectionModal(true);
            }}
            isFetchingPlayers={isFetchingPlayers}
          />
        </View>
      </Animated.View>

      {/* Modals */}
      {/* <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={handleApplyFilters} 
        franchises={franchises}
      /> */}

      {/* <HighlightedPlayerInfo
        player={selectedPlayer}
        visible={showPlayerStats}
        onClose={() => {
          setShowPlayerStats(false);
          setSelectedPlayer(null);
        }}
      /> */}

      <PlayerSelectionModal
        visible={showPlayerSelectionModal}
        onClose={() => setShowPlayerSelectionModal(false)}
        onSelectPlayer={addPlayer}
        availablePlayers={filteredPlayers}
        section={selectedSection}
        franchises={franchises}
        onFranchiseChange={handleFranchiseChange}
      />
    </SafeAreaView>
  );
};

export default EnhancedTeamView;