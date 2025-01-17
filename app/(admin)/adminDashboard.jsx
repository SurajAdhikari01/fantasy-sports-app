import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const AdminDashboard = () => {
  const { signOut } = useAuth(); // Add this hook

  // Add logout handler
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              // AuthGuard will handle the redirect to login
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

      {/* Create Team Button */}
      <StyledView className="w-full items-center mt-4">
        <StyledTouchableOpacity
          className="w-full"
          onPress={() => router.push("(admin)/createTeamForm")}
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
              Create New Team
            </StyledText>
          </LinearGradient>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledSafeAreaView>
  );
};

export default AdminDashboard;
