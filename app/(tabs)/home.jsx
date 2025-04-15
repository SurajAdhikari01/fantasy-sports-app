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
    // ... (keep existing implementation)
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
    // ... (keep existing implementation)
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

  // --- Fetch User Teams Data (NEW) ---
  // Assuming your endpoint is something like '/teams/getUserTeams'
  // Adjust the endpoint ('/teams/getUserTeams') if necessary
  const fetchUserTeams = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoadingUserTeams(true);
    setErrorUserTeams(null);
    try {
      // IMPORTANT: Replace '/teams/getUserTeams' with your actual endpoint for fetching user-specific teams
      const response = await api.get("/teams");
      if (response.data?.success && Array.isArray(response.data.data)) {
        setUserTeamsData(response.data.data);
      } else {
        setUserTeamsData([]); // Set empty array if response is not as expected
      }
    } catch (err) {
      console.error("Error fetching user teams:", err); // Log the error
      setErrorUserTeams(
        err.response?.data?.message || "Failed to load your team points."
      );
      setUserTeamsData([]); // Clear data on error
    } finally {
      if (!isRefreshing) setLoadingUserTeams(false);
    }
  }, []); // Add dependencies if needed (e.g., user ID if required by API)

  // --- Initial Data Load ---
  useEffect(() => {
    fetchUpcomingMatches();
    fetchTournaments();
    fetchUserTeams(); // Fetch user teams on initial load
  }, [fetchUpcomingMatches, fetchTournaments, fetchUserTeams]); // Add fetchUserTeams dependency

  // --- Refresh Handler ---
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setErrorUpcoming(null);
    setErrorTournaments(null);
    setErrorUserTeams(null); // Clear user teams error on refresh
    await Promise.all([
      fetchUpcomingMatches(true),
      fetchTournaments(true),
      fetchUserTeams(true), // Refresh user teams data
    ]);
    setRefreshing(false);
  }, [fetchUpcomingMatches, fetchTournaments, fetchUserTeams]); // Add fetchUserTeams dependency

  // --- Render Item for Tournament Points FlatList ---
  // This function already uses item.totalPoints correctly
  const renderTournamentPointsItem = ({ item }) => {
    // 'item' here is a team object from the userTeamsData array
    const tournamentName = item.tournamentId?.name || "Unknown Tournament";
    const points = item.totalPoints ?? 0; // Use nullish coalescing for default

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

  // --- Navigation Handlers (Unchanged) ---
  const handleTournamentSelect = useCallback(
    (tournament) => {
      // ... (keep existing implementation)
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

  // --- Render Item for Upcoming Matches FlatList (Unchanged) ---
  const renderUpcomingMatchItem = ({ item }) => {
    // ... (keep existing implementation)
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

  // --- Modal Handlers (Unchanged) ---
  const handleLogout = () => {
    // ... (keep existing implementation)
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
              // Optional: Navigate to login screen after logout if needed
              // router.replace('/login'); // Example using expo-router
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
    // ... (keep existing implementation)
    setOptionsModalVisible(false);
    router.push("/more"); // Ensure this path is correct
  };
  const showOptionsMenu = () => {
    // ... (keep existing implementation)
    profileImageRef.current?.measure((fx, fy, w, h, px, py) => {
      // Adjust calculations if needed based on layout
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
  // --- Updated Condition for Points Section (Uses new state) ---
  const showPointsSection =
    !loadingUserTeams && !errorUserTeams && userTeamsData.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-neutral-800">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ccc" // iOS spinner color
            colors={["#ccc"]} // Android spinner color(s)
            progressBackgroundColor="#444" // Android spinner background
          />
        }
      >
        {/* --- Header (Unchanged) --- */}
        <View className="px-4 pt-4">
          {/* ... (keep existing header JSX) */}
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
                  uri:
                    userData?.profileUrl ||
                    "https://png.pngtree.com/png-vector/20220611/ourmid/pngtree-person-gray-photo-placeholder-man-silhouette-on-white-background-png-image_4826258.png", // Default placeholder
                }}
                className="h-10 w-10 rounded-full"
              />
            </TouchableOpacity>
          </View>
          <Text className="text-neutral-400 text-sm">Welcome back</Text>
        </View>

        {/* --- Statistics Card (Unchanged) --- */}
        <View className="mt-6">
          {/* ... (keep existing StatisticsCard JSX) */}
          <StatisticsCard
            scoreEarned={userData?.scoreEarned || "0"} // Assuming scoreEarned comes from userData
            tournamentJoined={tournamentJoinedCount} // Use state variable
          />
        </View>

        {/* --- Tournament Points Section (Conditional Rendering - Uses new state) --- */}
        {/* Show loading indicator for points */}
        {loadingUserTeams && !refreshing && (
          <View className="mt-4 h-24 justify-center items-center px-4">
            <ActivityIndicator size="small" color="#ccc" />
            <Text className="text-neutral-400 mt-2 text-xs">
              Loading Points...
            </Text>
          </View>
        )}
        {/* Show error message for points */}
        {errorUserTeams && !refreshing && (
          <View className="mt-4 h-24 justify-center items-center px-4">
            <Text className="text-red-400 text-center text-xs">
              {errorUserTeams}
            </Text>
          </View>
        )}
        {/* Show the FlatList only if data is loaded, no error, and not empty */}
        {showPointsSection && !refreshing && (
          <FlatList
            data={userTeamsData} // Use the fetched user teams data
            horizontal
            renderItem={renderTournamentPointsItem}
            keyExtractor={(item) => item._id} // Use team _id as key
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 12, // Added some vertical padding
            }}
          />
        )}
        {/* Optional: Show 'No points' message */}
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

        {/* --- Upcoming Matches Section (Conditional Rendering - Unchanged) --- */}
        {/* ... (keep existing upcoming matches JSX with loading/error/data states) */}
        {/* Show loading indicator */}
        {loadingUpcoming && !refreshing && (
          <View className="mt-8 h-40 justify-center items-center">
            <ActivityIndicator size="small" color="#ccc" />
            <Text className="text-neutral-400 mt-2 text-sm">
              Loading Matches...
            </Text>
          </View>
        )}
        {/* Show error message */}
        {errorUpcoming && !refreshing && (
          <View className="mt-8 h-40 justify-center items-center px-4">
            <Text className="text-red-400 text-center text-sm">
              {errorUpcoming}
            </Text>
          </View>
        )}
        {/* Show the section only if there is data */}
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
                paddingHorizontal: 10, // Adjust padding as needed
                paddingVertical: 5,
              }}
            />
          </View>
        )}
        {/* Optional: Show 'No matches' only if not loading, no error, and empty */}
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

        {/* --- Tournament Results Section (Conditional Rendering - Unchanged) --- */}
        {/* ... (keep existing tournament results JSX with loading/error/data states) */}
        {/* Show loading indicator */}
        {loadingTournaments && !refreshing && (
          <View className="mt-8 pb-10 items-center">
            <ActivityIndicator size="small" color="#ccc" />
            <Text className="text-neutral-400 mt-2 text-sm">
              Loading Tournaments...
            </Text>
          </View>
        )}
        {/* Show error message */}
        {errorTournaments && !refreshing && (
          <View className="mt-8 items-center px-4 py-10">
            <Text className="text-red-400 text-center">{errorTournaments}</Text>
          </View>
        )}
        {/* Show the section only if there is data */}
        {showTournamentsSection && !refreshing && (
          <View className="mt-8">
            <Text className="text-neutral-200 text-lg font-semibold px-4 mb-3">
              Tournament Results
            </Text>
            <View className="pb-10 items-center">
              {/* Use map for tournaments */}
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
        {/* Optional: Show 'No tournaments' only if not loading, no error, and empty */}
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

      {/* Options Modal (Profile/Logout - Unchanged) */}
      {/* ... (keep existing modal JSX) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={optionsModalVisible}
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay} // Keep StyleSheet for overlay
          onPress={() => setOptionsModalVisible(false)}
        >
          {/* Use bg-neutral-800 for consistency */}
          <View
            style={[
              styles.optionsModalView, // Keep StyleSheet for positioning/base styles
              {
                top: modalPosition.top,
                right: modalPosition.right,
                backgroundColor: "#2d2d2d", // Use a slightly lighter dark bg if desired
              },
            ]}
            onStartShouldSetResponder={() => true} // Prevents touch from passing through modal
          >
            {/* Use text-neutral-200 */}
            <TouchableOpacity
              style={styles.optionButton} // Keep StyleSheet for padding/etc.
              onPress={handleMoreNavigation}
              className="active:bg-neutral-600" // Add active state background
            >
              <Text
                style={styles.optionButtonText}
                className="text-neutral-200"
              >
                View More
              </Text>
            </TouchableOpacity>
            {/* Use bg-neutral-600 */}
            <View style={styles.separator} className="bg-neutral-600" />
            {/* Use text-red-500 */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleLogout}
              className="active:bg-neutral-600"
            >
              <Text
                style={[styles.optionButtonText, styles.logoutText]} // Keep base styles
                className="text-red-500" // Apply color via className
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
    // backgroundColor: "#2d2d2d", // Moved inline for dynamic positioning override
    borderRadius: 10,
    overflow: "hidden",
    width: 150, // Adjust width as needed
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6, // Keep elevation for Android shadow
  },
  optionButton: { paddingVertical: 12, paddingHorizontal: 15 }, // Defines tap area size
  optionButtonText: { fontSize: 15 }, // Base font size
  logoutText: {
    /* color: "#ff4b2b" */
    // Color handled by className
  },
  separator: { height: StyleSheet.hairlineWidth /* backgroundColor: "#555" */ }, // Color handled by className
});

export default HomeScreen;
