import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import api from "../config/axios";

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await api.get("tournaments/getTournamentsByUserId");
        console.log("Fetched tournaments:", response.data);
        if (response.data && response.data.message) {
          setTournaments(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        Alert.alert("Error", "Failed to fetch tournaments. Please try again.");
      }
    };

    fetchTournaments();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-gray-900 p-4">
      {/* Header with Logout Button */}
      <StyledView className="w-full flex-row justify-between items-center mb-6">
        <StyledText className="text-white text-xl font-bold">
          Admin Dashboard
        </StyledText>
        <StyledTouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center bg-red-500 px-4 py-2 rounded-lg"
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <StyledText className="text-white font-bold ml-2">Logout</StyledText>
        </StyledTouchableOpacity>
      </StyledView>
      <ScrollView className="mt-6">
        {/* Create Team Button */}
        <StyledView className="w-full items-center mt-4 mb-8">
          <StyledTouchableOpacity
            className="w-full"
            onPress={() => router.push("../adminComponents/createTeamForm")}
          >
            <LinearGradient
              colors={["#ff9a9e", "#fad0c4", "#fad0c4", "#ff9a9e"]}
              start={[0, 0]}
              end={[1, 1]}
              style={{
                width: "100%",
                paddingVertical: 24,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 5,
              }}
            >
              <Ionicons
                name="add"
                size={24}
                color="black"
                style={{
                  borderWidth: 3,
                  borderColor: "black",
                  borderRadius: 4,
                  padding: 0,
                  marginRight: 8,
                  backgroundColor: "white",
                }}
              />
              <StyledText className="text-black text-lg font-extrabold">
                Create New Tournament
              </StyledText>
            </LinearGradient>
          </StyledTouchableOpacity>
        </StyledView>

        {/* Tournament Cards */}

        {tournaments.map((tournament) => (
          <StyledView
            key={tournament._id}
            className="mb-4 p-4 bg-gray-800 rounded-lg"
          >
            <StyledText className="text-white text-lg font-bold">
              {tournament.name}
            </StyledText>
            <StyledText className="text-white">
              Rules: {tournament.rules}
            </StyledText>
            <StyledText className="text-white">
              Player Limit Per Team: {tournament.playerLimitPerTeam}
            </StyledText>
            <StyledText className="text-white">
              Knockout Start:{" "}
              {new Date(tournament.knockoutStart).toLocaleDateString()}
            </StyledText>
            <StyledText className="text-white">
              Semifinal Start:{" "}
              {new Date(tournament.semifinalStart).toLocaleDateString()}
            </StyledText>
            <StyledText className="text-white">
              Final Start:{" "}
              {new Date(tournament.finalStart).toLocaleDateString()}
            </StyledText>
            <StyledTouchableOpacity
              className="mt-2 bg-blue-500 p-2 rounded-lg"
              onPress={() =>
                router.push(
                  {
                    pathname: "../adminComponents/addPlayerForm",
                    params: {
                      tournament: JSON.stringify(tournament),
                    },
                  },
                  console.log("Add Player clicked", tournament)
                )
              }
            >
              <StyledText className="text-white text-center">
                Add Player
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        ))}
      </ScrollView>
    </StyledSafeAreaView>
  );
};

export default AdminDashboard;
