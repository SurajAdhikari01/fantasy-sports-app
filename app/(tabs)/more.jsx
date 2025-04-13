import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Removed styled import as we are using className directly
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";

// --- Configuration ---
const CONTACT_PHONE_NUMBER = "+9779856000000";
const WEBSITE_URL = "https://yourfantasysite.com";
const SHOP_URL = "https://yourfantasysite.com/shop";
const LOCATION_INFO = "Pokhara, Nepal";

// --- Helper Function for Menu Items ---
const MenuItem = ({ icon, label, onPress, isLast = false }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row items-center py-4 ${
      !isLast ? "border-b border-gray-700" : ""
    } active:bg-gray-700 rounded-md px-1`}
  >
    {/* Changed icon color to white */}
    <Ionicons name={icon} size={22} className="text-white mr-4" />
    <Text className="text-white px-2 text-base flex-1">{label}</Text>
    {/* Changed chevron color to white */}
    <Ionicons name="chevron-forward-outline" size={20} className="text-white" />
  </TouchableOpacity>
);

// --- Main Screen Component ---
const MoreScreen = () => {
  const { signOut, userData } = useAuth();

  // --- Handlers ---
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

  const handleUrlPress = async (url, errorMessage) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", errorMessage || `Cannot open URL: ${url}`);
    }
  };

  const handleContactPress = () => {
    handleUrlPress(
      `tel:${CONTACT_PHONE_NUMBER}`,
      "Calling not supported on this device."
    );
  };

  // --- Navigation ---
  const navigateToMyTournaments = () => {
    router.push("/myTournaments"); // Assuming this route exists
  };

  const navigateToLocation = () => {
    // For simplicity, showing an Alert. Could open a map URL.
    Alert.alert("Location", LOCATION_INFO);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900 pb-12">
      <ScrollView
        className="flex-1 px-5 pt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Screen Title */}
        <Text className="text-3xl font-bold text-white text-left mb-6">
          Settings & More
        </Text>

        {/* User Profile Card */}
        <View className="bg-gray-800 rounded-xl p-4 mb-6 shadow-lg flex-row items-center">
          <View className="w-14 h-14 rounded-full bg-blue-600 items-center justify-center mr-4">
            <Ionicons name="person-outline" size={30} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-lg font-semibold">
              {userData?.username || "Username"}
            </Text>
            <Text className="text-gray-400 text-sm">
              {userData?.email || "user@example.com"}
            </Text>
          </View>
        </View>

        {/* Host Tournament Card */}
        <View className="mb-6">
          <LinearGradient
            colors={["#3b82f6", "#1e40af"]} // Blue gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-xl p-5 shadow-lg"
          >
            <View className="flex-row items-center mb-3">
              {/* Changed trophy icon color to white */}
              <Ionicons name="trophy-outline" size={24} color="white" />
              <Text className="text-white text-xl font-bold ml-2">
                Host Your Tournament!
              </Text>
            </View>

            <Text className="text-indigo-100 text-base mb-4">
              Bring your fantasy league to life on our platform. Easy setup,
              powerful features.
            </Text>

            <TouchableOpacity
              onPress={handleContactPress}
              className="bg-white/20 p-3 rounded-lg flex-row items-center justify-center shadow-sm active:bg-white/30"
            >
              <Ionicons name="call-outline" size={20} color="white" />
              <Text className="text-white font-semibold text-base ml-2">
                Contact Us to Host
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Information Section */}
        <View className="bg-gray-800 rounded-xl p-4 mb-6 shadow-lg">
          <Text className="text-gray-400 text-sm font-semibold mb-2 uppercase">
            Information
          </Text>
          <MenuItem
            icon="map-outline"
            label={`Location: ${LOCATION_INFO}`}
            onPress={navigateToLocation}
          />
          <MenuItem
            icon="globe-outline"
            label="Visit Our Website"
            onPress={() =>
              handleUrlPress(WEBSITE_URL, "Could not open website.")
            }
          />
          {SHOP_URL && (
            <MenuItem
              icon="storefront-outline"
              label="Visit Our Shop"
              onPress={() => handleUrlPress(SHOP_URL, "Could not open shop.")}
              isLast={true}
            />
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center bg-red-600/90 px-4 py-3.5 rounded-lg shadow-md mt-4 active:bg-red-700"
        >
          <Ionicons name="log-out-outline" size={22} color="white" />
          <Text className="text-white font-semibold ml-2 text-base">
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MoreScreen;
