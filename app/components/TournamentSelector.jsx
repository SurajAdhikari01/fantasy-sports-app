// components/TournamentSelector.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import api from '../config/axios';

const TournamentSelector = ({ onTournamentSelect }) => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      console.log('=== Tournament Fetch Debug Log ===');
      
      const response = await api.get('/tournaments/getTournamentsByUserId');
      console.log('API Response:', JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        setTournaments(response.data.message);
        console.log('Tournaments fetched:', response.data.message.length);
      } else {
        console.error('API Error:', response.data.data);
        setError('Failed to load tournaments');
      }
    } catch (err) {
      console.error('Fetch Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Network error occurred');
    } finally {
      setLoading(false);
      console.log('=== End Debug Log ===');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-800">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-800">
        <Text className="text-red-500 text-base">{error}</Text>
        <TouchableOpacity 
          className="mt-4 bg-gray-700 px-4 py-2 rounded-lg"
          onPress={fetchTournaments}
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-800 p-4">
      {/* Debug Info - Only visible in development */}
      {__DEV__ && (
        <View className="bg-black/50 p-2 rounded-lg mb-4">
          <Text className="text-xs text-gray-400">Debug Info:</Text>
          <Text className="text-xs text-gray-400">User: {currentUser}</Text>
          <Text className="text-xs text-gray-400">Time: {currentDate}</Text>
          <Text className="text-xs text-gray-400">
            Tournaments Loaded: {tournaments.length}
          </Text>
        </View>
      )}

      {/* Header with User Info */}
      <View className="mb-6">
        <Text className="text-gray-400 text-sm">Welcome back,</Text>
        <Text className="text-white text-xl font-bold">{currentUser}</Text>
        <Text className="text-gray-400 text-xs mt-1">{currentDate} UTC</Text>
      </View>

      <Text className="text-2xl font-bold text-white mb-5">Select Tournament</Text>

      <FlatList
        data={tournaments}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-gray-700 p-4 rounded-lg mb-3 border border-gray-600"
            onPress={() => onTournamentSelect(item)}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-bold text-white">{item.name}</Text>
              <View className="bg-gray-600 px-2 py-1 rounded">
                <Text className="text-gray-300 text-xs">
                  {item.franchises.length} Teams
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between mt-2">
              <View>
                <Text className="text-gray-400 text-xs">Players per team</Text>
                <Text className="text-emerald-400 font-semibold">
                  {item.playerLimitPerTeam}
                </Text>
              </View>

              <View>
                <Text className="text-gray-400 text-xs">Registration Limit</Text>
                <Text className="text-emerald-400 font-semibold">
                  {item.registrationLimits}
                </Text>
              </View>
            </View>

            <View className="mt-3 pt-3 border-t border-gray-600">
              <Text className="text-gray-400 text-xs">
                Knockout: {formatDate(item.knockoutStart)}
              </Text>
              <Text className="text-gray-400 text-xs">
                Final: {formatDate(item.finalStart)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        className="flex-1"
      />
    </View>
  );
};

export default TournamentSelector;