import React from "react";
import { View, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const SportSelector = ({ currentSport, onSportChange }) => {
  return (
    <View className="bg-gray-800 rounded-full p-2 flex-row">
      <TouchableOpacity
        onPress={() => onSportChange("cricket")}
        className={`p-2 rounded-full ${
          currentSport === "cricket" ? "bg-blue-500" : ""
        }`}
      >
        <MaterialCommunityIcons
          name="cricket"
          size={24}
          color={currentSport === "cricket" ? "#ffffff" : "#a0aec0"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onSportChange("football")}
        className={`p-2 rounded-full ml-2 ${
          currentSport === "football" ? "bg-blue-500" : ""
        }`}
      >
        <MaterialCommunityIcons
          name="soccer"
          size={24}
          color={currentSport === "football" ? "#ffffff" : "#a0aec0"}
        />
      </TouchableOpacity>
    </View>
  );
};

export default SportSelector;