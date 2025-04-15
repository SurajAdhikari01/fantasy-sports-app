import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // Use expo-linear-gradient
import { styled } from "nativewind";

import cricketBg from "../../assets/cricketbg.png"; // Ensure this path is correct
import footballBg from "../../assets/footballbg.png"; // Ensure this path is correct

const StyledGradient = styled(LinearGradient);
const screenWidth = Dimensions.get("window").width; // Get device screen width

const TournamentResult = ({ tournamentName, onPress }) => {
  const backgroundImg = footballBg;
  const emoji = "⚽️"; // Set the emoji based on the sport

  return (
    <TouchableOpacity onPress={onPress} style={styles.cardContainer}>
      <StyledGradient
        colors={["#87ceeb", "#00bfff"]} // Skybluish gradient colors
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="rounded-xl p-4 justify-center" // Removed fixed height, adjusted padding
        style={{ width: screenWidth * 0.9 }} // Take 90% of screen width
      >
        {/* Background Image */}
        <Image
          source={backgroundImg}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        {/* Content Overlay */}
        <View style={styles.overlay}>
          <View style={styles.contentRow}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text
              style={styles.upcomingText}
              numberOfLines={1} // Limit to 1 line
              ellipsizeMode="tail" // Add ellipsis (...) if text overflows
            >
              {tournamentName}
            </Text>
          </View>
        </View>
      </StyledGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: "relative",
    marginVertical: 10, // Add vertical space between cards
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2, // Control the opacity of the background image
    borderRadius: 12, // Match with the card's border radius
    width: "100%",
    height: "200%",
  },
  overlay: {
    flex: 1,
    justifyContent: "center", // Center text vertically
    alignItems: "center", // Center text horizontally
    zIndex: 1, // Ensure content is above the background image
  },
  contentRow: {
    flexDirection: "row", // Place emoji and text in a row
    alignItems: "center", // Center items vertically in the row
  },
  emoji: {
    fontSize: 24, // Make emoji larger
    marginRight: 10, // Add space between emoji and text
  },
  upcomingText: {
    color: "white",
    fontSize: 18, // Increased font size
    fontWeight: "bold", // Bold text for emphasis
    textShadowColor: "rgba(0, 0, 0, 0.3)", // Subtle text shadow for better visibility
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    textAlign: "left", // Align text to the left
    flex: 1, // Allow text to take remaining space
  },
});

export default TournamentResult;
