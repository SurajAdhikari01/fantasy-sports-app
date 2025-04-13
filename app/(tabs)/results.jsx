import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; 
import axios from "../config/axios";

const ResultsScreen = () => {
  const router = useRouter(); 
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);

  // Fetch all tournaments on mount
  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await axios.get("tournaments/getAllTournaments");
      if (response.status === 200) {
        setTournaments(response.data.data);
      } else {
        Alert.alert("Error", "Failed to fetch tournaments");
      }
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      Alert.alert("Error", "Failed to fetch tournaments");
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async (tournamentId) => {
    try {
      setLoading(true);
      const response = await axios.get(`tournaments/${tournamentId}/matches`);
      if (response.status === 200) {
        setMatches(response.data.data.matches);
      } else {
        Alert.alert("Error", "Failed to fetch matches");
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      Alert.alert("Error", "Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentSelect = (tournamentId) => {
    setSelectedTournament(tournamentId);
    fetchMatches(tournamentId);
  };

  const renderTournaments = () => (
    <View>
      <Text className="text-lg font-bold mb-4">Select a Tournament:</Text>
      {tournaments.map((tournament) => (
        <TouchableOpacity
          key={tournament._id}
          className="p-4 bg-blue-100 rounded-lg mb-2"
          onPress={() => handleTournamentSelect(tournament._id)}
        >
          <Text className="text-blue-800 font-medium">{tournament.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMatches = () => (
    <View>
      <Text className="text-lg font-bold mb-4">Match Details:</Text>
      {matches.map((match) => (
        <View key={match._id} className="p-4 bg-gray-100 rounded-lg mb-2">
          <Text className="text-gray-800 font-medium">Match Name: {match.matchName}</Text>
          <Text className="text-gray-600">Score: {match.score}</Text>
          <Text className="text-gray-600">Match Number: {match.matchNumber}</Text>
          <Text className="text-gray-600">Players Team 1: {match.playersPlayedTeam1?.join(", ") || "N/A"}</Text>
          <Text className="text-gray-600">Players Team 2: {match.playersPlayedTeam2?.join(", ") || "N/A"}</Text>
          <Text className="text-gray-600">
            Goals Scored:{" "}
            {match.goalsScoredBy.map(
              (goal, index) =>
                `${goal.player} scored ${goal.goals} goal(s) [Assists: ${goal.assists?.join(", ") || "N/A"}]`
            )}
          </Text>
          <Text className="text-gray-600">Yellow Cards: {match.cardsObtained?.yellow?.join(", ") || "None"}</Text>
          <Text className="text-gray-600">Red Cards: {match.cardsObtained?.red?.join(", ") || "None"}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      {/* Back Button */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity
          onPress={() => {
            setSelectedTournament(null); // Clear the selected tournament state
          }}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 ml-3">Results</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-4 font-medium">Loading...</Text>
        </View>
      ) : (
        <ScrollView>{selectedTournament ? renderMatches() : renderTournaments()}</ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ResultsScreen;