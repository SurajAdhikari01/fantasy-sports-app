// TeamBuilder.js
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Modal,
  Alert,
  Dimensions,
} from "react-native";
import cricketPitch from "../../assets/cricket-field.jpeg";
import footballPitch from "../../assets/football-field.jpg";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

// Sample players data for both sports
const allPlayers = {
  cricket: [
    {
      id: "c1",
      name: "Virat Kohli",
      team: "RCB",
      points: 50,
      image: "https://example.com/virat.jpg",
      role: "Batsman",
      price: 10.5,
    },
    {
      id: "c2",
      name: "MS Dhoni",
      team: "CSK",
      points: 48,
      image: "https://example.com/dhoni.jpg",
      role: "WicketKeeper",
      price: 9.5,
    },
    {
      id: "c3",
      name: "Jasprit Bumrah",
      team: "MI",
      points: 46,
      image: "https://example.com/bumrah.jpg",
      role: "Bowler",
      price: 9.0,
    },
    {
      id: "c4",
      name: "Ben Stokes",
      team: "RR",
      points: 45,
      image: "https://example.com/stokes.jpg",
      role: "AllRounder",
      price: 11.0,
    },
  ],
  football: [
    {
      id: "f1",
      name: "Lionel Messi",
      team: "Inter Miami",
      points: 92,
      image: "https://example.com/messi.jpg",
      role: "Forward",
      price: 15.0,
    },
    {
      id: "f2",
      name: "Manuel Neuer",
      team: "Bayern Munich",
      points: 89,
      image: "https://example.com/neuer.jpg",
      role: "Goalkeeper",
      price: 12.0,
    },
    {
      id: "f3",
      name: "Virgil van Dijk",
      team: "Liverpool",
      points: 90,
      image: "https://example.com/vandijk.jpg",
      role: "Defender",
      price: 13.5,
    },
    {
      id: "f4",
      name: "Kevin De Bruyne",
      team: "Man City",
      points: 91,
      image: "https://example.com/kdb.jpg",
      role: "Midfielder",
      price: 14.0,
    },
  ],
};

const SPORT_CONFIGS = {
  cricket: {
    maxPlayers: 11,
    sections: {
      Batsmen: { min: 3, max: 6, positions: ["top", "middle"] },
      Bowlers: { min: 3, max: 6, positions: ["bottom"] },
      AllRounders: { min: 1, max: 4, positions: ["middle"] },
      WicketKeepers: { min: 1, max: 2, positions: ["top"] },
    },
    fieldPositions: {
      top: { y: "15%", spread: true },
      middle: { y: "45%", spread: true },
      bottom: { y: "75%", spread: true },
    },
  },
  football: {
    maxPlayers: 11,
    sections: {
      Goalkeepers: { min: 1, max: 1, positions: ["gk"] },
      Defenders: { min: 3, max: 5, positions: ["def"] },
      Midfielders: { min: 2, max: 5, positions: ["mid"] },
      Forwards: { min: 1, max: 3, positions: ["fwd"] },
    },
    fieldPositions: {
      gk: { y: "85%", spread: false },
      def: { y: "65%", spread: true },
      mid: { y: "45%", spread: true },
      fwd: { y: "25%", spread: true },
    },
    formations: ["4-3-3", "4-4-2", "3-5-2", "5-3-2"],
  },
};

const SportSelector = React.memo(({ currentSport, onSportChange }) => (
  <View className="bg-gray-800 rounded-full p-2 flex-row">
    <TouchableOpacity
      onPress={() => onSportChange("cricket")}
      className={`p-2 rounded-full ${
        currentSport === "cricket" ? "bg-blue-500" : ""
      }`}
    >
      <MaterialCommunityIcons
        name="cricket"
        size={24}
        color={currentSport === "cricket" ? "#ffffff" : "#a0aec0"}
      />
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => onSportChange("football")}
      className={`p-2 rounded-full ${
        currentSport === "football" ? "bg-blue-500" : ""
      }`}
    >
      <MaterialCommunityIcons
        name="soccer"
        size={24}
        color={currentSport === "football" ? "#ffffff" : "#a0aec0"}
      />
    </TouchableOpacity>
  </View>
));

