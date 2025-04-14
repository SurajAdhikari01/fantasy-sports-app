import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Image, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import api from "../config/axios";
import { useRecoilState } from "recoil";
import { fetchedPlayersState, selectedTournamentState, playerLimitState, totalPointsState, teamIdState } from "./atoms";
import { viewModeState } from "./atoms";
import { Ionicons } from '@expo/vector-icons';

const TournamentSelect = () => {
  const [joinedTournaments, setJoinedTournaments] = useState([]);
  const [availableTournaments, setAvailableTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('joined');
  const router = useRouter();

  const [fetchedPlayers, setFetchedPlayers] = useRecoilState(fetchedPlayersState);
  const [selectedTournament, setSelectedTournament] = useRecoilState(selectedTournamentState);
  const [totalPoints, setTotalPoints] = useRecoilState(totalPointsState);
  const [playerLimit, setPlayerLimit] = useRecoilState(playerLimitState);
  const [selectedTournamentPlayers, setSelectedTournamentPlayers] = useState([]);
  const [viewMode, setViewMode] = useRecoilState(viewModeState);
  const [teamid, setTeamid] = useRecoilState(teamIdState);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "joined", title: "My Tournaments" },
    { key: "available", title: "Available" },
  ]);

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
      // console.log("Available tournaments response:", availableResponse.data);
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
        router.push("main");
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
    <View className="bg-white rounded-xl shadow-sm p-5 mb-4 mx-4 border border-gray-100">
      <View className="flex-row justify-between items-start">
        <Text className="text-xl font-bold text-gray-800 flex-1">{item.tournamentId.name}</Text>
        <View className="bg-green-100 px-3 py-1 rounded-full">
          <Text className="text-green-800 font-semibold text-xs">Joined</Text>
        </View>
      </View>

      <View className="mt-4">
        <View className="flex-row items-center mb-2">
          <Ionicons name="trophy" size={18} color="#4b5563" />
          <Text className="text-gray-700 ml-2 font-medium">Total Points: {item.totalPoints || 0}</Text>
        </View>

        <View className="flex-row flex-wrap">
          <View className="flex-row items-center mr-4 mb-2">
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text className="text-gray-600 ml-2 text-sm">Knockout: {new Date(item.tournamentId.knockoutStart).toLocaleDateString()}</Text>
          </View>

          <View className="flex-row items-center mr-4 mb-2">
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text className="text-gray-600 ml-2 text-sm">Semifinal: {new Date(item.tournamentId.semifinalStart).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        className="flex-row justify-center items-center py-3 px-4 mt-4 rounded-xl bg-blue-600 active:bg-blue-700"
        onPress={() => {
          setSelectedTournament(item.tournamentId._id);
          setTotalPoints(item.totalPoints);
          setSelectedTournamentPlayers(item.players);
          setViewMode('VIEW_TEAM');
          setTeamid(item._id);
          console.log("Selected team ID: from tournament select", teamid);
        }}
      >
        <Ionicons name="people" size={18} color="white" />
        <Text className="text-white font-medium ml-2">View Team</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAvailableTournamentItem = ({ item }) => (
    <View className="bg-white rounded-xl shadow-md p-5 mb-4 border-l-4 border-blue-500 mx-4">
      <Text className="text-xl font-bold text-gray-800">{item.name}</Text>

      <View className="mt-4 bg-gray-50 p-3 rounded-lg">
        <View className="flex-row items-center mb-2">
          <Ionicons name="person" size={18} color="#4b5563" />
          <Text className="text-gray-700 ml-2 font-medium">Player Limit: {item.playerLimitPerTeam || "N/A"}</Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="alert-circle-outline" size={18} color="#4b5563" />
          <Text className="text-gray-700 ml-2 font-medium">Registration Limit: {item.registrationLimits || "N/A"}</Text>
        </View>
      </View>

      <TouchableOpacity
        className="flex-row justify-center items-center py-3 px-4 mt-4 rounded-xl bg-green-600 active:bg-green-700 shadow-sm"
        onPress={() => handleJoinTournament(item._id, item.playerLimitPerTeam)}
      >
        <Ionicons name="add-circle" size={18} color="white" />
        <Text className="text-white font-medium ml-2">Join Tournament</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-10">
      <Ionicons
        name={activeTab === 'joined' ? "trophy-outline" : "calendar-outline"}
        size={64}
        color="#d1d5db"
      />
      <Text className="text-gray-500 text-lg mt-4 text-center px-6">
        {activeTab === 'joined'
          ? "You haven't joined any tournaments yet"
          : "No tournaments available at the moment"}
      </Text>
      <TouchableOpacity
        className="mt-6 px-6 py-3 bg-blue-100 rounded-full flex-row items-center"
        onPress={fetchTournaments}
      >
        <Ionicons name="refresh" size={18} color="#3b82f6" />
        <Text className="text-blue-600 font-medium ml-2">Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  //for swipe action;
  const MyTournaments = () => (
    <FlatList
      data={joinedTournaments}
      keyExtractor={(item) => item._id}
      renderItem={renderJoinedTournamentItem}
      contentContainerClassName="pb-6 pt-2"
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
  );

  const AvailableTournaments = () => (
    <FlatList
      data={availableTournaments}
      keyExtractor={(item) => item._id}
      renderItem={renderAvailableTournamentItem}
      contentContainerClassName="pb-6 pt-2"
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
  );

  const renderTabBar = (props) => {
    return (
      <View className="flex-row mx-4 my-2 bg-gray-100 rounded-xl p-1">
        {props.navigationState.routes.map((route, i) => {
          const isActive = i === props.navigationState.index;
          return (
            <TouchableOpacity
              key={route.key}
              className={`flex-1 items-center py-2 rounded-lg ${isActive ? 'bg-white shadow' : ''}`}
              onPress={() => setIndex(i)}
            >
              <Text className={`font-semibold ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                {route.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-2">
        <Text className="text-3xl font-bold text-gray-900 mb-1">Tournaments</Text>
        <Text className="text-gray-500">Manage your teams and join new competitions</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-3 text-gray-500">Loading tournaments...</Text>
        </View>
      ) : (
        <TabView
          navigationState={{ index, routes }}
          renderScene={SceneMap({
            joined: MyTournaments,
            available: AvailableTournaments,
          })}
          onIndexChange={setIndex}
          initialLayout={{ width: Dimensions.get("window").width }}
          renderTabBar={renderTabBar}
        />
      )}
    </SafeAreaView>
  );
};

export default TournamentSelect;