import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext"; // Assuming path is correct
import api from "../config/axios"; // Assuming path is correct
// CustomDropdown is no longer needed here
// import CustomDropdown from "../components/CustomDropdown";

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  // No longer need selectedTournamentId state

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      try {
        // Assuming this endpoint gets tournaments created by the logged-in admin user
        const response = await api.get(
          "tournaments/getTournamentsByUserIdAdmin"
        );
        if (response.data && Array.isArray(response.data.data)) {
          setTournaments(response.data.data);
        } else {
          console.warn(
            "No tournament data received or data is not an array:",
            response.data
          );
          setTournaments([]);
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        // Show alert only on fetch error, not during normal operation
        Alert.alert(
          "Fetch Error",
          "Failed to load tournaments. Please try again later."
        );
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []); // Empty dependency array ensures this runs once on mount

  const handleLogout = () => {
    Alert.alert(
      "Logout Confirmation",
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
              Alert.alert(
                "Logout Error",
                "Failed to logout. Please try again."
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-[#2a2a2a]">
      {/* --- Header --- */}
      <StyledView className="w-full flex-row justify-between items-center px-4 mt-2 pb-4 border-b border-gray-700/60">
        <StyledText className="text-white text-2xl font-bold ">
          Admin Dashboard
        </StyledText>
        <StyledTouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center bg-red-600/90 px-3 py-1.5 rounded-lg shadow"
        >
          <Ionicons name="log-out-outline" size={18} color="white" />
          <StyledText className="text-white py-1 mx-1 font-semibold ml-1.5 text-sm">
            Logout
          </StyledText>
        </StyledTouchableOpacity>
      </StyledView>

      {/* --- Scrollable Content --- */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* --- Create Tournament Button --- */}
        <StyledView className="w-full items-center my-5 ">
          <LinearGradient
            colors={["#3b82f6", "#1e40af"]} // Blue gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-xl p-5 shadow-lg"
          >
            <StyledTouchableOpacity
              className="w-full rounded-xl shadow-lg flex-row py-4 px-10"
              onPress={() => router.push("../adminComponents/createTeamForm")} // Ensure path is correct
            >
              <Ionicons
                name="add-circle"
                size={24}
                color="white"
                style={{ marginRight: 10 }}
              />
              <StyledText className="text-white text-lg font-bold">
                Create New Tournament
              </StyledText>
            </StyledTouchableOpacity>
          </LinearGradient>
        </StyledView>

        {/* --- Section Title for Tournament List --- */}
        <StyledView className="px-4 mb-3">
          <StyledText className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
            Your Tournaments
          </StyledText>
        </StyledView>

        {/* --- Tournament List --- */}
        {loading ? (
          // Centered Loading Indicator
          <StyledView className="flex-1 justify-center items-center pt-10">
            <ActivityIndicator size="large" color="#9ca3af" />
            <StyledText className="text-gray-400 mt-2">
              Loading Tournaments...
            </StyledText>
          </StyledView>
        ) : tournaments.length > 0 ? (
          // Map over tournaments and render a card for each
          tournaments.map((tournament) => (
            <StyledView
              key={tournament._id}
              className="mb-5 bg-[#3a3a3a] rounded-xl shadow-lg overflow-hidden mx-4" // Added horizontal margin
            >
              {/* Card Body */}
              <StyledView className="p-5">
                {/* Tournament Name */}
                <StyledText className="text-white text-xl font-bold mb-3">
                  {tournament.name}
                </StyledText>

                {/* Details Section */}
                <StyledView className="mb-4 space-y-2">
                  {tournament.rules && (
                    <StyledView className="flex-row items-start">
                      <MaterialCommunityIcons
                        name="clipboard-text-outline"
                        size={18}
                        color="#a0aec0"
                        style={styles.iconStyle}
                      />
                      <StyledText className="text-gray-300 text-base flex-1">
                        {tournament.rules}
                      </StyledText>
                    </StyledView>
                  )}
                  <StyledView className="flex-row items-center">
                    <Ionicons
                      name="people-outline"
                      size={18}
                      color="#a0aec0"
                      style={styles.iconStyle}
                    />
                    <StyledText className="text-gray-300 text-base">
                      {tournament.playerLimitPerTeam} Players / Team
                    </StyledText>
                  </StyledView>
                  {/* Dates */}
                  <StyledView className="flex-row items-center pt-1">
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color="#a0aec0"
                      style={styles.iconStyle}
                    />
                    <StyledText className="text-gray-400 text-sm">
                      Knockout: {formatDate(tournament.knockoutStart)} | Semis:{" "}
                      {formatDate(tournament.semifinalStart)} | Final:{" "}
                      {formatDate(tournament.finalStart)}
                    </StyledText>
                  </StyledView>
                </StyledView>

                {/* Action Buttons Section */}
                <StyledView className="mt-3 space-y-3 border-t border-gray-600/50 pt-4">
                  <StyledTouchableOpacity
                    className="bg-green-600 p-3 rounded-lg flex-row justify-center items-center shadow"
                    onPress={() => {
                      // Pass the specific tournament from the map iteration
                      router.push({
                        pathname: "../adminComponents/addPlayerForm",
                        params: { tournament: JSON.stringify(tournament) },
                      });
                    }}
                  >
                    <Ionicons
                      name="person-add-outline"
                      size={20}
                      color="white"
                      style={styles.buttonIconStyle}
                    />
                    <StyledText className="text-white text-center font-bold text-base">
                      Add Players
                    </StyledText>
                  </StyledTouchableOpacity>
                  <StyledTouchableOpacity
                    className="bg-blue-600 p-3 rounded-lg flex-row justify-center items-center shadow"
                    onPress={() => {
                      // Pass the specific tournament from the map iteration
                      router.push({
                        pathname: "../adminComponents/CreateFixtureScreen",
                        params: { tournament: JSON.stringify(tournament) },
                      });
                    }}
                  >
                    <Ionicons
                      name="add-outline"
                      size={20}
                      color="white"
                      style={styles.buttonIconStyle}
                    />
                    <StyledText className="text-white text-center font-bold text-base">
                      Add Upcoming Match
                    </StyledText>
                  </StyledTouchableOpacity>
                </StyledView>
              </StyledView>
            </StyledView>
          ))
        ) : (
          // No Tournaments Created State
          <StyledView className="items-center justify-center pt-10 opacity-70 px-4">
            <Ionicons
              name="file-tray-stacked-outline"
              size={50}
              color="#6b7280"
            />
            <StyledText className="text-gray-500 text-center mt-3 text-base">
              You haven't created any tournaments yet. Tap the button above to
              get started.
            </StyledText>
          </StyledView>
        )}
      </ScrollView>
    </StyledSafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingBottom: 50, // Ensure ample space at the bottom
  },
  iconStyle: {
    marginRight: 10, // Consistent margin for icons in details
    marginTop: 2, // Fine-tune vertical alignment
  },
  buttonIconStyle: {
    marginRight: 8, // Icon margin for buttons
  },
});

export default AdminDashboard;
