import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useTailwind } from "nativewind";

const SelectPlayer = () => {
  const { tw } = useTailwind();

  return (
    <View style={tw("flex-1 bg-black")}>
      {/* Header Section */}
      <View
        style={tw("bg-yellow-500 p-4 flex-row justify-between items-center")}
      >
        <TouchableOpacity>
          <Text style={tw("text-white text-lg")}>←</Text>
        </TouchableOpacity>
        <Text style={tw("text-white text-lg")}>Select Players</Text>
        <Text style={tw("text-white text-lg")}>Credits Left: 40.5</Text>
      </View>

      {/* Team Logo and Name */}
      <View
        style={tw("bg-yellow-500 p-4 flex-row justify-center items-center")}
      >
        <Image
          source={{
            uri: "https://upload.wikimedia.org/wikipedia/en/7/7e/Chennai_Super_Kings_Logo.png",
          }} // Example logo
          style={tw("h-16 w-16 mr-4")}
        />
        <Text style={tw("text-white text-2xl font-bold")}>
          Chennai Super Kings
        </Text>
      </View>

      {/* Players List */}
      <ScrollView style={tw("p-4")}>
        {/* Wicket-keepers Section */}
        <View style={tw("mb-4")}>
          <Text style={tw("text-white text-xl mb-2")}>Wicket-keepers</Text>
          <View
            style={tw(
              "bg-gray-800 p-4 rounded-lg flex-row justify-between items-center"
            )}
          >
            <View style={tw("flex-row")}>
              <Image
                source={{ uri: "https://imageurl/dhoni.png" }} // Example player image
                style={tw("h-20 w-20 mr-4 rounded-lg")}
              />
              <View>
                <Text style={tw("text-white text-lg")}>M.S. Dhoni</Text>
                <Text style={tw("text-gray-400")}>Wicket keeper - Batsman</Text>
                <Text style={tw("text-white")}>
                  Matches: 5 | Runs: 283 | Avg: 56.60
                </Text>
              </View>
            </View>
            <TouchableOpacity style={tw("bg-yellow-500 p-2 rounded-full")}>
              <Text style={tw("text-white text-lg")}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* All-rounders Section */}
        <View style={tw("mb-4")}>
          <Text style={tw("text-white text-xl mb-2")}>All-rounders</Text>
          <View
            style={tw(
              "bg-gray-800 p-4 rounded-lg flex-row justify-between items-center"
            )}
          >
            <View style={tw("flex-row")}>
              <Image
                source={{ uri: "https://imageurl/jadeja.png" }} // Example player image
                style={tw("h-20 w-20 mr-4 rounded-lg")}
              />
              <View>
                <Text style={tw("text-white text-lg")}>Ravindra Jadeja</Text>
                <Text style={tw("text-gray-400")}>Left arm orthodox spin</Text>
                <Text style={tw("text-white")}>
                  Matches: 5 | Runs: 170 | Avg: 42.50
                </Text>
              </View>
            </View>
            <TouchableOpacity style={tw("bg-yellow-500 p-2 rounded-full")}>
              <Text style={tw("text-white text-lg")}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* View My Team Button */}
      <TouchableOpacity style={tw("bg-yellow-500 p-4 rounded-full mx-4 mb-4")}>
        <Text style={tw("text-center text-black text-lg font-bold")}>
          View My Team
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SelectPlayer;