const PlayerCard = React.memo(
  ({ player, isPitch, onPlayerPress, position }) => {
    const cardStyle = position
      ? {
          position: "absolute",
          top: position.y,
          left: position.x,
        }
      : {};

    return (
      <TouchableOpacity
        onPress={() => onPlayerPress(player)}
        style={cardStyle}
        className={`${
          isPitch
            ? "bg-transparent opacity-80 rounded-lg shadow-lg m-2 w-20 h-28"
            : "flex-row bg-white rounded-2xl shadow-lg p-4 mb-3"
        }`}
      >
        <View className="relative flex items-center justify-center py-2">
          <Image
            source={{ uri: player.image }}
            className={`${
              isPitch ? "w-12 h-12" : "w-20 h-20"
            } rounded-full border-4 border-blue-500 shadow-md`}
          />
          <View className="absolute -bottom-0 right-1 bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
            <Text className="text-xs font-bold text-white">
              {player.points}
            </Text>
          </View>
        </View>
        <View className={`${isPitch ? "mt-3 bg-slate-50" : "ml-4 flex-1"}`}>
          <Text
            className={`font-extrabold ${
              isPitch ? "text-xs" : "text-base"
            } text-gray-800 ${isPitch ? "text-center" : ""}`}
            numberOfLines={1}
          >
            {player.name}
          </Text>
          {!isPitch && (
            <>
              <Text className="text-xs text-gray-600">{player.team}</Text>
              <View className="flex-row mt-1">
                <Text className="text-xs text-gray-500 mr-3">
                  {player.role}
                </Text>
                <Text className="text-xs text-gray-500">
                  <FontAwesome5 name="dollar-sign" size={12} color="#4B5563" />{" "}
                  {player.price}M
                </Text>
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

const TeamStats = React.memo(
  ({ totalPlayers, teamValue, avgPoints, sport }) => (
    <View className="flex-row justify-around items-center py-4 bg-gray-800 rounded-xl shadow-sm mb-4">
      <View className="items-center">
        <Text className="text-2xl font-bold text-white">
          {totalPlayers}/{SPORT_CONFIGS[sport].maxPlayers}
        </Text>
        <Text className="text-xs text-gray-400">Players</Text>
      </View>
      <View className="items-center">
        <Text className="text-2xl font-bold text-green-500">${teamValue}M</Text>
        <Text className="text-xs text-gray-400">Team Value</Text>
      </View>
      <View className="items-center">
        <Text className="text-2xl font-bold text-blue-500">{avgPoints}</Text>
        <Text className="text-xs text-gray-400">Avg. Points</Text>
      </View>
    </View>
  )
);

const PlayerSelectionModal = React.memo(
  ({ visible, onClose, onSelectPlayer, availablePlayers, section }) => (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-5 h-3/4">
          <Text className="text-2xl font-bold mb-4">Select {section}</Text>
          <FlatList
            data={availablePlayers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSelectPlayer(item)}
                className="flex-row items-center p-2 border-b border-gray-200"
              >
                <Image
                  source={{ uri: item.image }}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <View>
                  <Text className="font-bold">{item.name}</Text>
                  <Text className="text-sm text-gray-600">
                    {item.team} - {item.role}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            onPress={onClose}
            className="mt-4 bg-red-500 p-3 rounded-full"
          >
            <Text className="text-white text-center font-bold">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
);

export default function TeamView() {
  const navigation = useNavigation();
  const [sport, setSport] = useState("cricket");
  const [viewMode, setViewMode] = useState("pitch");
  const [teamData, setTeamData] = useState(() => {
    const initialData = {};
    Object.keys(SPORT_CONFIGS[sport].sections).forEach((section) => {
      initialData[section] = [];
    });
    return initialData;
  });
  const [showPlayerSelectionModal, setShowPlayerSelectionModal] =
    useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [formation, setFormation] = useState("4-3-3"); // For football only

  const totalPlayers = useMemo(
    () => Object.values(teamData).flat().length,
    [teamData]
  );

  const teamValue = useMemo(
    () =>
      Object.values(teamData)
        .flat()
        .reduce((sum, player) => sum + player.price, 0)
        .toFixed(1),
    [teamData]
  );

  const avgPoints = useMemo(
    () =>
      totalPlayers > 0
        ? (
            Object.values(teamData)
              .flat()
              .reduce((sum, player) => sum + player.points, 0) / totalPlayers
          ).toFixed(1)
        : "0.0",
    [teamData, totalPlayers]
  );

  const handleSportChange = useCallback(
    (newSport) => {
      if (Object.values(teamData).flat().length > 0) {
        Alert.alert(
          "Change Sport",
          "Changing sports will clear your current team. Are you sure?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Continue",
              onPress: () => {
                setSport(newSport);
                // Reset team data with correct sections for new sport
                const newData = {};
                Object.keys(SPORT_CONFIGS[newSport].sections).forEach(
                  (section) => {
                    newData[section] = [];
                  }
                );
                setTeamData(newData);
                // Reset formation to default if changing to football
                if (newSport === "football") {
                  setFormation(SPORT_CONFIGS.football.formations[0]);
                }
              },
            },
          ]
        );
      } else {
        setSport(newSport);
        // Reset team data with correct sections for new sport
        const newData = {};
        Object.keys(SPORT_CONFIGS[newSport].sections).forEach((section) => {
          newData[section] = [];
        });
        setTeamData(newData);
        // Reset formation to default if changing to football
        if (newSport === "football") {
          setFormation(SPORT_CONFIGS.football.formations[0]);
        }
      }
    },
    [teamData]
  );

  const validateTeamComposition = useCallback(() => {
    const config = SPORT_CONFIGS[sport].sections;
    let isValid = true;
    let message = "";

    Object.entries(config).forEach(([section, { min, max }]) => {
      const count = teamData[section]?.length || 0;
      if (count < min) {
        isValid = false;
        message += `Need at least ${min} ${section}. `;
      }
      if (count > max) {
        isValid = false;
        message += `Cannot have more than ${max} ${section}. `;
      }
    });

    return { isValid, message };
  }, [teamData, sport]);

  const handlePlayerPress = useCallback((player) => {
    Alert.alert(
      "Player Options",
      `What would you like to do with ${player.name}?`,
      [
        { text: "Remove", onPress: () => removePlayer(player) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  }, []);

  const handleAddPlayer = useCallback((section) => {
    setSelectedSection(section);
    setShowPlayerSelectionModal(true);
  }, []);

  const addPlayer = useCallback(
    (player) => {
      const config = SPORT_CONFIGS[sport];
      if (Object.values(teamData).flat().length >= config.maxPlayers) {
        Alert.alert(
          "Team Full",
          `You can only have ${config.maxPlayers} players in your team.`
        );
        return;
      }
      setTeamData((prev) => ({
        ...prev,

        [selectedSection]: [...prev[selectedSection], player],
      }));
      setShowPlayerSelectionModal(false);
    },
    [teamData, sport, selectedSection]
  );

  const removePlayer = useCallback((playerToRemove) => {
    setTeamData((prev) => {
      const newData = { ...prev };
      Object.keys(newData).forEach((section) => {
        newData[section] = newData[section].filter(
          (player) => player.id !== playerToRemove.id
        );
      });
      return newData;
    });
  }, []);

  const calculateFootballPositions = (
    section,
    players,
    fieldWidth,
    fieldHeight
  ) => {
    const positions = [];
    const padding = 10; // Padding from edges

    switch (section) {
      case "Goalkeepers":
        positions.push({
          x: (fieldWidth * 0.66) / 2,
          y: fieldHeight * 0.36,
        });
        break;

      case "Defenders":
        const defLine = fieldHeight * 0.28;
        players.forEach((player, index) => {
          const totalWidth = fieldWidth - padding * 2;
          const spacing = (totalWidth * 0.66) / (players.length + 1);
          positions.push({
            x: padding + spacing * (index + 1),
            y: defLine,
          });
        });
        break;

      case "Midfielders":
        const midLine = fieldHeight * 0.12;
        players.forEach((player, index) => {
          const totalWidth = fieldWidth - padding * 2;
          const spacing = (totalWidth * 0.66) / (players.length + 1);
          positions.push({
            x: padding + spacing * (index + 1),
            y: midLine,
          });
        });
        break;

      case "Forwards":
        const fwdLine = fieldHeight * 0.0;
        players.forEach((player, index) => {
          const totalWidth = fieldWidth - padding * 2;
          const spacing = (totalWidth * 0.66) / (players.length + 1);
          positions.push({
            x: padding + spacing * (index + 1),
            y: fwdLine,
          });
        });
        break;
    }

    return positions;
  };

  // Helper function to calculate positions for cricket
  const calculateCricketPositions = (
    section,
    players,
    fieldWidth,
    fieldHeight
  ) => {
    const positions = [];
    const padding = 3;

    switch (section) {
      case "WicketKeepers":
        positions.push({
          x: fieldWidth / 2,
          y: fieldHeight * 0.85,
        });
        break;

      case "Batsmen":
        const batsmenLine = fieldHeight * 0.3;
        players.forEach((player, index) => {
          const totalWidth = fieldWidth - padding * 2;
          const spacing = (totalWidth * 0.66) / (players.length + 1);
          positions.push({
            x: padding + spacing * (index + 1),
            y: batsmenLine,
          });
        });
        break;

      case "Bowlers":
        const bowlersLine = fieldHeight * 0.7;
        players.forEach((player, index) => {
          const totalWidth = fieldWidth - padding * 2;
          const spacing = (totalWidth * 0.66) / (players.length + 1);
          positions.push({
            x: padding + spacing * (index + 1),
            y: bowlersLine,
          });
        });
        break;

      case "AllRounders":
        const allRoundersLine = fieldHeight * 0.5;
        players.forEach((player, index) => {
          const totalWidth = fieldWidth - padding * 2;
          const spacing = (totalWidth * 0.66) / (players.length + 1);
          positions.push({
            x: padding + spacing * (index + 1),
            y: allRoundersLine,
          });
        });
        break;
    }

    return positions;
  };

  // Updated renderPitchView function
  const renderPitchView = useCallback(() => {
    const pitchBg = sport === "cricket" ? cricketPitch : footballPitch;
    const { width: fieldWidth, height: fieldHeight } = Dimensions.get("window");

    return (
      <View style={{ flex: 1, position: "relative" }}>
        <Image
          source={pitchBg}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            borderRadius: 8,
          }}
          resizeMode="cover"
        />
        {console.log(fieldHeight, fieldWidth)}
        {Object.entries(teamData).map(([section, players]) => {
          const positions =
            sport === "football"
              ? calculateFootballPositions(
                  section,
                  players,
                  fieldWidth,
                  fieldHeight
                )
              : calculateCricketPositions(
                  section,
                  players,
                  fieldWidth,
                  fieldHeight
                );

          return players.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              isPitch={true}
              onPlayerPress={handlePlayerPress}
              position={positions[index]}
            />
          ));
        })}
      </View>
    );
  }, [teamData, sport, handlePlayerPress]);

  const renderListView = useCallback(() => {
    return (
      <ScrollView className="flex-1">
        {Object.entries(SPORT_CONFIGS[sport].sections).map(
          ([section, config]) => (
            <View key={section} className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold text-gray-800">
                  {section}
                </Text>
                <Text className="text-sm text-gray-600">
                  {teamData[section]?.length || 0}/{config.max}
                </Text>
              </View>
              {teamData[section]?.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isPitch={false}
                  onPlayerPress={handlePlayerPress}
                />
              ))}
              {(teamData[section]?.length || 0) < config.max && (
                <TouchableOpacity
                  onPress={() => handleAddPlayer(section)}
                  className="bg-blue-500 p-4 rounded-xl flex-row justify-center items-center"
                >
                  <Ionicons name="add-circle-outline" size={24} color="white" />
                  <Text className="text-white font-bold ml-2">
                    Add {section}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )
        )}
      </ScrollView>
    );
  }, [teamData, sport, handleAddPlayer, handlePlayerPress]);

  const handleSave = useCallback(() => {
    const { isValid, message } = validateTeamComposition();
    if (!isValid) {
      Alert.alert("Invalid Team", message);
      return;
    }
    // Save team logic here
    Alert.alert("Success", "Team saved successfully!");
    navigation.goBack();
  }, [validateTeamComposition, navigation]);

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 px-4">
        <View className="flex-row justify-between items-center py-4">
          <SportSelector
            currentSport={sport}
            onSportChange={handleSportChange}
          />
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setViewMode("pitch")}
              className={`p-2 rounded-full mr-2 ${
                viewMode === "pitch" ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <MaterialCommunityIcons
                name="view-grid"
                size={24}
                color={viewMode === "pitch" ? "white" : "black"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode("list")}
              className={`p-2 rounded-full ${
                viewMode === "list" ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <MaterialCommunityIcons
                name="view-list"
                size={24}
                color={viewMode === "list" ? "white" : "black"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TeamStats
          totalPlayers={totalPlayers}
          teamValue={teamValue}
          avgPoints={avgPoints}
          sport={sport}
        />

        {sport === "football" && (
          <View className="mb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SPORT_CONFIGS.football.formations.map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFormation(f)}
                  className={`px-4 py-2 rounded-full mr-2 ${
                    formation === f ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <Text
                    className={`font-bold ${
                      formation === f ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {viewMode === "pitch" ? renderPitchView() : renderListView()}

        <TouchableOpacity
          onPress={handleSave}
          className="bg-green-500 py-4 rounded-xl mb-4"
        >
          <Text className="text-white font-bold text-center">Save Team</Text>
        </TouchableOpacity>

        <PlayerSelectionModal
          visible={showPlayerSelectionModal}
          onClose={() => setShowPlayerSelectionModal(false)}
          onSelectPlayer={addPlayer}
          availablePlayers={allPlayers[sport].filter(
            (player) =>
              !Object.values(teamData)
                .flat()
                .some((p) => p.id === player.id)
          )}
          section={selectedSection}
        />
      </View>
    </SafeAreaView>
  );
}
