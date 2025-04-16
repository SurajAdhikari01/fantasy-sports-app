import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  FlatList,
  ScrollView,
  Modal,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { Alert } from "react-native";
import StatisticsCard from "../components/HomeSVGCard";
import MatchCard from "../components/MatchCard"; // Used for upcoming matches
import api from "../config/axios"; // Assuming this is your configured Axios instance
import TournamentResult from "../components/TournamentResult"; // Import the updated card

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const { signOut, userData } = useAuth();
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 });
  const profileImageRef = useRef(null);

  // --- State for Dynamic Data ---
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [errorUpcoming, setErrorUpcoming] = useState(null);

  const [tournaments, setTournaments] = useState([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [errorTournaments, setErrorTournaments] = useState(null);
  const [tournamentJoinedCount, setTournamentJoinedCount] = useState(0);

  // --- State for User Teams Data (NEW) ---
  const [userTeamsData, setUserTeamsData] = useState([]);
  const [loadingUserTeams, setLoadingUserTeams] = useState(true);
  const [errorUserTeams, setErrorUserTeams] = useState(null);
  // --- End State ---

  const [refreshing, setRefreshing] = useState(false);

  // --- Data Fetching Functions ---
  const fetchUpcomingMatches = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoadingUpcoming(true);
    setErrorUpcoming(null);
    try {
      const response = await api.get("/upcoming/getmatches");
      if (response.data?.success && Array.isArray(response.data.data)) {
        setUpcomingMatches(response.data.data);
      } else {
        setUpcomingMatches([]);
      }
    } catch (err) {
      setErrorUpcoming(
        err.response?.data?.message || "Failed to load upcoming matches."
      );
      setUpcomingMatches([]);
    } finally {
      if (!isRefreshing) setLoadingUpcoming(false);
    }
  }, []);

  const fetchTournaments = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoadingTournaments(true);
    setErrorTournaments(null);
    try {
      const response = await api.get("/tournaments/getTournamentsByUserId");
      if (response.data?.success && Array.isArray(response.data.data)) {
        setTournaments(response.data.data);
        setTournamentJoinedCount(
          response.data.data.filter((tournament) => tournament).length // Assuming non-null means joined
        );
      } else {
        setTournaments([]);
        setTournamentJoinedCount(0); // Reset count if no data
      }
    } catch (err) {
      setErrorTournaments(
        err.response?.data?.message || "Failed to load tournaments."
      );
      setTournaments([]);
      setTournamentJoinedCount(0); // Reset count on error
    } finally {
      if (!isRefreshing) setLoadingTournaments(false);
    }
  }, []);

  const fetchUserTeams = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoadingUserTeams(true);
    setErrorUserTeams(null);
    try {
      // IMPORTANT: Replace '/teams/getUserTeams' with your actual endpoint if different
      const response = await api.get("/teams");
      if (response.data?.success && Array.isArray(response.data.data)) {
        setUserTeamsData(response.data.data);
      } else {
        setUserTeamsData([]);
      }
    } catch (err) {
      console.error("Error fetching user teams:", err);
      setErrorUserTeams(
        err.response?.data?.message || "Failed to load your team points."
      );
      setUserTeamsData([]);
    } finally {
      if (!isRefreshing) setLoadingUserTeams(false);
    }
  }, []);

  // --- Initial Data Load ---
  useEffect(() => {
    fetchUpcomingMatches();
    fetchTournaments();
    fetchUserTeams();
  }, [fetchUpcomingMatches, fetchTournaments, fetchUserTeams]);

  // --- Refresh Handler ---
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setErrorUpcoming(null);
    setErrorTournaments(null);
    setErrorUserTeams(null);
    await Promise.all([
      fetchUpcomingMatches(true),
      fetchTournaments(true),
      fetchUserTeams(true),
    ]);
    setRefreshing(false);
  }, [fetchUpcomingMatches, fetchTournaments, fetchUserTeams]);

  // --- Render Item for Tournament Points FlatList ---
  const renderTournamentPointsItem = ({ item }) => {
    const tournamentName = item.tournamentId?.name || "Unknown Tournament";
    const points = item.totalPoints ?? 0;

    return (
      <View className="bg-neutral-700 p-4 mt-6 rounded-lg w-36 h-24 mr-3 justify-between items-center">
        <Text
          className="text-neutral-200 text-2xl font-bold text-center"
          numberOfLines={1}
        >
          {points}
        </Text>
        <Text
          className="text-neutral-400 text-xs text-center mt-1"
          numberOfLines={2}
        >
          {tournamentName}
        </Text>
      </View>
    );
  };

  // --- Navigation Handlers ---
  const handleTournamentSelect = useCallback(
    (tournament) => {
      if (!tournament?._id) return;
      router.push({
        pathname: `/components/MatchResultsScreen`, // Ensure this path is correct
        params: {
          tournamentName: tournament.name,
          tournamentId: tournament._id,
        },
      });
    },
    [router]
  );

  // --- Render Item for Upcoming Matches FlatList ---
  const renderUpcomingMatchItem = ({ item }) => {
    const matchDataForCard = {
      id: item._id,
      sport: "football", // Assuming football, adjust if needed
      matchName: item.matchName,
      matchDate: item.matchDate,
      status: "UPCOMING", // Or derive from item data if available
    };
    return (
      <View className="mx-2">
        <MatchCard match={matchDataForCard} />
      </View>
    );
  };

  // --- Modal Handlers ---
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  const handleMoreNavigation = () => {
    setOptionsModalVisible(false);
    router.push("/more"); // Ensure this path is correct
  };
  const showOptionsMenu = () => {
    profileImageRef.current?.measure((fx, fy, w, h, px, py) => {
      const topOffset = py + h + 5;
      const rightOffset = Dimensions.get("window").width - (px + w);
      setModalPosition({ top: topOffset, right: rightOffset });
      setOptionsModalVisible(true);
    });
  };
  // --- End Modal Handlers ---

  // Helper flags updated to use new state
  const showUpcomingMatchesSection =
    !loadingUpcoming && !errorUpcoming && upcomingMatches.length > 0;
  const showTournamentsSection =
    !loadingTournaments && !errorTournaments && tournaments.length > 0;
  const showPointsSection =
    !loadingUserTeams && !errorUserTeams && userTeamsData.length > 0;

  // --- Calculate Highest Score ---
  // Find the maximum totalPoints from the userTeamsData array
  const highestScore = userTeamsData.reduce((max, team) => {
    const currentPoints = team.totalPoints ?? 0; // Default to 0 if null/undefined
    return currentPoints > max ? currentPoints : max;
  }, 0); // Start with 0 as the initial maximum

  return (
    <SafeAreaView className="flex-1 bg-neutral-800">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ccc"
            colors={["#ccc"]}
            progressBackgroundColor="#444"
          />
        }
      >
        {/* --- Header --- */}
        <View className="px-4 pt-4">
          <View className="flex-row justify-between items-center ">
            <Text className="text-neutral-200 font-semibold text-xl">
              Hi,{" "}
              {userData?.username
                ? `${
                    userData.username.charAt(0).toUpperCase() +
                    userData.username.slice(1).toLowerCase()
                  }`
                : "User"}
            </Text>
            <TouchableOpacity
              ref={profileImageRef}
              onPress={showOptionsMenu}
              className="active:opacity-70"
            >
              <Image
                source={{
                  uri: "https://png.pngtree.com/png-vector/20220611/ourmid/pngtree-person-gray-photo-placeholder-man-silhouette-on-white-background-png-image_4826258.png",
                }}
                className="h-10 w-10 rounded-full"
              />
            </TouchableOpacity>
          </View>
          <Text className="text-neutral-400 text-sm">Welcome back</Text>
        </View>

        {/* --- Statistics Card (UPDATED) --- */}
        <View className="mt-6">
          {/* Use the calculated highestScore, converting it to a string */}
          <StatisticsCard
            scoreEarned={highestScore.toString()} // Pass the highest score here
            tournamentJoined={tournamentJoinedCount} // Use state variable
          />
        </View>

        {/* --- Tournament Points Section --- */}
        {loadingUserTeams && !refreshing && (
          <View className="mt-4 h-24 justify-center items-center px-4">
            <ActivityIndicator size="small" color="#ccc" />
            <Text className="text-neutral-400 mt-2 text-xs">
              Loading Points...
            </Text>
          </View>
        )}
        {errorUserTeams && !refreshing && (
          <View className="mt-4 h-24 justify-center items-center px-4">
            <Text className="text-red-400 text-center text-xs">
              {errorUserTeams}
            </Text>
          </View>
        )}
        {showPointsSection && !refreshing && (
          <FlatList
            data={userTeamsData}
            horizontal
            renderItem={renderTournamentPointsItem}
            keyExtractor={(item) => item._id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          />
        )}
        {!loadingUserTeams &&
          !errorUserTeams &&
          userTeamsData.length === 0 &&
          !refreshing && (
            <View className="mt-4 h-10 justify-center items-center px-4">
              <Text className="text-neutral-500 text-center text-xs">
                No tournament points found yet.
              </Text>
            </View>
          )}

        {/* --- Upcoming Matches Section --- */}
        {loadingUpcoming && !refreshing && (
          <View className="mt-8 h-40 justify-center items-center">
            <ActivityIndicator size="small" color="#ccc" />
            <Text className="text-neutral-400 mt-2 text-sm">
              Loading Matches...
            </Text>
          </View>
        )}
        {errorUpcoming && !refreshing && (
          <View className="mt-8 h-40 justify-center items-center px-4">
            <Text className="text-red-400 text-center text-sm">
              {errorUpcoming}
            </Text>
          </View>
        )}
        {showUpcomingMatchesSection && !refreshing && (
          <View className="mt-8">
            <Text className="text-neutral-200 text-lg font-semibold px-4 mb-3">
              Upcoming Matches
            </Text>
            <FlatList
              data={upcomingMatches}
              horizontal
              keyExtractor={(item) => item._id}
              renderItem={renderUpcomingMatchItem}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}
            />
          </View>
        )}
        {!loadingUpcoming &&
          !errorUpcoming &&
          upcomingMatches.length === 0 &&
          !refreshing && (
            <View className="mt-8 h-10 justify-center items-center px-4">
              <Text className="text-neutral-500 text-center text-sm">
                No upcoming matches listed.
              </Text>
            </View>
          )}

        {/* --- Tournament Results Section --- */}
        {loadingTournaments && !refreshing && (
          <View className="mt-8 pb-10 items-center">
            <ActivityIndicator size="small" color="#ccc" />
            <Text className="text-neutral-400 mt-2 text-sm">
              Loading Tournaments...
            </Text>
          </View>
        )}
        {errorTournaments && !refreshing && (
          <View className="mt-8 items-center px-4 py-10">
            <Text className="text-red-400 text-center">{errorTournaments}</Text>
          </View>
        )}
        {showTournamentsSection && !refreshing && (
          <View className="mt-8">
            <Text className="text-neutral-200 text-lg font-semibold px-4 mb-3">
              Tournament Results
            </Text>
            <View className="pb-10 items-center">
              {tournaments.map((tournament) => (
                <TournamentResult
                  key={tournament._id}
                  tournamentName={tournament.name}
                  onPress={() => handleTournamentSelect(tournament)}
                />
              ))}
            </View>
          </View>
        )}
        {!loadingTournaments &&
          !errorTournaments &&
          tournaments.length === 0 &&
          !refreshing && (
            <View className="mt-8 items-center px-4 py-10">
              <Text className="text-neutral-500 text-center">
                No tournaments found. Pull down to refresh.
              </Text>
            </View>
          )}
      </ScrollView>

      {/* Options Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={optionsModalVisible}
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setOptionsModalVisible(false)}
        >
          <View
            style={[
              styles.optionsModalView,
              {
                top: modalPosition.top,
                right: modalPosition.right,
                backgroundColor: "#2d2d2d",
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleMoreNavigation}
              className="active:bg-neutral-600"
            >
              <Text
                style={styles.optionButtonText}
                className="text-neutral-200"
              >
                View More
              </Text>
            </TouchableOpacity>
            <View style={styles.separator} className="bg-neutral-600" />
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleLogout}
              className="active:bg-neutral-600"
            >
              <Text
                style={[styles.optionButtonText, styles.logoutText]}
                className="text-red-500"
              >
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

// Styles for Modal (Unchanged)
const styles = StyleSheet.create({
  modalOverlay: { flex: 1 },
  optionsModalView: {
    position: "absolute",
    borderRadius: 10,
    overflow: "hidden",
    width: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  optionButton: { paddingVertical: 12, paddingHorizontal: 15 },
  optionButtonText: { fontSize: 15 },
  logoutText: {
    // Color handled by className
  },
  separator: { height: StyleSheet.hairlineWidth }, // Color handled by className
});

export default HomeScreen;
