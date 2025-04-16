import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
  Modal,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import MatchResultsScreen from "../components/MatchResultsScreen";
import TournamentSelectionModal from "../components/TournamentSelectionModal";

import backgroundImage from "../../assets/footballbg.jpg";

const WelcomeScreen = () => {
  const [isMatchResultsVisible, setIsMatchResultsVisible] = useState(false);
  const [isTournamentModalVisible, setIsTournamentModalVisible] =
    useState(false);

  const [selectedTournament, setSelectedTournament] = useState(null); // { id: '...', name: '...' }

  const handleNavigation = (path) => {
    router.push(path);
  };

  const features = [
    {
      title: "Explore Leagues",
      subtitle: "Find & join competitions",
      iconName: "tournament",
      iconComponent: MaterialCommunityIcons,
      gradient: ["#6a11cb", "#2575fc"],
    },
    {
      title: "View Matches",
      subtitle: "Check upcoming games",
      iconName: "calendar-clear-outline",
      iconComponent: Ionicons,
      gradient: ["#00c6ff", "#0072ff"],
    },
    {
      title: "Manage Squad",
      subtitle: "Edit your fantasy teams",
      iconName: "shield-checkmark-outline",
      iconComponent: Ionicons,
      gradient: ["#11998e", "#38ef7d"],
    },
    {
      title: "How to Play",
      subtitle: "Learn the game rules",
      iconName: "book-outline",
      iconComponent: Ionicons,
      gradient: ["#ff5f6d", "#ffc371"],
    },
  ];

  // --- Handlers ---
  const handleTrophyPress = () => {
    setIsTournamentModalVisible(true);
  };

  // This function receives the selected tournament object from the modal's callback
  const handleSelectTournament = (tournamentData) => {
    // Ensure the data from the modal is valid
    if (tournamentData && tournamentData._id && tournamentData.name) {
      //console.log("Selected Tournament:", tournamentData._id);

      setSelectedTournament({
        id: tournamentData._id,
        name: tournamentData.name,
      });
      setIsTournamentModalVisible(false); // Close selection modal
      setIsMatchResultsVisible(true); // Open results modal
    } else {
      console.error(
        "Invalid tournament data received from modal:",
        tournamentData
      );
      Alert.alert(
        "Error",
        "Could not select tournament. Invalid data received."
      );
      setIsTournamentModalVisible(false); // Still close the modal
    }
  };

  const handleCloseMatchResults = () => {
    setIsMatchResultsVisible(false);
    setSelectedTournament(null); // Clear selection when closing results
  };

  return (
    <ImageBackground
      source={backgroundImage}
      className="flex-1"
      imageClassName="opacity-15"
      resizeMode="cover"
    >
      <View className="flex-1 bg-black/75">
        <SafeAreaView className="flex-1 bg-transparent">
          {/* Trophy Icon */}
          <TouchableOpacity
            className="absolute top-20 right-5 z-10 p-2 bg-white/40 rounded-full ios:shadow-sm android:elevation-4"
            onPress={handleTrophyPress}
          >
            <Ionicons name="trophy" size={26} color="#FFD700" />
          </TouchableOpacity>

          {/* Main Content */}
          <View className="flex-1 justify-around px-5 pt-12 pb-5">
            {/* Welcome Message */}
            <View className="items-center">
              <Text className="text-3xl font-bold text-white mb-2 text-center tracking-wide">
                Welcome, Player!
              </Text>
              <Text className="text-lg text-gray-300 text-center max-w-[90%] leading-relaxed">
                Your ultimate fantasy sports journey begins now.
              </Text>
            </View>

            {/* Feature Cards */}
            <View>
              <Text className="text-xl font-semibold text-gray-200 text-center mb-5">
                Discover What's Inside
              </Text>
              <View className="flex-row flex-wrap justify-between">
                {features.map((feature, index) => {
                  const IconComponent = feature.iconComponent;
                  return (
                    <View
                      key={index}
                      className="w-[48%] mb-4 rounded-2xl overflow-hidden ios:shadow-lg android:elevation-8"
                    >
                      <LinearGradient
                        colors={feature.gradient}
                        className="p-4 items-center justify-center min-h-[130px]"
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <IconComponent
                          name={feature.iconName}
                          size={28}
                          color="#fff"
                          style={{ marginBottom: 10 }}
                        />
                        <Text className="text-sm font-bold text-white text-center mb-1">
                          {feature.title}
                        </Text>
                        <Text className="text-xs text-gray-200 text-center leading-snug">
                          {feature.subtitle}
                        </Text>
                      </LinearGradient>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Login/Signup Buttons */}
            <View className="px-2">
              <TouchableOpacity onPress={() => handleNavigation("/signin")}>
                <LinearGradient
                  colors={["#8E2DE2", "#4A00E0"]}
                  className="flex-row justify-center items-center rounded-full py-3.5 px-5 mb-3 ios:shadow-md android:elevation-6"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons
                    name="log-in-outline"
                    size={20}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-white text-base font-semibold">
                    Login
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row justify-center items-center rounded-full py-3.5 px-5 border-2 border-[#03DAC6] bg-transparent ios:shadow-md android:elevation-6"
                onPress={() => handleNavigation("/signup")}
              >
                <Ionicons
                  name="person-add-outline"
                  size={20}
                  color="#03DAC6"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-[#03DAC6] text-base font-semibold">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {selectedTournament && (
        <Modal
          visible={isMatchResultsVisible}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={handleCloseMatchResults}
        >
          <MatchResultsScreen
            selectedTournament={selectedTournament}
            onClose={handleCloseMatchResults}
          />
        </Modal>
      )}

      <TournamentSelectionModal
        visible={isTournamentModalVisible}
        onClose={() => setIsTournamentModalVisible(false)}
        onTournamentSelect={handleSelectTournament}
        selectedTournament={selectedTournament} // Pass the selected tournament to the modal
      />
    </ImageBackground>
  );
};

export default WelcomeScreen;
