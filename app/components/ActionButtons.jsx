import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

const ActionButtons = ({ handleNext, setShowPlayerSelectionModal }) => {
  return (
    <View className="px-4 pt-4 pb-2 absolute bottom-4 w-screen z-50">
      <View className="flex-row justify-between">
        <TouchableOpacity
          onPress={() => setShowPlayerSelectionModal(true)}
          className="flex-1 bg-blue-700 py-4 px-2 rounded-xl mr-2 shadow-sm active:bg-blue-900"
        >
          <Text className="text-white text-center font-bold">
            + Add Players
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNext}
          className="flex-1 bg-green-500 py-4 px-2 rounded-xl ml-2 shadow-sm active:bg-green-600"
        >
          <Text className="text-white text-center font-bold">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ActionButtons;