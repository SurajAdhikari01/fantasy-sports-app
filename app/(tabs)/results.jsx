import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet, // Import StyleSheet for Picker styles
  Platform, // Import Platform for OS-specific styles
} from "react-native";
import { styled } from "nativewind";
import api from "../config/axios";
import RNPickerSelect from "react-native-picker-select";
import { Ionicons } from "@expo/vector-icons"; // For dropdown icon

// --- Styled Components (Keep previous theme adjustments) ---
const SafeContainer = styled(SafeAreaView, "flex-1 bg-gray-900");
const ContentContainer = styled(View, "flex-1 px-4");
const Title = styled(Text, "text-3xl font-bold text-white text-center my-4");
const LoadingContainer = styled(
  View,
  "flex-1 justify-center items-center bg-gray-900"
);
const ErrorText = styled(Text, "text-red-500 text-center mt-6 text-lg px-4");
const PickerContainer = styled(View, "mb-4 mx-4"); // Container for the picker

// List Header/Item styles (keep from previous version)
const ListHeaderContainer = styled(
  View,
  "flex-row bg-gray-800 px-4 py-3 border-b border-gray-700"
);
const HeaderText = styled(Text, "text-gray-200 font-bold text-sm uppercase");
const RankHeader = styled(HeaderText, "w-16 text-center");
const NameHeader = styled(HeaderText, "flex-1 px-2");
const PointsHeader = styled(HeaderText, "w-20 text-right");
const ListItemContainer = styled(
  View,
  "flex-row items-center bg-gray-800/80 px-4 py-4 border-b border-gray-700"
);
const RankText = styled(
  Text,
  "text-gray-300 text-lg w-16 text-center font-medium"
);
const NameText = styled(Text, "text-white text-base font-semibold flex-1 px-2");
const PointsText = styled(
  Text,
  "text-orange-500 text-lg font-bold w-20 text-right"
);
const EmptyListText = styled(Text, "text-center text-gray-400 mt-10 text-lg");

