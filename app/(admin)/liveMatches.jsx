import React, { useState, useEffect } from "react";
import {
  ScrollView,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator, // Import ActivityIndicator
  StyleSheet,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"; // Import icons
import { styled } from "nativewind";
import api from "../config/axios"; // Assuming path is correct
import { useRouter } from "expo-router";

// Styling container with NativeWind
const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function AdminTabsLayout() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const router = useRouter();

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true); // Start loading
      try {
        // Assuming the endpoint fetches tournaments relevant to the admin user
        const response = await api.get(
          "tournaments/getTournamentsByUserIdAdmin"
        );
        if (response.data && Array.isArray(response.data.data)) {
          // Check if data is an array
          setTournaments(response.data.data);
        } else {
          console.warn(
            "No tournament data received or data is not an array:",
            response.data
          );
          setTournaments([]); // Set to empty array if data is invalid
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        // Avoid disruptive alerts, rely on UI state
        // Alert.alert("Error", "Failed to fetch tournaments. Please try again.");
        setTournaments([]); // Set to empty array on error
      } finally {
        setLoading(false); // Stop loading regardless of success/failure
      }
    };

    fetchTournaments();
  }, []); // Empty dependency array ensures fetch runs once on mount

  // Helper function to check if a date string matches today's date (UTC comparison)
  const isCurrentDate = (dateString) => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      const today = new Date();

      // Compare year, month, and day in UTC to avoid timezone issues
      return (
        date.getUTCFullYear() === today.getUTCFullYear() &&
        date.getUTCMonth() === today.getUTCMonth() &&
        date.getUTCDate() === today.getUTCDate()
      );
    } catch (e) {
      console.error("Error parsing date in isCurrentDate:", dateString, e);
      return false;
    }
  };

  // *** Corrected Filter Logic ***
  // Filter tournaments where today is the knockout OR semifinal OR final start date
  const filteredTournaments = tournaments.filter(
    (tournament) =>
      isCurrentDate(tournament.knockoutStart) ||
      isCurrentDate(tournament.semifinalStart) ||
      isCurrentDate(tournament.finalStart)
  );

  return (
    // Use the consistent background color
    <StyledSafeAreaView className="flex-1 bg-[#2a2a2a]">
      {/* --- Header --- */}
      <StyledView className="w-full flex-row justify-between items-center px-4 pt-4 pb-3 border-b border-gray-700/60">
        <StyledText className="text-white text-2xl font-bold">
          Today's Matches
        </StyledText>
        {/* Optional: Add a refresh button or info icon */}
        {/* <TouchableOpacity onPress={fetchTournaments}>
            <Ionicons name="refresh-outline" size={24} color="white" />
        </TouchableOpacity> */}
      </StyledView>

      {/* --- Content Area --- */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {loading ? (
          // Loading Indicator
          <StyledView className="flex-1 justify-center items-center pt-20">
            <ActivityIndicator size="large" color="#9ca3af" />
            <StyledText className="text-gray-400 mt-3">
              Loading Matches...
            </StyledText>
          </StyledView>
        ) : filteredTournaments.length > 0 ? (
          // Tournament Cards List
          filteredTournaments.map((tournament) => (
            <StyledView
              key={tournament._id}
              className="mb-5 bg-[#3a3a3a] rounded-xl shadow-lg overflow-hidden mx-4" // Consistent card styling
            >
              <StyledView className="p-5">
                {/* Tournament Name */}
                <StyledText className="text-white text-xl font-semibold mb-4">
                  {tournament.name}
                </StyledText>

                {/* Highlight Today's Stage(s) */}
                <StyledView className="mb-4 space-y-1.5">
                  {isCurrentDate(tournament.knockoutStart) && (
                    <StyledView className="flex-row items-center bg-blue-900/50 p-2 rounded-md border border-blue-700">
                      <Ionicons
                        name="flash-outline"
                        size={18}
                        color="#60a5fa"
                        style={styles.iconStyle}
                      />
                      <StyledText className="text-blue-300 font-medium text-base">
                        Knockout Stage Is Today!
                      </StyledText>
                    </StyledView>
                  )}
                  {isCurrentDate(tournament.semifinalStart) && (
                    <StyledView className="flex-row items-center bg-yellow-900/50 p-2 rounded-md border border-yellow-700">
                      <Ionicons
                        name="star-half-outline"
                        size={18}
                        color="#fcd34d"
                        style={styles.iconStyle}
                      />
                      <StyledText className="text-yellow-300 font-medium text-base">
                        Semifinal Stage Is Today!
                      </StyledText>
                    </StyledView>
                  )}
                  {isCurrentDate(tournament.finalStart) && (
                    <StyledView className="flex-row items-center bg-red-900/50 p-2 rounded-md border border-red-700">
                      <Ionicons
                        name="trophy-outline"
                        size={18}
                        color="#f87171"
                        style={styles.iconStyle}
                      />
                      <StyledText className="text-red-300 font-medium text-base">
                        Final Stage Is Today!
                      </StyledText>
                    </StyledView>
                  )}
                </StyledView>

                {/* Other Details (Optional - can be hidden if too much info) */}
                {/* <StyledView className="mb-4 space-y-2 opacity-80">
                     {tournament.rules && (
                        <StyledView className="flex-row items-start">
                            <MaterialCommunityIcons name="clipboard-text-outline" size={16} color="#a0aec0" style={styles.iconStyle} />
                            <StyledText className="text-gray-300 text-sm flex-1">
                                {tournament.rules}
                            </StyledText>
                        </StyledView>
                    )}
                    <StyledView className="flex-row items-center">
                        <Ionicons name="people-outline" size={16} color="#a0aec0" style={styles.iconStyle} />
                        <StyledText className="text-gray-300 text-sm">
                            {tournament.playerLimitPerTeam} Players / Team
                        </StyledText>
                    </StyledView>
                 </StyledView> */}

                {/* Action Button */}
                <StyledView className="mt-2 border-t border-gray-600/50 pt-4">
                  <StyledTouchableOpacity
                    className="bg-cyan-600 p-3 rounded-lg flex-row justify-center items-center shadow-md" // Consistent button style
                    onPress={() =>
                      router.push({
                        pathname: "../adminComponents/addMatchDetails", // Ensure path is correct
                        params: {
                          tournament: JSON.stringify(tournament),
                        },
                      })
                    }
                  >
                    <Ionicons
                      name="football-outline"
                      size={20}
                      color="white"
                      style={styles.buttonIconStyle}
                    />
                    <StyledText className="text-white text-center font-bold text-base">
                      Add Match Results
                    </StyledText>
                  </StyledTouchableOpacity>
                </StyledView>
              </StyledView>
            </StyledView>
          ))
        ) : (
          // Empty State Message
          <StyledView className="flex-1 justify-center items-center pt-20 px-6 opacity-70">
            <Ionicons name="calendar-outline" size={60} color="#6b7280" />
            <StyledText className="text-gray-500 text-lg text-center mt-4">
              No tournaments have matches scheduled for today.
            </StyledText>
          </StyledView>
        )}
      </ScrollView>
    </StyledSafeAreaView>
  );
}

// Add StyleSheet for consistent spacing and icon styles
const styles = StyleSheet.create({
  scrollViewContent: {
    paddingTop: 20, // Add padding to the top of the scroll view content
    paddingBottom: 40, // Add padding to the bottom
  },
  iconStyle: {
    marginRight: 10, // Consistent margin for icons
  },
  buttonIconStyle: {
    marginRight: 8, // Icon margin for buttons
  },
});
