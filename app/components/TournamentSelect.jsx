import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
// Removed TabView and SceneMap imports
import api from "../config/axios";
import { useRecoilState } from "recoil";
import {
  fetchedPlayersState,
  selectedTournamentState,
  playerLimitState,
  teamIdState,
  currentRoundState,
} from "./atoms";
import { viewModeState } from "./atoms";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width: windowWidth } = Dimensions.get("window");

const TournamentSelect = () => {
  const [joinedTournaments, setJoinedTournaments] = useState([]);
  const [availableTournaments, setAvailableTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const [fetchedPlayers, setFetchedPlayers] =
    useRecoilState(fetchedPlayersState);
  const [selectedTournament, setSelectedTournament] = useRecoilState(
    selectedTournamentState
  );
  const [playerLimit, setPlayerLimit] = useRecoilState(playerLimitState);
  const [selectedTournamentPlayers, setSelectedTournamentPlayers] = useState(
    []
  );
  const [viewMode, setViewMode] = useRecoilState(viewModeState);
  const [currentRound, setCurrentRoundState] =
    useRecoilState(currentRoundState);
  // const [showEnded, setShowEnded] = useState(false); // This state seems unused globally, moved logic locally to routes

  // --- State for manual tab/swipe implementation ---
  const [activeIndex, setActiveIndex] = useState(0); // 0 for Joined, 1 for Available
  const scrollViewRef = useRef(null);
  // --- End State ---

  // Removed initialLayout and routes state

  useEffect(() => {
    fetchTournaments();
  }, []);

  // Helper functions (getRoundsToShow, getNextRoundInfo, fetchTournaments, getCurrentRound, handleJoinTournament, onRefresh) remain the same
  // ... (Keep existing helper functions) ...
  const getRoundsToShow = ({ knockoutStart, semifinalStart, finalStart }) => {
    const now = new Date();
    const knockout = knockoutStart ? new Date(knockoutStart) : null;
    const semifinal = semifinalStart ? new Date(semifinalStart) : null;
    const final = finalStart ? new Date(finalStart) : null;

    // Determine current phase to decide which future rounds to show
    if (final && now >= final) {
      // Final ended
      return []; // No future rounds
    }
    if (semifinal && now >= semifinal) {
      // Semifinal ongoing or ended (but final not started/ended)
      return [{ key: "final", label: "Final", start: final }].filter(
        (r) => r.start
      ); // Filter out null starts
    }
    if (knockout && now >= knockout) {
      // Knockout ongoing or ended (but semi not started/ended)
      return [
        { key: "semifinal", label: "Semifinal", start: semifinal },
        { key: "final", label: "Final", start: final },
      ].filter((r) => r.start);
    }
    // Before knockout starts
    return [
      { key: "knockout", label: "Knockout", start: knockout },
      { key: "semifinal", label: "Semifinal", start: semifinal },
      { key: "final", label: "Final", start: final },
    ].filter((r) => r.start);
  };

  const getNextRoundInfo = ({ knockoutStart, semifinalStart, finalStart }) => {
    const now = new Date();
    const knockout = knockoutStart ? new Date(knockoutStart) : null;
    const semifinal = semifinalStart ? new Date(semifinalStart) : null;
    const final = finalStart ? new Date(finalStart) : null;

    if (knockout && now < knockout) {
      return { roundLabel: "Knockout", deadline: knockout };
    }
    if (semifinal && now < semifinal) {
      // Need to check if we are past knockout deadline
      if (knockout && now >= knockout) {
        return { roundLabel: "Semifinal", deadline: semifinal };
      }
      // If knockout hasn't happened yet, the next round is still knockout technically
      // This case might need refinement based on exact registration logic
      if (knockout && now < knockout) {
        return { roundLabel: "Knockout", deadline: knockout };
      }
      // If no knockout date, but semifinal date exists and is in future
      if (!knockout && semifinal) {
        return { roundLabel: "Semifinal", deadline: semifinal };
      }
    }
    if (final && now < final) {
      // Need to check if we are past semifinal deadline
      if (semifinal && now >= semifinal) {
        return { roundLabel: "Final", deadline: final };
      }
      // If semifinal hasn't happened yet
      if (semifinal && now < semifinal) {
        // Check if knockout happened
        if (knockout && now >= knockout) {
          return { roundLabel: "Semifinal", deadline: semifinal };
        }
        if (knockout && now < knockout) {
          return { roundLabel: "Knockout", deadline: knockout };
        }
        // No knockout, no semifinal yet
        if (!knockout && !semifinal) {
          return { roundLabel: "Final", deadline: final }; // Assuming direct to final? Needs logic check.
        }
        if (!knockout && semifinal && now < semifinal) {
          return { roundLabel: "Semifinal", deadline: semifinal };
        }
      }
      // No knockout, no semifinal date, but final date exists
      if (!knockout && !semifinal && final) {
        return { roundLabel: "Final", deadline: final };
      }
    }
    // If final date has passed (or all relevant dates have passed)
    const latestDeadline = [knockout, semifinal, final]
      .filter(Boolean)
      .sort((a, b) => b - a)[0];
    if (latestDeadline && now >= latestDeadline) {
      return { roundLabel: "Tournament Ended", deadline: null };
    }
    // Fallback if no dates are set or logic is complex
    return { roundLabel: "Check Details", deadline: null }; // Changed fallback
  };

  const fetchTournaments = async () => {
    try {
      setLoading(true);

      const joinedResponse = await api.get(
        "tournaments/getTournamentsByUserId"
      );
      if (joinedResponse.data.success) {
        setJoinedTournaments(joinedResponse.data.data || []);
      } else {
        Alert.alert(
          "Error",
          joinedResponse.data.message || "Failed to fetch joined tournaments"
        );
      }

      const availableResponse = await api.get("/tournaments/getAllTournaments");
      if (availableResponse.data.success) {
        setAvailableTournaments(availableResponse.data.data || []);
      } else {
        Alert.alert(
          "Error",
          availableResponse.data.message ||
            "Failed to fetch available tournaments"
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch tournaments. Please try again.");
      console.error("Error fetching tournaments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getCurrentRound = ({ knockoutStart, semifinalStart, finalStart }) => {
    const now = new Date();
    const ko = knockoutStart ? new Date(knockoutStart) : null;
    const semi = semifinalStart ? new Date(semifinalStart) : null;
    const final = finalStart ? new Date(finalStart) : null;

    // Order matters: check from latest round backwards
    if (final && now >= final) {
      return "FINAL"; // Final round is ongoing or finished
    }
    if (semi && now >= semi) {
      // If final exists and we haven't reached it yet, we are in SEMIFINAL
      if (!final || now < final) {
        return "SEMIFINAL";
      }
      // If final exists and we have reached it, handled above. Fallback needed?
    }
    if (ko && now >= ko) {
      // If semifinal exists and we haven't reached it yet, we are in KNOCKOUT
      if (!semi || now < semi) {
        return "KNOCKOUT";
      }
      // If semifinal exists and we have reached it, handled above.
    }
    // If none of the start dates have been reached
    return "NOT_STARTED";
  };

  const handleJoinTournament = async (tournamentId, playerLimitPerTeam) => {
    try {
      setLoading(true);
      // Assuming you need to fetch players *before* navigating or confirming join
      // If joining is a separate API call, add it here.
      // const joinResponse = await api.post(`/tournaments/${tournamentId}/join`); // Example join call
      // if (!joinResponse.data.success) {
      //   Alert.alert("Error", joinResponse.data.message || "Failed to join tournament");
      //   setLoading(false);
      //   return;
      // }

      // Fetch players for the newly joined tournament (or maybe this happens on the next screen?)
      // This part seems more related to viewing the tournament *after* joining.
      // Let's assume joining is implicit or handled by viewing.
      const response = await api.get(`/players/${tournamentId}/players`); // Fetching players might not be needed here

      // if (response.data.success) { // Check might be redundant if join logic is separate
      setSelectedTournament(tournamentId);
      setPlayerLimit(playerLimitPerTeam);
      // setFetchedPlayers(response.data.data || []); // Maybe clear or fetch later
      setFetchedPlayers([]); // Clear players, fetch on view
      setViewMode("CREATE_TEAM"); // Go to team creation/view after joining
      const tournamentInfo =
        availableTournaments.find((t) => t._id === tournamentId) ||
        joinedTournaments.find((t) => t._id === tournamentId);
      if (tournamentInfo) {
        const round = getCurrentRound(tournamentInfo);
        setCurrentRoundState(round);
      } else {
        setCurrentRoundState("NOT_STARTED"); // Default if info not found
      }
      router.push("main"); // Navigate to the main screen where team management happens
      // } else {
      //   Alert.alert("Error", response.data.message || "Failed to fetch players");
      // }
    } catch (error) {
      Alert.alert("Error", "Failed to join tournament. Please try again.");
      console.error("Error joining tournament:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTournaments();
  };

  // --- Render Item Functions (renderJoinedTournamentItem, renderAvailableTournamentItem) ---
  // Adjusted onPress for "View Tournament" in renderJoinedTournamentItem
  const renderJoinedTournamentItem = ({ item }) => {
    const currentRoundLabel = getCurrentRound(item);
    const roundsToShow = getRoundsToShow(item);
    const nextRoundInfo = getNextRoundInfo(item); // Get next round info for display

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={styles.joinedBadge}>
            <Text style={styles.joinedBadgeText}>Joined</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <View style={styles.infoRowWrap}>
            <View style={styles.infoItem}>
              {/* Display current round status */}
              <Ionicons
                name={
                  currentRoundLabel === "FINAL"
                    ? "ribbon-outline"
                    : currentRoundLabel === "SEMIFINAL"
                    ? "flag-outline"
                    : currentRoundLabel === "KNOCKOUT"
                    ? "flash-outline"
                    : "hourglass-outline"
                }
                size={16}
                color="#94a3b8"
              />
              <Text style={[styles.infoText, styles.statusText]}>
                {
                  currentRoundLabel === "KNOCKOUT"
                    ? "Knockout round active"
                    : currentRoundLabel === "SEMIFINAL"
                    ? "Semifinal round active"
                    : currentRoundLabel === "FINAL"
                    ? "Final round active"
                    : nextRoundInfo.roundLabel === "Tournament Ended"
                    ? "Tournament Ended"
                    : "Starts Soon" // Or "Not Started"
                }
              </Text>
            </View>
            {/* Display upcoming round dates */}
            {roundsToShow.length === 0 &&
              nextRoundInfo.roundLabel !== "Tournament Ended" && (
                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
                  <Text style={styles.infoText}>Awaiting round details</Text>
                </View>
              )}
            {roundsToShow.map((round) => (
              <View style={styles.infoItem} key={round.key}>
                <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
                <Text style={styles.infoText}>
                  {round.label}:{" "}
                  {round.start ? round.start.toLocaleDateString() : "TBD"}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Keep View Tournament button enabled even if ended */}
        <TouchableOpacity
          style={[styles.button, styles.viewButton]}
          onPress={() => {
            setSelectedTournament(item._id);
            setSelectedTournamentPlayers([]); // Clear players initially
            setViewMode("VIEW_TEAM");
            setPlayerLimit(item.playerLimitPerTeam);
            const round = getCurrentRound(item);
            setCurrentRoundState(round);
            router.push("main"); // Navigate to main screen to view details
          }}
        >
          <Ionicons name="eye-outline" size={18} color="white" />
          <Text style={styles.buttonText}>View Tournament</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAvailableTournamentItem = ({ item }) => {
    const { roundLabel, deadline } = getNextRoundInfo(item);
    const isEnded = roundLabel === "Tournament Ended";

    return (
      <View style={[styles.card, styles.availableCardBorder]}>
        <Text style={styles.cardTitle}>{item.name}</Text>

        <View style={styles.infoBox}>
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={18} color="#94a3b8" />
            <Text style={styles.infoText}>
              Player Limit: {item.playerLimitPerTeam || "N/A"}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="list-outline" size={18} color="#94a3b8" />
            <Text style={styles.infoText}>
              Registration Limit: {item.registrationLimits || "N/A"}
            </Text>
          </View>

          {/* Show JOIN info or ENDED info */}
          {!isEnded ? (
            <>
              <View style={styles.infoItem}>
                <Ionicons name="timer-outline" size={18} color="#2dd4bf" />{" "}
                {/* Teal color */}
                <Text style={[styles.infoText, styles.joinInfoText]}>
                  Join for {roundLabel} round
                </Text>
              </View>
              {deadline && (
                <View style={styles.infoItem}>
                  <Ionicons name="alarm-outline" size={18} color="#fbbf24" />{" "}
                  {/* Yellow color */}
                  <Text style={[styles.infoText, styles.deadlineText]}>
                    Deadline: {deadline.toLocaleDateString()}{" "}
                    {deadline.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.infoItem}>
              <Ionicons name="close-circle-outline" size={18} color="#f87171" />{" "}
              {/* Red color */}
              <Text style={[styles.infoText, styles.endedText]}>
                Tournament Ended
              </Text>
            </View>
          )}
        </View>

        {!isEnded && (
          <TouchableOpacity
            style={[styles.button, styles.joinButton]}
            onPress={() =>
              handleJoinTournament(item._id, item.playerLimitPerTeam)
            }
          >
            <Ionicons name="add-circle-outline" size={18} color="white" />
            <Text style={styles.buttonText}>Join Tournament</Text>
          </TouchableOpacity>
        )}
        {/* Optionally show a disabled/different button for ended tournaments */}
        {isEnded && (
          <View style={[styles.button, styles.disabledButton]}>
            <Ionicons name="archive-outline" size={18} color="#64748b" />
            <Text style={styles.disabledButtonText}>View Results (Soon)</Text>
          </View>
        )}
      </View>
    );
  };
  // --- End Render Item Functions ---

  // --- Empty State Component ---
  const renderEmptyState = (isJoinedList) => (
    <View style={styles.emptyStateContainer}>
      <Ionicons
        name={isJoinedList ? "trophy-outline" : "calendar-outline"}
        size={64}
        color="#475569" // slate-600
      />
      <Text style={styles.emptyStateText}>
        {isJoinedList
          ? "You haven't joined any active tournaments yet."
          : "No new tournaments available right now."}
      </Text>
      <Text style={styles.emptyStateSubText}>
        {isJoinedList
          ? "Check the 'Discover' tab or pull down to refresh."
          : "Check back later or pull down to refresh."}
      </Text>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={onRefresh} // Use onRefresh directly
      >
        <Ionicons name="refresh" size={18} color="#a5b4fc" /> {/* indigo-300 */}
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
  // --- End Empty State ---

  // --- Components for each page (previously FirstRoute, SecondRoute) ---
  const JoinedTournamentsPage = () => {
    const [showEnded, setShowEnded] = useState(false);

    const activeTournaments = joinedTournaments.filter(
      (item) => getNextRoundInfo(item).roundLabel !== "Tournament Ended"
    );

    const endedTournaments = joinedTournaments.filter(
      (item) => getNextRoundInfo(item).roundLabel === "Tournament Ended"
    );

    const tournamentsToDisplay = showEnded
      ? endedTournaments
      : activeTournaments;
    const hasEndedToShow = endedTournaments.length > 0;
    const hasActiveToShow = activeTournaments.length > 0;

    const renderListFooter = () =>
      // Only show toggle if there are ended tournaments OR if currently showing ended tournaments
      (hasEndedToShow || showEnded) && (
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.toggleEndedButton}
            onPress={() => setShowEnded((prev) => !prev)}
          >
            <Ionicons name="time-outline" size={18} color="#fbbf24" />
            <Text style={styles.toggleEndedButtonText}>
              {showEnded ? "Hide" : "View"} Past Tournaments (
              {endedTournaments.length})
            </Text>
          </TouchableOpacity>
        </View>
      );

    return (
      <FlatList
        data={tournamentsToDisplay}
        keyExtractor={(item) => item._id}
        renderItem={renderJoinedTournamentItem}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={() => renderEmptyState(true)} // Pass true for joined list
        ListFooterComponent={renderListFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#a78bfa"]} // indigo-400
            tintColor="#a78bfa"
          />
        }
      />
    );
  };

  const AvailableTournamentsPage = () => {
    const [showEnded, setShowEnded] = useState(false);

    // Available = not joined AND not ended
    const available = availableTournaments.filter(
      (tournament) =>
        !joinedTournaments.some((joined) => joined._id === tournament._id) &&
        getNextRoundInfo(tournament).roundLabel !== "Tournament Ended"
    );

    // Ended = not joined AND ended
    const ended = availableTournaments.filter(
      (tournament) =>
        !joinedTournaments.some((joined) => joined._id === tournament._id) &&
        getNextRoundInfo(tournament).roundLabel === "Tournament Ended"
    );

    const tournamentsToDisplay = showEnded ? ended : available;
    const hasEndedToShow = ended.length > 0;

    const renderListFooter = () =>
      (hasEndedToShow || showEnded) && (
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.toggleEndedButton}
            onPress={() => setShowEnded((prev) => !prev)}
          >
            <Ionicons name="time-outline" size={18} color="#fbbf24" />
            <Text style={styles.toggleEndedButtonText}>
              {showEnded ? "Hide" : "View"} Past Tournaments ({ended.length})
            </Text>
          </TouchableOpacity>
        </View>
      );

    return (
      <FlatList
        data={tournamentsToDisplay}
        keyExtractor={(item) => item._id}
        renderItem={renderAvailableTournamentItem}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={() => renderEmptyState(false)} // Pass false for available list
        ListFooterComponent={renderListFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#a78bfa"]}
            tintColor="#a78bfa"
          />
        }
      />
    );
  };
  // --- End Page Components ---

  // --- Custom Tab Bar ---
  const CustomTabBar = () => {
    const tabs = ["My Tournaments", "Discover"];
    return (
      <View style={styles.tabBarContainer}>
        {tabs.map((tab, i) => {
          const isActive = i === activeIndex;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, isActive ? styles.activeTabItem : {}]}
              onPress={() => handleTabPress(i)}
            >
              <Text
                style={[styles.tabText, isActive ? styles.activeTabText : {}]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };
  // --- End Custom Tab Bar ---

  // --- Event Handlers for Swipe and Tab Press ---
  const handleScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / windowWidth);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const handleTabPress = (index) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * windowWidth,
        animated: true,
      });
    }
    // setActiveIndex(index); // Scroll handler will set the index
  };
  // --- End Event Handlers ---

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["rgba(79, 70, 229, 0.15)", "transparent"]} // slate-900 background ensures visibility
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Tournaments</Text>
        <Text style={styles.headerSubtitle}>
          Manage your teams and join new competitions
        </Text>
      </View>

      {/* Custom Tab Bar */}
      <CustomTabBar />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#a78bfa" />
          <Text style={styles.loadingText}>Loading tournaments...</Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll} // Use momentum end for better index detection
          scrollEventThrottle={16} // Adjust if needed
          style={styles.scrollView} // Ensure ScrollView takes remaining space
        >
          {/* Page 1: Joined Tournaments */}
          <View style={styles.pageStyle}>
            <JoinedTournamentsPage />
          </View>

          {/* Page 2: Available Tournaments */}
          <View style={styles.pageStyle}>
            <AvailableTournamentsPage />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0f172a", // slate-900
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 256, // h-64
  },
  headerContainer: {
    paddingHorizontal: 20, // px-5
    paddingTop: 16, // pt-4
    paddingBottom: 8, // pb-2
  },
  headerTitle: {
    fontSize: 30, // text-3xl
    fontWeight: "bold",
    color: "white",
    marginBottom: 4, // mb-1
  },
  headerSubtitle: {
    color: "#94a3b8", // slate-400
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12, // mt-3
    color: "#94a3b8", // slate-400
  },
  // Tab Bar Styles
  tabBarContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#334155", // slate-700
    borderRadius: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 2, // Added slight margin between tabs
  },
  activeTabItem: {
    backgroundColor: "#1e293b", // slate-800 (darker than container)
  },
  tabText: {
    fontWeight: "600",
    color: "#94a3b8", // slate-400 (inactive text)
  },
  activeTabText: {
    color: "#a78bfa", // indigo-400 (active text)
  },
  // ScrollView and Page Styles
  scrollView: {
    flex: 1, // Take remaining height
  },
  pageStyle: {
    width: windowWidth, // Each page takes full screen width
    flex: 1, // Allow content within page to expand
  },
  // List Styles
  listContentContainer: {
    paddingBottom: 24, // pb-6
    paddingTop: 8, // pt-2
  },
  // Card Styles (Shared)
  card: {
    backgroundColor: "#1e293b", // slate-800
    borderRadius: 12, // rounded-xl
    padding: 20, // p-5
    marginBottom: 16, // mb-4
    marginHorizontal: 16, // mx-4
    borderWidth: 1,
    borderColor: "#334155", // slate-700
    shadowColor: "#000", // Basic shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // for Android
  },
  availableCardBorder: {
    borderLeftWidth: 4,
    borderLeftColor: "#a855f7", // purple-500
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // Align items top
    marginBottom: 16, // Add space below header
  },
  cardTitle: {
    fontSize: 20, // text-xl
    fontWeight: "bold",
    color: "white",
    flex: 1, // Allow text to wrap if long
    marginRight: 8, // Space before badge
  },
  joinedBadge: {
    backgroundColor: "#065f46", // emerald-900
    paddingHorizontal: 12, // px-3
    paddingVertical: 4, // py-1
    borderRadius: 999, // rounded-full
    alignSelf: "flex-start", // Align to top
  },
  joinedBadgeText: {
    color: "#34d399", // emerald-400
    fontWeight: "600", // font-semibold
    fontSize: 12, // text-xs
  },
  // Info Box Styles
  infoBox: {
    backgroundColor: "rgba(51, 65, 85, 0.5)", // slate-700 with opacity
    borderRadius: 8, // rounded-lg
    padding: 12, // p-3
    marginTop: 16, // mt-4
  },
  infoRowWrap: {
    // New style for wrapping rows if needed
    flexDirection: "row",
    flexWrap: "wrap", // Allow items to wrap to next line
    alignItems: "center", // Align items vertically in a row
  },
  infoItem: {
    // Style for each icon + text pair
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16, // mr-4
    marginBottom: 8, // mb-2 (for wrapping)
  },
  infoText: {
    color: "#cbd5e1", // slate-300
    marginLeft: 8, // ml-2
    fontSize: 14, // text-sm (consistency)
    fontWeight: "500", // font-medium (consistency)
  },
  statusText: {
    // Optional: Add specific color based on status
    // Example: color: '#fbbf24' // yellow-400 for 'Starts Soon'
  },
  joinInfoText: {
    color: "#2dd4bf", // teal-400
  },
  deadlineText: {
    color: "#fbbf24", // yellow-400
  },
  endedText: {
    color: "#f87171", // red-400
  },
  // Button Styles
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12, // py-3
    paddingHorizontal: 16, // px-4
    marginTop: 16, // mt-4
    borderRadius: 12, // rounded-xl
    // Common gradient replaced by solid colors for simplicity here
    // Add activeOpacity for press effect if needed: activeOpacity={0.9}
  },
  viewButton: {
    backgroundColor: "#7c3aed", // Equivalent to violet-600 (adjust as needed)
    // For gradient, wrap with LinearGradient or use react-native-linear-gradient
  },
  joinButton: {
    backgroundColor: "#059669", // Equivalent to emerald-600
  },
  buttonText: {
    color: "white",
    fontWeight: "500", // font-medium
    marginLeft: 8, // ml-2
    fontSize: 16, // Slightly larger text
  },
  disabledButton: {
    // Style for ended tournament action placeholder
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#334155", // slate-700 (muted background)
  },
  disabledButtonText: {
    color: "#64748b", // slate-500 (muted text)
    fontWeight: "500",
    marginLeft: 8,
    fontSize: 16,
  },
  // Empty State Styles
  emptyStateContainer: {
    flex: 1, // Take available space in FlatList
    justifyContent: "center",
    alignItems: "center",
    padding: 40, // py-10 equivalent vertical padding + horizontal
    minHeight: 300, // Ensure it takes some minimum space
  },
  emptyStateText: {
    color: "#94a3b8", // slate-400
    fontSize: 18, // text-lg
    marginTop: 16, // mt-4
    textAlign: "center",
    paddingHorizontal: 24, // px-6
  },
  emptyStateSubText: {
    color: "#64748b", // slate-500
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  refreshButton: {
    marginTop: 24, // mt-6
    paddingHorizontal: 24, // px-6
    paddingVertical: 12, // py-3
    backgroundColor: "#334155", // slate-700
    borderRadius: 999, // rounded-full
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#a5b4fc", // indigo-300
    fontWeight: "500", // font-medium
    marginLeft: 8, // ml-2
  },
  // Footer (Toggle Past Tournaments) Styles
  footerContainer: {
    paddingVertical: 16, // py-4
    alignItems: "center",
  },
  toggleEndedButton: {
    backgroundColor: "#334155", // slate-700
    borderRadius: 999, // rounded-full
    paddingHorizontal: 24, // px-6
    paddingVertical: 12, // py-3
    flexDirection: "row",
    alignItems: "center",
  },
  toggleEndedButtonText: {
    color: "#fbbf24", // yellow-400
    fontWeight: "600", // font-semibold
    marginLeft: 8, // ml-2
  },
});

export default TournamentSelect;
