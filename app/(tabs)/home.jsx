import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  FlatList,
  ScrollView,
} from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import MatchCard from "../components/MatchCard";
import { router } from "expo-router";
import UpcomingMatchCard from "../components/UpcomingMatchCard";

// Get device screen width and height
const { width, height } = Dimensions.get("window");

// Adjusted width and height for padding and proportions
const adjustedWidth = width * 0.9; // 90% of the screen width
const adjustedHeight = height * 0.23; // Adjusted height proportional to width
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
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <View className="mx-2">
      <MatchCard
        match={item}
        onPress={() => {
          // Navigate based on the sport type
          const routeName =
            item.sport === "football" ? "FootballDetail" : "CricketDetail";

          router.push({
            pathname: `/components/${routeName}/[id]`, // Route to the correct detail page with dynamic id
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

const HomeScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-900 gap-12">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4">
          <View className="flex-row justify-between items-center ">
            <Text className="text-white font-semibold text-xl">Hi Lucifer</Text>
            <Image
              source={{
                uri: "https://png.pngtree.com/png-vector/20220611/ourmid/pngtree-person-gray-photo-placeholder-man-silhouette-on-white-background-png-image_4826258.png",
              }}
              className="h-10 w-10 rounded-full"
            />
          </View>
          <Text className="text-gray-400 text-sm">Welcome back</Text>
        </View>

        {/* Custom Shaped Polygon Card . Dont modify this*/}
        <View className="mt-6 items-center ">
          <View className="relative">
            <View
              className={`absolute top-[${
                adjustedHeight * 0.3
              }px] right-0 p-8 z-10 pt-24 items-end`}
            >
              <Text className="text-white text-2xl">130</Text>
              <Text className="text-white mt-2">Game Played</Text>
            </View>

            <Svg
              height={adjustedHeight}
              width={adjustedWidth}
              viewBox={`0 0 ${adjustedWidth} ${adjustedHeight}`}
            >
              <Path
                d={`
                M 0 ${adjustedHeight * 0.3} 
                A 30, 30 0 0 1 ${adjustedWidth * 0.05}, ${
                  adjustedHeight * 0.1
                }                  
                L ${adjustedWidth * 0.5} ${adjustedHeight * 0.3}      
                L ${adjustedWidth * 0.9} ${adjustedHeight * 0.1} 
                A 30,30 0 0 1 ${adjustedWidth}, ${
                  adjustedHeight * 0.3
                }           
                
                L ${adjustedWidth} ${adjustedHeight * 0.78}  
                A 30, 30 0 0 1 ${adjustedWidth * 0.9}, ${adjustedHeight * 0.99}
                L ${adjustedWidth * 0.5} ${adjustedHeight * 0.9} 
                 
                L ${adjustedWidth * 0.09} ${adjustedHeight}
                A 30,30 0 0 1 0, ${adjustedHeight * 0.8}   
                L 0 ${adjustedHeight * 0.3} 
                
                Z
              `}
                fill="#1f1f1f" // Darker grey fill
                stroke="#ddd" // Brighter grey stroke
                strokeWidth="3" // Adjust stroke width as needed
                strokeDasharray="12, 8" // Change this color as needed
              />
            </Svg>

            {/* Original SVG Polygon */}
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
              <View className="absolute top-0 left-0 p-8 ">
                <Text className="text-white text-2xl">$15,000</Text>
                <Text className="text-white mt-2">Won Amount</Text>
                <TouchableOpacity className="mt-2">
                  <Text className="text-white underline">Claim now</Text>
                </TouchableOpacity>
              </View>

              {/* Smaller Polygon with adjusted width and height */}
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

            {/* Overlay content */}
          </View>
        </View>

        {/* Games Played and Stats */}
        <View className="flex-row justify-between items-center p-6 mt-4">
          <View className="bg-gray-800 p-4 rounded-lg flex-1 mr-2">
            <Text className="text-white text-lg">442</Text>
            <Text className="text-gray-400 text-sm">Games Played</Text>
          </View>
          <View className="bg-gray-800 p-4 rounded-lg flex-1 ml-2">
            <Text className="text-white text-lg">134</Text>
            <Text className="text-gray-400 text-sm">Matches</Text>
          </View>
        </View>

        <View>
          <Text className="text-white text-lg font-semibold p-6">
            Ongoing Matches
          </Text>
          <MatchesList />
        </View>
        {/* Upcoming Matches Section */}
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
                  console.log(`Clicked on match ${match.id}`);
                }}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