// --- Component ---
export default function LeaderboardScreen() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(true);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false); // Initially false
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Fetch Tournaments on Mount
  useEffect(() => {
    const fetchTournaments = async () => {
      setIsLoadingTournaments(true);
      setError(null);
      try {
        const response = await api.get("/tournaments/getAllTournaments");
        console.log("Fetched Tournaments:", response);

        if (response.data && response.data.success) {
          const fetchedTournaments = response.data.data || [];
          setTournaments(fetchedTournaments);
          // Automatically select the first tournament if available
          if (fetchedTournaments.length > 0) {
            setSelectedTournamentId(fetchedTournaments[0]._id);
          } else {
            // Handle case where user has no tournaments
            setError("You are not part of any tournaments yet.");
            setSelectedTournamentId(null); // Ensure no leaderboard fetch is attempted
          }
        } else {
          setError(response.data.message || "Failed to fetch tournaments.");
        }
      } catch (err) {
        console.error("Fetch Tournaments Error:", err);
        setError("Could not fetch your tournaments. Please try again later.");
      } finally {
        setIsLoadingTournaments(false);
      }
    };

    fetchTournaments();
  }, []); // Run only once on mount

  // 2. Fetch Leaderboard when selectedTournamentId changes (and is not null)
  const fetchLeaderboard = useCallback(
    async (tournamentId) => {
      if (!tournamentId) {
        setLeaderboardData([]); // Clear data if no tournament is selected
        setIsLoadingLeaderboard(false);
        setRefreshing(false);
        return; // Don't fetch if no ID
      }

      // Set loading state only if not refreshing, or handle separately if needed
      if (!refreshing) {
        setIsLoadingLeaderboard(true);
      }
      setError(null); // Clear previous errors specific to leaderboard fetch
      setLeaderboardData([]); // Clear previous data before fetching new

      try {
        const response = await api.get(
          `/leaderboard/getLeaderboard/${tournamentId}`
        );

        if (response.data && response.data.success) {
          const sortedData = (response.data.data || []).sort(
            (a, b) => b.totalPoints - a.totalPoints
          );
          setLeaderboardData(sortedData);
        } else {
          setError(
            response.data.message ||
              "Failed to fetch leaderboard data for this tournament."
          );
        }
      } catch (err) {
        console.error(`Fetch Leaderboard Error (ID: ${tournamentId}):`, err);
        if (err.response) {
          setError(
            `Server Error: ${err.response.data?.message || err.response.status}`
          );
        } else if (err.request) {
          setError("Network Error: Could not connect to server.");
        } else {
          setError(
            "An unexpected error occurred while fetching the leaderboard."
          );
        }
        setLeaderboardData([]); // Clear data on error
      } finally {
        setIsLoadingLeaderboard(false);
        setRefreshing(false);
      }
    },
    [refreshing]
  ); // Depend on refreshing state if needed

  // Trigger leaderboard fetch when selection changes
  useEffect(() => {
    fetchLeaderboard(selectedTournamentId);
  }, [selectedTournamentId, fetchLeaderboard]); // Run when selection changes or fetch function instance changes

  // 3. Refresh Handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Re-fetch leaderboard for the currently selected tournament
    fetchLeaderboard(selectedTournamentId);
    // Note: We are not re-fetching the tournament list on pull-to-refresh here,
    // but you could add that if needed.
  }, [selectedTournamentId, fetchLeaderboard]);

  // 4. Render Helper Functions
  const renderListHeader = () => (
    <ListHeaderContainer>
      <RankHeader>#</RankHeader>
      <NameHeader>Name</NameHeader>
      <PointsHeader>Points</PointsHeader>
    </ListHeaderContainer>
  );

  const renderItem = ({ item, index }) => (
    <ListItemContainer>
      <RankText>{index + 1}</RankText>
      <NameText numberOfLines={1} ellipsizeMode="tail">
        {item.name}
      </NameText>
      <PointsText>{item.totalPoints}</PointsText>
    </ListItemContainer>
  );

  // 5. Picker Items Preparation
  const pickerItems = tournaments.map((tournament) => ({
    label: tournament.name,
    value: tournament._id,
    key: tournament._id, // Add key for React Native Picker Select
  }));

  // --- Render Logic ---

  // Initial Loading (Fetching Tournaments)
  if (isLoadingTournaments) {
    return (
      <LoadingContainer>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={{ color: "#ccc", marginTop: 10 }}>
          Loading Tournaments...
        </Text>
      </LoadingContainer>
    );
  }

  // Error during Tournament Fetch (or no tournaments found)
  // Use the error state set during tournament fetch
  if (error && tournaments.length === 0) {
    return (
      <SafeContainer>
        <StatusBar barStyle="light-content" />
        <Title>Leaderboard</Title>
        <ErrorText>{error}</ErrorText>
        {/* You might want a button to retry fetching tournaments here */}
      </SafeContainer>
    );
  }

  // Main Render (Tournaments loaded, show Picker and Leaderboard)
  return (
    <SafeContainer>
      <StatusBar barStyle="light-content" />
      <Title>Leaderboard</Title>

      {/* Tournament Selector Dropdown */}
      <PickerContainer>
        <RNPickerSelect
          placeholder={{
            label: "Select a tournament...",
            value: undefined,
            color: "#9EA0A4",
          }}
          items={pickerItems}
          onValueChange={(value) => {
            setSelectedTournamentId(value);
          }}
          style={pickerSelectStyles} // Apply custom styles
          value={selectedTournamentId ?? undefined}
          useNativeAndroidPickerStyle={false} // Use custom styles on Android
          Icon={() => {
            // Custom dropdown icon
            return (
              <Ionicons
                name="chevron-down"
                size={24}
                color="#9CA3AF"
                style={{ paddingRight: 10 }}
              />
            ); // Adjust styling as needed
          }}
          disabled={tournaments.length === 0} // Disable if no tournaments
        />
      </PickerContainer>

      {/* Display Error specific to Leaderboard fetch */}
      {error && tournaments.length > 0 && <ErrorText>{error}</ErrorText>}

      {/* Leaderboard List or Loading Indicator */}
      <ContentContainer>
        {isLoadingLeaderboard ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#F97316" />
          </View>
        ) : selectedTournamentId ? ( // Only show list if a tournament is selected
          <FlatList
            data={leaderboardData}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            ListHeaderComponent={renderListHeader}
            ListEmptyComponent={
              // Show empty message only if not loading and no error preventing display
              !isLoadingLeaderboard && !error ? (
                <EmptyListText>
                  Leaderboard is empty for this tournament.
                </EmptyListText>
              ) : null
            }
            // stickyHeaderIndices={[0]} // Keep if desired
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#F97316", "#FFFFFF"]}
                tintColor={"#F97316"}
                progressBackgroundColor="#374151"
              />
            }
            contentContainerStyle={{ paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          // Render something if no tournament is selected (e.g., placeholder text)
          !isLoadingTournaments &&
          !error && (
            <EmptyListText>Please select a tournament above.</EmptyListText>
          )
        )}
      </ContentContainer>
    </SafeContainer>
  );
}

// --- Styles for RNPickerSelect ---
// Adapting styles to match the dark theme
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#4B5563", // gray-600
    borderRadius: 8,
    color: "white", // Text color
    backgroundColor: "#374151", // gray-700
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 10,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#4B5563", // gray-600
    borderRadius: 8,
    color: "white", // Text color
    backgroundColor: "#374151", // gray-700
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 10,
  },
  placeholder: {
    color: "#9CA3AF", // gray-400
  },
  iconContainer: {
    // Style the container for the icon
    top: Platform.OS === "ios" ? 10 : 15,
    right: 12,
  },
  // You might need to add styles for dropdown items if using a custom dropdown component
});
