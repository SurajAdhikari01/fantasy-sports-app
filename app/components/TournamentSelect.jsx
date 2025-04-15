import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabView, SceneMap } from "react-native-tab-view";
import api from "../config/axios";
import { useRecoilState } from "recoil";
import { fetchedPlayersState, selectedTournamentState, playerLimitState, teamIdState } from "./atoms";
import { viewModeState } from "./atoms";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const TournamentSelect = () => {
  const [joinedTournaments, setJoinedTournaments] = useState([]);
  const [availableTournaments, setAvailableTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const [fetchedPlayers, setFetchedPlayers] = useRecoilState(fetchedPlayersState);
  const [selectedTournament, setSelectedTournament] = useRecoilState(selectedTournamentState);
  const [playerLimit, setPlayerLimit] = useRecoilState(playerLimitState);
  const [selectedTournamentPlayers, setSelectedTournamentPlayers] = useState([]);
  const [viewMode, setViewMode] = useRecoilState(viewModeState);
  const [teamid, setTeamid] = useRecoilState(teamIdState);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "joined", title: "My Tournaments" },
    { key: "available", title: "Discover" },
  ]);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);

      const joinedResponse = await api.get("tournaments/getTournamentsByUserId");
      if (joinedResponse.data.success) {
        setJoinedTournaments(joinedResponse.data.data || []);
      } else {
        Alert.alert("Error", joinedResponse.data.message || "Failed to fetch joined tournaments");
      }

      const availableResponse = await api.get("/tournaments/getAllTournaments");
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
    <View className="bg-slate-800 rounded-xl shadow-lg p-5 mb-4 mx-4 border border-slate-700">
      <View className="flex-row justify-between items-start">
        <Text className="text-xl font-bold text-white flex-1">{item.name}</Text>
        <View className="bg-emerald-900 px-3 py-1 rounded-full">
          <Text className="text-emerald-400 font-semibold text-xs">Joined</Text>
        </View>
      </View>

      <View className="mt-4 bg-slate-700/50 p-3 rounded-lg">
        <View className="flex-row flex-wrap">
          <View className="flex-row items-center mr-4 mb-2">
            <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
            <Text className="text-slate-300 ml-2 text-sm">Knockout: {item.knockoutStart ? new Date(item.knockoutStart).toLocaleDateString() : "N/A"}</Text>
          </View>
          <View className="flex-row items-center mr-4 mb-2">
            <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
            <Text className="text-slate-300 ml-2 text-sm">Semifinal: {item.semifinalStart ? new Date(item.semifinalStart).toLocaleDateString() : "N/A"}</Text>
          </View>
          <View className="flex-row items-center mr-4 mb-2">
            <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
            <Text className="text-slate-300 ml-2 text-sm">Final: {item.finalStart ? new Date(item.finalStart).toLocaleDateString() : "N/A"}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        className="flex-row justify-center items-center py-3 px-4 mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 active:opacity-90"
        onPress={() => {
          setSelectedTournament(item._id);
          setSelectedTournamentPlayers([]);
          setViewMode('VIEW_TEAM');
          setTeamid(item._id);
          setPlayerLimit(item.playerLimitPerTeam);
        }}
      >
        <Ionicons name="people" size={18} color="white" />
        <Text className="text-white font-medium ml-2">View Tournament</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAvailableTournamentItem = ({ item }) => (
    <View className="bg-slate-800 rounded-xl shadow-lg p-5 mb-4 mx-4 border-l-4 border-purple-500">
      <Text className="text-xl font-bold text-white">{item.name}</Text>

      <View className="mt-4 bg-slate-700/50 p-3 rounded-lg">
        <View className="flex-row items-center mb-2">
          <Ionicons name="person" size={18} color="#94a3b8" />
          <Text className="text-slate-300 ml-2 font-medium">Player Limit: {item.playerLimitPerTeam || "N/A"}</Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="alert-circle-outline" size={18} color="#94a3b8" />
          <Text className="text-slate-300 ml-2 font-medium">Registration Limit: {item.registrationLimits || "N/A"}</Text>
        </View>
      </View>

      <TouchableOpacity
        className="flex-row justify-center items-center py-3 px-4 mt-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 active:opacity-90 shadow-sm"
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
        name={index === 0 ? "trophy-outline" : "calendar-outline"}
        size={64}
        color="#475569"
      />
      <Text className="text-slate-400 text-lg mt-4 text-center px-6">
        {index === 0
          ? "You haven't joined any tournaments yet"
          : "No tournaments available at the moment"}
      </Text>
      <TouchableOpacity
        className="mt-6 px-6 py-3 bg-slate-700 rounded-full flex-row items-center"
        onPress={fetchTournaments}
      >
        <Ionicons name="refresh" size={18} color="#a5b4fc" />
        <Text className="text-indigo-300 font-medium ml-2">Refresh</Text>
      </TouchableOpacity>
    </View>
  );

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
          colors={['#a78bfa']}
          tintColor="#a78bfa"
        />
      }
    />
  );

  const AvailableTournaments = () => (
    <FlatList
      data={availableTournaments.filter(tournament =>
        !joinedTournaments.some(joined => joined._id === tournament._id)
      )}
      keyExtractor={(item) => item._id}
      renderItem={renderAvailableTournamentItem}
      contentContainerClassName="pb-6 pt-2"
      ListEmptyComponent={renderEmptyState}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#a78bfa']}
          tintColor="#a78bfa"
        />
      }
    />
  );

  const renderTabBar = (props) => {
    return (
      <View className="flex-row mx-4 my-3 bg-slate-700 rounded-xl p-1">
        {props.navigationState.routes.map((route, i) => {
          const isActive = i === props.navigationState.index;
          return (
            <TouchableOpacity
              key={route.key}
              className={`flex-1 items-center py-2.5 rounded-lg ${isActive ? 'bg-slate-800' : ''}`}
              onPress={() => setIndex(i)}
            >
              <Text className={`font-semibold ${isActive ? 'text-purple-400' : 'text-slate-400'}`}>
                {route.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <LinearGradient
        colors={['rgba(79, 70, 229, 0.15)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute top-0 left-0 right-0 h-64"
      />
      
      <View className="px-5 pt-4 pb-2">
        <Text className="text-3xl font-bold text-white mb-1">Tournaments</Text>
        <Text className="text-slate-400">Manage your teams and join new competitions</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#a78bfa" />
          <Text className="mt-3 text-slate-400">Loading tournaments...</Text>
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