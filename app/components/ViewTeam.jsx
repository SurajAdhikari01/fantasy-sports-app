import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
  Platform,
  StyleSheet,
} from "react-native";
// Use SafeAreaView for overall screen layout
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecoilState, useRecoilValue, useResetRecoilState } from "recoil";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import PitchView from "./PitchView"; // Assuming PitchView adapts to dark theme
import {
  selectedTournamentState,
  playerLimitState,
  viewModeState,
  totalPointsState,
  teamIdState,
} from "./atoms";
import api from "../config/axios";

// Get screen dimensions
const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

// --- HomeScreen Theme (Keep as is) ---
const homeScreenTheme = {
  background: "bg-neutral-900",
  card: "bg-neutral-800",
  surface: "bg-neutral-800",
  modalSurface: "bg-[#2d2d2d]",
  textPrimary: "text-white",
  textSecondary: "text-neutral-400",
  textMuted: "text-neutral-500",
  textAccent: "text-red-500",
  border: "border-neutral-700",
  separator: "bg-neutral-600",
  accentPrimary: "bg-red-500",
  accentPrimaryActive: "active:bg-red-600",
  accentSecondary: "bg-pink-500",
  accentSecondaryActive: "active:bg-pink-600",
  iconColorPrimaryClass: "text-neutral-200",
  iconColorSecondaryClass: "text-neutral-400",
  iconColorPrimaryValue: "#e5e5e5",
  iconColorSecondaryValue: "#a3a3a3",
  iconAccentValue: "#ef4444",
  badgeBg: "bg-red-500",
  badgeText: "text-white",
  tabBarBackground: "bg-neutral-800",
  tabInactiveBackground: "bg-neutral-800",
  tabActiveBackground: "bg-red-500",
  tabInactiveText: "text-neutral-400",
  tabActiveText: "text-white",
  refreshControlColor: "#ef4444",
  activityIndicatorColor: "#ef4444",
  shadow: Platform.OS === "ios" ? "shadow" : "shadow-xl",
};
// --- End HomeScreen Theme ---

