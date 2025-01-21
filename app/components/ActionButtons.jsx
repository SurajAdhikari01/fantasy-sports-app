import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

const ActionButtons = ({ handleNext, setShowPlayerSelectionModal }) => {
  return (
    <View className="flex-row justify-between items-center px-4">
      <TouchableOpacity
        onPress={() => setShowPlayerSelectionModal("Forwards")}
        className="bg-blue-600 px-6 py-2 rounded-full flex-1 mr-2"
      >
        <Text className="text-white text-center font-semibold">Add Player</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleNext}
        className="bg-green-600 px-6 py-2 rounded-full flex-1 ml-2"
      >
        <Text className="text-white text-center font-semibold">Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActionButtons;
