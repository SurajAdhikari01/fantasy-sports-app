import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { useNavigation, useRoute, Circle } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useSearchParams } from "expo-router";
// Get device screen width and height
const { width } = Dimensions.get("window");

const MatchDetailScreen = () => {
  const router = useRouter();
  //const { match } = router.query;
  //console.log(match);
  // Ensure you handle cases where match might be undefined

  return (
    <View className="flex-1 bg-gray-900 p-4">
      <SafeAreaView />
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity onPress={() => router.push("/home")}>
          <Text style={{ color: "#ffffff" }}>{"<"}</Text>
        </TouchableOpacity>
        <Text className="text-white font-semibold text-lg">LIVE MATCH</Text>
        <View style={{ width: 24, height: 24 }} />
      </View>

      {/* Match Information */}
      <View className="items-center bg-purple-500 rounded-lg p-4">
        <Text className="text-white text-sm">UEFA League 2022</Text>
        <Text className="text-white text-xs">Week 2</Text>

        <View className="flex-row justify-between items-center mt-4">
          <View className="items-center">
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
              }}
              style={{ width: 40, height: 40 }}
            />
            <Text className="text-white text-sm mt-2">Real Madrid</Text>
          </View>

          <Text className="text-white text-4xl font-semibold">2 : 0</Text>

          <View className="items-center">
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
              }}
              style={{ width: 40, height: 40 }}
            />
            <Text className="text-white text-sm mt-2">Chelsea</Text>
          </View>
        </View>
      </View>

      {/* Betting Info and Stats */}
      <View className="bg-black rounded-lg mt-4 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <View
              className="rounded-full bg-red-500 mr-2"
              style={{
                width: 32,
                height: 32,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text className="text-white">15</Text>
            </View>
            <Text className="text-white">Coins betted</Text>
          </View>
          <Text className="text-white">Total 234</Text>
        </View>

        {/* Stats */}
        <View>
          <View className="flex-row justify-between items-center">
            <Text className="text-white">66% Attacks</Text>
            <Text className="text-white">23%</Text>
          </View>
          <View className="bg-gray-700 h-2 rounded-lg my-2">
            <View
              style={{
                width: "66%",
                height: "100%",
                backgroundColor: "white",
                borderRadius: 4,
              }}
            />
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-white">28% Passing</Text>
            <Text className="text-white">52%</Text>
          </View>
          <View className="bg-gray-700 h-2 rounded-lg my-2">
            <View
              style={{
                width: "28%",
                height: "100%",
                backgroundColor: "white",
                borderRadius: 4,
              }}
            />
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-white">49% Shooting</Text>
            <Text className="text-white">30%</Text>
          </View>
          <View className="bg-gray-700 h-2 rounded-lg my-2">
            <View
              style={{
                width: "49%",
                height: "100%",
                backgroundColor: "white",
                borderRadius: 4,
              }}
            />
          </View>
        </View>
      </View>

      {/* Bet More Coins Button */}
      <TouchableOpacity className="bg-pink-500 p-4 rounded-lg mt-4">
        <Text className="text-white text-center font-semibold">
          BET MORE COINS
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MatchDetailScreen;
