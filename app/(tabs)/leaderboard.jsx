import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Platform,
} from "react-native";
import { styled } from "nativewind";
import api from "../config/axios";
import RNPickerSelect from "react-native-picker-select";
import { Ionicons } from "@expo/vector-icons";

// --- Styled Components ---
const SafeContainer = styled(SafeAreaView, "flex-1 bg-gray-900");
const ContentContainer = styled(View, "flex-1 px-4");
// --- MODIFIED TITLE ---
const Title = styled(Text, "text-3xl font-bold text-white text-left my-4 mx-4"); // Changed text-center to text-left and added horizontal margin
// --- END MODIFIED TITLE ---
const LoadingContainer = styled(
  View,
  "flex-1 justify-center items-center bg-gray-900"
);
const ErrorText = styled(Text, "text-red-500 text-center mt-6 text-lg px-4");
const InfoText = styled(Text, "text-gray-400 text-center mt-10 text-lg px-4"); // For non-error info messages
const PickerContainer = styled(View, "mb-4 mx-4");

// List Header/Item styles
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
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Fetch Tournaments (associated with the user) on Mount
  const fetchTournaments = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) {
      setIsLoadingTournaments(true);
    }
    setError(null);
    setInfoMessage(null);
    setTournaments([]); // Reset tournaments before fetch
    setSelectedTournamentId(null); // Reset selection

    try {
      const response = await api.get("/tournaments/getTournamentsByUserId");
      console.log("Fetched Tournaments Response Status:", response.status);

      if (response.data && response.data.success) {
        const fetchedTournaments = response.data.data || [];
        setTournaments(fetchedTournaments);
        if (fetchedTournaments.length > 0) {
          setSelectedTournamentId(fetchedTournaments[0]._id); // Auto-select first
        } else {
          setInfoMessage("You have not joined or created any tournaments yet.");
        }
      } else {
        setError(response.data?.message || "Failed to fetch tournaments.");
      }
    } catch (err) {
      console.error("Fetch Tournaments Error:", err);
      if (err.response) {
        console.error("API Error Response Data:", err.response.data);
        console.error("API Error Response Status:", err.response.status);

        if (err.response.status === 404) {
          setInfoMessage(
            err.response.data?.message ||
              "You have not joined or created any tournaments yet."
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
        setError("An unexpected error occurred while setting up the request.");
      }
      setTournaments([]);
      setSelectedTournamentId(null);
    } finally {
      if (!isRefreshing) {
        setIsLoadingTournaments(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  // 2. Fetch Leaderboard
  const fetchLeaderboard = useCallback(
    async (tournamentId, isRefreshing = false) => {
      if (!tournamentId) {
        setLeaderboardData([]);
        if (!isRefreshing) setIsLoadingLeaderboard(false);
        setRefreshing(false);
        return;
      }

      if (!isRefreshing) {
        setIsLoadingLeaderboard(true);
      }
      setError(null);
      setInfoMessage(null);
      setLeaderboardData([]);

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
          setError(
            response.data?.message || "Failed to fetch leaderboard data."
          );
        }
      } catch (err) {
        console.error(`Fetch Leaderboard Error (ID: ${tournamentId}):`, err);
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
        setLeaderboardData([]);
      } finally {
        if (!isRefreshing) setIsLoadingLeaderboard(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedTournamentId) {
      fetchLeaderboard(selectedTournamentId);
    } else {
      setLeaderboardData([]);
      setIsLoadingLeaderboard(false);
    }
  }, [selectedTournamentId, fetchLeaderboard]);

  // 3. Refresh Handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTournaments(true);
    if (selectedTournamentId) {
      await fetchLeaderboard(selectedTournamentId, true);
    } else {
      setRefreshing(false); // Ensure refreshing stops if no tournament is selected after fetch
    }
  }, [selectedTournamentId, fetchTournaments, fetchLeaderboard]);

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
    label: String(tournament.name || ""),
    value: String(tournament._id),
    key: String(tournament._id),
  }));

  // --- Render Logic ---

  if (isLoadingTournaments && !refreshing) {
    return (
      <LoadingContainer>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={{ color: "#ccc", marginTop: 10 }}>
          Loading Your Tournaments...
        </Text>
      </LoadingContainer>
    );
  }

  return (
    <SafeContainer>
      <StatusBar barStyle="light-content" />
      {/* Use the modified Title component */}
      <Title>Leaderboard</Title>

      {/* Display general errors */}
      {error && <ErrorText>{error}</ErrorText>}

      {/* Display info message */}
      {infoMessage && !error && <InfoText>{infoMessage}</InfoText>}

      {/* Only show Picker if tournaments loaded and no initial error/info preventing it */}
      {tournaments.length > 0 && (
        <PickerContainer>
          <RNPickerSelect
            placeholder={{
              label: "Select a tournament...",
              value: undefined,
              color: "#9CA3AF",
            }}
            items={pickerItems}
            onValueChange={(value) => {
              setSelectedTournamentId(value);
            }}
            style={pickerSelectStyles}
            value={selectedTournamentId ?? undefined}
            useNativeAndroidPickerStyle={false}
            Icon={() => (
              <Ionicons
                name="chevron-down"
                size={24}
                color="#9CA3AF"
                style={{ paddingRight: 10 }}
              />
            )}
            disabled={refreshing || isLoadingTournaments} // Disable while loading/refreshing
          />
        </PickerContainer>
      )}

      {/* Leaderboard List or Loading Indicator */}
      <ContentContainer>
        {isLoadingLeaderboard ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <ActivityIndicator size="large" color="#F97316" />
          </View>
        ) : selectedTournamentId ? (
          <FlatList
            data={leaderboardData}
            keyExtractor={(item) => String(item._id)}
            renderItem={renderItem}
            ListHeaderComponent={renderListHeader}
            ListEmptyComponent={
              !isLoadingLeaderboard && !error && !infoMessage ? (
                <EmptyListText>
                  Leaderboard data is currently unavailable.
                </EmptyListText>
              ) : null
            }
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
          !isLoadingTournaments &&
          !error &&
          !infoMessage &&
          tournaments.length > 0 && (
            <EmptyListText>Please select a tournament above.</EmptyListText>
          )
        )}
      </ContentContainer>
    </SafeContainer>
  );
}

// --- Styles for RNPickerSelect ---
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#4B5563",
    borderRadius: 8,
    color: "white",
    backgroundColor: "#374151",
    paddingRight: 30,
    marginBottom: 10,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#4B5563",
    borderRadius: 8,
    color: "white",
    backgroundColor: "#374151",
    paddingRight: 30,
    marginBottom: 10,
  },
  placeholder: {
    color: "#9CA3AF",
  },
  iconContainer: {
    top: Platform.OS === "ios" ? 10 : 15,
    right: 12,
  },
});
