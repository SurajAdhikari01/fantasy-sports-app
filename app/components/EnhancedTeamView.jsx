import React, { useCallback, useEffect } from "react";
import { View, Text, SafeAreaView, Alert, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRecoilState, useRecoilValue } from "recoil";
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
} from "./atoms";
import SportSelector from "./SportSelector";
import PitchView from "./PitchView";
import HighlightedPlayerInfo from "./HighlightedPlayerInfo";
import ActionButtons from "./ActionButtons";
import PlayerSelectionModal from "./PlayerSelectionModal";
import { SPORT_CONFIGS } from "../utils/data";

const EnhancedTeamView = () => {
  const navigation = useNavigation();
  const [sport, setSport] = useRecoilState(sportState);
  const [teamData, setTeamData] = useRecoilState(teamDataState);
  const [filterRole, setFilterRole] = useRecoilState(filterRoleState);
  const [sortBy, setSortBy] = useRecoilState(sortByState);
  const [selectedPlayer, setSelectedPlayer] =
    useRecoilState(selectedPlayerState);
  const [showPlayerStats, setShowPlayerStats] =
    useRecoilState(showPlayerStatsState);
  const [showPlayerSelectionModal, setShowPlayerSelectionModal] =
    useRecoilState(showPlayerSelectionModalState);
  const [selectedSection, setSelectedSection] =
    useRecoilState(selectedSectionState);

  const filteredAvailablePlayers = useRecoilValue(
    filteredAvailablePlayersState
  );
  const totalPlayers = useRecoilValue(totalPlayersState);
  const teamValue = useRecoilValue(teamValueState);
  const totalPoints = useRecoilValue(totalPointsState);
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1F2937" }}>
      {/* Header Section */}
      <View style={{ paddingHorizontal: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <SportSelector
            currentSport={sport}
            onSportChange={handleSportChange}
          />
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{ color: "#10B981", fontWeight: "bold", fontSize: 24 }}
            >
              ${teamValue}M
            </Text>
            <Text style={{ color: "#9CA3AF", fontSize: 12 }}>Team Value</Text>
            <Text style={{ color: "#3B82F6", fontSize: 12, marginTop: 4 }}>
              Players: {totalPlayers}/{SPORT_CONFIGS[sport].maxPlayers}
            </Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View
        style={{
          flex: 1,
          position: "relative",
          height: screenHeight * 0.75,
          paddingBottom: 80, // Add padding bottom to account for the tab bar
        }}
      >
        {/* Pitch View Container */}
        <View style={{ flex: 1, paddingTop: 8, paddingBottom: 4 }}>
          <PitchView
            teamData={teamData}
            handlePlayerPress={handlePlayerPress}
            handleOpenPlayerSelection={handleOpenPlayerSelection}
          />
        </View>

        {/* Stats and Points Section */}
        {/* <View
          style={{
            position: "absolute",
            bottom: 80,
            left: 0,
            right: 0,
            paddingHorizontal: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "rgba(31, 41, 55, 0.8)",
            paddingVertical: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: "#FFFFFF", fontSize: 12, marginRight: 16 }}>
              Total Points: {totalPoints}
            </Text>
          </View>
        </View> */}

        {/* Action Buttons Container */}
        <View style={{  left: 0, right: 0 }}>
          <ActionButtons
            handleNext={handleNext}
            setShowPlayerSelectionModal={handleOpenPlayerSelection}
          />
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