const ViewTeam = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [selectedTournament, setSelectedTournament] = useRecoilState(
    selectedTournamentState
  );
  const [currentStage, setCurrentStage] = useState("knockout");
  const playerLimit = useRecoilValue(playerLimitState);
  const totalPoints = useRecoilValue(totalPointsState);
  const [teamId, setTeamId] = useRecoilState(teamIdState);

  // Reset functions
  const resetSelectedTournament = useResetRecoilState(selectedTournamentState);
  const resetPlayerLimit = useResetRecoilState(playerLimitState);
  const resetViewMode = useResetRecoilState(viewModeState);
  const resetTeamId = useResetRecoilState(teamIdState);

  // --- API Fetching Logic (Keep as is) ---
  const fetchTournamentPlayers = useCallback(async () => {
    if (!selectedTournament) {
      setLoading(false);
      setPlayers([]);
      setTeamId(null);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get(`/teams`);
      if (response.data.success && Array.isArray(response.data.data)) {
        const teamForTournament = response.data.data.find(
          (team) => team.tournamentId?._id === selectedTournament
        );
        if (teamForTournament) {
          setTeamId(teamForTournament);
          const stagePlayers = [
            ...(teamForTournament.players?.[currentStage] || []),
          ].map((p) => ({
            ...p,
            playerType: (p.playerType?.toLowerCase() || "").trim(),
            photo:
              p.photo ||
              "https://i0.wp.com/e-quester.com/wp-content/uploads/2021/11/placeholder-image-person-jpg.jpg?fit=820%2C678&ssl=1",
          }));
          setPlayers(stagePlayers);
        } else {
          setPlayers([]);
          setTeamId(null);
          console.log("No team found.");
        }
      } else {
        Alert.alert("Error", response.data.message || "Could not fetch teams.");
        setPlayers([]);
        setTeamId(null);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      Alert.alert("Error", "Failed to load team data.");
      setPlayers([]);
      setTeamId(null);
    } finally {
      setLoading(false);
    }
  }, [selectedTournament, currentStage, setTeamId]);

  useEffect(() => {
    fetchTournamentPlayers();
  }, [fetchTournamentPlayers]);
  // --- End API Logic ---

  // --- Handlers (Keep as is) ---
  const handleEdit = () => {
    if (!teamId?._id) {
      Alert.alert("Error", "No team selected or data missing.");
      return;
    }
    router.push({
      pathname: "components/EditTeam",
      params: { teamId: teamId._id },
    });
  };

  const handleBack = () => {
    resetSelectedTournament();
    resetPlayerLimit();
    resetViewMode();
    resetTeamId();
  };
  // --- End Handlers ---

  // --- Render Functions ---
  const renderContent = () => {
    // **Enhanced Empty State**
    if (players.length === 0) {
      return (
        <View className="flex-1 justify-center items-center px-8 pb-16">
          <MaterialCommunityIcons
            name="tshirt-crew-outline" // Different icon maybe?
            size={72} // Larger icon
            color={homeScreenTheme.iconColorSecondaryValue}
          />
          <Text
            className={`${homeScreenTheme.textPrimary} text-xl font-semibold text-center mt-5`}
          >
            Team Not Set
          </Text>
          <Text
            className={`${homeScreenTheme.textSecondary} text-center text-sm mt-2`}
          >
            Your team for the '{currentStage}' stage isn't available. It might
            not have started, or players need to be added.
          </Text>
          {/* Optional: Add Edit button here too if applicable */}
          {teamId?._id && (
            <TouchableOpacity
              onPress={handleEdit}
              className={`mt-8 ${homeScreenTheme.accentPrimary} ${homeScreenTheme.accentPrimaryActive} px-6 py-2.5 rounded-full flex-row items-center ${homeScreenTheme.shadow}`}
            >
              <Ionicons name="create-outline" size={18} color="white" />
              <Text className="text-white font-medium ml-2 text-sm">
                Edit Team
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    // **Pitch View and Status Card**
    return (
      <View className="flex-1">
        {/* Container for PitchView with subtle background */}
        <View
          style={{ height: screenHeight * 0.58 }} // Slightly adjusted height
          // Added subtle background and padding
          className={`mb-4 mx-2 rounded-lg ${homeScreenTheme.card} overflow-hidden border ${homeScreenTheme.border} p-1`}
        >
          <PitchView
            teamData={{ all: players }}
            handlePlayerPress={(player) =>
              Alert.alert(player.name, `Price: ${player.price || "N/A"}`)
            }
            handleOpenPlayerSelection={(section, positionId, position) =>
              Alert.alert("Add Player", `Add player to ${section}`)
            }
            handleRemovePlayer={(player) =>
              Alert.alert("Remove Player", `Remove ${player.name}?`, [
                { text: "Cancel" },
                { text: "Remove", style: "destructive" },
              ])
            }
          />
        </View>

        {/* **Enhanced Squad Status Card** */}
        <View className="mb-6 mx-4">
          <View
            className={`${homeScreenTheme.card} p-4 rounded-lg ${homeScreenTheme.shadow} border ${homeScreenTheme.border}`}
          >
            <View className="flex-row justify-between items-center">
              {/* Player Count */}
              <View>
                <View className="flex-row items-center">
                  <Ionicons
                    name="people-outline"
                    size={20}
                    color={homeScreenTheme.iconColorSecondaryValue}
                  />
                  <Text
                    className={`${homeScreenTheme.textPrimary} font-semibold text-lg ml-1.5`}
                  >
                    {players.length} / {playerLimit || "-"}
                  </Text>
                </View>
                <Text
                  className={`${homeScreenTheme.textSecondary} text-xs mt-0.5`}
                >
                  Players Selected
                </Text>
              </View>

              {/* Points Display */}
              <View className="items-end">
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="star-circle-outline"
                    size={20}
                    color={homeScreenTheme.iconAccentValue}
                  />
                  <Text
                    className={`${homeScreenTheme.textPrimary} font-bold text-xl ml-1.5`}
                  >
                    {" "}
                    {/* Larger points */}
                    {totalPoints}
                  </Text>
                </View>
                <Text
                  className={`${homeScreenTheme.textSecondary} text-xs mt-0.5`}
                >
                  Total Score
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };
  // --- End Render Functions ---

  return (
    <View
      className={`flex-1 ${homeScreenTheme.background}`}
      edges={["top", "left", "right"]}
    >
      {/* **Enhanced Header** */}
      <View
        className={`px-4 py-3 flex-row items-center justify-between border-b ${homeScreenTheme.border} mb-1`}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={handleBack}
          className={`${homeScreenTheme.card} w-10 h-10 rounded-full items-center justify-center ${homeScreenTheme.shadow}`} // Slightly larger touch target
        >
          <Ionicons
            name="arrow-back-outline"
            size={22}
            color={homeScreenTheme.iconColorPrimaryValue}
          />
        </TouchableOpacity>

        {/* Title */}
        <Text
          className={`text-xl font-semibold ${homeScreenTheme.textPrimary}`}
        >
          View Team
        </Text>

        {/* Edit Button */}
        {teamId?._id ? (
          <TouchableOpacity
            onPress={handleEdit}
            className={`${homeScreenTheme.card} w-10 h-10 rounded-full items-center justify-center ${homeScreenTheme.shadow}`} // Slightly larger touch target
          >
            <Ionicons
              name="create-outline"
              size={22}
              color={homeScreenTheme.iconAccentValue}
            />
          </TouchableOpacity>
        ) : (
          <View className="w-10 h-10" />
        )}
      </View>

      {/* **Enhanced Stage Tabs** */}
      <View className="px-4 pt-3 pb-3">
        <View
          className={`flex-row ${homeScreenTheme.tabBarBackground} p-1 rounded-lg`}
        >
          {[
            {
              title: "Knockout",
              stageName: "knockout",
              icon: "trophy-outline",
            },
            {
              title: "Semi Final",
              stageName: "semifinal",
              icon: "git-network-outline",
            }, // Spelled out
            { title: "Final", stageName: "final", icon: "star-outline" },
          ].map((stage) => (
            <TouchableOpacity
              key={stage.stageName}
              className={`flex-1 py-2.5 px-2 rounded-md flex-row items-center justify-center ${
                // Increased vertical padding
                currentStage === stage.stageName
                  ? `${homeScreenTheme.tabActiveBackground} ${homeScreenTheme.shadow}`
                  : homeScreenTheme.tabInactiveBackground
              }`}
              onPress={() => setCurrentStage(stage.stageName)}
            >
              <Ionicons
                name={stage.icon}
                size={16}
                color={
                  currentStage === stage.stageName
                    ? homeScreenTheme.iconColorPrimaryValue
                    : homeScreenTheme.iconColorSecondaryValue
                }
              />
              <Text
                className={`font-medium text-sm ml-1.5 ${
                  currentStage === stage.stageName
                    ? homeScreenTheme.tabActiveText
                    : homeScreenTheme.tabInactiveText
                }`}
              >
                {stage.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main Content Area */}
      {loading ? (
        <View className="flex-1 justify-center items-center pb-16">
          <ActivityIndicator
            size="large"
            color={homeScreenTheme.activityIndicatorColor}
          />
          <Text className={`${homeScreenTheme.textMuted} mt-4 font-medium`}>
            Loading Team...
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {renderContent()}
        </ScrollView>
      )}
    </View>
  );
};

export default ViewTeam;
