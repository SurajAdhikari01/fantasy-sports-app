import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
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
  Animated,
  TextInput,
  Easing,
} from "react-native";
import cricketPitch from "../../assets/cricket-field.jpeg";
import footballPitch from "../../assets/football-field.jpg";
import { useNavigation } from "@react-navigation/native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  Feather,
} from "@expo/vector-icons";

// Enhanced Sample Data
const allPlayers = {
  cricket: [
    {
      id: "1",
      name: "Virat Kohli",
      team: "RCB",
      role: "Batsmen",
      price: 12.0,
      points: 95,
      image: "https://example.com/kohli.jpg",
      stats: {
        matches: 200,
        average: 50.3,
        strikeRate: 138.2,
      },
    },
    {
      id: "2",
      name: "Jasprit Bumrah",
      team: "MI",
      role: "Bowlers",
      price: 11.0,
      points: 88,
      image: "https://example.com/bumrah.jpg",
      stats: {
        wickets: 150,
        economy: 6.8,
        average: 22.4,
      },
    },
    {
      id: "3",
      name: "MS Dhoni",
      team: "CSK",
      role: "WicketKeepers",
      price: 10.0,
      points: 85,
      image: "https://example.com/dhoni.jpg",
      stats: {
        stumpings: 123,
        catches: 294,
        average: 38.5,
      },
    },
    // Add more cricket players...
  ],
  football: [
    {
      id: "f1",
      name: "Lionel Messi",
      team: "Inter Miami",
      role: "Forward",
      price: 15.0,
      points: 98,
      image: "https://example.com/messi.jpg",
      stats: {
        goals: 672,
        assists: 285,
        matches: 778,
      },
    },
    {
      id: "f2",
      name: "Manuel Neuer",
      team: "Bayern Munich",
      role: "Goalkeepers",
      price: 10.0,
      points: 89,
      image: "https://example.com/neuer.jpg",
      stats: {
        cleanSheets: 208,
        saves: 476,
        matches: 458,
      },
    },
    // Add more football players...
  ],
};

// Configuration objects for each sport
const SPORT_CONFIGS = {
  cricket: {
    maxPlayers: 11,
    maxTeamValue: 100,
    sections: {
      Batsmen: { min: 3, max: 6 },
      Bowlers: { min: 3, max: 6 },
      AllRounders: { min: 1, max: 4 },
      WicketKeepers: { min: 1, max: 2 },
    },
    fieldPositions: {
      Batsmen: { y: 200, spread: true },
      Bowlers: { y: 400, spread: true },
      AllRounders: { y: 300, spread: true },
      WicketKeepers: { y: 500, spread: false },
    },
  },
  football: {
    maxPlayers: 11,
    maxTeamValue: 120,
    sections: {
      Goalkeepers: { min: 1, max: 1 },
      Defenders: { min: 3, max: 5 },
      Midfielders: { min: 2, max: 5 },
      Forwards: { min: 1, max: 3 },
    },
    fieldPositions: {
      Goalkeepers: { y: 550, spread: false },
      Defenders: { y: 400, spread: true },
      Midfielders: { y: 250, spread: true },
      Forwards: { y: 100, spread: true },
    },
  },
};

// Reusable Components
const StatsBox = ({ label, value, icon }) => (
  <View className="bg-gray-700 rounded-lg py-3 flex-1 mx-1">
    <View className="flex-row items-center justify-center mb-1">
      <Feather name={icon} size={16} color="#60A5FA" />
      <Text className="text-white text-xs ml-1">{label}</Text>
    </View>
    <Text className="text-center text-white font-bold">{value}</Text>
  </View>
);

