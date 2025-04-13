import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  // StyleSheet, // No longer needed
  // Platform, // No longer needed for picker styles
  TouchableOpacity,
  TouchableWithoutFeedback, // For dismissing dropdown
} from "react-native";
// Removed styled import, using className directly
import api from "../config/axios";
// Removed RNPickerSelect import
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext"; // Import useAuth

// --- Component ---
export default function LeaderboardScreen() {
  // --- State Variables (Copied from Modal logic) ---
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(true); // Start true for initial load
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isTournamentListVisible, setIsTournamentListVisible] = useState(false);

  // Get current user data for highlighting
  const { userData } = useAuth();
  const currentUserUsername = userData?.username; // Get username from context

  // --- Data Fetching Callbacks (Adapted from Modal logic) ---
  const fetchTournaments = useCallback(
    async (isRefreshing = false) => {
      console.log("fetchTournaments called. isRefreshing:", isRefreshing);
      if (!isRefreshing) setIsLoadingTournaments(true);
      setError(null);
      setInfoMessage(null);
      // Don't reset selection on refresh immediately, handle after fetch

      try {
        // Using getAllTournaments as per the modal example
        const response = await api.get("/tournaments/getAllTournaments");
        if (response.data && response.data.success) {
          const fetchedTournaments = response.data.data || [];
          setTournaments(fetchedTournaments);

          let nextSelectedId = selectedTournamentId;

          if (fetchedTournaments.length > 0) {
            // Set initial selection or handle invalid selection after refresh
            if (
              !selectedTournamentId ||
              !fetchedTournaments.some((t) => t._id === selectedTournamentId)
            ) {
              nextSelectedId = fetchedTournaments[0]._id;
              console.log(
                "Setting/Resetting selectedTournamentId to:",
                nextSelectedId
              );
              // Explicitly set state if changing, otherwise useEffect handles it
              if (nextSelectedId !== selectedTournamentId) {
                setSelectedTournamentId(nextSelectedId);
              } else if (isRefreshing) {
                // If refreshing and selection didn't change, manually trigger leaderboard fetch
                await fetchLeaderboard(nextSelectedId, true);
              }
            } else if (isRefreshing) {
              // If refreshing and selection is still valid, trigger leaderboard refresh
              await fetchLeaderboard(selectedTournamentId, true);
            }
          } else {
            setInfoMessage("No tournaments available.");
            nextSelectedId = null;
            setSelectedTournamentId(null); // Explicitly clear selection
            setLeaderboardData([]);
          }
        } else {
          setError(response.data?.message || "Failed to fetch tournaments.");
          setTournaments([]);
          setSelectedTournamentId(null);
          setLeaderboardData([]);
        }
      } catch (err) {
        console.error("Fetch Tournaments Error:", err);
        const message =
          err.response?.data?.message ||
          (err.response?.status
            ? `Status ${err.response.status}`
            : "Network Error");
        if (err.response?.status === 404) {
          setInfoMessage(message || "No tournaments found.");
        } else {
          setError(`Error fetching tournaments: ${message}`);
        }
        setTournaments([]);
        setSelectedTournamentId(null);
        setLeaderboardData([]);
      } finally {
        if (!isRefreshing) setIsLoadingTournaments(false);
        // setRefreshing(false); // Let leaderboard fetch handle this if applicable
      }
    },
    [selectedTournamentId] // Keep dependency
  );

  const fetchLeaderboard = useCallback(
    async (tournamentId, isRefreshing = false) => {
      console.log(
        "fetchLeaderboard called. ID:",
        tournamentId,
        "isRefreshing:",
        isRefreshing
      );
      if (!tournamentId) {
        setLeaderboardData([]);
        if (!isRefreshing) setIsLoadingLeaderboard(false);
        if (isRefreshing) setRefreshing(false);
        return;
      }
      if (!isRefreshing) setIsLoadingLeaderboard(true);
      // Don't clear general error, but clear leaderboard-specific info
      // setError(null);
      setInfoMessage(null);
      // setLeaderboardData([]); // Clear only if not refreshing? Maybe not necessary

      try {
        const response = await api.get(
          `/leaderboard/getLeaderboard/${tournamentId}`
        );
        if (response.data && response.data.success) {
          const sortedData = (response.data.data || []).sort(
            (a, b) => b.totalPoints - a.totalPoints
          );
          setLeaderboardData(sortedData);
          if (sortedData.length === 0) {
            setInfoMessage("Leaderboard is empty for this tournament.");
          }
        } else {
          if (response.status === 404) {
            setInfoMessage(response.data?.message || "Leaderboard not found.");
          } else {
            setError(
              response.data?.message || "Failed to fetch leaderboard data."
            );
          }
          setLeaderboardData([]);
        }
      } catch (err) {
        console.error(`Fetch Leaderboard Error (ID: ${tournamentId}):`, err);
        const message =
          err.response?.data?.message ||
          (err.response?.status
            ? `Status ${err.response.status}`
            : "Network Error");
        if (err.response?.status === 404) {
          setInfoMessage(message || "Leaderboard not found.");
        } else {
          setError(`Error fetching leaderboard: ${message}`);
        }
        setLeaderboardData([]);
      } finally {
        if (!isRefreshing) setIsLoadingLeaderboard(false);
        if (isRefreshing) setRefreshing(false); // Ensure refreshing stops
      }
    },
    [] // No dependencies needed here
  );

  // --- Effects ---
  useEffect(() => {
    // Initial fetch on mount
    fetchTournaments();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Fetch leaderboard when selected tournament changes
  useEffect(() => {
    // Only fetch if a tournament is actually selected
    if (selectedTournamentId) {
      console.log(
        "Selected tournament changed to:",
        selectedTournamentId,
        "Fetching leaderboard."
      );
      setLeaderboardData([]); // Clear previous data immediately
      setError(null);
      setInfoMessage(null);
      setIsLoadingLeaderboard(true);
      fetchLeaderboard(selectedTournamentId);
    } else {
      // Handle case where selection is cleared (e.g., no tournaments available)
      setLeaderboardData([]);
      setIsLoadingLeaderboard(false); // Not loading if nothing selected
      // Info message might be set by fetchTournaments
    }
  }, [selectedTournamentId, fetchLeaderboard]); // Depend on selection and the stable fetch function

  // --- Event Handlers ---
  const onRefresh = useCallback(async () => {
    console.log("onRefresh called");
    setRefreshing(true);
    setError(null);
    setInfoMessage(null);
    setIsTournamentListVisible(false); // Close dropdown
    await fetchTournaments(true); // Refetch tournaments, which handles leaderboard refresh
  }, [fetchTournaments]); // Depend only on fetchTournaments

  const handleTournamentSelect = useCallback(
    (tournamentId) => {
      console.log("Tournament selected:", tournamentId);
      if (tournamentId !== selectedTournamentId) {
        setSelectedTournamentId(tournamentId); // Triggers the useEffect
      }
      setIsTournamentListVisible(false); // Close dropdown
    },
    [selectedTournamentId]
  );

  const toggleTournamentList = () => {
    if (tournaments.length > 0 && !isLoadingTournaments) {
      setIsTournamentListVisible((prev) => !prev);
    }
  };

  const handleDismissDropdown = () => {
    if (isTournamentListVisible) {
      setIsTournamentListVisible(false);
    }
  };

  // --- Render Functions (Adapted from Modal) ---
  const renderLeaderboardItem = ({ item, index }) => {
    const isCurrentUser = item.name === currentUserUsername;
    const itemContainerClasses = `flex-row px-4 py-3 border-b border-neutral-700 items-center ${
      isCurrentUser ? "bg-indigo-900/30" : ""
    }`;
    const textClasses = `text-neutral-200 text-sm ${
      isCurrentUser ? "text-white font-bold" : ""
    }`;

    return (
      <View className={itemContainerClasses}>
        <Text className={`${textClasses} w-[15%] text-left`}>{index + 1}</Text>
        <Text
          className={`${textClasses} w-[55%] px-2 text-left`}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
        <Text className={`${textClasses} w-[30%] text-right`}>
          {item.totalPoints} pts
        </Text>
      </View>
    );
  };

  const ListHeader = () => (
    <View className="flex-row px-4 pb-2 border-b border-neutral-600 mt-1 mb-1">
      <Text className="text-neutral-400 text-xs font-bold uppercase w-[15%] text-left">
        Rank
      </Text>
      <Text className="text-neutral-400 text-xs font-bold uppercase w-[55%] px-2 text-left">
        Player
      </Text>
      <Text className="text-neutral-400 text-xs font-bold uppercase w-[30%] text-right">
        Score
      </Text>
    </View>
  );

  const getSelectedTournamentName = () => {
    if (isLoadingTournaments && !selectedTournamentId) return "Loading..."; // Show loading only if no selection yet
    if (!selectedTournamentId) return "Select Tournament";
    const tournament = tournaments.find((t) => t._id === selectedTournamentId);
    return tournament?.name || "Select Tournament";
  };

  const renderTournamentSelectItem = ({ item }) => {
    const isSelected = item._id === selectedTournamentId;
    const itemButtonClasses = `py-3 px-4 border-b border-neutral-600 ${
      isSelected ? "bg-indigo-800/50" : "bg-[#444] active:bg-[#555]"
    }`; // Added active state
    const itemTextClasses = `text-base ${
      isSelected ? "text-white font-semibold" : "text-neutral-100"
    }`;
    return (
      <TouchableOpacity
        className={itemButtonClasses}
        onPress={() => handleTournamentSelect(item._id)}
      >
        <Text
          className={itemTextClasses}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // --- Main Render ---
  return (
    // Use TouchableWithoutFeedback for dropdown dismissal
    <TouchableWithoutFeedback onPress={handleDismissDropdown}>
      {/* Match the modal's background color */}
      <SafeAreaView className="flex-1 bg-[#2a2a2a]">
        <StatusBar barStyle="light-content" />

        {/* Header Area: Title + Tournament Selector */}
        {/* Added zIndex here for the dropdown context */}
        <View className="px-4 pt-5 pb-3 z-10">
          <Text className="text-white text-3xl font-bold mb-8">
            Leaderboard
          </Text>

          {/* --- Tournament Selector --- */}
          {/* Loading State for Selector */}
          {isLoadingTournaments && !refreshing && (
            <View className="bg-[#3a3a3a] rounded-lg py-3 px-4 border border-neutral-600 min-h-[50px] justify-center">
              <ActivityIndicator color="#ccc" />
            </View>
          )}

          {/* Selector Button (when tournaments loaded) */}
          {!isLoadingTournaments && tournaments.length > 0 && (
            <TouchableOpacity
              className="flex-row justify-between items-center bg-[#3a3a3a] rounded-lg py-3 px-4 border border-neutral-600 min-h-[50px] active:bg-[#4a4a4a]"
              onPress={toggleTournamentList}
              disabled={isLoadingTournaments}
            >
              <Text
                className="text-white text-base flex-1 mr-2"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {getSelectedTournamentName()}
              </Text>
              <Ionicons
                name={isTournamentListVisible ? "chevron-up" : "chevron-down"}
                size={20}
                color="#ccc"
              />
            </TouchableOpacity>
          )}

          {/* Message if no tournaments */}
          {!isLoadingTournaments && tournaments.length === 0 && !error && (
            <View className="bg-[#3a3a3a] rounded-lg py-3 px-4 border border-neutral-600 min-h-[50px] justify-center items-center">
              <Text className="text-neutral-400 text-sm">
                No tournaments available.
              </Text>
            </View>
          )}

          {/* --- Inline Tournament Dropdown List --- */}
          {isTournamentListVisible && tournaments.length > 0 && (
            <View
              className="absolute top-full left-4 right-4 mt-6 bg-[#333] rounded-lg border border-neutral-600 shadow-lg max-h-60 z-20"
              // Stop propagation to prevent dismissal when tapping inside dropdown
              onStartShouldSetResponder={() => true}
            >
              <FlatList
                data={tournaments}
                renderItem={renderTournamentSelectItem}
                keyExtractor={(item) => item._id}
                nestedScrollEnabled={true} // Important for scroll within scroll
              />
            </View>
          )}
          {/* --- End Tournament Selector --- */}

          {/* Display general errors prominently */}
          {error && !refreshing && (
            <View className="mt-3 mb-1 p-3 bg-red-800/50 border border-red-700 rounded-lg">
              <Text className="text-red-300 text-center text-sm">{error}</Text>
            </View>
          )}
        </View>

        {/* Leaderboard List Area */}
        <View className="flex-1 px-4 pt-2">
          {/* Loading Indicator for Leaderboard */}
          {!error && isLoadingLeaderboard && !refreshing && (
            <View className="flex-1 justify-center items-center pb-20">
              <ActivityIndicator color="#fff" size="large" />
            </View>
          )}

          {/* Leaderboard FlatList (Show only if not loading and tournament selected) */}
          {!isLoadingLeaderboard &&
            selectedTournamentId &&
            leaderboardData.length > 0 && (
              <FlatList
                data={leaderboardData}
                renderItem={renderLeaderboardItem}
                keyExtractor={(item) => item._id || item.name}
                ListHeaderComponent={ListHeader}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#ccc"
                    colors={["#ccc"]}
                    progressBackgroundColor="#444"
                  />
                }
                contentContainerStyle={{ paddingBottom: 40 }} // Adjust padding as needed
                showsVerticalScrollIndicator={false}
                // Removed rounding from FlatList itself, apply to items/header
              />
            )}

          {/* Placeholder/Info Messages within list area */}
          {!error && !isLoadingLeaderboard && (
            <>
              {/* Message when leaderboard is empty */}
              {selectedTournamentId &&
                leaderboardData.length === 0 &&
                infoMessage && (
                  <View className="flex-1 justify-center items-center pb-20">
                    <Text className="text-neutral-400 text-center text-sm px-4">
                      {infoMessage} {/* "Leaderboard is empty..." */}
                    </Text>
                  </View>
                )}
              {/* Message when no tournament is selected (and tournaments exist) */}
              {!selectedTournamentId &&
                tournaments.length > 0 &&
                !infoMessage && (
                  <View className="flex-1 justify-center items-center pb-20">
                    <Text className="text-neutral-400 text-center text-sm px-4">
                      Select a tournament to view rankings.
                    </Text>
                  </View>
                )}
              {/* Message when no tournaments exist at all (already shown above selector) */}
            </>
          )}
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

// No StyleSheet needed
