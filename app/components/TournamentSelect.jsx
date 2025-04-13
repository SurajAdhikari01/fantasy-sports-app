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
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../config/axios"; // Assuming path is correct
import { useRecoilState } from "recoil";
import {
  fetchedPlayersState,
  selectedTournamentState,
  playerLimitState,
  totalPointsState,
  viewModeState, // Ensure this is used or remove
} from "./atoms"; // Assuming path is correct
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth } = Dimensions.get("window"); // Get screen width

const TournamentSelect = () => {
  const [joinedTournaments, setJoinedTournaments] = useState([]);
  const [availableTournaments, setAvailableTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 for "My Tournaments", 1 for "Available"
  const router = useRouter();
  const scrollViewRef = useRef(null); // Ref for ScrollView

  // Recoil state (keep as is)
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

  // Define tab options
  const tabs = [
    { key: "joined", title: "My Tournaments" },
    { key: "available", title: "Available" },
  ];

  // --- Use Promise.all for potentially faster fetching ---
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
          "Error",
          joinedResponse.data.message || "Failed to fetch joined tournaments"
        );
        setJoinedTournaments([]);
      }

      if (availableResponse.data.success) {
        setAvailableTournaments(availableResponse.data.data || []);
      } else {
        Alert.alert(
          "Error",
          availableResponse.data.message ||
            "Failed to fetch available tournaments"
        );
        setAvailableTournaments([]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch tournaments. Please try again.");
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
          "Error",
          response.data.message || "Failed to fetch players"
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch players. Please try again.");
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // fetchTournaments will re-run via useEffect because 'refreshing' state changed
  }, []); // No need for fetchTournaments dependency here

  // --- Render Item Functions (Keep as is) ---
  const renderJoinedTournamentItem = ({ item }) => (
    <View className="bg-white rounded-xl shadow-sm p-5 mb-4 mx-4 border border-gray-100">
      <View className="flex-row justify-between items-start">
        <Text className="text-xl font-bold text-gray-800 flex-1 mr-2">
          {item.tournamentId?.name || "Tournament Name Missing"}
        </Text>
        <View className="bg-green-100 px-3 py-1 rounded-full">
          <Text className="text-green-800 font-semibold text-xs">Joined</Text>
        </View>
      </View>

      <View className="mt-4">
        <View className="flex-row items-center mb-2">
          <Ionicons name="trophy" size={18} color="#4b5563" />
          <Text className="text-gray-700 ml-2 font-medium">
            Total Points: {item.totalPoints ?? 0}
          </Text>
        </View>

        {item.tournamentId && (
          <View className="flex-row flex-wrap">
            {item.tournamentId.knockoutStart && (
              <View className="flex-row items-center mr-4 mb-2">
                <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                <Text className="text-gray-600 ml-2 text-sm">
                  Knockout:{" "}
                  {new Date(
                    item.tournamentId.knockoutStart
                  ).toLocaleDateString()}
                </Text>
              </View>
            )}
            {item.tournamentId.semifinalStart && (
              <View className="flex-row items-center mr-4 mb-2">
                <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                <Text className="text-gray-600 ml-2 text-sm">
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
          className="flex-row justify-center items-center py-3 px-4 mt-4 rounded-xl bg-blue-600 active:bg-blue-700"
          onPress={() => {
            setSelectedTournament(item.tournamentId._id);
            setTotalPoints(item.totalPoints ?? 0);
            setSelectedTournamentPlayers(item.players || []);
            setViewMode("VIEW_TEAM");
          }}
        >
          <Ionicons name="people" size={18} color="white" />
          <Text className="text-white font-medium ml-2">View Team</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAvailableTournamentItem = ({ item }) => (
    <View className="bg-white rounded-xl shadow-md p-5 mb-4 border-l-4 border-blue-500 mx-4">
      <Text className="text-xl font-bold text-gray-800">
        {item.name || "Tournament Name Missing"}
      </Text>

      <View className="mt-4 bg-gray-50 p-3 rounded-lg">
        <View className="flex-row items-center mb-2">
          <Ionicons name="person" size={18} color="#4b5563" />
          <Text className="text-gray-700 ml-2 font-medium">
            Player Limit: {item.playerLimitPerTeam ?? "N/A"}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="alert-circle-outline" size={18} color="#4b5563" />
          <Text className="text-gray-700 ml-2 font-medium">
            Registration Limit: {item.registrationLimits ?? "N/A"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        className="flex-row justify-center items-center py-3 px-4 mt-4 rounded-xl bg-green-600 active:bg-green-700 shadow-sm"
        onPress={() => handleJoinTournament(item._id, item.playerLimitPerTeam)}
        disabled={loading && !refreshing}
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Ionicons name="add-circle" size={18} color="white" />
            <Text className="text-white font-medium ml-2">Join Tournament</Text>
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
        color="#d1d5db"
      />
      <Text className="text-gray-500 text-lg mt-4 text-center px-6">
        {tabIndex === 0
          ? "You haven't joined any tournaments yet"
          : "No tournaments available at the moment"}
      </Text>
      <TouchableOpacity
        className="mt-6 px-6 py-3 bg-blue-100 rounded-full flex-row items-center"
        onPress={onRefresh}
      >
        <Ionicons name="refresh" size={18} color="#3b82f6" />
        <Text className="text-blue-600 font-medium ml-2">Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  // --- Custom Tab Bar ---
  const renderCustomTabBar = () => {
    return (
      <View className="flex-row mx-4 my-4 bg-gray-100 rounded-xl p-1">
        {tabs.map((tab, index) => {
          const isActive = index === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              className={`flex-1 items-center py-2.5 rounded-lg ${
                isActive ? "bg-white shadow" : ""
              }`}
              onPress={() => handleTabPress(index)} // Pass index here
            >
              <Text
                className={`font-semibold text-sm ${
                  isActive ? "text-blue-600" : "text-gray-500"
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

  // --- Event Handlers ---

  // Handle tab button press
  // --- FIX: Added 'index' parameter ---
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
  ); // Dependency: activeTab

  // Handle end of swipe gesture
  // --- FIX: Added 'event' parameter ---
  const handleScrollEnd = useCallback(
    (event) => {
      // console.log("Scroll Ended. Event received:", event); // Optional: Keep for debugging

      if (event && event.nativeEvent && event.nativeEvent.contentOffset) {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffsetX / screenWidth);

        // console.log("Calculated newIndex:", newIndex); // Optional: Keep for debugging

        // Check bounds to prevent invalid index
        if (newIndex >= 0 && newIndex < tabs.length && newIndex !== activeTab) {
          // console.log("Setting activeTab to:", newIndex); // Optional: Keep for debugging
          setActiveTab(newIndex);
        }
      } else {
        console.warn(
          "Scroll event or nativeEvent properties missing in handleScrollEnd"
        );
      }
    },
    [activeTab]
  ); // Dependency: activeTab

  // --- ScrollView Content ---
  const renderTabContent = () => {
    return (
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd} // Pass the correct handler
        scrollEventThrottle={16}
      >
        {/* Joined Tournaments List */}
        <View style={{ width: screenWidth }}>
          <FlatList
            data={joinedTournaments}
            keyExtractor={(item) =>
              item._id?.toString() ?? Math.random().toString()
            }
            renderItem={renderJoinedTournamentItem}
            contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
            ListEmptyComponent={() => renderEmptyState(0)}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#3b82f6"]}
                tintColor="#3b82f6"
              />
            }
          />
        </View>

        {/* Available Tournaments List */}
        <View style={{ width: screenWidth }}>
          <FlatList
            data={availableTournaments}
            keyExtractor={(item) =>
              item._id?.toString() ?? Math.random().toString()
            }
            renderItem={renderAvailableTournamentItem}
            contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
            ListEmptyComponent={() => renderEmptyState(1)}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#3b82f6"]}
                tintColor="#3b82f6"
              />
            }
          />
        </View>
      </ScrollView>
    );
  };

  // --- Main Component Return ---

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-3xl font-bold text-gray-900 mb-1">
          Tournaments
        </Text>
        <Text className="text-gray-500">
          Manage your teams and join new competitions
        </Text>
      </View>

      {/* Tab Bar */}
      {renderCustomTabBar()}

      {/* Content Area */}
      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-3 text-gray-500">Loading tournaments...</Text>
        </View>
      ) : (
        <View className="flex-1">
          {/* Render the ScrollView containing the lists */}
          {renderTabContent()}
        </View>
      )}
    </SafeAreaView>
  );
};

export default TournamentSelect;
