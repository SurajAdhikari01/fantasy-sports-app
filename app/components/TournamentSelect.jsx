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
import api from "../config/axios";
import { useRecoilState } from "recoil";
import {
  fetchedPlayersState,
  selectedTournamentState,
  playerLimitState,
  teamIdState,
  currentRoundState,
  viewModeState,
} from "./atoms";
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
  const [selectedTournamentPlayers, setSelectedTournamentPlayers] = useState([]);
  const [viewMode, setViewMode] = useRecoilState(viewModeState);
  const [currentRound, setCurrentRoundState] = useRecoilState(currentRoundState);

  // --- State for manual tab/swipe implementation ---
  const [activeIndex, setActiveIndex] = useState(0); // 0 for Joined, 1 for Available
  const scrollViewRef = useRef(null);
  // --- End State ---

  useEffect(() => {
    fetchTournaments();
  }, []);

  // Helper functions 
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
          return { roundLabel: "Final", deadline: final };
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
    return { roundLabel: "Check Details", deadline: null };
  };

  const fetchTournaments = async () => {
    setLoading(true);
    let finalJoined = [];
    let finalAvailable = [];

    try {
      try {
        const joinedResponse = await api.get("tournaments/getTournamentsByUserId");
        if (joinedResponse.data.success) {
          finalJoined = joinedResponse.data.data || [];
        } else {
          Alert.alert(
            "Error fetching joined",
            joinedResponse.data.message || "Failed to process joined tournaments"
          );
        }
      } catch (error) {
        // Check if it's an HTTP error with a 404 status
        if (error.response && error.response.status === 404) {
          console.warn("Fetching joined tournaments resulted in 404 (Not Found). Setting joined list to empty.");
          finalJoined = [];
        } else {
          Alert.alert("Error fetching joined", "An error occurred. Please try again.");
          console.error("Error fetching joined tournaments:", error);
        }
      }

      // Fetch Available Tournaments
      try {
        const availableResponse = await api.get("/tournaments/getAllTournaments");
        if (availableResponse.data.success) {
          finalAvailable = availableResponse.data.data || [];
        } else {
          // Handle non-success API response
          Alert.alert(
            "Error fetching available",
            availableResponse.data.message || "Failed to process available tournaments"
          );
        }
      } catch (error) {
        //teams na vaye 404 falxa
        if (error.response && error.response.status === 404) {
          // console.warn("Fetching available tournaments resulted in 404 (Not Found). Setting available list to empty.");
          finalAvailable = []; // Set to empty array
        } else {
          Alert.alert("Error fetching available", "An error occurred. Please try again.");
          console.error("Error fetching available tournaments:", error);
        }
      }

      setJoinedTournaments(finalJoined);
      setAvailableTournaments(finalAvailable);

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
    }
    if (ko && now >= ko) {
      // If semifinal exists and we haven't reached it yet, we are in KNOCKOUT
      if (!semi || now < semi) {
        return "KNOCKOUT";
      }
    }
    // If none of the start dates have been reached
    return "NOT_STARTED";
  };

  const handleJoinTournament = async (tournamentId, playerLimitPerTeam) => {
    try {
      setLoading(true);

      setSelectedTournament(tournamentId);
      setPlayerLimit(playerLimitPerTeam);
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
    setActiveIndex(0);
  };

  // --- Render Item Functions ---
  const renderJoinedTournamentItem = ({ item }) => {
    const currentRoundLabel = getCurrentRound(item);
    const roundsToShow = getRoundsToShow(item);
    const nextRoundInfo = getNextRoundInfo(item);

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
                {currentRoundLabel === "KNOCKOUT"
                  ? "Knockout round active"
                  : currentRoundLabel === "SEMIFINAL"
                    ? "Semifinal round active"
                    : currentRoundLabel === "FINAL"
                      ? "Final round active"
                      : nextRoundInfo.roundLabel === "Tournament Ended"
                        ? "Tournament Ended"
                        : "Starts Soon"}
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
                <Ionicons name="timer-outline" size={18} color="#2dd4bf" />
                <Text style={[styles.infoText, styles.joinInfoText]}>
                  Join for {roundLabel} round
                </Text>
              </View>
              {deadline && (
                <View style={styles.infoItem}>
                  <Ionicons name="alarm-outline" size={18} color="#fbbf24" />
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
              <Ionicons name="close-circle-outline" size={18} color="#f87171" />
              <Text style={[styles.infoText, styles.endedText]}>
                Tournament Ended
              </Text>
            </View>
          )}
        </View>

        {!isEnded ? (
          <TouchableOpacity
            style={[styles.button, styles.joinButton]}
            onPress={() =>
              handleJoinTournament(item._id, item.playerLimitPerTeam)
            }
          >
            <Ionicons name="add-circle-outline" size={18} color="white" />
            <Text style={styles.buttonText}>Join Tournament</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.button, styles.disabledButton]}>
            <Ionicons name="archive-outline" size={18} color="#64748b" />
            <Text style={styles.disabledButtonText}>View Results (Soon)</Text>
          </View>
        )}
      </View>
    );
  };

  // --- Empty State Component ---
  const renderEmptyState = (isJoinedList) => (
    <View style={styles.emptyStateContainer}>
      <Ionicons
        name={isJoinedList ? "trophy-outline" : "calendar-outline"}
        size={64}
        color="#475569"
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
        onPress={onRefresh}
      >
        {/* <Ionicons name="refresh" size={18} color="#a5b4fc" /> */}
        <Text style={styles.refreshButtonText}>Join Now</Text>
      </TouchableOpacity>
    </View>
  );

  // --- Components for each page ---
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

    const renderListFooter = () =>
      (hasEndedToShow || showEnded) && (
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.toggleEndedButton}
            onPress={() => setShowEnded((prev) => !prev)}
          >
            <Ionicons name="time-outline" size={18} color="#fbbf24" />
            <Text style={styles.toggleEndedButtonText}>
              {showEnded ? "Hide" : "View"} Past Tournaments ({endedTournaments.length})
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
        ListEmptyComponent={() => renderEmptyState(true)}
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
        ListEmptyComponent={() => renderEmptyState(false)}
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

  // --- Custom Tab Bar ---
  const CustomTabBar = () => {
    const tabs = ["Discover", "My Tournaments"];
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
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["rgba(79, 70, 229, 0.15)", "transparent"]}
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
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          <View style={styles.pageStyle}>
            <AvailableTournamentsPage />
          </View>

          <View style={styles.pageStyle}>
            <JoinedTournamentsPage />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// Enhanced styles with more Tailwind-like aesthetics
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
    height: 256,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#94a3b8", // slate-400
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#94a3b8",
  },
  // Tab Bar Styles
  tabBarContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#334155", // slate-700
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTabItem: {
    backgroundColor: "#1e293b", // slate-800
  },
  tabText: {
    fontWeight: "600",
    color: "#94a3b8", // slate-400
  },
  activeTabText: {
    color: "#a78bfa", // indigo-400
  },
  // ScrollView and Page Styles
  scrollView: {
    flex: 1,
  },
  pageStyle: {
    width: windowWidth,
    flex: 1,
  },
  // List Styles
  listContentContainer: {
    paddingBottom: 24,
    paddingTop: 8,
    flexGrow: 1, // Important for empty state to center properly
  },
  // Card Styles (Shared)
  card: {
    backgroundColor: "#1e293b", // slate-800
    borderRadius: 16, // Slightly larger rounded corners
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#334155", // slate-700
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4, // Enhanced shadow for better depth
  },
  availableCardBorder: {
    borderLeftWidth: 4,
    borderLeftColor: "#a855f7", // purple-500
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    marginRight: 8,
  },
  joinedBadge: {
    backgroundColor: "#065f46", // emerald-900
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  joinedBadgeText: {
    color: "#34d399", // emerald-400
    fontWeight: "600",
    fontSize: 12,
  },
  // Info Box Styles
  infoBox: {
    backgroundColor: "rgba(51, 65, 85, 0.5)", // slate-700 with opacity
    borderRadius: 12, // Increased roundedness
    padding: 14, // Slightly more padding
    marginTop: 16,
  },
  infoRowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 10, // Slightly more spacing
  },
  infoText: {
    color: "#cbd5e1", // slate-300
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  statusText: {
    fontWeight: "600",
  },
  joinInfoText: {
    color: "#2dd4bf", // teal-400
    fontWeight: "600",
  },
  deadlineText: {
    color: "#fbbf24", // yellow-400
    fontWeight: "500",
  },
  endedText: {
    color: "#f87171", // red-400
    fontWeight: "500",
  },
  // Button Styles
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  viewButton: {
    backgroundColor: "#7c3aed", // violet-600
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  joinButton: {
    backgroundColor: "#059669", // emerald-600
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontWeight: "600", // Increased weight for better readability
    marginLeft: 8,
    fontSize: 16,
  },
  disabledButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#334155", // slate-700
  },
  disabledButtonText: {
    color: "#64748b", // slate-500
    fontWeight: "500",
    marginLeft: 8,
    fontSize: 16,
  },
  // Empty State Styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    minHeight: 300,
  },
  emptyStateText: {
    color: "#94a3b8", // slate-400
    fontSize: 18,
    marginTop: 16,
    textAlign: "center",
    paddingHorizontal: 24,
    fontWeight: "500",
  },
  emptyStateSubText: {
    color: "#64748b", // slate-500
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  refreshButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#334155", // slate-700
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#a5b4fc", // indigo-300
    fontWeight: "500",
    marginLeft: 8,
  },
  // Footer (Toggle Past Tournaments) Styles
  footerContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  toggleEndedButton: {
    backgroundColor: "#334155", // slate-700
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleEndedButtonText: {
    color: "#fbbf24", // yellow-400
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default TournamentSelect;