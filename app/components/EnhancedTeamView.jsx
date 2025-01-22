import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, SafeAreaView, Alert, Dimensions, TouchableOpacity } from 'react-native';
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
  totalPointsState,
  franchisesState,
  selectedTournamentState,
} from './atoms';
import api from '../config/axios';
import SportSelector from './SportSelector';
import PitchView from './PitchView';
import HighlightedPlayerInfo from './HighlightedPlayerInfo';
import ActionButtons from './ActionButtons';
import PlayerSelectionModal from './PlayerSelectionModal';
import { SPORT_CONFIGS } from '../utils/data';

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
  const [franchises, setFranchises] = useRecoilState(franchisesState); // Ensure franchisesState is an atom/selector
  const [selectedTournament, setSelectedTournament] = useRecoilState(selectedTournamentState); // Ensure selectedTournamentState is an atom/selector

  const filteredAvailablePlayers = useRecoilValue(filteredAvailablePlayersState);
  const totalPlayers = useRecoilValue(totalPlayersState);
  const teamValue = useRecoilValue(teamValueState);
  const totalPoints = useRecoilValue(totalPointsState);
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  const [selectedFranchise, setSelectedFranchise] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const createInitialTeamData = useCallback((sportType) => {
    const data = {};
    Object.keys(SPORT_CONFIGS[sportType].sections).forEach((sectionKey) => {
      data[sectionKey] = [];
    });
    return data;
  }, []);

  useEffect(() => {
    setTeamData(createInitialTeamData(sport));
  }, [sport, createInitialTeamData]);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchFranchises = async () => {
      try {
        const tournamentId = "67908e4177daf7d0fef42b85"; 

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
      setSelectedPlayer(null);
      setShowPlayerStats(false);
      setShowPlayerSelectionModal(false);
    };
  }, []);

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

  const handlePlayerPress = useCallback((player) => {
    setSelectedPlayer(player);
    setShowPlayerStats(true);
  }, []);

  const removePlayer = useCallback((playerToRemove) => {
    setTeamData((prev) => {
      const newData = { ...prev };
      Object.keys(newData).forEach((section) => {
        newData[section] = newData[section].filter(
          (p) => p.id !== playerToRemove.id
        );
      });
      return newData;
    });
  }, []);

  const addPlayer = useCallback(
    (player) => {
      const config = SPORT_CONFIGS[sport];

      if (!selectedSection || !config.sections[selectedSection]) {
        Alert.alert(
          "Error",
          "Please select a valid section to add the player."
        );
        return;
      }

      if (totalPlayers >= config.maxPlayers) {
        Alert.alert(
          "Team Full",
          `You can only have ${config.maxPlayers} players in your team.`
        );
        return;
      }

      if (
        teamData[selectedSection]?.length >=
        config.sections[selectedSection].max
      ) {
        Alert.alert(
          "Section Full",
          `You can only have ${config.sections[selectedSection].max} ${selectedSection}`
        );
        return;
      }

      if (parseFloat(teamValue) + player.price > config.maxTeamValue) {
        Alert.alert(
          "Budget Exceeded",
          `Adding this player would exceed the maximum team value of $${config.maxTeamValue}M`
        );
        return;
      }

      setTeamData((prev) => ({
        ...prev,
        [selectedSection]: [...prev[selectedSection], player],
      }));
      setShowPlayerSelectionModal(false);
    },
    [selectedSection, sport, teamData, teamValue, totalPlayers]
  );

  const handleSportChange = useCallback(
    (newSport) => {
      if (totalPlayers > 0) {
        Alert.alert(
          "Change Sport",
          "Changing sports will clear your current team. Are you sure?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Continue",
              onPress: () => {
                setSport(newSport);
                setTeamData(createInitialTeamData(newSport));
              },
            },
          ]
        );
      } else {
        setSport(newSport);
        setTeamData(createInitialTeamData(newSport));
      }
    },
    [totalPlayers, createInitialTeamData]
  );

  const handleNext = useCallback(() => {
    const errors = validateTeam();
    if (errors.length > 0) {
      Alert.alert("Invalid Team", errors.join("\n"), [{ text: "OK" }]);
      return;
    }

    Alert.alert("Success", "Team saved successfully!", [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]);
  }, [validateTeam, navigation]);

  const handleOpenPlayerSelection = (section) => {
    setSelectedSection(section);
    setShowPlayerSelectionModal(true);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#1F2937", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "white" }}>Loading franchises...</Text>
      </SafeAreaView>
    );
  }

  const FranchiseSelector = () => (
    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
      <Text style={{ color: "#9CA3AF", fontSize: 16, marginBottom: 8 }}>Select Franchise</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {franchises.map((franchise) => (
          <TouchableOpacity
            key={franchise._id}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: selectedFranchise?._id === franchise._id ? "#10B981" : "#9CA3AF",
              backgroundColor: selectedFranchise?._id === franchise._id ? "#10B981" : "#1F2937",
            }}
            onPress={() => setSelectedFranchise(franchise)}
          >
            <Text style={{ color: selectedFranchise?._id === franchise._id ? "#FFFFFF" : "#9CA3AF" }}>
              {franchise.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1F2937" }}>
      {/* Header Section */}
      <View style={{ paddingHorizontal: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <SportSelector currentSport={sport} onSportChange={handleSportChange} />
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: "#10B981", fontWeight: "bold", fontSize: 24 }}>${teamValue}M</Text>
            <Text style={{ color: "#9CA3AF", fontSize: 12 }}>Team Value</Text>
            <Text style={{ color: "#3B82F6", fontSize: 12, marginTop: 4 }}>
              Players: {totalPlayers}/{SPORT_CONFIGS[sport].maxPlayers}
            </Text>
          </View>
        </View>
      </View>

      <FranchiseSelector />

      {/* Main Content */}
      <View style={{ flex: 1, position: "relative", height: screenHeight * 0.75, paddingBottom: 80 }}>
        {/* Pitch View Container */}
        <View style={{ flex: 1, paddingTop: 8, paddingBottom: 4 }}>
          <PitchView teamData={teamData} handlePlayerPress={handlePlayerPress} handleOpenPlayerSelection={handleOpenPlayerSelection} />
        </View>

        {/* Action Buttons Container */}
        <View style={{ left: 0, right: 0 }}>
          <ActionButtons handleNext={handleNext} setShowPlayerSelectionModal={handleOpenPlayerSelection} />
        </View>
      </View>

      {/* Modals */}
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
      />
    </SafeAreaView>
  );
};

export default EnhancedTeamView;