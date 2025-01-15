import React from "react";
import { TouchableOpacity, View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // Use expo-linear-gradient
import { styled } from "nativewind";

const teamPlaceholder = "https://via.placeholder.com/50";
import cricketBg from "../../assets/cricketbg.png"; // Ensure this path is correct
import footballBg from "../../assets/footballbg.jpg"; // Ensure this path is correct

const StyledGradient = styled(LinearGradient);

const MatchCard = ({ match, onPress }) => {
  const backgroundImg = match.sport === "football" ? footballBg : cricketBg;

  return (
    <TouchableOpacity onPress={onPress} style={styles.cardContainer}>
      <StyledGradient
        colors={["#ff416c", "#ff4b2b"]} // Gradient colors
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="rounded-xl p-4 mx-2 h-44 w-48 justify-between"
      >
        {/* Background Image */}
        <Image
          source={backgroundImg}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        {/* Content Overlay */}
        <View style={styles.overlay}>
          <View className="flex-row justify-between items-center">
            <Text className="text-white text-xs bg-white/30 px-2 py-1 rounded-full">
              {match.status}
            </Text>
            <Text className="text-white text-xs bg-red-500 px-2 py-1 rounded-full">
              15
            </Text>
          </View>

          <View className="flex-row justify-between items-center my-2">
            <Image
              source={{ uri: teamPlaceholder }}
              className="h-12 w-12 rounded-full"
            />
            <Text className="text-white text-lg font-bold">VS</Text>
            <Image
              source={{ uri: teamPlaceholder }}
              className="h-12 w-12 rounded-full"
            />
          </View>

          <Text className="text-white text-center text-sm font-semibold">
            {match.score}
          </Text>
          <Text className="text-white text-xs text-center">
            {match.team1} vs {match.team2}
          </Text>
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
