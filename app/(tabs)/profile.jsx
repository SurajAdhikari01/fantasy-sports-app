import React from "react";
import { View, Text, TouchableOpacity, Alert, Linking } from "react-native"; // Added Linking
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
// import { router } from "expo-router"; // router is not used in this version
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext"; // Assuming path is correct

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

// Placeholder Contact Number - Replace with your actual number
const CONTACT_PHONE_NUMBER = "+977-9856000000"; // Use international format for Linking

const ProfileScreen = () => {
  const { signOut, userData } = useAuth(); // Get userData if needed, e.g., for username display

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
              // AuthGuard should handle redirect
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

  // Function to handle calling the contact number
  const handleContactPress = () => {
    const phoneNumberUrl = `tel:${CONTACT_PHONE_NUMBER}`;
    Linking.canOpenURL(phoneNumberUrl)
      .then((supported) => {
        if (!supported) {
          Alert.alert("Error", "Calling not supported on this device.");
        } else {
          return Linking.openURL(phoneNumberUrl);
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };

  return (
    // Use justify-between to push header to top and card to bottom
    <StyledSafeAreaView className="flex-1 bg-gray-900 p-4 justify-between">
      <StyledView className="w-full">
        <StyledView className="flex-row justify-between items-center mb-6">
          <StyledText className="text-white text-xl font-bold">
            {userData?.username
              ? `${
                  userData.username.charAt(0).toUpperCase() +
                  userData.username.slice(1).toLowerCase()
                }'s Dashboard`
              : "User Dashboard"}
          </StyledText>
          <StyledTouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center bg-red-600 px-3 py-2 rounded-lg shadow-md" // Slightly darker red, added shadow
          >
            <Ionicons name="log-out-outline" size={20} color="white" />
            <StyledText className="text-white font-semibold ml-1.5 text-sm">
              Logout
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>

      <StyledView className="mb-6">
        <LinearGradient
          colors={["#3b82f6", "#1e40af"]} // Example: Blue gradient
          start={{ x: 0, y: 0 }} // Gradient direction
          end={{ x: 1, y: 1 }}
          className="rounded-xl p-5 shadow-lg" // Rounded corners, padding, shadow
        >
          <StyledView className="flex-row items-center mb-3">
            <Ionicons name="trophy-outline" size={24} color="#fad607" />
            <StyledText className="text-white text-xl font-bold ml-2">
              Host Your Tournament!
            </StyledText>
          </StyledView>

          <StyledText className="text-indigo-100 text-base mb-4">
            Bring your fantasy league to life on our platform. Easy setup,
            powerful features.
          </StyledText>

          <StyledTouchableOpacity
            onPress={handleContactPress}
            className="bg-white/20 p-3 rounded-lg flex-row items-center justify-center shadow-sm" // Semi-transparent white button
          >
            <Ionicons name="call-outline" size={20} color="white" />
            <StyledText className="text-white font-semibold text-base ml-2">
              Contact Us: {CONTACT_PHONE_NUMBER.replace("+1", "")}
            </StyledText>
          </StyledTouchableOpacity>
        </LinearGradient>
      </StyledView>
    </StyledSafeAreaView>
  );
};

export default ProfileScreen;
