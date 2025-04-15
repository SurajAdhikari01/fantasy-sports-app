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
import api from "../config/axios";
import TournamentResult from "../components/TournamentResult"; // Import the updated card
// useNavigation import removed as it's not used directly in this component's logic
// import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  // navigation constant removed
  const { signOut, userData } = useAuth();
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 });
  const profileImageRef = useRef(null);

  // --- State for Dynamic Data ---
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [errorUpcoming, setErrorUpcoming] = useState(null);

  const [tournaments, setTournaments] = useState([]); // State for the tournament list
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [errorTournaments, setErrorTournaments] = useState(null);

  const [refreshing, setRefreshing] = useState(false);
  // --- End State ---

  // --- Data Fetching Functions (Unchanged) ---
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
      } else {
        setTournaments([]);
      }
    } catch (err) {
      setErrorTournaments(
        err.response?.data?.message || "Failed to load tournaments."
      );
      setTournaments([]);
    } finally {
      if (!isRefreshing) setLoadingTournaments(false);
    }
  }, []);

  // --- Initial Data Load (Unchanged) ---
  useEffect(() => {
    fetchUpcomingMatches();
    fetchTournaments();
  }, [fetchUpcomingMatches, fetchTournaments]);

  // --- Refresh Handler (Unchanged) ---
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Clear errors on refresh
    setErrorUpcoming(null);
    setErrorTournaments(null);
    await Promise.all([fetchUpcomingMatches(true), fetchTournaments(true)]);
    setRefreshing(false);
  }, [fetchUpcomingMatches, fetchTournaments]);

  // --- Navigation Handlers (Unchanged) ---
  const handleTournamentSelect = useCallback(
    (tournament) => {
      if (!tournament?._id) return;
      router.push({
        pathname: `/components/MatchResultsScreen`,
        params: {
          tournamentName: tournament.name,
          tournamentId: tournament._id,
        },
      });
    },
    [router] // Dependency on router from expo-router
  );

  // --- Render Item for Upcoming Matches FlatList (Unchanged) ---
  const renderUpcomingMatchItem = ({ item }) => {
    const matchDataForCard = {
      id: item._id,
      sport: "football",
      matchName: item.matchName,
      matchDate: item.matchDate,
      status: "UPCOMING",
    };
    return (
      <View className="mx-2">
        <MatchCard match={matchDataForCard} />
      </View>
    );
  };

  // --- Modal Handlers (Unchanged) ---
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
    router.push("/more");
  };
  const showOptionsMenu = () => {
    profileImageRef.current?.measure((fx, fy, w, h, px, py) => {
      const topOffset = py + h + 5;
      const rightOffset = width - (px + w);
      setModalPosition({ top: topOffset, right: rightOffset });
      setOptionsModalVisible(true);
    });
  };
  // --- End Modal Handlers ---

  // Helper flags to determine if sections should be shown
  const showUpcomingMatchesSection =
    !loadingUpcoming && !errorUpcoming && upcomingMatches.length > 0;
  const showTournamentsSection =
    !loadingTournaments && !errorTournaments && tournaments.length > 0;

  return (
    // Use bg-neutral-800 to match MatchResultsScreen
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
            progressBackgroundColor="#444" // Use a darker color matching the theme
          />
        }
      >
        {/* --- Header --- */}
        {/* Use text-neutral-200 and text-neutral-400 for consistency */}
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
                  uri:
                    userData?.profileUrl ||
                    "https://png.pngtree.com/png-vector/20220611/ourmid/pngtree-person-gray-photo-placeholder-man-silhouette-on-white-background-png-image_4826258.png",
                }}
                className="h-10 w-10 rounded-full"
              />
            </TouchableOpacity>
          </View>
          <Text className="text-neutral-400 text-sm">Welcome back</Text>
        </View>

        {/* --- Statistics Card --- */}
        <View className="mt-6">
          <StatisticsCard
            scoreEarned={userData?.scoreEarned || "0"}
            gamesPlayed={userData?.gamesPlayed || "0"}
          />
        </View>

        {/* --- Games Played and Stats --- */}
        {/* Use bg-neutral-700 and text-neutral-200/400 */}
        <View className="flex-row justify-between items-center px-4 mt-6">
          <View className="bg-neutral-700 p-4 rounded-lg flex-1 mr-2 items-center">
            <Text className="text-neutral-200 text-lg font-bold">
              {userData?.ranking || "-"}
            </Text>
            <Text className="text-neutral-400 text-sm mt-1">Ranking</Text>
          </View>
          <View className="bg-neutral-700 p-4 rounded-lg flex-1 ml-2 items-center">
            <Text className="text-neutral-200 text-lg font-bold">
              {userData?.matchesPlayed || "0"}
            </Text>
            <Text className="text-neutral-400 text-sm mt-1">
              Matches Played
            </Text>
          </View>
        </View>

        {/* --- Upcoming Matches Section (Conditional Rendering) --- */}
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
                paddingHorizontal: 10,
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

        {/* --- Tournament Results Section (Conditional Rendering) --- */}
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

      {/* Options Modal (Profile/Logout) */}
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
                backgroundColor: "#2d2d2d",
              }, // Use a slightly lighter dark bg
            ]}
            onStartShouldSetResponder={() => true} // Prevents touch from passing through
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

// Styles for Modal - Keep these as StyleSheet for simplicity with positioning/overlay
const styles = StyleSheet.create({
  modalOverlay: { flex: 1 },
  optionsModalView: {
    position: "absolute",
    // backgroundColor: "#2d2d2d", // Moved inline with className for override
    borderRadius: 10,
    overflow: "hidden",
    width: 150,
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
  }, // Color handled by className
  separator: { height: StyleSheet.hairlineWidth /* backgroundColor: "#555" */ }, // Color handled by className
});

export default HomeScreen;
