import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import api from "../config/axios"; // Assuming path is correct
import { useRecoilState } from "recoil";
import {
  fetchedPlayersState,
  selectedTournamentState,
  playerLimitState,
  totalPointsState,
  viewModeState,
} from "./atoms"; // Assuming path is correct
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth } = Dimensions.get("window"); // Get screen width

// --- Using the HomeScreen Theme ---
const homeScreenTheme = {
  // Core Backgrounds and Surfaces
  background: "bg-neutral-900", // Matches #2a2a2a (very dark gray)
  card: "bg-neutral-800", // Matches #3a3a3a used for stat boxes
  surface: "bg-neutral-800", // General surface color, can be same as card
  modalSurface: "bg-[#2d2d2d]", // Specific color from modal styles (can keep hex or map to Tailwind like bg-neutral-800/bg-neutral-700)

  // Text Colors
  textPrimary: "text-white", // High-emphasis text
  textSecondary: "text-neutral-400", // Matches text-gray-400 for subheadings/labels
  textMuted: "text-neutral-500", // Lower emphasis text (slightly darker gray)
  textAccent: "text-red-500", // For accent text like logout

  // Borders and Separators
  border: "border-neutral-700", // Subtle border for dark theme
  separator: "bg-neutral-600", // Separator color from modal styles (#555)

  // Primary Accent (Derived from the red/orange gradient/logout button)
  accentPrimary: "bg-red-500", // Matches #ff4b2b or similar red/orange
  accentPrimaryActive: "active:bg-red-600", // Darker shade for press state

  // Secondary Accent (Derived from the pink/red part of the gradient)
  accentSecondary: "bg-pink-500", // Matches #ff416c or similar pink/red
  accentSecondaryActive: "active:bg-pink-600",

  // Icons - Store the TEXT color class here
  iconColorPrimaryClass: "text-neutral-200", // Class for primary icons
  iconColorSecondaryClass: "text-neutral-400", // Class for secondary icons
  // Store the actual COLOR value for direct use in props
  iconColorPrimaryValue: "#e5e5e5", // neutral-200
  iconColorSecondaryValue: "#a3a3a3", // neutral-400

  // Badges (Using primary accent color as an example)
  badgeBg: "bg-red-500", // Use primary accent for badge bg
  badgeText: "text-white", // White text on primary accent

  // Tab Bar (Inferring from HomeScreen style)
  tabBarBackground: "bg-neutral-800", // Use card color for tab background
  tabInactiveBackground: "bg-neutral-800", // Inactive tabs match background
  tabActiveBackground: "bg-red-500", // Use primary accent for active tab
  tabInactiveText: "text-neutral-400", // Use secondary text color
  tabActiveText: "text-white", // White text on active tab color

  // Component-Specific Colors (Using Hex for consistency if needed by component)
  refreshControlColor: "#ef4444", // Hex for red-500
  activityIndicatorColor: "#ef4444", // Hex for red-500

  // Shadows (Keep platform-specific logic)
  shadow: Platform.OS === "ios" ? "shadow" : "shadow-xl", // Use Tailwind shadow classes
};
// --- End HomeScreen Theme ---

