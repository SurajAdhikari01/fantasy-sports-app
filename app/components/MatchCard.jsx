import React from "react";
import { TouchableOpacity, View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // Use expo-linear-gradient
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons

import cricketBg from "../../assets/cricketbg.png"; // Ensure this path is correct
import footballBg from "../../assets/footballbg.jpg"; // Ensure this path is correct

const StyledGradient = styled(LinearGradient);

const MatchCard = ({ match, onPress }) => {
  const backgroundImg = match.sport === "football" ? footballBg : cricketBg;
  const sportIcon = match.sport === "football" ? "football" : "cricket-sharp";
  const matchDateTime = match.matchDate ? new Date(match.matchDate) : null;
  const formattedDate = matchDateTime
    ? matchDateTime.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "Date TBD";
  const formattedTime = matchDateTime
    ? matchDateTime.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "Time TBD";

  return (
    <TouchableOpacity onPress={onPress} style={styles.cardContainer}>
      <StyledGradient
        colors={["#ff416c", "#ff4b2b"]} // Gradient colors
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="rounded-xl p-4 mx-2 h-44 w-60 justify-between"
      >
        {/* Background Image */}
        <Image
          source={backgroundImg}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        {/* Content Overlay */}
        <View style={styles.overlay}>
          {/* Top Row: Status and Sport Icon */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white text-xs bg-black/40 px-2 py-1 rounded-full font-semibold shadow-sm">
              <View className="flex-row items-center ">
                <Ionicons
                  name="time-outline"
                  size={14}
                  color="white"
                  style={{ marginRight: 4 }}
                />
                <Text className="text-white text-xs font-medium">
                  {formattedTime}
                </Text>
              </View>
            </Text>
            <Ionicons name={sportIcon} size={16} color="white" />
          </View>

          {/* Middle Row: Match Name */}
          <View className="flex-1 justify-center items-center my-1">
            <Text
              className="text-white text-center text-base font-bold leading-tight shadow-md"
              numberOfLines={2} // Allow up to 2 lines for match name
              ellipsizeMode="tail"
            >
              {match.matchName || "Match Name"}
            </Text>
          </View>

          {/* Bottom Row: Date and Time */}
          <View className="items-center border-t border-white/20 pt-2 mt-auto">
            <View className="flex-row items-center">
              <Ionicons
                name="calendar-outline"
                size={14}
                color="white"
                style={{ marginRight: 4 }}
              />
              <Text className="text-white text-xs font-medium">
                {formattedDate}
              </Text>
            </View>
          </View>
        </View>
      </StyledGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2, // Control the opacity of the background image
    borderRadius: 12, // Match with the card's border radius
    width: "120%",
    height: "122%",
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    zIndex: 1, // Ensure content is above the background image
  },
});

export default MatchCard;