const PlayerCard = React.memo(
  ({ player, isPitch, onPlayerPress, position }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, []);

    const cardStyle = position
      ? {
          position: "absolute",
          top: position.y,
          left: position.x,
        }
      : {};

    return (
      <Animated.View
        style={[cardStyle, { opacity: fadeAnim }]}
        className={`${
          isPitch
            ? "bg-white/90 rounded-lg shadow-lg m-2 w-20 h-28"
            : "bg-white rounded-2xl shadow-lg p-4 mb-3"
        }`}
      >
        <TouchableOpacity onPress={() => onPlayerPress(player)}>
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
          <View className={`${isPitch ? "mt-3" : "mt-4"}`}>
            <Text
              className={`font-bold ${
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
                    <FontAwesome5
                      name="dollar-sign"
                      size={12}
                      color="#4B5563"
                    />
                    {player.price}M
                  </Text>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

// Team Stats Component
const TeamStats = React.memo(({ teamValue, totalPoints }) => (
  <View className="flex-row justify-around items-center py-3 w-2/3">
    <StatsBox label="Team Value" value={`$${teamValue}M`} icon="dollar-sign" />
    <StatsBox label="Total Points" value={totalPoints} icon="star" />
  </View>
));

// Player Stats Modal
const PlayerStatsModal = React.memo(({ player, visible, onClose }) => {
  if (!player) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-5">
          <View className="flex-row items-center mb-4">
            <Image
              source={{ uri: player.image }}
              className="w-20 h-20 rounded-full"
            />
            <View className="ml-4">
              <Text className="text-xl font-bold">{player.name}</Text>
              <Text className="text-gray-600">{player.team}</Text>
            </View>
          </View>

          <View className="flex-row justify-around mb-4">
            <StatsBox label="Points" value={player.points} icon="star" />
            <StatsBox
              label="Price"
              value={`$${player.price}M`}
              icon="dollar-sign"
            />
            <StatsBox label="Role" value={player.role} icon="user" />
          </View>

          {player.stats && (
            <View className="border-t border-gray-200 pt-4">
              {Object.entries(player.stats).map(([key, value]) => (
                <View
                  key={key}
                  className="flex-row justify-between py-2 border-b border-gray-100"
                >
                  <Text className="capitalize text-gray-600">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Text>
                  <Text className="font-bold">{value}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={onClose}
            className="mt-6 bg-blue-500 p-4 rounded-full"
          >
            <Text className="text-white text-center font-bold">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

// Filter and Sort Component
const FilterSortBar = React.memo(
  ({ sport, filterRole, setFilterRole, sortBy, setSortBy }) => {
    const roles = Object.keys(SPORT_CONFIGS[sport].sections);

    return (
      <View className="px-4 py-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => setFilterRole("All")}
            className={`px-4 py-2 rounded-full mr-2 ${
              filterRole === "All" ? "bg-blue-500" : "bg-gray-700"
            }`}
          >
            <Text className="text-white">All</Text>
          </TouchableOpacity>
          {roles.map((role) => (
            <TouchableOpacity
              key={role}
              onPress={() => setFilterRole(role)}
              className={`px-4 py-2 rounded-full mr-2 ${
                filterRole === role ? "bg-blue-500" : "bg-gray-700"
              }`}
            >
              <Text className="text-white">{role}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="flex-row mt-2">
          <TouchableOpacity
            onPress={() => setSortBy("points")}
            className={`px-4 py-2 rounded-full mr-2 ${
              sortBy === "points" ? "bg-blue-500" : "bg-gray-700"
            }`}
          >
            <Text className="text-white">Sort by Points</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSortBy("price")}
            className={`px-4 py-2 rounded-full mr-2 ${
              sortBy === "price" ? "bg-blue-500" : "bg-gray-700"
            }`}
          >
            <Text className="text-white">Sort by Price</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

// Main TeamView Component
export default function TeamView() {
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
    let players = allPlayers[sport].filter(
      (player) =>
        !Object.values(teamData)
          .flat()
          .some((p) => p.id === player.id)
    );

    if (filterRole !== "All") {
      players = players.filter((p) => p.role === filterRole);
    }

    return [...players].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [sport, filterRole, sortBy, teamData]);

  // Continue with the rest of the code...
  // Continuing from previous code...

  const validateTeam = useCallback(() => {
    const errors = [];
    const config = SPORT_CONFIGS[sport];

    // Check total players
    if (totalPlayers !== config.maxPlayers) {
      errors.push(`Team must have exactly ${config.maxPlayers} players`);
    }

    // Check section requirements
    Object.entries(config.sections).forEach(([section, { min, max }]) => {
      const count = teamData[section]?.length || 0;
      if (count < min) {
        errors.push(`Need at least ${min} ${section}`);
      }
      if (count > max) {
        errors.push(`Cannot have more than ${max} ${section}`);
      }
    });

    // Check team value
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

      // Validate max players
      if (totalPlayers >= config.maxPlayers) {
        Alert.alert(
          "Team Full",
          `You can only have ${config.maxPlayers} players in your team.`
        );
        return;
      }

      // Validate section limit
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

      // Validate team value
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

    // Simulate saving to backend
    Alert.alert("Success", "Team saved successfully!", [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]);
  }, [validateTeam, navigation]);

  const calculatePositions = useCallback(
    (section, players) => {
      const { width: fieldWidth } = Dimensions.get("window");
      const positions = [];
      const config = SPORT_CONFIGS[sport].fieldPositions[section];
      const padding = 20;

      if (!config) return positions;

      if (config.spread) {
        players.forEach((_, index) => {
          const totalWidth = fieldWidth - padding * 2;
          const spacing = totalWidth / (players.length + 1);
          positions.push({
            x: padding + spacing * (index + 1),
            y: config.y,
          });
        });
      } else {
        // Center position for non-spread positions (like goalkeeper)
        const xPos = (fieldWidth - padding * 2) / 2;
        positions.push({
          x: xPos,
          y: config.y,
        });
      }

      return positions;
    },
    [sport]
  );
  // Sport Selector Component
  const SportSelector = React.memo(({ currentSport, onSportChange }) => {
    return (
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
          className={`p-2 rounded-full ml-2 ${
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
    );
  });
  // Player Selection Modal Component
  const PlayerSelectionModal = React.memo(
    ({ visible, onClose, onSelectPlayer, availablePlayers, section }) => {
      const [searchQuery, setSearchQuery] = useState("");
      const [fadeAnim] = useState(new Animated.Value(0)); // Initial opacity value for fade animation

      useEffect(() => {
        if (visible) {
          // Fade in the background when the modal is visible
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }).start();
        } else {
          // Fade out the background when the modal is hidden
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }).start();
        }
      }, [visible]);

      const filteredPlayers = useMemo(() => {
        return availablePlayers.filter(
          (player) =>
            player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            player.team.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }, [availablePlayers, searchQuery]);

      return (
        <Modal
          visible={visible}
          animationType="slide"
          transparent={true}
          onRequestClose={onClose}
        >
          <Animated.View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5)"],
              }),
            }}
          >
            <View style={{ backgroundColor: "transparent", height: "25%" }} />
            <View style={{ backgroundColor: "transparent", height: "75%" }}>
              <View className="bg-gray-900 rounded-t-3xl p-5 h-full">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-2xl font-bold text-white">
                    Select {section}
                  </Text>
                  <TouchableOpacity
                    onPress={onClose}
                    className="p-2 rounded-full bg-gray-800"
                  >
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="bg-gray-800 rounded-xl flex-row items-center px-4 mb-4">
                  <Ionicons name="search" size={20} color="#a0aec0" />
                  <TextInput
                    placeholder="Search players..."
                    placeholderTextColor="#a0aec0"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="flex-1 py-3 px-2 text-white"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                      <Ionicons name="close-circle" size={20} color="#a0aec0" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Players List */}
                {filteredPlayers.length > 0 ? (
                  <FlatList
                    data={filteredPlayers}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => onSelectPlayer(item)}
                        className="bg-gray-800 rounded-xl p-4 mb-3 flex-row items-center"
                      >
                        <Image
                          source={{ uri: item.image }}
                          className="w-16 h-16 rounded-full"
                        />
                        <View className="ml-4 flex-1">
                          <Text className="text-lg font-bold text-white">
                            {item.name}
                          </Text>
                          <Text className="text-gray-400">
                            {item.team} • {item.role}
                          </Text>
                          <View className="flex-row mt-2">
                            <View className="bg-blue-500/20 rounded-full px-3 py-1 mr-2">
                              <Text className="text-blue-400 text-sm">
                                ${item.price}M
                              </Text>
                            </View>
                            <View className="bg-green-500/20 rounded-full px-3 py-1">
                              <Text className="text-green-400 text-sm">
                                {item.points} pts
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View className="bg-blue-500 rounded-full p-2">
                          <Ionicons name="add" size={24} color="white" />
                        </View>
                      </TouchableOpacity>
                    )}
                    contentContainerClassName="pb-4"
                  />
                ) : (
                  <View className="flex-1 justify-center items-center">
                    <MaterialCommunityIcons
                      name="account-search"
                      size={48}
                      color="#a0aec0"
                    />
                    <Text className="text-gray-400 mt-4 text-lg">
                      No players found
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        </Modal>
      );
    }
  );
  // Render Functions
  const renderPitchView = useCallback(() => {
    const pitchBg = sport === "cricket" ? cricketPitch : footballPitch;

    return (
      <View className="flex-1">
        {/* Buttons Section - Moved to top */}
        <View className="px-4 pt-4 pb-2 absolute bottom-4 w-screen z-50">
          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={() => setShowPlayerSelectionModal(true)}
              className="flex-1 bg-blue-500 p-4 rounded-xl mr-2 shadow-sm
                         active:bg-blue-600"
            >
              <Text className="text-white text-center font-bold">
                + Add Players
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              className="flex-1 bg-green-500 p-4 rounded-xl ml-2 shadow-sm
                         active:bg-green-600"
            >
              <Text className="text-white text-center font-bold">Next</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pitch View - Takes remaining space */}
        <View className="flex-1 relative">
          <Image
            source={pitchBg}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              borderRadius: 8,
              transform: [
                { perspective: 500 },
                { rotateX: "60deg" },
                { scale: 1.2 },
              ],
            }}
            resizeMode="cover"
          />

          {/* Players Layer */}
          {Object.entries(teamData).map(([section, players]) => {
            const positions = calculatePositions(section, players);
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
      </View>
    );
  }, [teamData, sport, calculatePositions, handlePlayerPress, handleNext]);

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1">
        <View className="flex-row justify-between items-center p-4">
          <SportSelector
            currentSport={sport}
            onSportChange={handleSportChange}
          />
          <TeamStats teamValue={teamValue} totalPoints={totalPoints} />
        </View>

        {renderPitchView()}

        <PlayerStatsModal
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
      </View>
    </SafeAreaView>
  );
}
