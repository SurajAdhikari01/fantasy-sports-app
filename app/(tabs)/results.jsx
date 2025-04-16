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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "../config/axios";

const ResultsScreen = () => {
  // --- State Variables ---
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(true);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [expandedMatches, setExpandedMatches] = useState({});
  const [players, setPlayers] = useState({}); // Cache for player data

  // --- Helper: Determine Player's Team Side ---
  const getPlayerTeamSide = (playerId, match) => {
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

    if (team1PlayerIds.includes(playerId)) {
      return "left"; // Team 1
    }
    if (team2PlayerIds.includes(playerId)) {
      return "right"; // Team 2
    }
    console.warn(
      `Player ${playerId} not found in team lists for match ${match?._id}`
    );
    return null;
  };

  // --- Helper to get player name by ID ---
  const getPlayerNameById = (playerId, playersCache = players) => {
    if (!playerId) return "Unknown Player";
    return playersCache[playerId]?.name || playerId; // Return ID if name not found
  };

  // --- Toggle Match Expansion ---
  const toggleMatchExpansion = (matchId) => {
    setExpandedMatches((prev) => ({
      ...prev,
      [matchId]: !prev[matchId],
    }));
  };

  // --- Data Fetching ---
  const fetchTournaments = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setIsLoadingTournaments(true);
    setError(null);
    setInfoMessage(null);
    try {
      const response = await axios.get("/tournaments/getAllTournaments");
      if (response.data?.success) {
        const fetchedTournaments = response.data.data || [];
        setTournaments(fetchedTournaments);
        if (fetchedTournaments.length === 0)
          setInfoMessage("No tournaments available.");
      } else {
        setError(response.data?.message || "Failed to fetch tournaments.");
        setTournaments([]);
      }
    } catch (err) {
      console.error("Fetch Tournaments Error:", err);
      const message =
        err.response?.data?.message ||
        (err.response?.status
          ? `Status ${err.response.status}`
          : "Network Error");
      if (err.response?.status === 404)
        setInfoMessage(message || "No tournaments found.");
      else setError(`Error fetching tournaments: ${message}`);
      setTournaments([]);
    } finally {
      if (!isRefreshing) setIsLoadingTournaments(false);
      if (isRefreshing) setRefreshing(false);
    }
  }, []);

  // Fetch players for a tournament
  const fetchPlayers = useCallback(async (tournamentId) => {
    if (!tournamentId) return;

    setIsLoadingPlayers(true);
    try {
      const response = await axios.get(`/players/${tournamentId}/players`);

      if (response.status === 200 && response.data?.data) {
        // Create a dictionary/map of player IDs to player objects
        const playersMap = {};
        response.data.data.forEach((player) => {
          if (player._id) {
            playersMap[player._id] = player;
          }
        });

        setPlayers(playersMap);
      } else {
        console.warn("Failed to fetch players or no players found");
        setPlayers({});
      }
    } catch (err) {
      console.error("Error fetching players:", err);
      setPlayers({});
    } finally {
      setIsLoadingPlayers(false);
    }
  }, []);

  const fetchMatches = useCallback(
    async (tournamentId, isRefreshing = false) => {
      if (!tournamentId) {
        setMatches([]);
        if (!isRefreshing) setIsLoadingMatches(false);
        if (isRefreshing) setRefreshing(false);
        return;
      }
      if (!isRefreshing) setIsLoadingMatches(true);
      setError(null);
      setInfoMessage(null);
      try {
        const response = await axios.get(
          `/tournaments/${tournamentId}/matches`
        );
        if (response.status === 200 && response.data?.data?.matches) {
          const sortedMatches = (response.data.data.matches || []).sort(
            (a, b) => {
              const numA = parseInt(a.matchNumber, 10);
              const numB = parseInt(b.matchNumber, 10);
              if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
              if (!isNaN(numA)) return -1;
              if (!isNaN(numB)) return 1;
              return 0;
            }
          );
          setMatches(sortedMatches);
          setExpandedMatches({});
          if (sortedMatches.length === 0)
            setInfoMessage("No match results found for this tournament yet.");
        } else {
          setMatches([]);
          if (response.status === 404)
            setInfoMessage(response.data?.message || "No match results found.");
          else setError(response.data?.message || "Failed to fetch matches.");
        }
      } catch (err) {
        console.error("Error fetching matches:", err);
        const message =
          err.response?.data?.message ||
          (err.response?.status
            ? `Status ${err.response.status}`
            : "Network Error");
        if (err.response?.status === 404)
          setInfoMessage(message || "No match results found.");
        else setError(`Error fetching matches: ${message}`);
        setMatches([]);
      } finally {
        if (!isRefreshing) setIsLoadingMatches(false);
        if (isRefreshing) setRefreshing(false);
      }
    },
    []
  );

  // --- Effects ---
  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  // --- Event Handlers ---
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    setInfoMessage(null);
    if (selectedTournament) {
      await fetchMatches(selectedTournament._id, true);
      await fetchPlayers(selectedTournament._id);
    } else {
      await fetchTournaments(true);
    }
  }, [selectedTournament, fetchTournaments, fetchMatches, fetchPlayers]);

  const handleTournamentSelect = useCallback(
    async (tournament) => {
      setSelectedTournament(tournament);
      setPlayers({}); // Reset players cache
      await fetchMatches(tournament._id);
      await fetchPlayers(tournament._id); // Fetch players after selecting tournament
    },
    [fetchMatches, fetchPlayers]
  );

  const handleBackToTournaments = () => {
    setSelectedTournament(null);
    setMatches([]);
    setError(null);
    setInfoMessage(null);
    setPlayers({}); // Clear players cache when returning to tournaments list
  };

  // --- Render Event Item Component ---
  const EventItem = ({ type, player, side, extra = null }) => {
    let iconName, iconColor, label;

    switch (type) {
      case "goal":
        iconName = "football";
        iconColor = "#A7F3D0";
        label = `Goal by ${player}${extra ? ` ${extra}` : ""}`;
        break;
      case "ownGoal":
        iconName = "football";
        iconColor = "#FCA5A5";
        label = `Own Goal by ${player}`;
        break;
      case "yellowCard":
        iconName = "square";
        iconColor = "#FBBF24";
        label = `Yellow Card for ${player}`;
        break;
      case "redCard":
        iconName = "square";
        iconColor = "#F87171";
        label = `Red Card for ${player}`;
        break;
      case "penaltyMissed":
        iconName = "close-circle";
        iconColor = "#FCA5A5";
        label = `Penalty Missed by ${player}`;
        break;
      case "penaltySave":
        iconName = "hand-left";
        iconColor = "#A7F3D0";
        label = `Penalty Save by ${player}`;
        break;
      default:
        iconName = "alert-circle";
        iconColor = "#CBD5E1";
        label = player;
    }

    return (
      <View className="flex-row items-center justify-between py-2 border-b border-neutral-700 last:border-b-0">
        {/* Left side content */}
        <View className="flex-1 flex-row items-center">
          {side === "left" ? (
            <>
              <Ionicons
                name={iconName}
                size={14}
                color={iconColor}
                className="mr-2"
              />
              <Text className="text-neutral-200 text-xs">{label}</Text>
            </>
          ) : (
            <View />
          )}
        </View>

        {/* Event type indicator in center */}
        <View className="w-8 h-8 rounded-full bg-[#444] items-center justify-center mx-2">
          <View className="w-2 h-2 rounded-full bg-neutral-300" />
        </View>

        {/* Right side content */}
        <View className="flex-1 flex-row items-center justify-end">
          {side === "right" ? (
            <>
              <Text className="text-neutral-200 text-xs text-right">
                {label}
              </Text>
              <Ionicons
                name={iconName}
                size={14}
                color={iconColor}
                className="ml-2"
              />
            </>
          ) : (
            <View />
          )}
        </View>
      </View>
    );
  };

  // --- Get Events for a Match ---
  const getMatchEvents = (match) => {
    const events = [];

    // Process goals
    (match.goalsScoredBy || []).forEach((goal, index) => {
      const side = getPlayerTeamSide(goal.player, match);
      if (side) {
        // Get player name from players cache
        const playerName = getPlayerNameById(goal.player);

        // Get assist names if available
        const assistsText = goal.assists?.length
          ? `(Assist: ${goal.assists
              .map((id) => getPlayerNameById(id))
              .join(", ")})`
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

    // Process own goals
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

    // Process yellow cards
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

    // Process red cards
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

    // Process penalties missed
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

    // Process penalty saves
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
  };

  // --- Render Match Item ---
  const renderMatchItem = (match) => {
    const isExpanded = expandedMatches[match._id] || false;
    const events = getMatchEvents(match);

    // Count stats for summary
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

    // Format date
    const matchDate = match.createdAt
      ? new Date(match.createdAt).toLocaleString()
      : null;

    return (
      <View
        key={match._id}
        className="bg-[#3a3a3a] rounded-xl p-4 mb-4 shadow-md border border-neutral-700"
      >
        {/* Match Header */}
        <Text className="text-center text-neutral-400 text-sm mb-2 uppercase">
          {match.matchName || `Match ${match.matchNumber || "N/A"}`}
        </Text>
        <Text className="text-neutral-500 text-center text-xs mb-1">
          {matchDate && `${matchDate}`}
        </Text>

        {/* Score & Teams Row */}
        <View className="flex-row justify-between items-center mb-3">
          <Text
            className="text-neutral-200 text-sm font-semibold w-[40%] text-left"
            numberOfLines={2}
          >
            {match.team1?.name || "Team 1"}
          </Text>
          <Text className="text-white text-xl font-bold w-[20%] text-center">
            {match.score || "vs"}
          </Text>
          <Text
            className="text-neutral-200 text-sm font-semibold w-[40%] text-right"
            numberOfLines={2}
          >
            {match.team2?.name || "Team 2"}
          </Text>
        </View>

        {/* Match Summary (Always visible) */}
        <View className="flex-row justify-center items-center mt-1 mb-3 space-x-4">
          {goalCount > 0 && (
            <View className="flex-row items-center">
              <Ionicons name="football" size={14} color="#A7F3D0" />
              <Text className="text-neutral-300 text-xs ml-1">{goalCount}</Text>
            </View>
          )}

          {yellowCardCount > 0 && (
            <View className="flex-row items-center">
              <Ionicons name="square" size={14} color="#FBBF24" />
              <Text className="text-neutral-300 text-xs ml-1">
                {yellowCardCount}
              </Text>
            </View>
          )}

          {redCardCount > 0 && (
            <View className="flex-row items-center">
              <Ionicons name="square" size={14} color="#F87171" />
              <Text className="text-neutral-300 text-xs ml-1">
                {redCardCount}
              </Text>
            </View>
          )}

          {penaltyCount > 0 && (
            <View className="flex-row items-center">
              <Ionicons name="close-circle" size={14} color="#FCA5A5" />
              <Text className="text-neutral-300 text-xs ml-1">
                {penaltyCount}
              </Text>
            </View>
          )}

          {goalCount === 0 &&
            yellowCardCount === 0 &&
            redCardCount === 0 &&
            penaltyCount === 0 && (
              <Text className="text-neutral-500 text-xs">No events</Text>
            )}
        </View>

        {/* Toggle Button */}
        <TouchableOpacity
          onPress={() => toggleMatchExpansion(match._id)}
          className="bg-neutral-700 rounded-lg py-2 px-4 items-center"
        >
          <View className="flex-row items-center justify-center">
            <Text className="text-white text-sm mr-2">
              {isExpanded ? "Hide Details" : "View Details"}
            </Text>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color="#ccc"
            />
          </View>
        </TouchableOpacity>

        {/* Expanded Details */}
        {isExpanded && (
          <View className="mt-3 pt-3 border-t border-neutral-600">
            {/* Players section */}
            <View className="mb-3">
              <Text className="text-neutral-300 text-xs font-medium mb-1">
                TEAMS:
              </Text>
              <View className="flex-row">
                <View className="flex-1 pr-2">
                  <Text className="text-neutral-400 text-xs mb-1">Team 1:</Text>
                  {match.playersPlayedTeam1?.map((playerId, idx) => (
                    <Text
                      key={`t1-${idx}`}
                      className="text-neutral-300 text-xs"
                      numberOfLines={1}
                    >
                      • {getPlayerNameById(playerId)}
                    </Text>
                  ))}
                </View>
                <View className="flex-1 pl-2">
                  <Text className="text-neutral-400 text-xs mb-1 text-right">
                    Team 2:
                  </Text>
                  {match.playersPlayedTeam2?.map((playerId, idx) => (
                    <Text
                      key={`t2-${idx}`}
                      className="text-neutral-300 text-xs text-right"
                      numberOfLines={1}
                    >
                      {getPlayerNameById(playerId)} •
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            {/* Timeline label */}
            <Text className="text-neutral-300 text-xs font-medium mb-2">
              MATCH EVENTS:
            </Text>

            {/* Timeline of Events */}
            <View>
              {events.length > 0 ? (
                <View className="relative">
                  {/* Center line */}
                  <View className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-neutral-600 -ml-0.25" />

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
                <Text className="text-center text-neutral-500 text-xs">
                  No events recorded for this match.
                </Text>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  // --- Tournament Item Renderer ---
  const renderTournamentItem = (tournament) => (
    <TouchableOpacity
      key={tournament._id}
      className="bg-[#3a3a3a] rounded-xl p-4 mb-3 flex-row items-center justify-between shadow-md active:bg-[#4a4a4a] border border-neutral-700"
      onPress={() => handleTournamentSelect(tournament)}
    >
      <View className="flex-1 mr-3">
        <Text className="text-white text-base font-semibold">
          {tournament.name}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color="#ccc" />
    </TouchableOpacity>
  );

  // --- Main Render ---
  return (
    <SafeAreaView
      className="flex-1 bg-[#2a2a2a]"
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="light-content" />

      {/* Custom Header */}
      <View className="flex-row items-center p-4 border-neutral-700">
        {selectedTournament ? (
          <TouchableOpacity
            onPress={handleBackToTournaments}
            className="w-10 h-10 rounded-full bg-[#3a3a3a] items-center justify-center active:bg-[#4a4a4a] border border-neutral-600 mr-3"
          >
            <Ionicons name="arrow-back" size={24} color="#E5E7EB" />
          </TouchableOpacity>
        ) : (
          <View className="" />
        )}
        <Text
          className={`${
            selectedTournament ? "text-xl" : "text-3xl"
          } font-bold text-white flex-1`}
        >
          {selectedTournament ? selectedTournament.name : "Match Results"}
        </Text>
      </View>

      {/* Content Area */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ccc"
            colors={["#ccc"]}
            progressBackgroundColor="#444"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Error/Info Messages */}
        {error && !refreshing && (
          <View className="mb-4 p-3 bg-red-800/50 border border-red-700 rounded-lg">
            <Text className="text-red-300 text-center text-sm">{error}</Text>
          </View>
        )}
        {infoMessage && !error && !refreshing && (
          <View className="mb-4 p-3 bg-blue-800/30 border border-blue-700 rounded-lg">
            <Text className="text-blue-300 text-center text-sm">
              {infoMessage}
            </Text>
          </View>
        )}

        {/* Conditional Rendering: Tournament List or Match List */}
        {selectedTournament ? (
          // --- Matches View ---
          <>
            {(isLoadingMatches || isLoadingPlayers) && !refreshing ? (
              <View className="flex-1 justify-center items-center py-20">
                <ActivityIndicator size="large" color="#A5B4FC" />
                <Text className="text-neutral-400 mt-3">
                  Loading Match Data...
                </Text>
              </View>
            ) : matches.length > 0 ? (
              matches.map(renderMatchItem)
            ) : (
              !error &&
              !infoMessage && (
                <View className="flex-1 justify-center items-center py-20">
                  <Text className="text-neutral-500 text-center px-4">
                    No match results found yet.
                  </Text>
                </View>
              )
            )}
          </>
        ) : (
          // --- Tournaments View ---
          <>
            {isLoadingTournaments && !refreshing ? (
              <View className="flex-1 justify-center items-center py-20">
                <ActivityIndicator size="large" color="#A5B4FC" />
                <Text className="text-neutral-400 mt-3">
                  Loading Tournaments...
                </Text>
              </View>
            ) : tournaments.length > 0 ? (
              <>{tournaments.map(renderTournamentItem)}</>
            ) : (
              !error &&
              !infoMessage && (
                <View className="flex-1 justify-center items-center py-20">
                  <Text className="text-neutral-500 text-center px-4">
                    No tournaments available. Pull down to refresh.
                  </Text>
                </View>
              )
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResultsScreen;
