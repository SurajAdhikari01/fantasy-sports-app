import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  // StyleSheet removed
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "../config/axios";
import { useLocalSearchParams } from "expo-router";

// NativeWind classes replace StyleSheet
// Ensure you have NativeWind setup in your project (tailwind.config.js, babel plugin, etc.)

const MatchResultsScreen = ({ onClose, selectedTournament }) => {
  const navigation = useNavigation(); // REMOVE if ONLY used for goBack
  const route = useRoute();
  const params = useLocalSearchParams(); // Get route params
  const tournamentId = params?.tournamentId ?? selectedTournament?._id;
  const tournamentName = params?.tournamentName ?? selectedTournament?.name;

  // --- State Variables (Unchanged) ---
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [expandedMatches, setExpandedMatches] = useState({});

  if (!tournamentId && !tournamentName) {
    console.log("Tournament ID is missing.");
  }

  // --- Helpers & Callbacks (Logic Unchanged) ---

  // --- Helpers & Callbacks (Logic Unchanged, only JSX/Styles might change later) ---
  const getPlayerTeamSide = useCallback((playerId, match) => {
    const team1PlayerIds = Array.isArray(match?.team1?.players)
      ? match.team1.players
      : Array.isArray(match?.playersPlayedTeam1)
      ? match.playersPlayedTeam1
      : [];
    const team2PlayerIds = Array.isArray(match?.team2?.players)
      ? match.team2.players
      : Array.isArray(match?.playersPlayedTeam2)
      ? match.playersPlayedTeam2
      : [];

    if (team1PlayerIds.includes(playerId)) return "left";
    if (team2PlayerIds.includes(playerId)) return "right";
    return null;
  }, []);

  const getPlayerNameById = useCallback(
    (playerId) => {
      if (!playerId) return "Unknown Player";
      return players[playerId]?.name || `Player (${playerId.slice(-4)})`;
    },
    [players]
  );

  const toggleMatchExpansion = useCallback((matchId) => {
    setExpandedMatches((prev) => ({
      ...prev,
      [matchId]: !prev[matchId],
    }));
  }, []);

  // --- Data Fetching (Unchanged) ---
  const fetchPlayers = useCallback(async (tId) => {
    // Use tId parameter name to avoid conflict
    if (!tId) {
      setPlayers({});
      setIsLoadingPlayers(false);
      return;
    }
    setIsLoadingPlayers(true);
    try {
      // Use tId in the API call
      const response = await axios.get(`/players/${tId}/players`);
      if (response.status === 200 && response.data?.data) {
        const playersMap = response.data.data.reduce((acc, player) => {
          if (player._id) acc[player._id] = player;
          return acc;
        }, {});
        setPlayers(playersMap);
      } else {
        console.warn(
          "Failed to fetch players or no players found for tournament:",
          tId
        );
        setPlayers({});
      }
    } catch (err) {
      console.error("Error fetching players:", err);
      setPlayers({});
    } finally {
      setIsLoadingPlayers(false);
    }
  }, []);

  const fetchMatches = useCallback(async (tId, isRefreshing = false) => {
    // Use tId parameter name
    if (!tId) {
      setMatches([]);
      if (!isRefreshing) setIsLoadingMatches(false);
      setRefreshing(false);
      return;
    }
    if (!isRefreshing) setIsLoadingMatches(true);
    setError(null);
    setInfoMessage(null);
    setMatches([]); // Clear previous matches

    try {
      const response = await axios.get(`/tournaments/${tId}/matches`);
      if (response.status === 200 && response.data?.data?.matches) {
        const sortedMatches = (response.data.data.matches || []).sort(
          (a, b) => {
            const numA = parseInt(a.matchNumber, 10);
            const numB = parseInt(b.matchNumber, 10);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            if (!isNaN(numA)) return -1;
            if (!isNaN(numB)) return 1;
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          }
        );
        setMatches(sortedMatches);
        setExpandedMatches({});
        if (sortedMatches.length === 0) {
          setInfoMessage("No match results found for this tournament yet.");
        }
      } else {
        if (response.status === 404) {
          setInfoMessage(response.data?.message || "No match results found.");
        } else {
          setError(response.data?.message || "Failed to fetch matches.");
        }
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
      const message =
        err.response?.data?.message ||
        (err.response?.status
          ? `Status ${err.response.status}`
          : "Network Error");
      if (err.response?.status === 404) {
        setInfoMessage(message || "No match results found.");
      } else {
        setError(`Error fetching matches: ${message}`);
      }
    } finally {
      if (!isRefreshing) setIsLoadingMatches(false);
      setRefreshing(false);
    }
  }, []);

  // --- Effects (Unchanged) ---
  useEffect(() => {
    if (tournamentId) {
      setIsLoadingMatches(true);
      setIsLoadingPlayers(true);
      fetchPlayers(tournamentId);
      fetchMatches(tournamentId);
    } else {
      setError("Tournament information is missing.");
      setIsLoadingMatches(false);
      setIsLoadingPlayers(false);
    }
  }, [tournamentId, fetchMatches, fetchPlayers]);

  // --- Event Handlers (Unchanged) ---
  const onRefresh = useCallback(async () => {
    if (!tournamentId) return;
    setRefreshing(true);
    setError(null);
    setInfoMessage(null);
    await fetchPlayers(tournamentId);
    await fetchMatches(tournamentId, true);
  }, [tournamentId, fetchMatches, fetchPlayers]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
    onClose?.();
  };

  // --- Render Event Item Component (Converted to NativeWind) ---
  const EventItem = React.memo(({ type, player, side, extra = null }) => {
    let iconName, iconColorClass, label; // Use color class now

    // Map type to icon and Tailwind color class
    switch (type) {
      case "goal":
        iconName = "football";
        iconColorClass = "text-green-300"; // ~ #A7F3D0
        label = `Goal by ${player}${extra ? ` ${extra}` : ""}`;
        break;
      case "ownGoal":
        iconName = "football";
        iconColorClass = "text-red-400"; // ~ #FCA5A5
        label = `Own Goal by ${player}`;
        break;
      case "yellowCard":
        iconName = "square";
        iconColorClass = "text-yellow-400"; // ~ #FBBF24
        label = `Yellow Card for ${player}`;
        break;
      case "redCard":
        iconName = "square";
        iconColorClass = "text-red-500"; // ~ #F87171
        label = `Red Card for ${player}`;
        break;
      case "penaltyMissed":
        iconName = "close-circle";
        iconColorClass = "text-red-400"; // ~ #FCA5A5
        label = `Penalty Missed by ${player}`;
        break;
      case "penaltySave":
        iconName = "hand-left";
        iconColorClass = "text-green-300"; // ~ #A7F3D0
        label = `Penalty Save by ${player}`;
        break;
      default:
        iconName = "alert-circle";
        iconColorClass = "text-slate-400"; // ~ #CBD5E1
        label = player;
    }

    // Note: Ionicons color prop still takes a hex/rgb value.
    // We map the class to a hex value here. Consider abstracting this mapping.
    const colorMap = {
      "text-green-300": "#A7F3D0",
      "text-red-400": "#FCA5A5",
      "text-yellow-400": "#FBBF24",
      "text-red-500": "#F87171",
      "text-slate-400": "#CBD5E1",
    };
    const iconColorValue = colorMap[iconColorClass] || "#CBD5E1";

    return (
      // eventItemContainer
      <View className="flex-row items-center justify-between py-2 border-b border-b-neutral-700">
        {/* Left side content - eventItemSide */}
        <View className="flex-1 flex-row items-center px-1">
          {side === "left" && (
            <>
              {/* eventIconLeft */}
              <Ionicons
                name={iconName}
                size={14}
                color={iconColorValue}
                style={{ marginRight: 6 }}
              />
              {/* eventText */}
              <Text
                className="text-neutral-200 text-xs flex-shrink"
                numberOfLines={2}
              >
                {label}
              </Text>
            </>
          )}
        </View>

        {/* Event type indicator in center - eventTimelineDotContainer */}
        <View className="w-8 h-8 items-center justify-center mx-1">
          {/* eventTimelineDot */}
          <View className="w-2 h-2 rounded-full bg-neutral-400" />
        </View>

        {/* Right side content - eventItemSide, eventItemSideRight */}
        <View className="flex-1 flex-row items-center px-1 justify-end">
          {side === "right" && (
            <>
              {/* eventText, eventTextRight */}
              <Text
                className="text-neutral-200 text-xs flex-shrink text-right"
                numberOfLines={2}
              >
                {label}
              </Text>
              {/* eventIconRight */}
              <Ionicons
                name={iconName}
                size={14}
                color={iconColorValue}
                style={{ marginLeft: 6 }}
              />
            </>
          )}
        </View>
      </View>
    );
  });

  // --- Get Events for a Match (Unchanged) ---
  const getMatchEvents = useCallback(
    (match) => {
      if (!match) return [];
      const events = [];
      (match.goalsScoredBy || []).forEach((goal, index) => {
        const side = getPlayerTeamSide(goal.player, match);
        if (side) {
          const playerName = getPlayerNameById(goal.player);
          const assistsText = goal.assists?.length
            ? `(Assist: ${goal.assists.map(getPlayerNameById).join(", ")})`
            : null;
          events.push({
            id: `goal-${match._id}-${index}`,
            type: "goal",
            player: playerName,
            side: side,
            extra: assistsText,
          });
        }
      });
      (match.ownGoals || []).forEach((ogPlayerId, index) => {
        const playerSide = getPlayerTeamSide(ogPlayerId, match);
        const scoringSide =
          playerSide === "left"
            ? "right"
            : playerSide === "right"
            ? "left"
            : null;
        if (scoringSide) {
          const playerName = getPlayerNameById(ogPlayerId);
          events.push({
            id: `og-${match._id}-${index}`,
            type: "ownGoal",
            player: playerName,
            side: scoringSide,
          });
        }
      });
      (match.cardsObtained?.yellow || []).forEach((playerId, index) => {
        const side = getPlayerTeamSide(playerId, match);
        if (side) {
          const playerName = getPlayerNameById(playerId);
          events.push({
            id: `yellow-${match._id}-${index}`,
            type: "yellowCard",
            player: playerName,
            side: side,
          });
        }
      });
      (match.cardsObtained?.red || []).forEach((playerId, index) => {
        const side = getPlayerTeamSide(playerId, match);
        if (side) {
          const playerName = getPlayerNameById(playerId);
          events.push({
            id: `red-${match._id}-${index}`,
            type: "redCard",
            player: playerName,
            side: side,
          });
        }
      });
      (match.penaltiesMissed || []).forEach((playerId, index) => {
        const side = getPlayerTeamSide(playerId, match);
        if (side) {
          const playerName = getPlayerNameById(playerId);
          events.push({
            id: `penalty-missed-${match._id}-${index}`,
            type: "penaltyMissed",
            player: playerName,
            side: side,
          });
        }
      });
      (match.penaltySaves || []).forEach((playerId, index) => {
        const side = getPlayerTeamSide(playerId, match);
        if (side) {
          const playerName = getPlayerNameById(playerId);
          events.push({
            id: `penalty-save-${match._id}-${index}`,
            type: "penaltySave",
            player: playerName,
            side: side,
          });
        }
      });
      return events;
    },
    [getPlayerTeamSide, getPlayerNameById]
  );

  // --- Render Match Item (Converted to NativeWind) ---
  const renderMatchItem = useCallback(
    (match) => {
      if (!match || !match._id) return null;

      const isExpanded = expandedMatches[match._id] || false;
      const events = getMatchEvents(match);

      const goalCount = events.filter(
        (e) => e.type === "goal" || e.type === "ownGoal"
      ).length;
      const yellowCardCount = events.filter(
        (e) => e.type === "yellowCard"
      ).length;
      const redCardCount = events.filter((e) => e.type === "redCard").length;
      const penaltyCount = events.filter(
        (e) => e.type === "penaltyMissed" || e.type === "penaltySave"
      ).length;
      const hasEvents =
        goalCount > 0 ||
        yellowCardCount > 0 ||
        redCardCount > 0 ||
        penaltyCount > 0;

      const matchDate = match.createdAt
        ? new Date(match.createdAt).toLocaleString()
        : "Date unknown";

      // Mapping for summary icons - needs hex values
      const summaryIconColors = {
        goal: "#A7F3D0",
        yellow: "#FBBF24",
        red: "#F87171",
        penalty: "#FCA5A5", // Using missed color
      };

      return (
        // matchItemContainer
        <View
          key={match._id}
          className="bg-neutral-700 rounded-xl p-4 mb-4 shadow-md border border-neutral-600"
        >
          {/* Match Header - matchHeaderText */}
          <Text className="text-center text-neutral-400 text-sm mb-1 uppercase font-medium">
            {match.matchName || `Match ${match.matchNumber || "N/A"}`}
          </Text>
          {/* matchDateText */}
          <Text className="text-neutral-500 text-center text-xs mb-2">
            {matchDate}
          </Text>

          {/* Score & Teams Row - scoreRow */}
          <View className="flex-row justify-between items-center mb-3">
            {/* teamNameLeft */}
            <Text
              className="text-neutral-200 text-[15px] font-semibold w-[40%] text-left"
              numberOfLines={2}
            >
              {match.team1?.name || "Team 1"}
            </Text>
            {/* scoreText */}
            <Text className="text-white text-xl font-bold w-[20%] text-center">
              {match.score || "vs"}
            </Text>
            {/* teamNameRight */}
            <Text
              className="text-neutral-200 text-[15px] font-semibold w-[40%] text-right"
              numberOfLines={2}
            >
              {match.team2?.name || "Team 2"}
            </Text>
          </View>

          {/* Match Summary - summaryRow */}
          <View className="flex-row justify-center items-center mt-1 mb-3 flex-wrap">
            {hasEvents ? (
              <>
                {goalCount > 0 && (
                  // summaryItem
                  <View className="flex-row items-center mx-2 mb-1">
                    <Ionicons
                      name="football"
                      size={14}
                      color={summaryIconColors.goal}
                    />
                    {/* summaryText */}
                    <Text className="text-neutral-300 text-xs ml-1">
                      {goalCount}
                    </Text>
                  </View>
                )}
                {yellowCardCount > 0 && (
                  <View className="flex-row items-center mx-2 mb-1">
                    <Ionicons
                      name="square"
                      size={14}
                      color={summaryIconColors.yellow}
                    />
                    <Text className="text-neutral-300 text-xs ml-1">
                      {yellowCardCount}
                    </Text>
                  </View>
                )}
                {redCardCount > 0 && (
                  <View className="flex-row items-center mx-2 mb-1">
                    <Ionicons
                      name="square"
                      size={14}
                      color={summaryIconColors.red}
                    />
                    <Text className="text-neutral-300 text-xs ml-1">
                      {redCardCount}
                    </Text>
                  </View>
                )}
                {penaltyCount > 0 && (
                  <View className="flex-row items-center mx-2 mb-1">
                    <Ionicons
                      name="close-circle"
                      size={14}
                      color={summaryIconColors.penalty}
                    />
                    <Text className="text-neutral-300 text-xs ml-1">
                      {penaltyCount}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              // noEventsSummaryText
              <Text className="text-neutral-500 text-xs">
                No events recorded
              </Text>
            )}
          </View>

          {/* Toggle Button - toggleButton */}
          <TouchableOpacity
            onPress={() => toggleMatchExpansion(match._id)}
            className="bg-neutral-600 rounded-lg py-2 px-3 items-center flex-row justify-center active:opacity-70"
            // activeOpacity={0.7} // Use active:opacity-70 with NativeWind
          >
            {/* toggleButtonText */}
            <Text className="text-white text-sm mr-2 font-medium">
              {isExpanded ? "Hide Details" : "View Details"}
            </Text>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color="#ccc"
            />
          </TouchableOpacity>

          {/* Expanded Details */}
          {isExpanded && (
            // detailsContainer
            <View className="mt-3 pt-3 border-t border-t-neutral-600">
              {/* Players section - playersSection */}
              <View className="mb-4">
                {/* detailsTitle */}
                <Text className="text-neutral-400 text-xs font-semibold mb-2 uppercase">
                  TEAMS:
                </Text>
                {/* teamsRow */}
                <View className="flex-row">
                  {/* Team 1 Players - teamColumn */}
                  <View className="flex-1 pr-2">
                    {/* teamColumnHeader */}
                    <Text className="text-neutral-300 text-[13px] font-medium mb-1">
                      {match.team1?.name || "Team 1"}:
                    </Text>
                    {(match.playersPlayedTeam1 || []).length > 0 ? (
                      match.playersPlayedTeam1.map((playerId, idx) => (
                        // playerName
                        <Text
                          key={`t1-${idx}`}
                          className="text-neutral-200 text-xs mb-0.5"
                          numberOfLines={1}
                        >
                          • {getPlayerNameById(playerId)}
                        </Text>
                      ))
                    ) : (
                      // noPlayersText
                      <Text className="text-neutral-500 text-xs italic">
                        No players listed
                      </Text>
                    )}
                  </View>
                  {/* Team 2 Players - teamColumn, teamColumnRight */}
                  <View className="flex-1 pl-2">
                    {/* teamColumnHeader, teamColumnHeaderRight */}
                    <Text className="text-neutral-300 text-[13px] font-medium mb-1 text-right">
                      {match.team2?.name || "Team 2"}:
                    </Text>
                    {(match.playersPlayedTeam2 || []).length > 0 ? (
                      match.playersPlayedTeam2.map((playerId, idx) => (
                        // playerName, playerNameRight
                        <Text
                          key={`t2-${idx}`}
                          className="text-neutral-200 text-xs mb-0.5 text-right"
                          numberOfLines={1}
                        >
                          {getPlayerNameById(playerId)} •
                        </Text>
                      ))
                    ) : (
                      // noPlayersText, playerNameRight
                      <Text className="text-neutral-500 text-xs italic text-right">
                        No players listed
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Timeline section - timelineContainer */}
              <View>
                {/* detailsTitle */}
                <Text className="text-neutral-400 text-xs font-semibold mb-2 uppercase">
                  MATCH EVENTS:
                </Text>
                {events.length > 0 ? (
                  // timeline
                  <View className="relative">
                    {/* Center line - timelineCenterLine */}
                    {/* Use absolute positioning with Tailwind */}
                    <View className="absolute top-0 bottom-0 left-1/2 w-px bg-neutral-600 -ml-px" />
                    {/* Event items */}
                    {events.map((event) => (
                      <EventItem
                        key={event.id}
                        type={event.type}
                        player={event.player}
                        side={event.side}
                        extra={event.extra}
                      />
                    ))}
                  </View>
                ) : (
                  // noEventsText
                  <Text className="text-center text-neutral-500 text-xs mt-2">
                    No events recorded for this match.
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      );
    },
    [expandedMatches, getMatchEvents, toggleMatchExpansion, getPlayerNameById]
  );

  // --- Main Render (Converted to NativeWind) ---
  const isLoading = isLoadingMatches || isLoadingPlayers;

  return (
    // safeArea
    <SafeAreaView className="flex-1 bg-neutral-800">
      <StatusBar barStyle="light-content" />

      {/* Custom Header - header */}
      <View className="flex-row items-center px-4 py-3 border-b border-b-neutral-700">
        {/* backButton */}
        <TouchableOpacity
          onPress={handleBack}
          className="p-2 mr-3 -ml-2 active:opacity-70" // Added active:opacity-70
          // activeOpacity={0.7} // Removed
        >
          <Ionicons name="arrow-back" size={24} color="#E5E7EB" />
        </TouchableOpacity>
        {/* headerTitle */}
        <Text
          className="flex-1 text-xl font-bold text-white text-center"
          numberOfLines={1}
        >
          {tournamentName || "Match Results"}
        </Text>
        {/* headerSpacer */}
        <View className="w-8" />
      </View>

      {/* Content Area - scrollView */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ccc" // Keep tintColor for iOS native control
            colors={["#ccc"]} // Keep colors for Android native control
            progressBackgroundColor="#444" // Keep progressBackgroundColor
          />
        }
        showsVerticalScrollIndicator={false}
        // scrollContentContainer
        contentContainerStyle={{ paddingBottom: 40 }} // Keep contentContainerStyle for paddingBottom
      >
        {/* Error/Info Messages */}
        {error && !refreshing && (
          // messageContainer, errorContainer
          <View className="mb-4 p-3 rounded-lg border border-red-900 bg-red-500/20">
            {/* errorText */}
            <Text className="text-red-300 text-center text-sm">{error}</Text>
          </View>
        )}
        {infoMessage && !error && !refreshing && (
          // messageContainer, infoContainer
          <View className="mb-4 p-3 rounded-lg border border-blue-800 bg-blue-600/15">
            {/* infoText */}
            <Text className="text-blue-300 text-center text-sm">
              {infoMessage}
            </Text>
          </View>
        )}

        {/* Loading Indicator - loadingContainer */}
        {isLoading && !refreshing && (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#A5B4FC" />
            {/* loadingText */}
            <Text className="text-neutral-400 mt-3">Loading Match Data...</Text>
          </View>
        )}

        {/* Match List - Removing the unnecessary fragment */}
        {!isLoading && matches.length > 0 && matches.map(renderMatchItem)}

        {/* No Matches Message - emptyContainer */}
        {!isLoading &&
          !refreshing &&
          matches.length === 0 &&
          !error &&
          !infoMessage && (
            <View className="flex-1 justify-center items-center py-20">
              {/* emptyText */}
              <Text className="text-neutral-500 text-center px-4">
                No match results found yet. Pull down to refresh.
              </Text>
            </View>
          )}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles object removed ---

export default MatchResultsScreen;
