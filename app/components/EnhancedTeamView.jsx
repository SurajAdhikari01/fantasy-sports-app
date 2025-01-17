import React, { useState, useCallback, useMemo, useEffect } from "react";
import { View, Text, SafeAreaView, Alert, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import SportSelector from "./SportSelector";
import PitchView from "./PitchView";
import HighlightedPlayerInfo from "./HighlightedPlayerInfo";
import ActionButtons from "./ActionButtons";
import PlayerSelectionModal from "./PlayerSelectionModal";
import { allPlayers, SPORT_CONFIGS } from "../utils/data";

const EnhancedTeamView = () => {
  const navigation = useNavigation();
  const [sport, setSport] = useState("cricket");
  const [viewMode, setViewMode] = useState("pitch");
  const [filterRole, setFilterRole] = useState("All");
  const [sortBy, setSortBy] = useState("points");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [showPlayerSelectionModal, setShowPlayerSelectionModal] =
    useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  const createInitialTeamData = useCallback((sportType) => {
    const data = {};
    Object.keys(SPORT_CONFIGS[sportType].sections).forEach((sectionKey) => {
      data[sectionKey] = [];
    });
    return data;
  }, []);

  const [teamData, setTeamData] = useState(() => createInitialTeamData(sport));

  useEffect(() => {
    setTeamData(createInitialTeamData(sport));
  }, [sport, createInitialTeamData]);

  const totalPlayers = useMemo(() => {
    return Object.values(teamData).flat().length;
  }, [teamData]);

  const teamValue = useMemo(() => {
    return Object.values(teamData)
      .flat()
      .reduce((sum, player) => sum + player.price, 0)
      .toFixed(1);
  }, [teamData]);

  const totalPoints = useMemo(() => {
    return Object.values(teamData)
      .flat()
      .reduce((sum, player) => sum + player.points, 0);
  }, [teamData]);

  const filteredAvailablePlayers = useMemo(() => {
    let players = allPlayers[sport]?.filter(
      (player) =>
        !Object.values(teamData)
          .flat()
          .some((p) => p.id === player.id)
    );

    if (!players) return [];

    if (filterRole !== "All") {
      players = players.filter((p) => p.role === filterRole);
    }

    return [...players].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [sport, filterRole, sortBy, teamData]);

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

      // Ensure selectedSection is valid before accessing its properties
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


  const calculateDynamicPositions = (section, numPlayers) => {
    const positions = {
      Goalkeepers: [
        { x: 50, y: 90 }
      ],
      Defenders: [
        { x: 20, y: 70 },
        { x: 40, y: 70 },
        { x: 60, y: 70 },
        { x: 80, y: 70 },
        { x: 50, y: 75 }
      ],
      Midfielders: [
        { x: 30, y: 50 },
        { x: 50, y: 50 },
        { x: 70, y: 50 },
        { x: 40, y: 60 },
        { x: 60, y: 60 }
      ],
      Forwards: [
        { x: 35, y: 20 },
        { x: 50, y: 20 },
        { x: 65, y: 20 }
      ]
    };
    return positions[section];
  };
  

  const handleOpenPlayerSelection = (section) => {
    setSelectedSection(section);
    setShowPlayerSelectionModal(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        <View className="flex-row justify-between items-center p-4">
          <SportSelector
            currentSport={sport}
            onSportChange={handleSportChange}
          />
          <View className="flex-col items-center">
            <Text className="text-green-500 font-bold mr-1 text-2xl">
              ${teamValue}M
            </Text>
            <Text className="text-gray-500">Team Value</Text>
          </View>
        </View>

        <PitchView
          sport="football"
          teamData={teamData}
          handlePlayerPress={handlePlayerPress}
          calculatePositions={calculateDynamicPositions}
          handleOpenPlayerSelection={handleOpenPlayerSelection}
        />

        <HighlightedPlayerInfo
          player={selectedPlayer}
          visible={showPlayerStats}
          onClose={() => {
            setShowPlayerStats(false);
            setSelectedPlayer(null);
          }}
        />

        <ActionButtons
          handleNext={handleNext}
          setShowPlayerSelectionModal={handleOpenPlayerSelection} // Pass the section to open
        />

        <PlayerSelectionModal
          visible={showPlayerSelectionModal}
          onClose={() => setShowPlayerSelectionModal(false)}
          onSelectPlayer={addPlayer}
          availablePlayers={filteredAvailablePlayers}
          section={selectedSection}
        />
      </View>
    </SafeAreaView>
  );
};

export default EnhancedTeamView;