const TournamentSelect = () => {
  const [joinedTournaments, setJoinedTournaments] = useState([]);
  const [availableTournaments, setAvailableTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 for "My Tournaments", 1 for "Available"
  const router = useRouter();
  const scrollViewRef = useRef(null); // Ref for ScrollView

  // Recoil state
  const [fetchedPlayers, setFetchedPlayers] =
    useRecoilState(fetchedPlayersState);
  const [selectedTournament, setSelectedTournament] = useRecoilState(
    selectedTournamentState
  );
  const [totalPoints, setTotalPoints] = useRecoilState(totalPointsState);
  const [playerLimit, setPlayerLimit] = useRecoilState(playerLimitState);
  const [selectedTournamentPlayers, setSelectedTournamentPlayers] = useState(
    []
  );
  const [viewMode, setViewMode] = useRecoilState(viewModeState);

  const tabs = [
    { key: "joined", title: "My Tournaments" },
    { key: "available", title: "Available" },
  ];

  // --- API Calls and Logic (Keep as is) ---
  const fetchTournaments = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const [joinedResponse, availableResponse] = await Promise.all([
        api.get("/teams"),
        api.get("/tournaments/getAllTournaments"),
      ]);

      if (joinedResponse.data.success) {
        setJoinedTournaments(joinedResponse.data.data || []);
      } else {
        Alert.alert(
          "Error Fetching Joined",
          joinedResponse.data.message || "Failed to fetch joined tournaments"
        );
        setJoinedTournaments([]);
      }

      if (availableResponse.data.success) {
        setAvailableTournaments(availableResponse.data.data || []);
      } else {
        Alert.alert(
          "Error Fetching Available",
          availableResponse.data.message ||
            "Failed to fetch available tournaments"
        );
        setAvailableTournaments([]);
      }
    } catch (error) {
      Alert.alert(
        "Network Error",
        "Failed to fetch tournaments. Check connection."
      );
      console.error("Error fetching tournaments:", error);
      setJoinedTournaments([]);
      setAvailableTournaments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const handleJoinTournament = async (tournamentId, playerLimitPerTeam) => {
    try {
      setLoading(true);
      const response = await api.get(`/players/${tournamentId}/players`);

      if (response.data.success) {
        setSelectedTournament(tournamentId);
        setPlayerLimit(playerLimitPerTeam);
        setFetchedPlayers(response.data.data || []);
        router.push("main");
      } else {
        Alert.alert(
          "Error Joining",
          response.data.message || "Failed to fetch players for tournament"
        );
      }
    } catch (error) {
      Alert.alert(
        "Action Failed",
        "Could not join tournament. Please try again."
      );
      console.error("Error joining tournament/fetching players:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTournaments();
  }, [fetchTournaments]);
  // --- End API Calls and Logic ---

  // --- Render Item Functions (Applying homeScreenTheme) ---
  const renderJoinedTournamentItem = ({ item }) => (
    <View
      // Use theme for card, shadow, border
      className={`${homeScreenTheme.card} rounded-lg ${homeScreenTheme.shadow} p-4 mb-4 mx-4 border ${homeScreenTheme.border}`}
    >
      <View className="flex-row justify-between items-start mb-2">
        {/* Use theme for text */}
        <Text
          className={`text-lg font-bold ${homeScreenTheme.textPrimary} flex-1 mr-2`}
        >
          {item.tournamentId?.name || "Tournament Name Missing"}
        </Text>
        {/* Use theme for badge */}
        <View
          className={`${homeScreenTheme.badgeBg} px-2.5 py-1 rounded-full self-start`}
        >
          <Text
            className={`${homeScreenTheme.badgeText} font-semibold text-xs`}
          >
            Joined
          </Text>
        </View>
      </View>

      <View className="mt-2">
        <View className="flex-row items-center mb-2">
          <Ionicons
            name="trophy"
            size={18}
            // Use theme icon color VALUE
            color={homeScreenTheme.iconColorPrimaryValue}
          />
          {/* Use theme text color */}
          <Text className={`${homeScreenTheme.textSecondary} ml-2 font-medium`}>
            Total Points: {item.totalPoints ?? 0}
          </Text>
        </View>

        {item.tournamentId && (
          <View className="flex-row flex-wrap mt-1">
            {item.tournamentId.knockoutStart && (
              <View className="flex-row items-center mr-4 mb-2">
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  // Use theme icon color VALUE
                  color={homeScreenTheme.iconColorSecondaryValue}
                />
                {/* Use theme muted text color */}
                <Text className={`${homeScreenTheme.textMuted} ml-1.5 text-sm`}>
                  Knockout:{" "}
                  {new Date(
                    item.tournamentId.knockoutStart
                  ).toLocaleDateString()}
                </Text>
              </View>
            )}
            {item.tournamentId.semifinalStart && (
              <View className="flex-row items-center mr-4 mb-2">
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  // Use theme icon color VALUE
                  color={homeScreenTheme.iconColorSecondaryValue}
                />
                {/* Use theme muted text color */}
                <Text className={`${homeScreenTheme.textMuted} ml-1.5 text-sm`}>
                  Semifinal:{" "}
                  {new Date(
                    item.tournamentId.semifinalStart
                  ).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {item.tournamentId?._id && (
        <TouchableOpacity
          // Use theme primary accent for button
          className={`flex-row justify-center items-center py-2.5 px-4 mt-3 rounded-md ${homeScreenTheme.accentPrimary} ${homeScreenTheme.accentPrimaryActive}`}
          onPress={() => {
            setSelectedTournament(item.tournamentId._id);
            setTotalPoints(item.totalPoints ?? 0);
            setSelectedTournamentPlayers(item.players || []);
            setViewMode("VIEW_TEAM");
            router.push("main");
          }}
        >
          <Ionicons name="people" size={18} color="white" />
          <Text className="text-white font-medium ml-2 text-sm">View Team</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAvailableTournamentItem = ({ item }) => (
    <View
      // Use theme card, shadow, and primary accent border
      className={`${homeScreenTheme.card} rounded-lg ${homeScreenTheme.shadow} p-4 mb-4 border-l-4 ${homeScreenTheme.border} border-l-red-500 mx-4`}
    >
      {/* Use theme text */}
      <Text className={`text-lg font-bold ${homeScreenTheme.textPrimary}`}>
        {item.name || "Tournament Name Missing"}
      </Text>

      {/* Slightly darker inner box for info - using neutral-700 */}
      <View className="mt-3 bg-neutral-700 p-3 rounded-md">
        <View className="flex-row items-center mb-2">
          <Ionicons
            name="person"
            size={18}
            // Use theme icon color VALUE
            color={homeScreenTheme.iconColorPrimaryValue}
          />
          {/* Use theme text */}
          <Text
            className={`${homeScreenTheme.textSecondary} ml-2 font-medium text-sm`}
          >
            Player Limit: {item.playerLimitPerTeam ?? "N/A"}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons
            name="alert-circle-outline"
            size={18}
            // Use theme icon color VALUE
            color={homeScreenTheme.iconColorPrimaryValue}
          />
          {/* Use theme text */}
          <Text
            className={`${homeScreenTheme.textSecondary} ml-2 font-medium text-sm`}
          >
            Registration Limit: {item.registrationLimits ?? "N/A"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        // Use theme primary accent for button
        className={`flex-row justify-center items-center py-2.5 px-4 mt-3 rounded-md ${homeScreenTheme.accentPrimary} ${homeScreenTheme.accentPrimaryActive} ${homeScreenTheme.shadow}`}
        onPress={() => handleJoinTournament(item._id, item.playerLimitPerTeam)}
        disabled={loading && !refreshing}
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Ionicons name="add-circle" size={18} color="white" />
            <Text className="text-white font-medium ml-2 text-sm">
              Join Tournament
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = (tabIndex) => (
    <View
      className="flex-1 justify-center items-center py-10"
      style={{ width: screenWidth }}
    >
      <Ionicons
        name={tabIndex === 0 ? "trophy-outline" : "calendar-outline"}
        size={64}
        // Use theme icon color VALUE
        color={homeScreenTheme.iconColorSecondaryValue}
      />
      {/* Use theme muted text */}
      <Text
        className={`${homeScreenTheme.textMuted} text-lg mt-4 text-center px-6`}
      >
        {tabIndex === 0
          ? "You haven't joined any tournaments yet."
          : "No new tournaments available right now."}
      </Text>
      <TouchableOpacity
        // Use theme card color for button background
        className={`mt-6 px-5 py-2.5 ${homeScreenTheme.card} rounded-full flex-row items-center ${homeScreenTheme.shadow}`}
        onPress={onRefresh}
      >
        <Ionicons
          name="refresh"
          size={18}
          // Use theme icon color VALUE
          color={homeScreenTheme.iconColorPrimaryValue}
        />
        {/* Use theme secondary text */}
        <Text className={`${homeScreenTheme.textSecondary} font-medium ml-2`}>
          Refresh
        </Text>
      </TouchableOpacity>
    </View>
  );

  // --- Custom Tab Bar (Uses homeScreenTheme directly) ---
  const renderCustomTabBar = () => {
    return (
      <View
        className={`flex-row mx-4 my-4 ${homeScreenTheme.tabBarBackground} rounded-lg p-1`} // Use rounded-lg for consistency
      >
        {tabs.map((tab, index) => {
          const isActive = index === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              // Use rounded-md for inner buttons
              className={`flex-1 items-center py-2 rounded-md ${
                isActive
                  ? `${homeScreenTheme.tabActiveBackground} ${homeScreenTheme.shadow}`
                  : homeScreenTheme.tabInactiveBackground
              }`}
              onPress={() => handleTabPress(index)}
            >
              <Text
                className={`font-semibold text-sm ${
                  isActive
                    ? homeScreenTheme.tabActiveText
                    : homeScreenTheme.tabInactiveText
                }`}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // --- Event Handlers (Keep as is) ---
  const handleTabPress = useCallback(
    (index) => {
      if (index !== activeTab) {
        setActiveTab(index);
        scrollViewRef.current?.scrollTo({
          x: index * screenWidth,
          animated: true,
        });
      }
    },
    [activeTab]
  );

  const handleScrollEnd = useCallback(
    (event) => {
      if (event?.nativeEvent?.contentOffset) {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffsetX / screenWidth);
        if (newIndex >= 0 && newIndex < tabs.length && newIndex !== activeTab) {
          setActiveTab(newIndex);
        }
      }
    },
    [activeTab, tabs.length]
  );

  // --- ScrollView Content ---
  const renderTabContent = () => {
    // Use theme color for refresh control
    const refreshControlProps = {
      refreshing: refreshing,
      onRefresh: onRefresh,
      colors: [homeScreenTheme.refreshControlColor], // Android
      tintColor: homeScreenTheme.refreshControlColor, // iOS
      // Use theme text class for title color (applied via style prop)
      titleColor: homeScreenTheme.textMuted.replace("text-", ""), // Pass color value if needed, or handle via style
    };

    return (
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {/* Joined Tournaments List */}
        <View style={{ width: screenWidth }}>
          <FlatList
            data={joinedTournaments}
            keyExtractor={(item) =>
              item._id?.toString() ?? `joined-${Math.random()}`
            }
            renderItem={renderJoinedTournamentItem}
            contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
            ListEmptyComponent={() => renderEmptyState(0)}
            refreshControl={<RefreshControl {...refreshControlProps} />}
          />
        </View>

        {/* Available Tournaments List */}
        <View style={{ width: screenWidth }}>
          <FlatList
            data={availableTournaments}
            keyExtractor={(item) =>
              item._id?.toString() ?? `available-${Math.random()}`
            }
            renderItem={renderAvailableTournamentItem}
            contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
            ListEmptyComponent={() => renderEmptyState(1)}
            refreshControl={<RefreshControl {...refreshControlProps} />}
          />
        </View>
      </ScrollView>
    );
  };

  // --- Main Component Return (Using homeScreenTheme) ---

  return (
    <View className={`flex-1 ${homeScreenTheme.background}`}>
      {/* Header section - Use theme text colors */}
      <View className="px-5 pt-5 pb-2">
        <Text
          className={`text-2xl font-bold ${homeScreenTheme.textPrimary} mb-1`} // Adjusted size slightly
        >
          Tournaments
        </Text>
        <Text className={`${homeScreenTheme.textSecondary} text-sm`}>
          Manage your teams and join new competitions
        </Text>
      </View>

      {/* Tab Bar */}
      {renderCustomTabBar()}

      {/* Content Area */}
      {loading && !refreshing ? (
        // Loading state - Use theme colors
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator
            size="large"
            color={homeScreenTheme.activityIndicatorColor}
          />
          <Text className={`mt-3 ${homeScreenTheme.textMuted}`}>
            Loading tournaments...
          </Text>
        </View>
      ) : (
        <View className="flex-1">{renderTabContent()}</View>
      )}
    </View>
  );
};

export default TournamentSelect;
