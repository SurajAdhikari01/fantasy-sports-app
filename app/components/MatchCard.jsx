import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // Use expo-linear-gradient
import { styled } from "nativewind";
import { router } from "expo-router";

const teamPlaceholder = "https://via.placeholder.com/50";

const StyledGradient = styled(LinearGradient);

const MatchCard = ({ match, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <StyledGradient
        colors={["#ff416c", "#ff4b2b"]} // Add your gradient colors
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="rounded-xl p-4 mx-2 h-44 w-48 justify-between"
      >
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
      </StyledGradient>
    </TouchableOpacity>
  );
};

export default MatchCard;
