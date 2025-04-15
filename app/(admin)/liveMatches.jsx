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

// --- Date Helper Functions (UTC Comparison) ---

// Checks if a date string matches today's date (UTC)
const isSameUTCDate = (dateString) => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    const today = new Date();

    // Compare year, month, and day in UTC
    return (
      date.getUTCFullYear() === today.getUTCFullYear() &&
      date.getUTCMonth() === today.getUTCMonth() &&
      date.getUTCDate() === today.getUTCDate()
    );
  } catch (e) {
    console.error("Error parsing date in isSameUTCDate:", dateString, e);
    return false;
  }
};

// Checks if today's date is between startDateString (inclusive) and endDateString (exclusive) in UTC
const isDateBetweenUTC = (startDateString, endDateString) => {
  if (!startDateString || !endDateString) return false;
  try {
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    const today = new Date();

    // Set time to 00:00:00.000 UTC for accurate date comparison
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);
    today.setUTCHours(0, 0, 0, 0);

    return today >= startDate && today < endDate;
  } catch (e) {
    console.error(
      "Error parsing dates in isDateBetweenUTC:",
      startDateString,
      endDateString,
      e
    );
    return false;
  }
};
// --- End Date Helper Functions ---

export default function AdminTabsLayout() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const router = useRouter();

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true); // Start loading
      try {
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
        setTournaments([]);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchTournaments();
  }, []);

  // *** Corrected Filter Logic ***
  // Filter tournaments where today is:
  // 1. Between knockout start (inclusive) and semifinal start (exclusive) OR
  // 2. Between semifinal start (inclusive) and final start (exclusive) OR
  // 3. Exactly on the final start date
  const filteredTournaments = tournaments.filter((tournament) => {
    const isKnockoutOngoing = isDateBetweenUTC(
      tournament.knockoutStart,
      tournament.semifinalStart
    );
    const isSemifinalOngoing = isDateBetweenUTC(
      tournament.semifinalStart,
      tournament.finalStart
    );
    const isFinalToday = isSameUTCDate(tournament.finalStart);

    return isKnockoutOngoing || isSemifinalOngoing || isFinalToday;
  });

  // Function to determine the current stage text and style
  const getCurrentStageInfo = (tournament) => {
    const isKnockoutOngoing = isDateBetweenUTC(
      tournament.knockoutStart,
      tournament.semifinalStart
    );
    const isSemifinalOngoing = isDateBetweenUTC(
      tournament.semifinalStart,
      tournament.finalStart
    );
    const isFinalToday = isSameUTCDate(tournament.finalStart);

    if (isKnockoutOngoing) {
      return {
        text: "Knockout Stage Ongoing",
        style: "bg-blue-900/50 border-blue-700",
        icon: "flash-outline",
        iconColor: "#60a5fa",
        textColor: "text-blue-300",
      };
    }
    if (isSemifinalOngoing) {
      return {
        text: "Semifinal Stage Ongoing",
        style: "bg-yellow-900/50 border-yellow-700",
        icon: "star-half-outline",
        iconColor: "#fcd34d",
        textColor: "text-yellow-300",
      };
    }
    if (isFinalToday) {
      return {
        text: "Final Stage Is Today!",
        style: "bg-red-900/50 border-red-700",
        icon: "trophy-outline",
        iconColor: "#f87171",
        textColor: "text-red-300",
      };
    }
    return null; // Should not happen based on filter, but good practice
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-[#2a2a2a]">
      {/* --- Header --- */}
      <StyledView className="w-full flex-row justify-between items-center px-4 pt-4 pb-3 border-b border-gray-700/60">
        <StyledText className="text-white text-2xl font-bold">
          Ongoing Stages
        </StyledText>
      </StyledView>

      {/* --- Content Area --- */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {loading ? (
          <StyledView className="flex-1 justify-center items-center pt-20">
            <ActivityIndicator size="large" color="#9ca3af" />
            <StyledText className="text-gray-400 mt-3">
              Loading Matches...
            </StyledText>
          </StyledView>
        ) : filteredTournaments.length > 0 ? (
          filteredTournaments.map((tournament) => {
            const stageInfo = getCurrentStageInfo(tournament); // Get current stage info

            return (
              <StyledView
                key={tournament._id}
                className="mb-5 bg-[#3a3a3a] rounded-xl shadow-lg overflow-hidden mx-4"
              >
                <StyledView className="p-5">
                  {/* Tournament Name */}
                  <StyledText className="text-white text-xl font-semibold mb-4">
                    {tournament.name}
                  </StyledText>

                  {/* Highlight Today's Stage */}
                  {stageInfo && ( // Check if stageInfo is valid
                    <StyledView
                      className={`flex-row items-center p-2 rounded-md border mb-4 ${stageInfo.style}`}
                    >
                      <Ionicons
                        name={stageInfo.icon}
                        size={18}
                        color={stageInfo.iconColor}
                        style={styles.iconStyle}
                      />
                      <StyledText
                        className={`${stageInfo.textColor} font-medium text-base`}
                      >
                        {stageInfo.text}
                      </StyledText>
                    </StyledView>
                  )}

                  {/* Action Button */}
                  <StyledView className="mt-2 border-t border-gray-600/50 pt-4">
                    <StyledTouchableOpacity
                      className="bg-cyan-600 p-3 rounded-lg flex-row justify-center items-center shadow-md"
                      onPress={() =>
                        router.push({
                          pathname: "../adminComponents/addMatchDetails",
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
            );
          })
        ) : (
          <StyledView className="flex-1 justify-center items-center pt-20 px-6 opacity-70">
            <Ionicons name="calendar-outline" size={60} color="#6b7280" />
            <StyledText className="text-gray-500 text-lg text-center mt-4">
              No tournaments have active stages today.
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  iconStyle: {
    marginRight: 10,
  },
  buttonIconStyle: {
    marginRight: 8,
  },
});
