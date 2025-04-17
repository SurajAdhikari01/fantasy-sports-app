import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Alert,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  sportState,
  teamDataState,
  showPlayerSelectionModalState,
  selectedSectionState,
  teamValueState,
  franchisesState,
  selectedTournamentState,
  playerLimitState,
  fetchedPlayersState,
  viewModeState,
  currentRoundState,
} from "./atoms";
import PitchView from "./PitchView";
import ActionButtons from "./ActionButtons";
import PlayerSelectionModal from "./PlayerSelectionModal";
import { SPORT_CONFIGS } from "./sportConfigs";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTeamActions } from "./TeamActions";
import TeamGuideModal from "./help"
import { FontAwesome5 } from "@expo/vector-icons";

const EnhancedTeamView = ({ onSubmit }) => {
  // GLOBAL/RECOIL STATE
  const [selectedTournament, setSelectedTournament] = useRecoilState(selectedTournamentState);
  const tournamentId = selectedTournament;
  const router = useRouter();
  const [sport, setSport] = useRecoilState(sportState);
  const [teamData, setTeamData] = useRecoilState(teamDataState);
  const [showPlayerSelectionModal, setShowPlayerSelectionModal] = useRecoilState(
    showPlayerSelectionModalState("default")
  );
  const currentRound = useRecoilValue(currentRoundState);
  const [selectedSection, setSelectedSection] = useRecoilState(selectedSectionState("default"));
  const [franchises, setFranchises] = useRecoilState(franchisesState);
  const [fetchedPlayers, setFetchedPlayers] = useRecoilState(fetchedPlayersState);
  const [playerLimit, setPlayerLimit] = useRecoilState(playerLimitState);
  const totalPlayers = Object.values(teamData).flat().length;
  const viewMode = useRecoilValue(viewModeState);
  const teamValue = useRecoilValue(teamValueState);
  const isViewMode = viewMode === "VIEW_TEAM";

  // UI/LOCAL STATE
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingPlayers, setIsFetchingPlayers] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerSlideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const isEditMode = viewMode === "EDIT_TEAM";
  const [filteredPlayers, setFilteredPlayers] = useState([]);

  // HEADER: Cancel/go back
  const handleCancel = useCallback(() => {
    Alert.alert(
      "Cancel Team Creation",
      "Are you sure you want to exit? Any unsaved changes will be lost.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            setSelectedTournament(null);
            setTeamData(createInitialTeamData(sport));
            router.push("/main");
          },
        },
      ],
      { cancelable: true }
    );
  }, [setSelectedTournament, sport, setTeamData]);

  // Create initial team data for the given sport
  const createInitialTeamData = useCallback((sportType) => {
    const data = {};
    Object.keys(SPORT_CONFIGS[sportType].sections).forEach((sectionKey) => {
      data[sectionKey] = [];
    });
    return data;
  }, []);

  // Reset team data when the sport changes (unless editing)
  useEffect(() => {
    if (!isEditMode) {
      setTeamData(createInitialTeamData(sport));
    }
  }, [sport, createInitialTeamData, setTeamData, isEditMode]);

  // Fetch franchises and players
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchFranchisesAndPlayers = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);

        // Fetch franchises
        const franchisesResponse = await import("../config/axios").then((mod) =>
          mod.default.get(`/tournaments/franchises/${tournamentId}`, {
            signal: abortController.signal,
          })
        );

        if (!isMounted) return;

        if (franchisesResponse.data && franchisesResponse.data.data) {
          setFranchises(franchisesResponse.data.data);
        } else if (franchisesResponse.data && franchisesResponse.data.success && Array.isArray(franchisesResponse.data.message)) {
          setFranchises(franchisesResponse.data.message);
        } else if (Array.isArray(franchisesResponse.data)) {
          setFranchises(franchisesResponse.data);
        } else {
          setFranchises([]);
        }

        // Fetch all players
        setIsFetchingPlayers(true);
        const playersResponse = await import("../config/axios").then((mod) =>
          mod.default.get(`/players/${tournamentId}/players`)
        );
        if (!isMounted) return;

        if (playersResponse.data.success && Array.isArray(playersResponse.data.data)) {
          const playersWithFranchises = playersResponse.data.data.map((player) => ({
            ...player,
            franchise: player.franchise || { name: "Free Agent" },
          }));
          setFetchedPlayers(playersWithFranchises);
        } else {
          setFetchedPlayers([]);
        }
      } catch (err) {
        setFranchises([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsFetchingPlayers(false);
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

  // Extracted team actions
  const {
    handleFranchiseChange,
    validateTeam,
    addPlayer,
    removePlayer,
    handleRemovePlayer,
    handleNext,
    handleOpenPlayerSelection,
  } = useTeamActions({
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
  });
  const [guideVisible, setGuideVisible] = useState(false);
  // Loading indicator
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
        <StatusBar barStyle="light-content" backgroundColor="#111827" />
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-white mt-3 text-base">Loading team data...</Text>
      </SafeAreaView>
    );
  }

  // Header info
  const deadline = "Sat 25 Jan 19:15";
  const isOverBudget = parseFloat(teamValue) > SPORT_CONFIGS[sport].maxTeamValue;

  // Function to handle clearing the entire team
  const handleClearTeam = () => {
    // Get total player count to check if there are players to remove
    const totalPlayers = [
      ...(teamData?.goalkeepers || []),
      ...(teamData?.defenders || []),
      ...(teamData?.midfielders || []),
      ...(teamData?.forwards || []),
      ...(teamData?.all || [])
    ].length;

    if (totalPlayers === 0) {
      Alert.alert("No Players", "There are no players to remove.");
      return;
    }

    Alert.alert(
      "Clear Team",
      "Are you sure you want to remove all players?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            // Check if we have a dedicated function for clearing all players
            if (typeof handleClearAllPlayers === 'function') {
              // Use the dedicated function if available
              handleClearAllPlayers();
            } else {
              // Fallback: collect all players into a single array
              const allPlayers = [
                ...(teamData?.goalkeepers || []),
                ...(teamData?.defenders || []),
                ...(teamData?.midfielders || []),
                ...(teamData?.forwards || []),
                ...(teamData?.all || [])
              ];

              // Create a unique list of players by ID to avoid duplicates
              const uniquePlayers = {};
              allPlayers.forEach(player => {
                if (player && player._id) {
                  uniquePlayers[player._id] = player;
                }
              });

              // Remove each player with the "skipConfirmation" flag set to true
              Object.values(uniquePlayers).forEach(player => {
                handleRemovePlayer(player, true);
              });
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* Header */}
      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.07)",
          transform: [{ translateY: headerSlideAnim }],
          opacity: fadeAnim,
        }}
      >
        <TouchableOpacity
          onPress={handleCancel}
          className="p-2 rounded-full bg-gray-700/80"
        >
          <AntDesign name="arrowleft" size={22} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">
          {isEditMode ? "Edit Team" : "Create Team"}
        </Text>
        <TouchableOpacity
          className="p-2 rounded-full bg-gray-700/80"
          onPress={() => setGuideVisible(true)}
        >
          <AntDesign name="questioncircleo" size={22} color="white" />
        </TouchableOpacity>
        <TeamGuideModal visible={guideVisible} onClose={() => setGuideVisible(false)} />

      </Animated.View>

      {/* Team Value Section */}
      <Animated.View
        style={{
          margin: 16,
          borderRadius: 14,
          overflow: "hidden",
          elevation: 5,
          opacity: fadeAnim,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.23,
          shadowRadius: 4,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        }}
      >
        <LinearGradient
          colors={["#111827", "#1F2937"]}
          className="rounded-xl"
        >
          <View className="p-4 flex-row justify-between items-center">
            <View>
              <View className="flex-row items-center bg-emerald-500/10 px-3 py-1.5 rounded-xl mb-2">
                <MaterialIcons name="sports" size={14} color="#10B981" />
                <Text className="text-emerald-500 text-sm font-bold ml-1">{currentRound}</Text>
              </View>
              <Text className="text-gray-400 text-sm">
                Deadline: <Text className="text-white font-medium">{deadline}</Text>
              </Text>
            </View>
            <View className="items-end">
              <Text
                className={`text-2xl font-bold text-right ${isOverBudget ? "text-red-500" : "text-emerald-500"}`}
              >
                $
                {isOverBudget
                  ? `-${(parseFloat(teamValue) - 100).toFixed(1)}`
                  : parseFloat(teamValue).toFixed(1)}
                M
              </Text>
              <View className="items-end">
                <Text className="text-gray-400 text-xs text-right">
                  Team Value ({totalPlayers}/{playerLimit})
                </Text>
                {isOverBudget && (
                  <Text className="text-red-500 text-xs mt-0.5">Exceeds budget</Text>
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
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <View
            style={{
              height: "100%",
              width: `${Math.min(100, (totalPlayers / playerLimit) * 100)}%`,
              backgroundColor: totalPlayers === playerLimit ? "#10B981" : "#3B82F6",
              borderRadius: 3,
            }}
          />
        </View>

        <Text className="text-gray-400 text-xs mt-1 text-center">
          {totalPlayers === playerLimit
            ? "Team complete!"
            : `${playerLimit - totalPlayers} more player${playerLimit - totalPlayers !== 1 ? "s" : ""} needed`}
        </Text>
      </Animated.View>


      {/* Main Content */}
      <Animated.View
        style={{
          flex: 1,
          position: "relative",
          paddingBottom: 80,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {!isViewMode && (
          <TouchableOpacity
            className="absolute top-4 right-4 bg-red-500 rounded-md px-3 py-2 z-20"
            onPress={handleClearTeam}
          >
            <View className="flex-row items-center">
              {/* <Text>"Clear Team"</Text> */}
              <FontAwesome5 name="trash" size={16} color="white" style={{ marginRight: 5 }} />
              <View className="bg-white/20 w-[1px] h-4 mx-1" />
              <View className="px-1">
                <FontAwesome5 name="user-minus" size={13} color="white" />
              </View>
            </View>
          </TouchableOpacity>
        )}
        <View className="flex-1 pt-2 pb-1">

          <PitchView
            teamData={teamData}
            handleOpenPlayerSelection={handleOpenPlayerSelection}
            handleRemovePlayer={handleRemovePlayer}
            style={{
              width: "100%",
              height: Dimensions.get("window").height * 0.6,
            }}
          />
        </View>
        <View className="px-4 pb-4">
          <ActionButtons
            handleNext={handleNext}
            setShowPlayerSelectionModal={() => {
              const addedPlayerIds = Object.values(teamData)
                .flat()
                .map((player) => player._id);
              const availablePlayers = fetchedPlayers.filter(
                (player) => player && !addedPlayerIds.includes(player._id)
              );
              setFilteredPlayers(availablePlayers);
              setSelectedSection(null);
              setShowPlayerSelectionModal(true);
            }}
            isFetchingPlayers={isFetchingPlayers}
          />
        </View>
      </Animated.View>

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