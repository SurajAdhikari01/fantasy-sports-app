import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../config/axios";
import { useRecoilState } from "recoil";
import { fetchedPlayersState, selectedTournamentState, playerLimitState, totalPointsState } from "./atoms";
import { viewModeState } from "./atoms";
import { Ionicons } from '@expo/vector-icons';

const TournamentSelect = () => {
  const [joinedTournaments, setJoinedTournaments] = useState([]);
  const [availableTournaments, setAvailableTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('joined');
  const navigation = useNavigation();

  const [fetchedPlayers, setFetchedPlayers] = useRecoilState(fetchedPlayersState);
  const [selectedTournament, setSelectedTournament] = useRecoilState(selectedTournamentState);
  const [totalPoints, setTotalPoints] = useRecoilState(totalPointsState);
  const [playerLimit, setPlayerLimit] = useRecoilState(playerLimitState);
  const [selectedTournamentPlayers, setSelectedTournamentPlayers] = useState([]);
  const [viewMode, setViewMode] = useRecoilState(viewModeState);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);

      // Fetch joined tournaments
      const joinedResponse = await api.get("/teams");
      if (joinedResponse.data.success) {
        setJoinedTournaments(joinedResponse.data.data || []);
      } else {
        Alert.alert("Error", joinedResponse.data.message || "Failed to fetch joined tournaments");
      }

      // Fetch available tournaments
      const availableResponse = await api.get("/tournaments/getAllTournaments");
      console.log("Available tournaments response:", availableResponse.data);
      if (availableResponse.data.success) {
        setAvailableTournaments(availableResponse.data.data || []);
      } else {
        Alert.alert("Error", availableResponse.data.message || "Failed to fetch available tournaments");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch tournaments. Please try again.");
      console.error("Error fetching tournaments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleJoinTournament = async (tournamentId, playerLimitPerTeam) => {
    try {
      setLoading(true);
      const response = await api.get(`/players/${tournamentId}/players`);

      if (response.data.success) {
        setSelectedTournament(tournamentId);
        setPlayerLimit(playerLimitPerTeam);
        setFetchedPlayers(response.data.data || []);
        navigation.navigate("MainPage");
      } else {
        Alert.alert("Error", response.data.message || "Failed to fetch players");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch players. Please try again.");
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTournaments();
  };

  const renderJoinedTournamentItem = ({ item }) => (
    <View className="bg-white rounded-xl shadow-lg p-5 mb-4 border-l-4 border-green-500">
      <View className="flex-row justify-between items-start">
        <Text className="text-xl font-bold text-gray-800 flex-1">{item.tournamentId.name}</Text>
        <View className="bg-green-100 px-3 py-1 rounded-full">
          <Text className="text-green-800 font-semibold">Joined</Text>
        </View>
      </View>
      
      <View className="mt-3">
        <View className="flex-row items-center mb-1">
          <Ionicons name="trophy" size={16} color="#6b7280" />
          <Text className="text-gray-600 ml-2">Total Points: {item.totalPoints || 0}</Text>
        </View>
        
        <View className="flex-row items-center mb-1">
          <Ionicons name="calendar" size={16} color="#6b7280" />
          <Text className="text-gray-600 ml-2">Knockout: {new Date(item.tournamentId.knockoutStart).toLocaleDateString()}</Text>
        </View>
        <View className="flex-row items-center mb-1">
          <Ionicons name="calendar" size={16} color="#6b7280" />
          <Text className="text-gray-600 ml-2">Semifinal: {new Date(item.tournamentId.semifinalStart).toLocaleDateString()}</Text>
        </View>
        
        <View className="flex-row items-center">
          <Ionicons name="calendar" size={16} color="#6b7280" />
          <Text className="text-gray-600 ml-2">Final: {new Date(item.tournamentId.finalStart).toLocaleDateString()}</Text>
        </View>
        {/* <View className="flex-row items-center mb-1">
          <Ionicons name="calendar" size={16} color="#6b7280" />
          <Text className="text-gray-600 ml-2">Total Points: {item.totalPoints || 0}</Text>
        </View> */}
      </View>

      <TouchableOpacity
        className="flex-row justify-center items-center py-3 px-4 mt-4 rounded-xl bg-blue-600 active:bg-blue-700"
        onPress={() => {
          setSelectedTournament(item.tournamentId._id);
          setTotalPoints(item.totalPoints);
          setSelectedTournamentPlayers(item.players);
          setViewMode('VIEW_TEAM');
        }}
      >
        <Ionicons name="people" size={18} color="white" />
        <Text className="text-white font-medium ml-2">View Team</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAvailableTournamentItem = ({ item }) => (
    <View className="bg-white rounded-xl shadow-lg p-5 mb-4 border-l-4 border-blue-500">
      <Text className="text-xl font-bold text-gray-800">{item.name}</Text>
      
      <View className="mt-3">
        <View className="flex-row items-center mb-1">
          <Ionicons name="person" size={16} color="#6b7280" />
          <Text className="text-gray-600 ml-2">Player Limit: {item.playerLimitPerTeam || "N/A"}</Text>
        </View>
        
        <View className="flex-row items-center">
          <Ionicons name="alert-circle" size={16} color="#6b7280" />
          <Text className="text-gray-600 ml-2">Registration Limit: {item.registrationLimits || "N/A"}</Text>
        </View>
      </View>

      <TouchableOpacity
        className="flex-row justify-center items-center py-3 px-4 mt-4 rounded-xl bg-green-600 active:bg-green-700"
        onPress={() => handleJoinTournament(item._id, item.playerLimitPerTeam)}
      >
        <Ionicons name="add-circle" size={18} color="white" />
        <Text className="text-white font-medium ml-2">Join Tournament</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-10">
      <Image 
        // source={require('../assets/empty-tournament.png')} 
        className="w-48 h-48 opacity-80"
      />
      <Text className="text-gray-500 text-lg mt-4 text-center">
        {activeTab === 'joined' 
          ? "You haven't joined any tournaments yet" 
          : "No tournaments available at the moment"}
      </Text>
      <TouchableOpacity 
        className="mt-4 px-6 py-2 bg-blue-100 rounded-full"
        onPress={fetchTournaments}
      >
        <Text className="text-blue-600">Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-5 flex-1">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Tournaments</Text>
        <Text className="text-gray-500 mb-6">Manage your teams and join new competitions</Text>
        
        {/* Tab Navigation */}
        <View className="flex-row mb-6 bg-gray-100 rounded-xl p-1">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg ${activeTab === 'joined' ? 'bg-white shadow' : ''}`}
            onPress={() => setActiveTab('joined')}
          >
            <Text className={`text-center font-medium ${activeTab === 'joined' ? 'text-blue-600' : 'text-gray-500'}`}>
              My Tournaments
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg ${activeTab === 'available' ? 'bg-white shadow' : ''}`}
            onPress={() => setActiveTab('available')}
          >
            <Text className={`text-center font-medium ${activeTab === 'available' ? 'text-blue-600' : 'text-gray-500'}`}>
              Available
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="mt-3 text-gray-500">Loading tournaments...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'joined' ? (
              <FlatList
                data={joinedTournaments}
                keyExtractor={(item) => item._id}
                renderItem={renderJoinedTournamentItem}
                contentContainerClassName="pb-4"
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                  <RefreshControl 
                    refreshing={refreshing} 
                    onRefresh={onRefresh}
                    colors={['#3b82f6']}
                    tintColor="#3b82f6"
                  />
                }
              />
            ) : (
              <FlatList
                data={availableTournaments}
                keyExtractor={(item) => item._id}
                renderItem={renderAvailableTournamentItem}
                contentContainerClassName="pb-4"
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                  <RefreshControl 
                    refreshing={refreshing} 
                    onRefresh={onRefresh}
                    colors={['#3b82f6']}
                    tintColor="#3b82f6"
                  />
                }
              />
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default TournamentSelect;