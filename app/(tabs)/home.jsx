import React, { useState, useRef } from "react"; // Import useRef
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  FlatList,
  ScrollView,
  Modal,
  StyleSheet,
  Pressable,
} from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
// import { useNavigation } from "@react-navigation/native"; // Keep if needed
import MatchCard from "../components/MatchCard";
import { router } from "expo-router";
import UpcomingMatchCard from "../components/UpcomingMatchCard";
import { useAuth } from "../context/AuthContext";
import { Alert } from "react-native";

// --- (Keep existing code for Dimensions, matches, MatchesList, upcomingMatches, StatisticsCard) ---
const { width, height } = Dimensions.get("window");
const adjustedWidth = width * 0.9;
const adjustedHeight = height * 0.23;
// ... (matches, MatchesList, upcomingMatches, StatisticsCard definitions remain the same) ...
const matches = [
  {
    id: "1",
    sport: "football",
    team1: "Real Madrid",
    team2: "Chelsea Club",
    score: "2 - 0",
    status: "LIVE",
  },
  {
    id: "2",
    sport: "cricket",
    team1: "M. Indians",
    team2: "Raj. Royals",
    score: "123/7 - 67/2",
    status: "HOLD",
  },
  {
    id: "3",
    sport: "football",
    team1: "Barcelona",
    team2: "Juventus",
    score: "1 - 1",
    status: "LIVE",
  },
  {
    id: "4",
    sport: "football",
    team1: "PSG",
    team2: "Bayern",
    score: "0 - 0",
    status: "UPCOMING",
  },
];
const MatchesList = () => {
  // const navigation = useNavigation(); // Can remove if only using router

  const renderItem = ({ item }) => (
    <View className="mx-2">
      <MatchCard
        match={item}
        onPress={() => {
          // Navigate based on the sport type
          const routeName =
            item.sport === "football" ? "FootballDetail" : "CricketDetail";

          router.push({
            // Make sure your route structure matches this
            pathname: `/components/${routeName}/[id]`,
            params: { id: item.id }, // Pass the match id as a parameter
          });
        }}
      />
    </View>
  );

  return (
    <FlatList
      data={matches}
      horizontal
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 10 }}
    />
  );
};
const upcomingMatches = [
  {
    id: "4",
    sport: "football",
    team1: "PSG",
    team2: "Bayern",
    status: "UPCOMING",
  },
  {
    id: "6",
    sport: "cricket",
    team1: "Rajistan",
    team2: "Kathmandu",
    status: "UPCOMING",
  },
];

const StatisticsCard = ({ scoreEarned, gamesPlayed }) => (
  <View className="mt-6 items-center">
    <View className="relative">
      <View
        className={`absolute top-[${
          adjustedHeight * 0.3
        }px] right-0 p-8 z-10 pt-24 items-end`}
      >
        <Text className="text-white text-2xl">{gamesPlayed}</Text>
        <Text className="text-white mt-2">Games Played</Text>
      </View>

      <Svg
        height={adjustedHeight}
        width={adjustedWidth}
        viewBox={`0 0 ${adjustedWidth} ${adjustedHeight}`}
      >
        {/* Background Path */}
        <Path
          d={`
            M 0 ${adjustedHeight * 0.3}
            A 30, 30 0 0 1 ${adjustedWidth * 0.05}, ${adjustedHeight * 0.1}
            L ${adjustedWidth * 0.5} ${adjustedHeight * 0.3}
            L ${adjustedWidth * 0.9} ${adjustedHeight * 0.1}
            A 30,30 0 0 1 ${adjustedWidth}, ${adjustedHeight * 0.3}
            L ${adjustedWidth} ${adjustedHeight * 0.78}
            A 30, 30 0 0 1 ${adjustedWidth * 0.9}, ${adjustedHeight * 0.99}
            L ${adjustedWidth * 0.5} ${adjustedHeight * 0.9}
            L ${adjustedWidth * 0.09} ${adjustedHeight}
            A 30,30 0 0 1 0, ${adjustedHeight * 0.8}
            L 0 ${adjustedHeight * 0.3}
            Z
          `}
          fill="#1f1f1f"
          stroke="#ddd"
          strokeWidth="3"
          strokeDasharray="12, 8"
        />
      </Svg>

      <Svg
        height={adjustedHeight}
        width={adjustedWidth}
        viewBox={`0 0 ${adjustedWidth} ${adjustedHeight}`}
        style={{ position: "absolute", top: 0 }}
      >
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#ff416c" />
            <Stop offset="1" stopColor="#ff4b2b" />
          </LinearGradient>
        </Defs>
        <View className="absolute top-0 left-0 p-8">
          <Text className="text-white text-2xl">{scoreEarned}</Text>
          <Text className="text-white mt-2">Score Earned</Text>
        </View>

        <Path
          d={`
            M ${adjustedWidth * 0.1} 0
            A 20, 20 1 1 1 ${adjustedWidth * 0.07} 0
            L ${adjustedWidth * 0.6} 0
            A 20, 20 0 0 1 ${adjustedWidth * 0.65}, ${adjustedHeight * 0.15}
            L ${adjustedWidth * 0.58} ${adjustedHeight * 0.6}
            A 20, 20 0 0 1 ${adjustedWidth * 0.54}, ${adjustedHeight * 0.69}
            L ${adjustedWidth * 0.135} ${adjustedHeight * 0.81}
            A 30, 30 0 0 1 ${adjustedWidth * 0.038}, ${adjustedHeight * 0.7}
            L ${adjustedWidth * 0.03} ${adjustedHeight * 0.1}
            Z
          `}
          fill="url(#grad)"
        />
      </Svg>
    </View>
  </View>
);

