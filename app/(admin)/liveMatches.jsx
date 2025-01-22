import React, { useState, useEffect } from "react";
import {
  ScrollView,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "nativewind";
import api from "../config/axios";
import { useRouter } from "expo-router";

// Styling container with NativeWind
const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function AdminTabsLayout() {
  const [tournaments, setTournaments] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await api.get("tournaments/getTournamentsByUserId");
        if (response.data && response.data.message) {
          setTournaments(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        Alert.alert("Error", "Failed to fetch tournaments. Please try again.");
      }
    };

    fetchTournaments();
  }, []);

  const isCurrentDate = (date) => {
    const givenDate = new Date(date).toDateString();
    const currentDate = new Date().toDateString();
    return givenDate === currentDate;
  };

  const filteredTournaments = tournaments.filter(
    (tournament) =>
      !isCurrentDate(tournament.knockoutStart) ||
      isCurrentDate(tournament.semifinalStart) ||
      isCurrentDate(tournament.finalStart)
  );

  return (
    <StyledSafeAreaView className="flex-1 bg-gray-900 p-4">
      {/* Header */}
      <StyledView className="w-full flex-row justify-between items-center mb-6">
        <StyledText className="text-white text-xl font-bold px-4 pt-4">
          Today's Matches
        </StyledText>
      </StyledView>
      <ScrollView className="mt-6">
        {/* Tournament Cards */}
        {filteredTournaments.map((tournament) => (
          <StyledView
            key={tournament._id}
            className="mb-4 p-6 bg-gray-800 rounded-lg"
            style={{ marginHorizontal: 16 }}
          >
            <StyledText className="text-white text-lg font-bold mb-2">
              {tournament.name}
            </StyledText>
            <StyledText className="text-white mb-1">
              Rules: {tournament.rules}
            </StyledText>
            <StyledText className="text-white mb-1">
              Player Limit Per Team: {tournament.playerLimitPerTeam}
            </StyledText>
            <StyledText className="text-white mb-1">
              Knockout Start:{" "}
              {new Date(tournament.knockoutStart).toLocaleDateString()}
            </StyledText>
            <StyledText className="text-white mb-1">
              Semifinal Start:{" "}
              {new Date(tournament.semifinalStart).toLocaleDateString()}
            </StyledText>
            <StyledText className="text-white mb-2">
              Final Start:{" "}
              {new Date(tournament.finalStart).toLocaleDateString()}
            </StyledText>
            <StyledTouchableOpacity
              className="mt-2 bg-green-500 p-3 rounded-lg"
              onPress={() =>
                router.push({
                  pathname: "../adminComponents/addMatchDetails",
                  params: {
                    tournament: JSON.stringify(tournament),
                  },
                })
              }
            >
              <StyledText className="text-white text-center font-bold">
                Add Match Details
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        ))}
      </ScrollView>
    </StyledSafeAreaView>
  );
}
