import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  TouchableWithoutFeedback, // Import for dismissing dropdown
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../config/axios"; // Assuming you have this configured

const LeaderboardModal = ({ visible, onClose, currentUserUsername }) => {
  // --- State Variables ---
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(false);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  // State to control the visibility of the inline tournament dropdown list
  const [isTournamentListVisible, setIsTournamentListVisible] = useState(false);

  // --- Data Fetching Callbacks ---
  const fetchTournaments = useCallback(
    async (isRefreshing = false) => {
      console.log("fetchTournaments called. isRefreshing:", isRefreshing);
      if (!isRefreshing) setIsLoadingTournaments(true);
      setError(null);
      setInfoMessage(null);
      // Don't reset selection on refresh, only on initial load if needed
      // let previousSelection = selectedTournamentId;

      try {
        const response = await api.get("/tournaments/getAllTournaments");
        if (response.data && response.data.success) {
          const fetchedTournaments = response.data.data || [];
          setTournaments(fetchedTournaments);

          if (fetchedTournaments.length > 0) {
            // Set initial selection only if none is selected yet
            if (!selectedTournamentId) {
              const initialTournamentId = fetchedTournaments[0]._id;
              console.log(
                "Setting initial selectedTournamentId:",
                initialTournamentId
              );
              setSelectedTournamentId(initialTournamentId);
              // Fetch leaderboard for the initial selection
              fetchLeaderboard(initialTournamentId, false);
            } else if (
              !fetchedTournaments.some((t) => t._id === selectedTournamentId)
            ) {
              // If the previously selected tournament is no longer available, select the first one
              const newSelectionId = fetchedTournaments[0]._id;
              console.log(
                "Previous selection invalid, setting new default:",
                newSelectionId
              );
              setSelectedTournamentId(newSelectionId);
              fetchLeaderboard(newSelectionId, false);
            } else {
              // If refreshing and a valid tournament is already selected, re-fetch its leaderboard
              if (isRefreshing && selectedTournamentId) {
                await fetchLeaderboard(selectedTournamentId, true);
              }
            }
          } else {
            setInfoMessage(
              "You have not joined or created any tournaments yet."
            );
            setSelectedTournamentId(null);
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
        // ... (keep existing error handling)
        if (err.response) {
          if (err.response.status === 404) {
            setInfoMessage(
              err.response.data?.message || "No tournaments found."
            );
          } else {
            setError(
              `Error ${err.response.status}: ${
                err.response.data?.message || "Could not fetch tournaments."
              }`
            );
          }
        } else if (err.request) {
          setError("Network Error: Could not connect to the server.");
        } else {
          setError("An unexpected error occurred while fetching tournaments.");
        }
        setTournaments([]);
        setSelectedTournamentId(null);
        setLeaderboardData([]);
      } finally {
        if (!isRefreshing) setIsLoadingTournaments(false);
        if (isRefreshing) setRefreshing(false);
      }
    },
    [selectedTournamentId] // Keep selectedTournamentId dependency
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
        console.log("fetchLeaderboard skipped: No tournamentId");
        setLeaderboardData([]);
        if (!isRefreshing) setIsLoadingLeaderboard(false);
        if (isRefreshing) setRefreshing(false);
        return;
      }
      // Only show loading indicator if not refreshing
      if (!isRefreshing) setIsLoadingLeaderboard(true);
      // Clear previous errors/messages specific to leaderboard
      // setError(null); // Maybe keep general error?
      // setInfoMessage(null); // Clear info message before fetching

      try {
        const response = await api.get(
          `/leaderboard/getLeaderboard/${tournamentId}`
        );
        console.log("Fetched Leaderboard Response:", response.data); // Log the whole response data
        if (response.data && response.data.success) {
          const sortedData = (response.data.data || []).sort(
            (a, b) => b.totalPoints - a.totalPoints
          );
          console.log("Fetched Leaderboard Data Count:", sortedData.length);

          // Ensure we're setting leaderboard data correctly for the *currently* selected tournament
          // This check prevents race conditions if the user selects another tournament quickly
          // UPDATE: We now rely on the useEffect for selectedTournamentId to trigger this,
          // so this check might be less critical but good for safety.
          // if (tournamentId === selectedTournamentId) { // Check might be redundant now
          setLeaderboardData(sortedData);
          if (sortedData.length === 0) {
            // Set info message specifically for empty leaderboard
            setInfoMessage("Leaderboard is empty for this tournament.");
          } else {
            setInfoMessage(null); // Clear message if data is present
          }
          // }
        } else {
          // Set error specific to leaderboard fetch
          setError(
            response.data?.message || "Failed to fetch leaderboard data."
          );
          setLeaderboardData([]); // Clear data on error
        }
      } catch (err) {
        console.error(`Fetch Leaderboard Error (ID: ${tournamentId}):`, err);
        // Set error specific to leaderboard fetch
        if (err.response) {
          setError(
            `Leaderboard Error: ${
              err.response.data?.message || err.response.status
            }`
          );
        } else if (err.request) {
          setError("Network Error fetching leaderboard.");
        } else {
          setError("Unexpected error fetching leaderboard.");
        }
        setLeaderboardData([]); // Clear data on error
      } finally {
        if (!isRefreshing) setIsLoadingLeaderboard(false);
        if (isRefreshing) setRefreshing(false);
      }
    },
    [] // Remove selectedTournamentId dependency here, rely on useEffect trigger
  );

  // --- Effects ---
  useEffect(() => {
    // Fetch tournaments when modal becomes visible
    if (visible) {
      console.log("Modal visible: Triggering initial fetchTournaments");
      fetchTournaments();
    } else {
      // Reset state when modal is closed
      setIsTournamentListVisible(false);
      // Optionally reset selection or keep it for next open? Let's keep it for now.
      // setSelectedTournamentId(null);
      // setLeaderboardData([]);
      setError(null);
      setInfoMessage(null);
    }
  }, [visible]); // Removed fetchTournaments from dependencies, let it be stable

  // Fetch leaderboard when selected tournament changes
  useEffect(() => {
    if (visible && selectedTournamentId) {
      console.log(
        "Selected tournament changed to:",
        selectedTournamentId,
        "Fetching leaderboard."
      );
      // Clear previous leaderboard state before fetching new one
      setLeaderboardData([]);
      setError(null); // Clear errors related to previous selection
      setInfoMessage(null);
      setIsLoadingLeaderboard(true); // Show loading indicator immediately
      fetchLeaderboard(selectedTournamentId);
    } else if (visible && !selectedTournamentId && tournaments.length > 0) {
      // Handle case where selection is cleared but tournaments exist
      setLeaderboardData([]);
      setInfoMessage("Select a tournament to view rankings.");
    }
  }, [selectedTournamentId, visible]); // Add visible dependency

  // --- Event Handlers ---
  const onRefresh = useCallback(async () => {
    console.log("onRefresh called");
    setRefreshing(true);
    setError(null); // Clear errors on refresh
    setInfoMessage(null); // Clear messages on refresh
    setIsTournamentListVisible(false); // Close dropdown on refresh
    // Re-fetch tournaments, which will also trigger leaderboard fetch if needed
    await fetchTournaments(true);
    // No need to call fetchLeaderboard explicitly here,
    // fetchTournaments handles refreshing the selected one if it exists.
  }, [fetchTournaments]); // Depend only on fetchTournaments

  // Handler for selecting a tournament from the inline list
  const handleTournamentSelect = useCallback(
    (tournamentId) => {
      console.log("Tournament selected:", tournamentId);
      if (tournamentId !== selectedTournamentId) {
        setSelectedTournamentId(tournamentId); // This triggers the useEffect
      }
      setIsTournamentListVisible(false); // Close the dropdown
    },
    [selectedTournamentId]
  ); // Add dependency

  // Toggle the inline tournament list visibility
  const toggleTournamentList = () => {
    if (tournaments.length > 0) {
      // Only toggle if there are tournaments
      setIsTournamentListVisible((prev) => !prev);
    }
  };

  // Close the dropdown if tapped outside
  const handleDismissDropdown = () => {
    if (isTournamentListVisible) {
      setIsTournamentListVisible(false);
    }
  };

  // --- Render Functions ---
  const renderLeaderboardItem = ({ item, index }) => {
    const isCurrentUser = item.name === currentUserUsername;
    // Using template literals for cleaner class concatenation
    const itemContainerClasses = `
      flex-row px-4 py-3 border-b border-neutral-700 items-center
      ${isCurrentUser ? "bg-indigo-900/30" : ""}
    `;
    const textClasses = `
      text-neutral-200 text-sm
      ${isCurrentUser ? "text-white font-bold" : ""}
    `;

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

  // Function to get the name of the currently selected tournament
  const getSelectedTournamentName = () => {
    if (isLoadingTournaments) return "Loading...";
    if (!selectedTournamentId) return "Select Tournament";
    const tournament = tournaments.find((t) => t._id === selectedTournamentId);
    return tournament?.name || "Select Tournament";
  };

  // Render item for the inline tournament dropdown list
  const renderTournamentSelectItem = ({ item }) => {
    const isSelected = item._id === selectedTournamentId;
    const itemButtonClasses = `
      py-3 px-4 border-b border-neutral-600
      ${isSelected ? "bg-indigo-800/50" : "bg-[#444]"}
    `; // Adjusted background colors
    const itemTextClasses = `
      text-base
      ${isSelected ? "text-white font-semibold" : "text-neutral-100"}
    `;
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
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Use TouchableWithoutFeedback to dismiss the dropdown */}
      <TouchableWithoutFeedback onPress={handleDismissDropdown}>
        <SafeAreaView className="flex-1 bg-black/70 justify-start items-center">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View className="bg-[#2a2a2a] rounded-t-xl pt-5 pb-2 w-full h-[100%] shadow-lg shadow-black/40">
              <View className="flex-row justify-between items-center mb-4 px-4">
                <Text className="text-white text-xl font-bold">
                  Leaderboard
                </Text>
                <TouchableOpacity onPress={onClose} className="p-1">
                  <Ionicons name="close-circle" size={30} color="#ccc" />
                </TouchableOpacity>
              </View>

              <View className="px-4 mb-3 z-10 ">
                {isLoadingTournaments && !refreshing && (
                  <View className="bg-[#3a3a3a] rounded-lg py-3 px-4 border border-neutral-600 min-h-[50px] justify-center">
                    <ActivityIndicator color="#ccc" />
                  </View>
                )}
                {!isLoadingTournaments && tournaments.length > 0 && (
                  <TouchableOpacity
                    className="flex-row justify-between items-center bg-[#3a3a3a] rounded-lg py-3 px-4 border border-neutral-600 min-h-[50px]"
                    onPress={toggleTournamentList}
                    disabled={isLoadingTournaments} // Disable while loading
                  >
                    <Text
                      className="text-white text-base flex-1 mr-2"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {getSelectedTournamentName()}
                    </Text>
                    <Ionicons
                      name={
                        isTournamentListVisible ? "chevron-up" : "chevron-down"
                      }
                      size={20}
                      color="#ccc"
                    />
                  </TouchableOpacity>
                )}
                {/* Display message if no tournaments loaded */}
                {!isLoadingTournaments &&
                  tournaments.length === 0 &&
                  !error && (
                    <View className="bg-[#3a3a3a] rounded-lg py-3 px-4 border border-neutral-600 min-h-[50px] justify-center items-center">
                      <Text className="text-neutral-400 text-sm">
                        No tournaments available.
                      </Text>
                    </View>
                  )}
                {/* --- Inline Tournament Dropdown List --- */}
                {isTournamentListVisible && tournaments.length > 0 && (
                  <View className="absolute top-full left-4 right-4 mt-1 bg-[#333] rounded-lg border border-neutral-600 shadow-lg max-h-60 overflow-hidden z-20">
                    {/* Add explicit max height and overflow */}
                    <FlatList
                      data={tournaments}
                      renderItem={renderTournamentSelectItem}
                      keyExtractor={(item) => item._id}
                      // persistentScrollbar={true} // Consider for long lists
                    />
                  </View>
                )}
              </View>

              <View className="flex-1 px-4">
                {error &&
                  !isLoadingLeaderboard && ( // Show error only if not loading leaderboard
                    <View className="flex-1 justify-center items-center p-5">
                      <Text className="text-red-400 text-center text-sm">
                        {error}
                      </Text>
                      {/* Optionally add a retry button here */}
                    </View>
                  )}

                {/* Loading Indicator for Leaderboard */}
                {!error &&
                  isLoadingLeaderboard &&
                  !refreshing && ( // Don't show if refreshing pull-down is active
                    <View className="flex-1 justify-center items-center pt-10">
                      <ActivityIndicator color="#fff" size="large" />
                    </View>
                  )}

                {/* Leaderboard FlatList */}
                {!error &&
                  !isLoadingLeaderboard &&
                  leaderboardData.length > 0 && (
                    <FlatList
                      data={leaderboardData}
                      renderItem={renderLeaderboardItem}
                      keyExtractor={(item) => item._id || item.name} // Use name as fallback key
                      style={{ flex: 1 }} // Ensure FlatList tries to fill space
                      ListHeaderComponent={ListHeader}
                      refreshControl={
                        <RefreshControl
                          refreshing={refreshing}
                          onRefresh={onRefresh}
                          tintColor="#ccc" // iOS spinner color
                          colors={["#ccc"]} // Android spinner color
                          progressBackgroundColor="#444" // Android spinner background
                        />
                      }
                      // Add contentContainerStyle for padding if needed, e.g., paddingBottom
                      contentContainerStyle={{ paddingBottom: 20 }}
                    />
                  )}

                {/* Placeholder/Info Messages */}
                {!error && !isLoadingLeaderboard && (
                  <>
                    {/* Message when tournament selected but leaderboard is empty */}
                    {selectedTournamentId &&
                      leaderboardData.length === 0 &&
                      infoMessage && (
                        <View className="flex-1 justify-center items-center p-5">
                          <Text className="text-neutral-400 text-center text-sm">
                            {infoMessage} {/* Show "Leaderboard is empty..." */}
                          </Text>
                        </View>
                      )}
                    {/* Message when no tournament is selected (and tournaments are available) */}
                    {!selectedTournamentId &&
                      tournaments.length > 0 &&
                      !infoMessage && (
                        <View className="flex-1 justify-center items-center p-5">
                          <Text className="text-neutral-400 text-center text-sm">
                            Select a tournament to view rankings.
                          </Text>
                        </View>
                      )}
                    {/* Message when no tournaments exist at all */}
                    {tournaments.length === 0 &&
                      infoMessage &&
                      !isLoadingTournaments && (
                        <View className="flex-1 justify-center items-center p-5">
                          <Text className="text-neutral-400 text-center text-sm">
                            {infoMessage} {/* Show "No tournaments..." */}
                          </Text>
                        </View>
                      )}
                  </>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default LeaderboardModal;
