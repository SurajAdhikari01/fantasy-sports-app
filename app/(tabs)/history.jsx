import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
} from "react-native";
import { styled } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../assets/loadinganimation.json";

const { height } = Dimensions.get("window");

const generateNewData = (currentLength) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: currentLength + 1,
          date: "Jun 05",
          sport: "cricket",
          match: "Mumbai Indians vs Rajasthan Royals",
          score: "MI: 210/6 | RR: 180/8",
          result: "Mumbai Indians Won by 30 runs",
          description:
            "A high-scoring game with a spectacular finish between two great teams in the IPL.",
          club1: "https://via.placeholder.com/50",
          club2: "https://via.placeholder.com/50",
        },
        {
          id: currentLength + 2,
          date: "Jun 07",
          sport: "football",
          match: "Chelsea vs Real Madrid",
          score: "Chelsea: 2 | Madrid: 2",
          result: "Match Draw",
          description:
            "A nail-biting finish with both teams putting up a good fight, leading to an exciting draw.",
          club1: "https://via.placeholder.com/50",
          club2: "https://via.placeholder.com/50",
        },
      ]);
    }, 2000);
  });
};

const HistoryPage = () => {
  const navigation = useNavigation();
  const [data, setData] = useState([
    {
      id: 1,
      date: "May 25",
      sport: "cricket",
      match: "Mumbai Indians vs Rajasthan Royals",
      score: "MI: 210/6 | RR: 180/8",
      result: "Mumbai Indians Won by 30 runs",
      description:
        "A high-scoring game with a spectacular finish between two great teams in the IPL.",
      club1: "https://via.placeholder.com/50",
      club2: "https://via.placeholder.com/50",
    },
    {
      id: 2,
      date: "Jun 05",
      sport: "football",
      match: "Chelsea vs Real Madrid",
      score: "Chelsea: 2 | Madrid: 2",
      result: "Match Draw",
      description:
        "A nail-biting finish with both teams putting up a good fight, leading to an exciting draw.",
      club1: "https://via.placeholder.com/50",
      club2: "https://via.placeholder.com/50",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const timelineScrollY = useRef(new Animated.Value(0)).current;

  const fetchMoreData = async () => {
    if (loading) return;
    setLoading(true);
    const newData = await generateNewData(data.length);
    setData((prevData) => [...prevData, ...newData]);
    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <View className="flex-row  items-start mb-2 rounded-xl overflow-hidden shadow-lg ">
      <View className="w-16 items-center justify-start ">
        <View className="w-10 h-10 bg-gray-700 justify-center items-center rounded-full mb-2">
          <Text className="text-white">{item.date.split(" ")[1]}</Text>
        </View>
        <View className="w-1 bg-gray-600 flex-1" />
      </View>

      {/* Right Side Card */}
      <View className="flex-1 rounded-lg bg-gray-900 p-4">
        <Text className="text-white text-xl font-bold mb-4" numberOfLines={1}>
          {item.match}
        </Text>

        <View className="flex-row  justify-between items-center mb-4">
          <View className="flex-row items-center space-x-4">
            <Image
              source={{ uri: item.club1 }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                borderWidth: 2,
                borderColor: "#fff",
              }}
            />
            <Image
              source={{ uri: item.club2 }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                borderWidth: 2,
                borderColor: "#fff",
              }}
            />
          </View>
          <View className="flex-row items-center">
            <Text className="text-gray-400 text-sm">{item.date}</Text>
            <Text className="text-white ml-2">
              {item.sport === "football" ? "⚽️" : "🏏"}
            </Text>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-gray-400 text-lg mb-1">{item.score}</Text>
          <Text
            className={`text-lg font-bold ${
              item.result.includes("Won") ? "text-green-500" : "text-yellow-500"
            }`}
          >
            {item.result}
          </Text>
        </View>

        <Text className="text-gray-400 text-sm mb-4" numberOfLines={2}>
          {item.description}
        </Text>

        <TouchableOpacity
          onPress={() => navigateToDetails(item.id)}
          className="bg-green-600 mt-4 p-3 rounded-lg items-center"
        >
          <Text className="text-white text-base font-semibold">
            View Match Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const navigateToDetails = (id) => {
    navigation.navigate("DetailsScreen", { id });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <View className="flex-row justify-between items-center p-4 mb-6">
        <Text className="text-white text-2xl font-bold">Match History</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        onEndReached={fetchMoreData}
        onEndReachedThreshold={0.5}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: timelineScrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        ListFooterComponent={() => {
          return loading ? (
            <View className="flex items-center justify-center py-5">
              <LottieView
                source={loadingAnimation}
                autoPlay
                loop
                style={{ width: 100, height: 100 }}
              />
            </View>
          ) : null;
        }}
      />
    </SafeAreaView>
  );
};

export default HistoryPage;