const HomeScreen = () => {
  const { signOut, userData } = useAuth();
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [logoutConfirmModalVisible, setLogoutConfirmModalVisible] =
    useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 }); // State for position
  const profileImageRef = useRef(null); // Ref for the touchable opacity

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

  const handleMoreNavigation = () => {
    setOptionsModalVisible(false);
    router.push("/more"); // Ensure '/profile' route exists
  };

  // Function to measure the image position and show the modal
  const showOptionsMenu = () => {
    profileImageRef.current?.measure((fx, fy, w, h, px, py) => {
      // fx, fy: position relative to parent
      // w, h: width/height of element
      // px, py: position relative to screen
      const topOffset = py + h + 5; // Position below the image + 5px margin
      const rightOffset = width - (px + w); // Position aligned to the right edge

      setModalPosition({ top: topOffset, right: rightOffset });
      setOptionsModalVisible(true);
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#2a2a2a] gap-12">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="px-4">
          <View className="flex-row justify-between items-center ">
            <Text className="text-white font-semibold text-xl">
              Hi,{" "}
              {userData?.username
                ? `${
                    userData.username.charAt(0).toUpperCase() +
                    userData.username.slice(1).toLowerCase()
                  }`
                : "User"}
            </Text>

            {/* Attach ref and onPress handler to the TouchableOpacity */}
            <TouchableOpacity ref={profileImageRef} onPress={showOptionsMenu}>
              <Image
                source={{
                  uri:
                    userData?.profileUrl ||
                    "https://png.pngtree.com/png-vector/20220611/ourmid/pngtree-person-gray-photo-placeholder-man-silhouette-on-white-background-png-image_4826258.png",
                }}
                className="h-10 w-10 rounded-full"
              />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-400 text-sm">Welcome back</Text>
        </View>

        {/* Statistics Card */}
        <StatisticsCard
          scoreEarned={userData?.scoreEarned || "150"}
          gamesPlayed={userData?.gamesPlayed || "3"}
        />

        {/* Games Played and Stats */}
        <View className="flex-row justify-between items-center p-6 mt-4">
          <View className="bg-[#3a3a3a] p-4 rounded-lg flex-1 mr-2">
            <Text className="text-white text-lg">
              {userData?.ranking || "42"}
            </Text>
            <Text className="text-gray-400 text-sm">Ranking</Text>
          </View>
          <View className="bg-[#3a3a3a] p-4 rounded-lg flex-1 ml-2">
            <Text className="text-white text-lg">
              {userData?.matchesPlayed || "134"}
            </Text>
            <Text className="text-gray-400 text-sm">Matches</Text>
          </View>
        </View>

        {/* Ongoing Matches */}
        <View>
          <Text className="text-white text-lg font-semibold p-6">
            Ongoing Matches
          </Text>
          <MatchesList />
        </View>

        {/* Upcoming Matches */}
        <View>
          <Text className="text-white text-lg font-semibold p-6">
            Upcomings
          </Text>
          <View className="flex-col items-center pb-20">
            {upcomingMatches.map((match) => (
              <UpcomingMatchCard
                key={match.id}
                match={match}
                onPress={() => {
                  const routeName =
                    match.sport === "football"
                      ? "FootballDetail"
                      : "CricketDetail";
                  router.push({
                    pathname: `/components/${routeName}/[id]`,
                    params: { id: match.id },
                  });
                }}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Options Modal (Profile/Logout) - Positioned using state */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={optionsModalVisible}
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        {/* Pressable overlay to close modal */}
        <Pressable
          style={styles.modalOverlay} // Make overlay fill screen but allow touches through if needed, or handle close here
          onPress={() => setOptionsModalVisible(false)}
        >
          {/* Position the modal content absolutely */}
          <View
            style={[
              styles.optionsModalView,
              { top: modalPosition.top, right: modalPosition.right }, // Apply calculated position
            ]}
            // Prevent closing when tapping inside the modal itself
            onStartShouldSetResponder={() => true}
          >
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleMoreNavigation}
            >
              <Text style={styles.optionButtonText}>View More</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleLogout}
            >
              <Text style={[styles.optionButtonText, styles.logoutText]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

// Updated Styles
const styles = StyleSheet.create({
  // Overlay for the options modal (covers screen, allows absolute positioning)
  modalOverlay: {
    flex: 1,
    // backgroundColor: 'rgba(0, 0, 0, 0.3)', // Optional: dim background slightly
  },
  // Styles for Options Modal (now positioned absolutely)
  optionsModalView: {
    position: "absolute", // Key change for positioning
    backgroundColor: "#2d2d2d",
    borderRadius: 10, // Smaller radius for dropdown feel
    overflow: "hidden",
    width: 150, // Adjust width as needed
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  optionButtonText: {
    color: "white",
    fontSize: 15,
  },
  logoutText: {
    color: "#ff4b2b",
  },
  separator: {
    height: StyleSheet.hairlineWidth, // Thinner separator
    backgroundColor: "#555",
  },

  // Styles for Confirmation Modal (Centered)
  confirmModalOverlay: {
    // Separate overlay style for centered modal
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  confirmModalView: {
    margin: 20,
    backgroundColor: "#2d2d2d",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2,
    marginHorizontal: 10,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonCancel: {
    backgroundColor: "#555",
  },
  buttonLogout: {
    backgroundColor: "#ff4b2b",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
    color: "white",
    fontSize: 17,
  },
});

export default HomeScreen;
