import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useRecoilState, useRecoilValue, useResetRecoilState } from "recoil";
import {
  selectedTournamentState,
  playerLimitState,
  fetchedPlayersState,
  viewModeState,
} from "./atoms";
import { AntDesign } from "@expo/vector-icons";
import api from "../config/axios";
import PitchView from "./PitchView";

const TeamPlayersView = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [selectedTournament, setSelectedTournament] = useRecoilState(selectedTournamentState);
  const [currentStage, setCurrentStage] = useState("knockout");
  const playerLimit = useRecoilValue(playerLimitState);

  // Reset functions
  const resetSelectedTournament = useResetRecoilState(selectedTournamentState);
  const resetPlayerLimit = useResetRecoilState(playerLimitState);
  const resetFetchedPlayers = useResetRecoilState(fetchedPlayersState);
  const resetViewMode = useResetRecoilState(viewModeState);

  useEffect(() => {
    if (selectedTournament) {
      fetchTournamentPlayers();
    }
  }, [selectedTournament, currentStage]);

  const fetchTournamentPlayers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/teams`);

      if (response.data.success) {
        const teamForTournament = response.data.data.find(
          (team) => team.tournamentId?._id === selectedTournament
        );

        if (teamForTournament) {
            const stagePlayers = [
                ...(teamForTournament.players?.[currentStage] || []),
              ].map((p) => ({
                ...p,
                playerType: (p.playerType?.toLowerCase() || "").trim(), 
                photo: p.photo || "https://via.placeholder.com/150",
              }));
          setPlayers(stagePlayers);
          // Debug: Log players to verify data
          console.log("Fetched players:", stagePlayers);
        } else {
          setPlayers([]);
        }
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      Alert.alert("Error", "Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    resetSelectedTournament();
    resetPlayerLimit();
    resetFetchedPlayers();
    resetViewMode();
    navigation.navigate("TournamentSelect");
  };

  const handlePlayerPress = (player) => {
    Alert.alert(player.name, `Price: ${player.price || "N/A"}`);
  };

  const handleRemovePlayer = (player) => {
    Alert.alert("Remove Player", `Remove ${player.name} from team?`);
  };

  const handleOpenPlayerSelection = (section, positionId, position) => {
    Alert.alert("Add Player", `Add player to ${section} position`);
  };

  const renderContent = () => {
    if (players.length === 0) {
      return (
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-gray-500 text-lg text-center">
            No players found for this tournament stage
          </Text>
        </View>
      );
    }

    console.log ("teamData", { all: players });
    return (
        <>
        <PitchView
          teamData={{ all: players }}
          handlePlayerPress={handlePlayerPress}
          handleOpenPlayerSelection={handleOpenPlayerSelection}
          handleRemovePlayer={handleRemovePlayer}
        />
        <View className="mt-4 p-3 bg-blue-50 rounded-lg">
          <Text className="font-medium text-blue-800">
            Total Players: {players.length}/{playerLimit}
          </Text>
        </View>
      </>
    );
  };

  const StageButton = ({ title, stageName }) => (
    <TouchableOpacity
      className={`px-4 py-2 rounded-lg mr-2 ${
        currentStage === stageName ? "bg-blue-500" : "bg-gray-300"
      }`}
      onPress={() => setCurrentStage(stageName)}
    >
      <Text
        className={`font-medium ${
          currentStage === stageName ? "text-white" : "text-gray-700"
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="px-4 py-2 flex-row items-center border-b border-gray-200">
        <TouchableOpacity
          onPress={handleBack}
          style={{
            padding: 8,
            borderRadius: 20,
            backgroundColor: "rgba(55, 65, 81, 0.8)",
          }}
        >
          <AntDesign name="arrowleft" size={22} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 ml-4">Your Team</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <View className="flex-1 p-4">
          <View className="flex-row mb-4">
            <StageButton title="Knockout" stageName="knockout" />
            <StageButton title="Semifinal" stageName="semifinal" />
            <StageButton title="Final" stageName="final" />
          </View>
          {renderContent()}
        </View>
      )}
    </SafeAreaView>
  );
};

export default TeamPlayersView;