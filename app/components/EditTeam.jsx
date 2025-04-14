import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useRecoilState, useRecoilValue } from "recoil";
import { Ionicons } from "@expo/vector-icons";
import PitchView from "./PitchView";
import PlayerSelectionModal from "./PlayerSelectionModal";
import {
  selectedTournamentState,
  fetchedPlayersState,
  viewModeState,
  teamDataState,
  teamIdState,
} from "./atoms";
import api from "../config/axios";

const { height: screenHeight } = Dimensions.get("window");

const EditTeam = () => {
  const router = useRouter();
  const teamId = useRecoilValue(teamIdState);
  const [loading, setLoading] = useState(true);
  const [selectedTournament] = useRecoilState(selectedTournamentState);
  const [currentStage, setCurrentStage] = useState("knockout");
  const [viewMode, setViewMode] = useRecoilState(viewModeState);
  const [teamData, setTeamData] = useRecoilState(teamDataState);
  const [fetchedPlayers, setFetchedPlayers] = useRecoilState(fetchedPlayersState);
  const [addedPlayers, setAddedPlayers] = useState([]);
  const [removedPlayers, setRemovedPlayers] = useState([]);
  const [showPlayerSelectionModal, setShowPlayerSelectionModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);

  // Fetch team data and available players
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchTeamData(), fetchAvailablePlayers()]);
      } catch (error) {
        Alert.alert("Error", "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const response = await api.get(`/teams/${teamId}`);
      if (response.data.success) {
        const formattedPlayers = response.data.data.players[currentStage].map(p => ({
          ...p,
          _id: p._id,
          playerType: p.playerType?.toLowerCase().trim(),
        }));
        setTeamData({ [currentStage]: formattedPlayers });
      }
    } catch (error) {
      console.error("Fetch team error:", error);
      throw error;
    }
  };

  const fetchAvailablePlayers = async () => {
    try {
      const response = await api.get(`/players?tournament=${selectedTournament}`);
      if (response.data.success) {
        setFetchedPlayers(response.data.data);
      }
    } catch (error) {
      console.error("Fetch players error:", error);
      throw error;
    }
  };

  const handleAddPlayer = (player, position) => {
    setAddedPlayers(prev => [...prev, player._id]);
    setRemovedPlayers(prev => prev.filter(id => id !== player._id));
    
    setTeamData(prev => ({
      ...prev,
      [currentStage]: prev[currentStage].map(p => 
        p.position === position ? { ...player, position } : p
      )
    }));
  };

  const handleRemovePlayer = (playerId) => {
    setRemovedPlayers(prev => [...prev, playerId]);
    setAddedPlayers(prev => prev.filter(id => id !== playerId));
    
    setTeamData(prev => ({
      ...prev,
      [currentStage]: prev[currentStage].filter(p => p._id !== playerId)
    }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        addPlayers: addedPlayers,
        removePlayers: removedPlayers,
        stage: currentStage
      };

      const response = await api.put(`/teams/${teamId}`, payload);
      if (response.data.success) {
        Alert.alert("Success", "Team updated successfully!");
        setViewMode("VIEW");
        router.back();
      }
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert(
        "Error", 
        error.response?.data?.message || "Failed to update team"
      );
    }
  };

  const handleOpenSelection = (section, positionId, position) => {
    setSelectedPosition(position);
    setShowPlayerSelectionModal(true);
  };

  const renderHeader = () => (
    <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
      <TouchableOpacity
        onPress={() => {
          setViewMode("VIEW");
          router.back();
        }}
        className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
      >
        <Ionicons name="chevron-back" size={24} color="#374151" />
      </TouchableOpacity>
      
      <Text className="text-xl font-bold text-gray-800">Edit Team</Text>
      
      <TouchableOpacity
        onPress={handleSave}
        className="bg-blue-500 px-4 py-2 rounded-lg"
      >
        <Text className="text-white font-medium">Save</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStageSelector = () => (
    <View className="px-4 pt-4 pb-2">
      <View className="flex-row bg-gray-100 p-1 rounded-xl">
        {[
          { title: "Knockout", stageName: "knockout", icon: "trophy-outline" },
          { title: "Semifinal", stageName: "semifinal", icon: "git-network-outline" },
          { title: "Final", stageName: "final", icon: "star-outline" },
        ].map((stage) => (
          <TouchableOpacity
            key={stage.stageName}
            className={`flex-1 py-2.5 px-3 rounded-lg flex-row items-center justify-center ${
              currentStage === stage.stageName ? "bg-white shadow-sm" : ""
            }`}
            onPress={() => setCurrentStage(stage.stageName)}
          >
            <Ionicons 
              name={stage.icon} 
              size={16} 
              color={currentStage === stage.stageName ? "#3B82F6" : "#6B7280"} 
            />
            <Text
              className={`font-medium text-sm ml-1.5 ${
                currentStage === stage.stageName ? "text-blue-500" : "text-gray-500"
              }`}
            >
              {stage.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-4 font-medium">Loading team data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {renderHeader()}
      {renderStageSelector()}

      <ScrollView>
        <View style={{ height: screenHeight * 0.6 }}>
          <PitchView
            teamData={{ [currentStage]: teamData[currentStage] || [] }}
            handlePlayerPress={() => {}}
            handleOpenPlayerSelection={handleOpenSelection}
            handleRemovePlayer={handleRemovePlayer}
            editMode={true}
          />
        </View>

        <PlayerSelectionModal
          visible={showPlayerSelectionModal}
          onClose={() => setShowPlayerSelectionModal(false)}
          onSelectPlayer={(player) => handleAddPlayer(player, selectedPosition)}
          availablePlayers={fetchedPlayers.filter(p => 
            !teamData[currentStage]?.some(tp => tp._id === p._id) &&
            !removedPlayers.includes(p._id)
          )}
          position={selectedPosition}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditTeam;