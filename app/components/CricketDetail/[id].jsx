import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // For the back arrow icon
import { BlurView } from "expo-blur"; // Import BlurView
import { LineChart } from "react-native-chart-kit"; // For charts

const simulateLiveScoreUpdate = (initialScore) => {
  // Simulates score updates
  const randomScoreChange = Math.floor(Math.random() * 10); // Random score change
  const newScore = `${
    parseInt(initialScore.split("/")[0]) + randomScoreChange
  }/${initialScore.split("/")[1]}`; // Update score
  return newScore;
};

const CricketDetail = () => {
  const { id } = useLocalSearchParams(); // Extract the id from the dynamic route
  const router = useRouter();

  console.log(id);

  // Mock data for demonstration
  const initialData = {
    team1: "Team A",
    team2: "Team B",
    score: "150/7",
    status: "LIVE",
  };

  // State to hold match data
  const [matchData, setMatchData] = useState(initialData);
  const [playerStats, setPlayerStats] = useState([]);
  const [matchEvents, setMatchEvents] = useState([]);

  useEffect(() => {
    // Simulate live score updates every 5 seconds
    const intervalId = setInterval(() => {
      setMatchData((prevData) => ({
        ...prevData,
        score: simulateLiveScoreUpdate(prevData.score),
      }));
    }, 5000); // Update every 5 seconds

    // Mock player statistics and match events
    setPlayerStats([
      { name: "Player A", runs: 50, balls: 30 },
      { name: "Player B", runs: 30, balls: 25 },
    ]);
    setMatchEvents(["Player A scored a boundary!", "Player B was bowled out!"]);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Custom Navigation Bar with Blur and Transparency */}
      <BlurView intensity={50} tint="dark" style={{ padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "rgba(0, 0, 0, 0)", // Semi-transparent background
            padding: 0,
            borderRadius: 12, // Rounded corners
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
            Cricket Match Details
          </Text>
          {/* Placeholder for alignment */}
          <View style={{ width: 24 }} />
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <LinearGradient
          colors={["#ff416c", "#ff4b2b"]}
          start={[0, 0]}
          end={[1, 1]}
          className="p-6 rounded-b-3xl"
        >
          <Text className="text-white text-3xl font-bold text-center mb-4">
            Cricket Match
          </Text>
          <Text className="text-gray-200 text-lg text-center">
            {matchData.team1} vs {matchData.team2}
          </Text>
        </LinearGradient>

        {/* Match Details Section */}
        <View className="bg-gray-800 mt-6 mx-4 rounded-lg p-6">
          <View className="mb-4">
            <Text className="text-gray-400 text-base">Score:</Text>
            <Text className="text-white text-2xl font-bold">
              {matchData.score}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-400 text-base">Status:</Text>
            <Text
              className={`text-lg font-semibold ${
                matchData.status === "LIVE"
                  ? "text-green-400"
                  : matchData.status === "UPCOMING"
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {matchData.status}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-400 text-base">Sport:</Text>
            <Text className="text-white text-lg">Cricket</Text>
          </View>
        </View>

        {/* Teams Logos */}
        <View className="flex-row justify-center space-x-4 mt-6">
          <Image
            source={{
              uri: "https://example.com/cricket-team-logo1.png",
            }}
            className="h-24 w-24 rounded-full border-4 border-gray-700"
          />
          <Image
            source={{
              uri: "https://example.com/cricket-team-logo2.png",
            }}
            className="h-24 w-24 rounded-full border-4 border-gray-700"
          />
        </View>

        {/* Match Statistics */}
        <View className="bg-gray-800 mt-8 mx-4 rounded-lg p-6">
          <Text className="text-white text-xl font-semibold mb-4">
            Match Statistics
          </Text>
          <View className="flex-row justify-between mb-4">
            <Text className="text-gray-400">Total Overs:</Text>
            <Text className="text-white">20</Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text className="text-gray-400">Wickets:</Text>
            <Text className="text-white">7 / 2</Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text className="text-gray-400">Extras:</Text>
            <Text className="text-white">12</Text>
          </View>
        </View>

        {/* Player Statistics Section */}
        <View className="bg-gray-800 mt-6 mx-4 rounded-lg p-6">
          <Text className="text-white text-xl font-semibold mb-4">
            Player Statistics
          </Text>
          {playerStats.map((player) => (
            <View key={player.name} className="flex-row justify-between mb-2">
              <Text className="text-gray-400">{player.name}:</Text>
              <Text className="text-white">
                {player.runs} ({player.balls} balls)
              </Text>
            </View>
          ))}
        </View>

        {/* Match Events Section */}
        <View className="bg-gray-800 mt-6 mx-4 rounded-lg p-6">
          <Text className="text-white text-xl font-semibold mb-4">
            Match Events
          </Text>
          {matchEvents.map((event, index) => (
            <Text key={index} className="text-gray-400 mb-2">
              {event}
            </Text>
          ))}
        </View>

        {/* Scoring Pattern Chart */}
        <View className="bg-gray-800 mt-6 mx-4 rounded-lg p-6">
          <Text className="text-white text-xl font-semibold mb-4">
            Scoring Pattern
          </Text>
          <LineChart
            data={{
              labels: [
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "10",
                "11",
                "12",
                "13",
                "14",
                "15",
                "16",
                "17",
                "18",
                "19",
                "20",
              ],
              datasets: [
                {
                  data: [
                    0, 20, 30, 50, 60, 80, 90, 110, 120, 130, 140, 150, 160,
                    170, 180, 190, 200, 210, 220, 230,
                  ],
                },
              ],
            }}
            width={Dimensions.get("window").width - 82} // from react-native
            height={220}
            chartConfig={{
              backgroundColor: "#1E2923",
              backgroundGradientFrom: "#1E2923",
              backgroundGradientTo: "#08130D",
              decimalPlaces: 0, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CricketDetail;
