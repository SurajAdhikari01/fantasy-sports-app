import React from "react";
import { View, Text, Image, TouchableOpacity, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";

const StatsBox = ({ label, value, icon }) => (
  <View className="bg-gray-700 rounded-lg py-3 flex-1 mx-1">
    <View className="flex-row items-center justify-center mb-1">
      <Feather name={icon} size={16} color="#60A5FA" />
      <Text className="text-white text-xs ml-1">{label}</Text>
    </View>
    <Text className="text-center text-white font-bold">{value}</Text>
  </View>
);

const HighlightedPlayerInfo = ({ player, visible, onClose }) => {
  if (!player) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-5">
          <View className="flex-row items-center mb-4">
            <Image
              source={{ uri: player.image }}
              className="w-20 h-20 rounded-full"
            />
            <View className="ml-4">
              <Text className="text-xl font-bold">{player.name}</Text>
              <Text className="text-gray-600">{player.team}</Text>
            </View>
          </View>

          <View className="flex-row justify-around mb-4">
            <StatsBox label="Points" value={player.points} icon="star" />
            <StatsBox
              label="Price"
              value={`$${player.price}M`}
              icon="dollar-sign"
            />
            <StatsBox label="Role" value={player.role} icon="user" />
          </View>

          {player.stats && (
            <View className="border-t border-gray-200 pt-4">
              {Object.entries(player.stats).map(([key, value]) => (
                <View
                  key={key}
                  className="flex-row justify-between py-2 border-b border-gray-100"
                >
                  <Text className="capitalize text-gray-600">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Text>
                  <Text className="font-bold">{value}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={onClose}
            className="mt-6 bg-blue-500 p-4 rounded-full"
          >
            <Text className="text-white text-center font-bold">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default HighlightedPlayerInfo;